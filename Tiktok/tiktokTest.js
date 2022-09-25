// user.json tag numberofelements
const puppeteer = require("puppeteer");
const fs = require("fs");
const uuid = require("uuid");
(async function main() {
    try {
        const browser = await puppeteer.launch({
            headless: false,
            executablePath: "C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe",
            defaultViewport: null,
            ignoreDefaultArgs: ["--enable-automation"],
            args: ["--no-sandbox", "--disable-dev-shm-usage"],
        });
        const pages = await browser.pages();
        const page = await browser.newPage();
        await page.setDefaultNavigationTimeout(0);
        await pages[0].close();
        const cookiesString = await fs.promises.readFile(
            `cookies/${process.argv[2]}`
        );
        if (cookiesString != "") {
            var cookies = JSON.parse(cookiesString);
            await page.setCookie(...cookies);
        }
        await page.goto(`https://www.tiktok.com/search/video?q=${process.argv[3]}`);
        await page.waitForSelector('div[data-e2e="search_video-item"]', {
            timeout: 0,
        });
        let total = 12;
        await page.evaluate(() => {
            window.scrollBy(0, window.innerHeight);
        });
        while (total < parseInt(process.argv[4])) {
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
                let bottomContent = element.lastChild;
                object.url = element.querySelector("a").href;
                object.author = bottomContent.querySelector("p").innerText;
                object.date = [...element.firstChild.querySelectorAll("div")].pop().innerText;
                object.views = bottomContent.querySelector('div[data-e2e="search-card-like-container"]').innerText;
                object.image = element.firstChild.querySelector("img").src;
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
        content = content.slice(0, process.argv[4]);
        content.map((element) => (element.id = uuid.v4()));
        console.log(content);
        console.log("total is : " + content.length);
        // await browser.close();
    } catch (e) {
        console.log("erreur est : " + e);
    }
})();