const puppeteer = require("puppeteer");
const fs = require("fs");
const uuid = require("uuid");
async function instagramScript(
  page,
  user,
  tag,
  LenOption,
  checkHistory,
  checkSave
) {
  const cookiesString = await fs.promises.readFile(`cookies/instagram/${user}`);
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
    console.log("access is : " + `history/instagram/${tag}.json`);
    let exist = await fs.existsSync(`history/instagram/${tag}.json`);
    if (exist) {
      const savedData = await fs.promises.readFile(
        `history/instagram/${tag}.json`
      );
      data = JSON.parse(savedData);
    }
    console.log("checkhistory is : " + checkHistory);
    if (checkHistory == "latest" && data != "") index = data.length - 1;
    else if (data != "")
      index = data.findIndex((object) => object.id === checkHistory);
    limit = parseInt(index) + parseInt(LenOption);
    addedPost = await scrapingInstagram(page, index, limit);
    data = data.concat(addedPost);
  } else {
    limit = parseInt(index) + parseInt(LenOption);
    addedPost = await scrapingInstagram(page, index, limit);
    data = addedPost;
  }

  if (checkSave === "save") {
    addedPost = addedPost.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.url === value.url)
    );
    await fs.promises.writeFile(
      `history/instagram/${tag}.json`,
      JSON.stringify(data, null, 2)
    );
  }

  console.log(data);
  console.log("total is : " + data.length);

  // await browser.close()
}

async function tiktokScript(
  page,
  user,
  tag,
  LenOption,
  checkHistory,
  checkSave
) {
  let index = 0;
  let data = [];
  let addedPost = [];
  if (checkHistory != undefined) {
    let exist = await fs.existsSync(`history/tiktok/${tag}.json`);
    if (exist) {
      const savedData = await fs.promises.readFile(
        `history/tiktok/${tag}.json`
      );
      data = JSON.parse(savedData);
    }
    if (checkHistory == "latest" && data != "") index = data.length;
    else if (data != "")
      index = data.findIndex((object) => object.id === checkHistory);
    addedPost = await scrapingTiktok(page, index, tag, LenOption, user);
    data = data.concat(addedPost);
  } else {
    addedPost = await scrapingTiktok(page, index, tag, LenOption, user);
    data = addedPost;
  }

  if (checkSave === "save") {
    console.log("are you saving?");
    addedPost = addedPost.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.url === value.url)
    );
    await fs.promises.writeFile(
      `history/tiktok/${tag}.json`,
      JSON.stringify(data, null, 2)
    );
  }
  console.log(data);
  console.log("total is : " + data.length);
  // await browser.close()
}

async function youtubeScript(page, tag, LenOption, checkHistory, checkSave) {
  let index = 0;
  let data = [];
  let addedPost = [];
  if (checkHistory != undefined) {
    let exist = await fs.existsSync(`history/youtube/${tag}.json`);
    if (exist) {
      const savedData = await fs.promises.readFile(
        `history/youtube/${tag}.json`
      );
      data = JSON.parse(savedData);
    }
    console.log("checkhistory is : " + checkHistory);
    if (checkHistory == "latest" && data != "") index = data.length;
    else if (data != "")
      index = data.findIndex((object) => object.id === checkHistory);
    limit = parseInt(index) + LenOption;
    addedPost = await scrapingYoutube(page, index, tag, LenOption);
    data = data.concat(addedPost);
  } else {
    limit = parseInt(index) + LenOption;
    addedPost = await scrapingYoutube(page, index, tag, LenOption);
    data = addedPost;
  }

  if (checkSave === "save") {
    addedPost = addedPost.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.url === value.url)
    );
    await fs.promises.writeFile(
      `history/youtube/${tag}.json`,
      JSON.stringify(data, null, 2)
    );
  }
  console.log("total is : " + data.length);

  // await browser.close()
}

