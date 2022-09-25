// tag numberofelements
const puppeteer = require("puppeteer");
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

        // await page.setRequestInterception(true);
        await page.goto(`https://www.google.com/search?q=${process.argv[2]}`);
        await page.waitForSelector("#search");
        await page.waitForTimeout(4000);
        var LenElements = 10;
        var LenOption = parseInt(process.argv[3]);
        let content = await page.evaluate(() => {
            let objectCollection = [];
            let total = document.querySelectorAll('div[data-header-feature="0"]');
            //chronometres de 10 elements
            //   https://www.google.com/search?q=access&start=20
            total.forEach((element) => {
                let object = {};
                object.title = element.querySelector("h3").innerText.split(" -")[0];
                object.site = element.querySelector("cite").innerText.split(" ›")[0];
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
        console.log(content);
        while (content.length < LenOption) {
            LenElements += 10;
            await page.goto(
                `https://www.google.com/search?q=${process.argv[2]}&start=${LenElements}`
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
        console.log(content);
        console.log("total is : " + content.length);
    } catch (e) {
        // fs.writeFileSync("err", e);
        console.log("erreur est : " + e);
        // close(fs);
    }
})();