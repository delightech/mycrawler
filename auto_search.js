const fs = require('fs');
require('date-utils');

const puppeteer = require('puppeteer');
const program   = require('commander');

program
  .requiredOption('-i, --id <id>', 'id')
  .requiredOption('-p, --password <password>', 'password')
  .parse(process.argv);

if(process.argv.length < 3) {
  program.help();
}

const id = program.id
const password  = program.password
const url = program.url;

puppeteer.launch({headless: false,
                  dumpio: false,
                  devtools: false,
                  //executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
                  args: ['--lang=ja',
                         '--no-sandbox',
                         '--disable-setuid-sandbox',
                         //'--user-data-dir=~/Library/Application Support/Google/Chrome',
                         //'--load-extension=~/Library/Application Support/Google/Chrome/Default/Extensions',
                         '--window-size=1600,800']}).then(async browser => {
  try {
    let page = await browser.newPage();
    await page.setViewport({width: 1600, height: 800});
    await page.setExtraHTTPHeaders({'Accept-Language': 'ja-JP'});
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3864.0 Safari/537.36');

    let search_page = 'SOME SEARCH PAGE';
    await page.goto(search_page + 'login');
    await page.waitFor(1000);
    let e = await page.$x('//*[@id="wrapper"]/header/div/div/div[1]/div[1]/div[1]/a');
    await e[0].click();
    await page.waitFor(3000);


    // input id and password
    e = await page.$x('//*[@id="loginInner_u"]');
    await e[0].type(id);
    await page.waitFor(1000);
    e = await page.$x('//*[@id="loginInner_p"]');
    await e[0].type(password);
    await page.waitFor(1000);

    await page.click('input[type="submit"]')

    let words = ['天気','ニュース','政治','経済','テレビ','買い物','ネット','ランチ','ディナー'];
    for(let val of words) {
      await page.waitFor(3000);
      await console.log('keyword:' +val);
      await page.goto(search_page + val);
    }

    await browser.close();

  } catch (e) {
    console.log(e.toString);
    console.log(e.stack);
    await browser.close();
    process.exit(1);
  }
});
