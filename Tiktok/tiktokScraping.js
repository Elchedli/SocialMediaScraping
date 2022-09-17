// tag numberofelements
const puppeteer = require("puppeteer");
const fs = require("fs");
const CaptchaSolver = require("tiktok-captcha-solver");

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}
(async function main() {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      executablePath:
        "C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe",
      defaultViewport: null,
      ignoreDefaultArgs: ["--enable-automation"],
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });
    const pages = await browser.pages();
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    await pages[0].close();
    const captchaSolver = new CaptchaSolver(page);
    const cookiesString = await fs.promises.readFile("cookiesTiktok.json");
    if (cookiesString != "") {
      var cookies = JSON.parse(cookiesString);
      await page.setCookie(...cookies);
    }
    await page.goto(`https://www.tiktok.com/search/video?q=${process.argv[2]}`);
    // await page.waitForSelector(".captcha_verify_bar");
    await page.waitForTimeout(20000);
    let verifbar = (await page.$(".captcha_verify_bar")) || "";
    console.log("verif bar est : " + verifbar);
    if (verifbar != "") {
      await captchaSolver.solve();
      cookies = await page.cookies();
      await fs.writeFileSync(
        "cookiesTiktok.json",
        JSON.stringify(cookies, null, 2)
      );
    }
    await page.waitForSelector('div[data-e2e="search_video-item"]', {
      timeout: 0,
    });
    let total = 12;
    await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight);
    });
    // console.log("process argvb : " + parseInt(process.argv[3]));
    while (total < parseInt(process.argv[3])) {
      await page.click('button[data-e2e="search-load-more"]');
      await page.waitForTimeout(3000);
      verifbar = (await page.$(".captcha_verify_bar")) || "";
      if (verifbar) {
        await captchaSolver.solve();
        await page.waitForTimeout(2000);
      }
      total += 12;
    }

    let content = await page.evaluate(() => {
      let objectCollection = [];
      let total = document.querySelectorAll(
        'div[data-e2e="search_video-item"]'
      );
      total.forEach((element) => {
        let object = {};
        element = element.parentNode;
        object.Image = element.firstChild.querySelector("img").src;
        object.description = [...element.lastChild.querySelectorAll("span")]
          .map((elem) => elem.innerText)
          .filter((elem) => elem != " " && elem != "");
        object.tags = [
          ...element.lastChild.querySelectorAll("div > div a"),
        ].map((elem) => elem.innerText);
        objectCollection.push(object);
      });
      return objectCollection;
    });
    console.log(content);
  } catch (e) {
    // fs.writeFileSync("err", e);
    console.log("erreur est : " + e);
    // close(fs);
  }
})();
