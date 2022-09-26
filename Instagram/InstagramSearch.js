// user.json tag numberofelements latest/id save
const puppeteer = require("puppeteer");
const fs = require("fs");
const uuid = require("uuid");

async function scraping(page, position, maxElement) {
  console.log("i am in the function ");
  let addedPost = [];
  for (let index = 0; index < position; index++) {
    await page.evaluate(() =>
      document
        .querySelector(
          "div[role='dialog'] svg[aria-label='Suivant'],div[role='dialog'] svg[aria-label='Next']"
        )
        .parentNode.parentNode.parentNode.click()
    );
    await page.waitForSelector("article[role='presentation']");
  }
  for (let index = position; index < maxElement; index++) {
    let id = uuid.v4();
    let content = await page.evaluate((id) => {
      // let total = document.querySelector("article").querySelectorAll("a");
      let singlePost = {};
      let element = document.querySelector("div[role='dialog']");
      let contentExist = element.querySelectorAll(
        "li[role='menuitem'] span"
      )[1];
      singlePost.url = window.location.href;
      singlePost.author = element.querySelectorAll("a")[1].innerText;
      singlePost.date = element.querySelector("time").title;
      let totalviews = element
        .querySelectorAll('div[role="presentation"] section')[1]
        .innerText.split(" ");
      singlePost.views = totalviews.length > 2 ? "" : totalviews[0];
      singlePost.image = element.querySelector("img").src || "video";
      singlePost.description = contentExist ? contentExist.innerText : "";
      if (singlePost.description != "") {
        if (singlePost.description.contains("#")) {
          let element = singlePost.description.replaceAll(" ", "");
          element = element.replaceAll("\n", "").split("#");
          element.shift();
          singlePost.tags = element;
          singlePost.description = singlePost.description.split("#", 2)[0];
        }
      } else {
        singlePost.tags = "";
      }
      singlePost.id = id;
      return singlePost;
    }, id);
    addedPost.push(content);
    await page.evaluate(() =>
      document
        .querySelector(
          "div[role='dialog'] svg[aria-label='Suivant'],div[role='dialog'] svg[aria-label='Next']"
        )
        .parentNode.parentNode.parentNode.click()
    );
    await page.waitForSelector("article[role='presentation']");
  }
  return addedPost;
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
    const user = process.argv[2];
    const tag = process.argv[3];
    var LenOption = process.argv[4];
    const checkHistory = process.argv[5];
    const checkSave = process.argv[6];
    await pages[0].close();
    const cookiesString = await fs.promises.readFile(`cookies/${user}`);
    if (cookiesString != "") {
      var cookies = JSON.parse(cookiesString);
      await page.setCookie(...cookies);
    }
    await page.goto(`https://www.instagram.com/explore/tags/${tag}/`);
    await page.waitForSelector("article a");

    await page.evaluate(() => document.querySelector("article a").click());
    await page.waitForSelector("article[role='presentation']");
    let index = 0;
    let data = [];
    let addedPost = [];
    if (checkHistory != undefined) {
      console.log("access is : " + `history/${tag}.json`);
      let exist = await fs.existsSync(`history/${tag}.json`);
      if (exist) {
        const savedData = await fs.promises.readFile(`history/${tag}.json`);
        data = JSON.parse(savedData);
      }
      console.log("checkhistory is : " + checkHistory);
      if (checkHistory == "latest" && data != "") index = data.length - 1;
      else if (data != "")
        index = data.findIndex((object) => object.id === checkHistory);
      limit = parseInt(index) + parseInt(LenOption);
      addedPost = await scraping(page, index, limit);
      data = data.concat(addedPost);
    } else {
      limit = parseInt(index) + parseInt(LenOption);
      addedPost = await scraping(page, index, limit);
      data = addedPost;
    }

    if (checkSave === "save") {
      // tache pour enlever les duplicates
      addedPost = addedPost.filter(
        (value, index, self) =>
          index === self.findIndex((t) => t.url === value.url)
      );
      await fs.promises.writeFile(
        `history/${tag}.json`,
        JSON.stringify(data, null, 2)
      );
    }

    console.log(data);
    console.log("total is : " + data.length);

    // await browser.close()
  } catch (e) {
    console.log("erreur est : " + e);
    // close(fs);
  }
})();
