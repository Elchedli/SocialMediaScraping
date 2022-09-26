const puppeteer = require("puppeteer");
const fs = require("fs");

async function loginTiktok(page, userfile) {
  const userData = await fs.promises.readFile(`users/tiktok/${userfile}`);
  user = JSON.parse(userData);
  console.log(userfile);
  await page.goto("https://www.tiktok.com/login/phone-or-email/email");
  await page.waitForSelector("form");
  await page.type("input[name='username']", user.username, { delay: 20 });
  await page.type("input[autocomplete='new-password']", user.password, {
    delay: 20,
  });
  await page.click("button[data-e2e='login-button']");
  await page.waitForSelector('div[data-e2e="recommend-list-item-container"]', {
    timeout: 0,
  });
  var cookies = await page.cookies();
  await fs.promises.writeFile(
    `cookies/tiktok/${userfile}`,
    JSON.stringify(cookies, null, 2)
  );
  console.log(`Nouvelles cookies du nom : ${userfile} sont prises`);
}

async function loginInstagram(page, userfile) {
  const userData = await fs.promises.readFile(`users/instagram/${userfile}`);
  user = JSON.parse(userData);
  await page.goto("https://www.instagram.com");
  await page.waitForSelector("form");
  await page.type("input[name='username']", user.username, { delay: 20 });
  await page.type("input[name='password']", user.password, {
    delay: 20,
  });
  await page.click("button[type='submit']");
  await page.waitForSelector("nav", { timeout: 0 });
  var cookies = await page.cookies();
  await fs.promises.writeFile(
    `cookies/instagram/${userfile}`,
    JSON.stringify(cookies, null, 2)
  );
  console.log(`Nouvelles cookies du nom : ${userfile} sont prises`);
}
async function scriptLogin(platform, userfile) {
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
    switch (platform) {
      case "instagram":
        await loginInstagram(page, userfile);
        break;
      case "tiktok":
        await loginTiktok(page, userfile);
        break;
    }
    await browser.close();
  } catch (e) {
    console.log("our error", e);
    close(fs);
  }
}
(async function main() {
  // platform userfile.json
  //tiktok
  // scriptLogin("tiktok", "shidono.json");
  //instagram
  scriptLogin("instagram", "insta.json");
})();
