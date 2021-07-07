const jwt = require('jsonwebtoken');
const puppeteer = require('puppeteer');

const screenshot = {
  fullPage: true,
};
const lastScreenshot = {};
const lastScreenDate = {};

function getDashboardUrl(dashboard_id, metabase) {
  const payload = {
    resource: { dashboard: dashboard_id },
    params: {},
    exp: Math.round(Date.now() / 1000) + (10 * 60) // 10 minute expiration
  };
  const token = jwt.sign(payload, metabase.secret);
  return metabase.proxy + "/metabase/embed/dashboard/" + token + "#bordered=true&titled=true";
};

function getDashboard(req, res, config, glam) {
  if (!glam['dashboard_id']) {
    res.sendStatus(404);
  } else {
    res.json({
      iframeUrl: getDashboardUrl(glam['dashboard_id'], config.metabase)
    });
  }
}

async function getPng(req, res, config, glam) {
  if (!glam['dashboard_id']) {
    res.sendStatus(404);
    return;
  }

  const id = glam['dashboard_id'];
  const url = getDashboardUrl(id, config.metabase);

  if (!lastScreenDate[id] || !lastScreenshot[id] || new Date() - lastScreenDate[id] > 3600000) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(url + '#bordered=true&titled=true', { waitUntil: 'networkidle2', timeout: 0 });
    await page.waitForTimeout(5000);
    const resultImage = await page.screenshot(screenshot);
    await browser.close();
    lastScreenshot[id] = resultImage;
    lastScreenDate[id] = new Date();
  }
  res.set('Content-Type', 'image/png');
  res.setHeader('Content-Disposition', 'attachment; filename=\"' + glam['name'] + '-' + lastScreenDate[id].getTime() + '.png\"');
  res.send(lastScreenshot[id]);
}

exports.getDashboard = getDashboard;
exports.getPng = getPng;