async function googleScript(page, tag, LenOption, checkHistory, checkSave) {
  let index = 0;
  let data = [];
  let addedPost = [];
  if (checkHistory != undefined) {
    let exist = await fs.existsSync(`history/google/${tag}.json`);
    if (exist) {
      const savedData = await fs.promises.readFile(
        `history/google/${tag}.json`
      );
      data = JSON.parse(savedData);
    }
    console.log("checkhistory is : " + checkHistory);
    if (checkHistory == "latest" && data != "") index = data.length;
    else if (data != "")
      index = data.findIndex((object) => object.id === checkHistory);
    limit = parseInt(index) + LenOption;
    addedPost = await scrapingGoogle(page, index, tag, LenOption);
    data = data.concat(addedPost);
  } else {
    limit = parseInt(index) + LenOption;
    addedPost = await scrapingGoogle(page, index, tag, LenOption);
    data = addedPost;
  }

  if (checkSave === "save") {
    // tache pour enlever les duplicates
    addedPost = addedPost.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.url === value.url)
    );
    await fs.promises.writeFile(
      `history/google/${tag}.json`,
      JSON.stringify(data, null, 2)
    );
  }

  console.log("total is : " + data.length);

  // await browser.close()
}

async function scrapingInstagram(page, position, maxElement) {
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

async function scrapingYoutube(page, position, tag, LenOption) {
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
      let viewstime = element
        .querySelector("#metadata-line")
        .innerText.split("\n");
      singleVideo.url = element.querySelector("a").href;
      let elementText = element.querySelectorAll("yt-formatted-string");
      singleVideo.author = elementText[2].innerText;
      singleVideo.date = viewstime[1];
      singleVideo.views = viewstime[0];
      singleVideo.image = element.querySelector("img").src;
      singleVideo.description = elementText[4]
        ? elementText[4].innerText
        : elementText[3].innerText;
      singleVideo.title = elementText[0].innerText;
      addedVideos.push(singleVideo);
    });
    return addedVideos;
  });
  content = newContent.slice(position, LenOption);
  content.map((element) => (element.id = uuid.v4()));
  return content;
}

async function scrapingTiktok(page, position, tag, LenOption, user) {
  let content = [];
  let limit = parseInt(position) + LenOption;
  const cookiesString = await fs.promises.readFile(`cookies/tiktok/${user}`);
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

async function scrapingGoogle(page, position, tag, LenOption) {
  let content = [];
  let lenElements = position - 10;
  while (content.length < LenOption) {
    lenElements += 10;

    await page.goto(
      `https://www.google.com/search?q=${tag}&start=${lenElements}`
    );
    await page.waitForSelector("#search");
    let newContent = await page.evaluate(() => {
      let objectCollection = [];
      let total = document.querySelectorAll('div[data-header-feature="0"]');
      //chronometres de 10 elements
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

async function globalScraping(
  socialMediaName,
  user,
  tag,
  LenOption,
  checkHistory,
  checkSave
) {
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
    switch (socialMediaName) {
      case "instagram":
        instagramScript(page, user, tag, LenOption, checkHistory, checkSave);
        break;
      case "tiktok":
        tiktokScript(page, user, tag, LenOption, checkHistory, checkSave);
        break;
      case "youtube":
        youtubeScript(page, tag, LenOption, checkHistory, checkSave);
        break;
      case "google":
        googleScript(page, tag, LenOption, checkHistory, checkSave);
        break;
    }
  } catch (e) {
    console.log("erreur est : " + e);
  }
}
(async function main() {
  // user.json tag numberofelements latest/id save

  //script instagram
  globalScraping("instagram", "insta.json", "cars", 5, "latest", "save");
  //script tiktok
  // globalScraping("tiktok", "shidono.json", "cars", 13, "latest", "save");
  //script youtube
  //   globalScraping("youtube", "cars", 13, "latest", "save");
  //script google
  //   globalScraping("google", "cars", 13, "latest", "save");
})();
