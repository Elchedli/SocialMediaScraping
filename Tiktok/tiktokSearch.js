// user.json tag numberofelements latest/id save

// 20 30 40 50 90 80
const puppeteer = require("puppeteer");
const fs = require("fs");
const uuid = require("uuid");
async function scraping(page, position, tag, LenOption, user) {
  let content = [];
  let limit = parseInt(position) + LenOption;
  const cookiesString = await fs.promises.readFile(`cookies/${user}`);
  if (cookiesString != "") {
    var cookies = JSON.parse(cookiesString);
    await page.setCookie(...cookies);
  }
  await page.goto(`https://www.tiktok.com/search/video?q=${tag}`);
  await page.waitForSelector('div[data-e2e="search_video-item"]', {
    timeout: 0,
  });
  let total = 12;
  await page.evaluate(() => {
    window.scrollBy(0, window.innerHeight);
  });
  while (total < limit) {
    await page.click('button[data-e2e="search-load-more"]');
    // await page.waitForTimeout(1000);
    await page.waitForSelector('button[data-e2e="search-load-more"]');
    total += 12;
  }
  let newContent = await page.evaluate(() => {
    let objectCollection = [];
    let total = document.querySelectorAll('div[data-e2e="search_video-item"]');
    total.forEach((element) => {
      let object = {};
      element = element.parentNode;
      let bottomContent = element.lastChild;
      object.url = element.querySelector("a").href;
      object.author = bottomContent.querySelector("p").innerText;
      object.date = [
        ...element.firstChild.querySelectorAll("div"),
      ].pop().innerText;
      object.views = bottomContent.querySelector(
        'div[data-e2e="search-card-like-container"]'
      ).innerText;
      object.image = element.firstChild.querySelector("img").src;
      object.description = [...element.lastChild.querySelectorAll("span")]
        .map((elem) => elem.innerText)
        .filter((elem) => elem != " " && elem != "");
      object.tags = [...element.lastChild.querySelectorAll("div > div a")].map(
        (elem) => elem.innerText
      );
      objectCollection.push(object);
    });
    return objectCollection;
  });
  content = newContent.slice(position, limit);
  content.map((element) => (element.id = uuid.v4()));
  return content;
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
    await pages[0].close();
    const user = process.argv[2];
    const tag = process.argv[3];
    const LenOption = parseInt(process.argv[4]);
    const checkHistory = process.argv[5];
    const checkSave = process.argv[6];
    let index = 0;
    let data = [];
    let addedPost = [];
    if (checkHistory != undefined) {
      let exist = await fs.existsSync(`history/${tag}.json`);
      if (exist) {
        const savedData = await fs.promises.readFile(`history/${tag}.json`);
        data = JSON.parse(savedData);
      }
      // console.log("checkhistory is : " + checkHistory);
      if (checkHistory == "latest" && data != "") index = data.length;
      else if (data != "")
        index = data.findIndex((object) => object.id === checkHistory);
      addedPost = await scraping(page, index, tag, LenOption, user);
      data = data.concat(addedPost);
    } else {
      // limit = parseInt(index) + LenOption;
      addedPost = await scraping(page, index, tag, LenOption, user);
      data = addedPost;
    }

    if (checkSave === "save") {
      // tache pour enlever les duplicates
      console.log("are you saving?");
      addedPost = addedPost.filter(
        (value, index, self) =>
          index === self.findIndex((t) => t.url === value.url)
      );
      await fs.promises.writeFile(
        `history/${tag}.json`,
        JSON.stringify(data, null, 2)
      );
    }

    // console.log(data);
    console.log("total is : " + data.length);

    // await browser.close()
  } catch (e) {
    console.log("erreur est : " + e);
    // close(fs);
  }
})();
