//npm i puppeteer-real-browser
//wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
//sudo dpkg -i google-chrome-stable_current_amd64.deb
//sudo apt update && sudo apt install xvfb -y
//ubuntu setup

const { connect } = require("puppeteer-real-browser");
const fs = require("fs");

const TARGET = process.argv[2];
const PROXY = process.argv[3];
const UA = process.argv[4];

const proxyParts = PROXY.split(":");
let proxyAddress = `${proxyParts[0]}:${proxyParts[1]}`;
let proxyUser = null, proxyPass = null;
if (proxyParts.length === 4) {
    proxyUser = proxyParts[2];
    proxyPass = proxyParts[3];
}

const realBrowserOption = {
    args: [`--proxy-server=${proxyAddress}`],
    turnstile: true,
    headless: false,
    customConfig: {},
    connectOption: { defaultViewport: null },
    plugins: []
};

(async () => {
    let browser;
    let cookieString = "";
    try {
        const { page, browser: b } = await connect(realBrowserOption);
        browser = b;
        if (proxyUser && proxyPass) {
            await page.authenticate({ username: proxyUser, password: proxyPass });
        }
        await page.setUserAgent(UA);
        await page.goto(TARGET);
        let verify = null;
        let startDate = Date.now();
        while (!verify && (Date.now() - startDate) < 15000) {
            const title = await page.title();
            if (title === "Attention Required! | Cloudflare") {
                console.error(`error`);
                break;
            }
            if (title !== "Just a moment...") {
                verify = true;
            }
            await new Promise(r => setTimeout(r, 1000));
        }
        const cookies = await page.cookies();
        cookieString = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join("; ");
        console.log(cookieString);
    } catch (error) {
        console.error(`error`);
    } finally {
        if (browser) await browser.close();
    }
})();
