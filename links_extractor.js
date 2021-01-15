const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
      headless: true,
      slowMo: 1500
  })
  const page = await browser.newPage()
  var results = []
  
  await page.goto('https://myfcd.moh.gov.my/myfcdcurrent/')
  
  await page.setViewport({ width: 1848, height: 949 })

  while(true) {
    var foods = await page.evaluate(() => {
        var foodRows = document.querySelectorAll('#tblDataProduct > tbody > tr > td:first-child > a');
        var links = [];
    
        foodRows.forEach(value => {
            links.push(value.href);
        });
    
        return links;
      });
    results = results.concat(foods);
    await page.waitForSelector('#tab1 > #tblDataProduct_wrapper > .bottom > .dataTables_paginate > .next')
      
    var nextButton = await page.$('#tab1 > #tblDataProduct_wrapper > .bottom > .dataTables_paginate > .next')
    var nextClasses = await page.evaluate(el => el.className.split(" "), nextButton);
    if(nextClasses.find(s => s == "disabled")){
        break
    }
    else {
        await page.click('#tab1 > #tblDataProduct_wrapper > .bottom > .dataTables_paginate > .next')
    }
  }
  let data = JSON.stringify(results, null, 2)
  fs.writeFileSync('food_links.json', data)
  await browser.close()
})()
