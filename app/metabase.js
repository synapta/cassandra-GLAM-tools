/**
 * @name metabase
 *
 * @desc Logs into metabase. Provide your username and password as environment variables when running the script, i.e:
 * `META_USER=email_address META_PWD=password node metabase.js && open meta.pdf`
 *
 */
const puppeteer = require('puppeteer');
const screenshot = {
  path: 'metascreen.png',
  fullPage: true,
};

(async () => {
  const browser = await puppeteer.launch({headless: false}) //use this instead of below to troubleshoot
  // const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080});
  await page.goto('https://metabase-wmch.synapta.io/embed/dashboard/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZXNvdXJjZSI6eyJkYXNoYm9hcmQiOjJ9LCJwYXJhbXMiOnt9LCJleHAiOjE2MDY4MTk2MTcsImlhdCI6MTYwNjgxOTAxNn0.hiQ-NWxMI_KqKTf5QSDcjOtXtk4CsZ8q2MnWkZmoDKA#bordered=true&titled=true',{waitUntil: 'networkidle2'});
  // await page.waitForNavigation();
  await page.waitForTimeout(5200);
  console.log('=====Capture');
  // await page.pdf({path: 'meta.pdf'});
  await page.screenshot(screenshot);
  await browser.close();
  console.log('See screenshot: ' + screenshot);
})();
