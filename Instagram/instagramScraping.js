const puppeteer = require("puppeteer");
const fs = require("fs");
const uuid = require("uuid");

async function exists(path) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

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
    await pages[0].close();
    // const cookiesString = await fs.promises.readFile("cookies/");
    const cookiesString = await fs.promises.readFile(
      `cookies/${process.argv[2]}`
    );
    if (cookiesString != "") {
      var cookies = JSON.parse(cookiesString);
      await page.setCookie(...cookies);
    }
    await page.goto(
      `https://www.instagram.com/explore/tags/${process.argv[3]}/`
    );
    await page.waitForSelector("article a");
    var LenOption = process.argv[4];
    var addedPost = [];
    await page.evaluate(() => document.querySelector("article a").click());
    await page.waitForSelector("article[role='presentation']");
    //wait
    for (let index = 0; index < LenOption; index++) {
      let id = uuid.v4();
      let content = await page.evaluate((id) => {
        // let total = document.querySelector("article").querySelectorAll("a");
        let singlePost = {};
        singlePost.id = id;
        let element = document.querySelector("div[role='dialog']");
        singlePost.Image = element.querySelector("img").src || "video";
        let contentExist = element.querySelectorAll(
          "li[role='menuitem'] span"
        )[1];
        singlePost.url = window.location.href;
        singlePost.Description = contentExist ? contentExist.innerText : "";
        if (singlePost.Description != "") {
          if (singlePost.Description.contains("#")) {
            let element = singlePost.Description.replaceAll(" ", "");
            element = element.replaceAll("\n", "").split("#");
            element.shift();
            singlePost.Tags = element;
            singlePost.Description = singlePost.Description.split("#", 2)[0];
          }
        } else {
          singlePost.Tags = "";
        }
        // if (singlePost.Description != "") {
        //     singlePost.Description.forEach((element, index, array) => {
        //         if (element.contains('#')) {
        //             let total = element.replaceAll(" ", "");
        //             total = element.replace("\n", "")
        //             total = total.split("#");
        //             if (total[0] == "") array.splice(index, 1)
        //             else array[index] = total[0]
        //             total.shift()
        //             singlePost.Tags = singlePost.Tags.concat(total);
        //         }
        //     });
        // }
        // singlePost.Tags = singlePost.Description.split("\n")[-1];
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

    // if (process.argv[5] == "saved") {
    //   //   let exist = await fs.access(`history/${process.argv[3]}.json`, (err) =>
    //   //     err ? false : true
    //   //   );
    //   //   let exist = exists(`history/${process.argv[3]}.json`);
    //   let exist = await fs.existsSync(`history/${process.argv[3]}.json`);
    //   console.log("exist is : " + exist);
    //   if (exist) {
    //     console.log("hooray");
    //     const savedData = await fs.promises.readFile(
    //       `history/${process.argv[3]}.json`
    //     );
    //     console.log(" i am here?");
    //     let data = JSON.parse(savedData);
    //     data = data.concat(addedPost);
    //   } else {
    //     console.log("nah man");
    //     let data = {
    //       last: addedPost[addedPost.length - 1].id,
    //       content: addedPost,
    //     };
    //     await fs.promises.writeFile(
    //       `history/${process.argv[3]}.json`,
    //       JSON.stringify(data, null, 2)
    //     );
    //   }
    // }

    console.log(addedPost);
    console.log("total is : " + addedPost.length);
    // console.log("")

    // await browser.close()
  } catch (e) {
    console.log("erreur est : " + e);
    // close(fs);
  }
})();
