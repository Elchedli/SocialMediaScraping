const fs = require("fs");
(async function main() {
  try {
    const tag = process.argv[2];
    data = [];
    let exist = await fs.existsSync(`history/${tag}.json`);
    if (exist) {
      const savedData = await fs.promises.readFile(`history/${tag}.json`);
      data = JSON.parse(savedData);
    }
    console.log("data length : " + data.length);
  } catch (e) {
    // fs.writeFileSync("err", e);
    console.log("erreur est : " + e);
    // close(fs);
  }
})();
