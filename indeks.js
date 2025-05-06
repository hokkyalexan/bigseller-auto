const puppeteer = require("puppeteer");
const Tesseract = require("tesseract.js");

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.goto("https://www.bigseller.com");

  await page.type("input[placeholder='Phone/Email']", process.env.EMAIL);
  await page.type("input[placeholder='Password']", process.env.PASSWORD);

  const captchaInput = await page.$("input[placeholder='Enter the graphic code']");
  const box = await captchaInput.boundingBox();
  await page.screenshot({
    path: "captcha.png",
    clip: { x: box.x, y: box.y, width: box.width, height: box.height }
  });

  const { data: { text } } = await Tesseract.recognize("captcha.png", "eng");
  const captcha = text.replace(/\s/g, "");
  await page.type("input[placeholder='Enter the graphic code']", captcha);

  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle2" }),
    page.click("button:has-text('Log In')")
  ]);

  await page.waitForSelector("li[data-status='2']");
  await page.click("li[data-status='2']");
  await page.waitForTimeout(1000);
  await page.click("button.export-btn");
  await page.waitForTimeout(1000);
  await page.click("li.export-all");
  await page.click(".template-dropdown");
  await page.waitForSelector("li[data-template='Siap Kirim 2']");
  await page.click("li[data-template='Siap Kirim 2']");
  await page.click("button.confirm-export");
  await page.waitForTimeout(3000);
  await page.click("button.download-export");

  console.log("✅ Selesai!");
  await browser.close();
})();
