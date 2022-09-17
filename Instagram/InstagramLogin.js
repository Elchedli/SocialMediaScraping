const puppeteer = require("puppeteer");
const fs = require("fs");

function delay(time) {
    return new Promise(function(resolve) {
        setTimeout(resolve, time);
    });
}

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
        const userData = await fs.promises.readFile(`users/${process.argv[2]}`);
        user = JSON.parse(userData);
        // console.log(user);
        await page.goto("https://www.instagram.com");
        await page.waitForSelector("form");
        await page.type("input[name='username']", user.username, { delay: 20 });
        await page.type("input[name='password']", user.password, {
            delay: 20,
        });
        await page.click("button[type='submit']");
        await page.waitForSelector(
            'nav', { timeout: 0 }
        );

        // await page.waitForTimeout(6000);
        // await page.waitForSelector("article");
        var cookies = await page.cookies();
        await fs.promises.writeFile(
            `cookies/${process.argv[2]}`,
            JSON.stringify(cookies, null, 2)
        );
        console.log(`Nouvelles cookies du nom : ${process.argv[2]} est pris`);
        await browser.close();
    } catch (e) {
        console.log("our error", e);
        close(fs);
    }
})();