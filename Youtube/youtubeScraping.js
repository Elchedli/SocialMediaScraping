// tag numberofelements
const puppeteer = require("puppeteer");
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
        await pages[0].close();
        await page.goto(
            `https://www.youtube.com/results?search_query=${process.argv[2]}`
        );
        await page.waitForSelector("#contents");
        let LenOption = process.argv[3];
        for (let index = 0; index < parseInt(LenOption / 4) + 3; index++) {
            await page.waitForTimeout(500);
            await page.evaluate(() => {
                window.scrollBy(0, window.innerHeight);
            });
        }
        let content = await page.evaluate(() => {
            let addedVideos = [];
            //   let total = document.querySelectorAll(
            //     "#video-title > yt-formatted-string"
            //   );
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
                singleVideo.description = elementText[4] ?
                    elementText[4].innerText :
                    elementText[3].innerText;
                singleVideo.title = elementText[0].innerText;
                // singleVideo.Tags = singleVideo.Description.split('\n')[-1];
                addedVideos.push(singleVideo);
            });
            return addedVideos;
        });
        content = content.slice(0, LenOption);
        content.map((element) => (element.id = uuid.v4()));
        console.log(content);
        console.log("total est : " + content.length);
        // style-scope
        // ytd-item-section-renderer
    } catch (e) {
        console.log("our error", e);
    }
})();