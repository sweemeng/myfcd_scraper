const puppeteer = require('puppeteer')
const fs = require('fs')

const extractor = async url => {
    const browser = await puppeteer.launch({
        headless: true,
        slowMo: 1500
    })
    const page = await browser.newPage()

    await page.goto(url)
    await page.setViewport({ width: 1848, height: 949 })
    var results = await page.evaluate(() => {
        var data = []
        const scrapeTime = Date.now()
        var name = document.querySelector("#divToBePrinted h3").textContent
        var image = document.querySelector("#divToBePrinted img").src
        var foodGroup = document.querySelector("#divToBePrinted table tr td:nth-child(3)").textContent
        var foodTable = document.querySelector('#divToBePrinted #tableDetailNutrient')
        if(foodTable.querySelector("thead > tr").childElementCount == 4){
            var unitWeight = foodTable.querySelector("thead > tr > th:nth-child(4)").textContent.clean().slice(2)
        }
        else {
            var unitWeight = null
        }
        
        foodTable.querySelectorAll("tbody > tr").forEach(item => {
            if (item.childElementCount == 1) {
                var value = item.querySelector("td").textContent
                data.push({name: value})
            }
            else if(item.childElementCount == 4) {
                
                data.push({
                    name: item.querySelector("td:nth-child(1)").textContent,
                    unit: item.querySelector("td:nth-child(2)").textContent,
                    value_per_100g: item.querySelector("td:nth-child(3)").textContent,
                    value_per_unit: item.querySelector("td:nth-child(4").textContent
                })
            }
            else {
                data.push({
                    name: item.querySelector("td:nth-child(1)").textContent,
                    unit: item.querySelector("td:nth-child(2)").textContent,
                    value_per_100g: item.querySelector("td:nth-child(3)").textContent,
                })
            }
        })
        return {
            name: name,
            image: image,
            foodGroup: foodGroup,
            unitWeight: unitWeight,
            data: data,
            source: window.location.href,
            date: scrapeTime.toLocaleString('en-GB', { timeZone: 'Asia/Kuala_Lumpur' })
        }
    });
    var dir = './food_data';

    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    var file_name = "food_data/" + results.name.replace("/", "").replaceAll(",", "").replaceAll(" ", "_").replaceAll("(", "").replaceAll(")","") + ".json"
    let data = JSON.stringify(results, null, 2)
    fs.writeFileSync(file_name, data)

    await browser.close()
}

runExtractor = async urllist => {
    for (let i=0; i < urllist.length; i++) {
        const url = urllist[i]
        console.log("processing " + url)
        await extractor(url)
        console.log("done" + url)
    }
}

let rawlist = fs.readFileSync("food_links.json")
let urllist = JSON.parse(rawlist)

runExtractor(urllist)

