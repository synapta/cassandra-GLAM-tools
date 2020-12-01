/**
 * @name metabase
 *
 * @desc Logs into metabase. Provide your username and password as environment variables when running the script, i.e:
 * `META_USER=email_address META_PWD=password node metabase.js && open meta.pdf`
 *
 */
const jwt = require("jsonwebtoken");
const puppeteer = require('puppeteer');
const screenshot = {
  fullPage: true,
};
let lastScreenshot;
let lastScreenDate;
const METABASE_SITE_URL = "https://metabase-wmch.synapta.io";
const METABASE_SECRET_KEY = "8c3242646342e6d1bc422bf709a6a82acbf7624ab83f980630b4b4e293c30ea9";

function getDashboardUrl(){

  const payload = {
    resource: {dashboard: 2},
    params: {},
    exp: Math.round(Date.now() / 1000) + (10 * 60) // 10 minute expiration
  };
  const token = jwt.sign(payload, METABASE_SECRET_KEY);
  return  METABASE_SITE_URL + "/embed/dashboard/" + token + "#bordered=true&titled=true";
}



async function getPng (req,res){
  const url = getDashboardUrl();
  if (!lastScreenDate || !lastScreenshot || new Date () - lastScreenDate > 3600000) {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080});

    await page.goto(url+'#bordered=true&titled=true',{waitUntil: 'networkidle2'});
    // await page.waitForNavigation();
    await page.waitForTimeout(5200);
    console.log('=====Capture');
    // await page.pdf({path: 'meta.pdf'});
    const resultImage = await page.screenshot(screenshot);
    await browser.close();
    lastScreenshot = resultImage;
    lastScreenDate = new Date();
    res.set('Content-Type', 'image/png');
    res.send(resultImage);
  }
  else {
    res.set('Content-Type', 'image/png');
    res.send(lastScreenshot);
  }
}

exports.getDashboardUrl = getDashboardUrl;
exports.getPng = getPng;
