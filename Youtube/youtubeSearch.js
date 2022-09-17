// tag numberofelements latest/id save
const puppeteer = require("puppeteer");
const fs = require("fs");
const uuid = require("uuid");
async function scraping(page, position, tag, LenOption) {
  let content = [];
  await page.goto(`https://www.youtube.com/results?search_query=${tag}`);
  await page.waitForSelector("#contents");
  for (let index = 0; index < parseInt(LenOption / 4) + 3; index++) {
    await page.waitForTimeout(500);
    await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight);
    });
  }
  let newContent = await page.evaluate(() => {
    let addedVideos = [];
    let total = document.querySelectorAll("#contents > ytd-video-renderer");
    total.forEach((element) => {
      let singleVideo = {};
      singleVideo.Image = element.querySelector("img").src;
      let elementText = element.querySelectorAll("yt-formatted-string");
      singleVideo.Title = elementText[0].innerText;
      singleVideo.ChannelName = elementText[2].innerText;
      singleVideo.Description = elementText[4]
        ? elementText[4].innerText
        : elementText[3].innerText;
      addedVideos.push(singleVideo);
    });
    return addedVideos;
  });
  content = newContent.slice(position, LenOption);
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
    const tag = process.argv[2];
    const LenOption = parseInt(process.argv[3]);
    const checkHistory = process.argv[4];
    const checkSave = process.argv[5];
    await pages[0].close();
    let index = 0;
    let data = [];
    let addedPost = [];
    if (checkHistory != undefined) {
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
