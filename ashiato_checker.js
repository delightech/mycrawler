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

puppeteer.launch({headless: false,
                  dumpio: false,
                  devtools: false,
                  args: ['--lang=ja',
                         '--window-size=1600,800',
                         '--no-sandbox',
                         '--disable-setuid-sandbox']}).then(async browser => {
  try {

    let page = await browser.newPage();
    await page.setViewport({width: 1600, height: 800});
    // Change browser language for inputting Japanese date format(YYYY/MM/DD)
    await page.setExtraHTTPHeaders({'Accept-Language': 'ja-JP'});

    login_page = 'https://www.pairs.lv/';
    // login
    await page.goto(login_page, {waitUntil: 'domcontentloaded'});
    await page.waitFor(5000);
    await page.click('div.login-facebook-button-start')
    await page.waitFor(5000);
    const pages = await browser.pages();
    const popup = pages[pages.length - 1];
    await popup.waitFor(5000);
    await popup.type('input[name="email"]', id);
    await popup.waitFor(1000);
    await popup.type('input[name="pass"]', password);
    await popup.waitFor(1000);
    await popup.click('input[type="submit"]')
    await page.waitFor(20000);

    //page = pages[1];
    ashiato_page = 'https://pairs.lv/#/visitor/list/1';
    await page.goto(ashiato_page, {waitUntil: 'domcontentloaded'});
    await page.waitFor(5000);
    await page.waitFor(1000000);
    await browser.close();
  } catch (e) {
    console.log(e.toString);
    console.log(e.stack);
    await browser.close();
    process.exit(1);
  }
});
