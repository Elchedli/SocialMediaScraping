// tag numberofelements latest/id save
const puppeteer = require("puppeteer");
const fs = require("fs");
const uuid = require("uuid");
async function scraping(page, position, tag, LenOption) {
  //   await page.exposeFunction("myFunc", createId);
  //   let addedPost = [];
  let content = [];
  //   console.log(content);
  let lenElements = position - 10;
  while (content.length < LenOption) {
    lenElements += 10;
    // console.log("position is : " + lenElements);

    await page.goto(
      `https://www.google.com/search?q=${tag}&start=${lenElements}`
    );
    await page.waitForSelector("#search");
    let newContent = await page.evaluate(() => {
      let objectCollection = [];
      let total = document.querySelectorAll('div[data-header-feature="0"]');
      //chronometres de 10 elements
      //   https://www.google.com/search?q=access&start=20
      total.forEach((element) => {
        let object = {};
        object.url = element.querySelector("cite").innerText.split(" ›")[0];
        object.title = element.querySelector("h3").innerText.split(" -")[0];
        objectCollection.push(object);
      });
      total = document.querySelectorAll('div[data-content-feature="1"]');
      total.forEach(
        (element, index) =>
          (objectCollection[index].description = [
            ...element.querySelectorAll("span"),
          ].map((elem) => elem.innerText))
      );
      return objectCollection;
    });
    content = content.concat(newContent);
  }
  content = content.slice(0, LenOption);
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
    const tag = process.argv[2];
    const LenOption = parseInt(process.argv[3]);
    const checkHistory = process.argv[4];
    const checkSave = process.argv[5];
    // await page.goto(`https://www.google.com/search?q=${tag}`);
    // await page.waitForSelector("#search");
    // await page.waitForTimeout(4000);
    // const LenElements = 10;
    let index = 0;
    let data = [];
    let addedPost = [];
    if (checkHistory != undefined) {
      //   console.log("access is : " + `history/${tag}.json`);
      let exist = await fs.existsSync(`history/${tag}.json`);
      if (exist) {
        const savedData = await fs.promises.readFile(`history/${tag}.json`);
        data = JSON.parse(savedData);
      }
      console.log("checkhistory is : " + checkHistory);
      if (checkHistory == "latest" && data != "") index = data.length;
      else if (data != "")
        index = data.findIndex((object) => object.id === checkHistory);
      limit = parseInt(index) + LenOption;
      addedPost = await scraping(page, index, tag, LenOption);
      data = data.concat(addedPost);
    } else {
      limit = parseInt(index) + LenOption;
      addedPost = await scraping(page, index, tag, LenOption);
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

    // console.log(data);
    console.log("total is : " + data.length);

    // await browser.close()
  } catch (e) {
    console.log("erreur est : " + e);
    // close(fs);
  }
})();
