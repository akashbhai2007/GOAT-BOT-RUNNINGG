// autoRefreshBot_env.js
require('dotenv').config();
const fs = require('fs');
const puppeteer = require('puppeteer');
const axios = require('axios');

const ACCOUNT_FILE = './account.txt';
const CHECK_INTERVAL = 5 * 60 * 1000; // প্রতি 5 মিনিটে চেক

function readCookie() {
  if (!fs.existsSync(ACCOUNT_FILE)) return null;
  return fs.readFileSync(ACCOUNT_FILE, 'utf8').trim();
}
function writeCookie(cookie) {
  fs.writeFileSync(ACCOUNT_FILE, cookie, 'utf8');
  console.log('✅ account.txt updated with new cookie');
}

async function isCookieValid(cookie) {
  try {
    const res = await axios.get('https://facebook.com', {
      headers: { Cookie: cookie },
      timeout: 5000
    });
    return res.status === 200;
  } catch {
    return false;
  }
}

async function refreshCookie(email, password) {
  console.log('🔄 Refreshing cookie...');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  await page.goto('https://facebook.com/login', { waitUntil: 'networkidle2' });

  await page.type('#email', email, { delay: 50 });
  await page.type('#pass', password, { delay: 50 });
  await page.click('[name="login"]');

  try {
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
  } catch (err) {
    console.warn('⏱️ Navigation timeout — maybe checkpoint/2FA required');
  }

  const cookies = await page.cookies();
  const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');

  await browser.close();
  console.log('✅ New cookie fetched');
  return cookieString;
}

async function autoRefresh(email, password) {
  let cookie = readCookie();

  if (!cookie) {
    cookie = await refreshCookie(email, password);
    writeCookie(cookie);
  }

  setInterval(async () => {
    const valid = await isCookieValid(cookie);
    if (!valid) {
      console.log('❌ Cookie expired, fetching new one...');
      cookie = await refreshCookie(email, password);
      writeCookie(cookie);
    } else {
      console.log('✅ Cookie still valid');
    }
  }, CHECK_INTERVAL);
}

const EMAIL = process.env.FB_EMAIL;
const PASSWORD = process.env.FB_PASS;

if (!EMAIL || !PASSWORD) {
  console.error('❌ .env missing FB_EMAIL or FB_PASS');
  process.exit(1);
}

autoRefresh(EMAIL, PASSWORD);
