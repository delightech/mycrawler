const fs = require('fs');
require('date-utils');

const puppeteer = require('puppeteer');
const program   = require('commander');
const { IncomingWebhook } = require('@slack/webhook');

program
  .requiredOption('-i, --id <id>', 'id')
  .requiredOption('-p, --password <password>', 'password')
  .requiredOption('-u, --url <slack web hook url>', 'password')
  .parse(process.argv);

if(process.argv.length < 4) {
  program.help();
} else {
  var dt = new Date();
  var formatted = dt.toFormat("YYYYMMDD HH24MISS");
  console.log('[' + formatted + '] script start');
}
const id = program.id
const password  = program.password
const url = program.url;

puppeteer.launch({headless: true,
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

    login_page = 'https://www.pai' + 'rs.lv/';
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
    ashiato_page = 'https://pai' + 'rs.lv/#/visitor/list/1';
    await page.goto(ashiato_page, {waitUntil: 'domcontentloaded'});
    await page.waitFor(5000);

    visitor_value = ' ';
    let date = await page.$('th.date');
    visitor_value += await (await date.getProperty('textContent')).jsonValue();
    visitor_value += "\n";

    let time = await page.$$('td.time');
    let summary_inner = await page.$$('div.summary_inner');
    for(let i=0; i< summary_inner.length; i++) {
      visitor_value += await (await time[i].getProperty('textContent')).jsonValue();
      visitor_value += " ";
      let age = await summary_inner[i].$('a > div > strong > span.user_age');
      let area = await summary_inner[i].$('a > div > strong > span.user_area');
      visitor_value += await (await age.getProperty('textContent')).jsonValue();
      visitor_value += " ";
      visitor_value += await (await area.getProperty('textContent')).jsonValue();
      visitor_value += " ";
      let user_profiles = await summary_inner[i].$$('a > div > span.user_profile_item');
      for(let user_profile of user_profiles) {
        visitor_value += await (await user_profile.getProperty('textContent')).jsonValue();
        visitor_value += " ";
      }
      visitor_value += "\n";
    }

    let text = fs.readFileSync("../weekly_visitor.txt");
    if(text != visitor_value) {
      fs.writeFileSync("../weekly_visitor.txt", visitor_value);

      const webhook = new IncomingWebhook(url);
      await webhook.send({
        text: "<!channel>" + visitor_value
      });
    }

    await page.waitFor(5000);
    //await page.waitFor(1000000);
    await browser.close();

    var dt = new Date();
    var formatted = dt.toFormat("YYYYMMDD HH24MISS");
    console.log('[' + formatted + '] script end');
  } catch (e) {
    console.log(e.toString);
    console.log(e.stack);
    await browser.close();
    process.exit(1);
  }
});
