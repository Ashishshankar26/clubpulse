const puppeteer = require('puppeteer-core');

async function test() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  // Login as Priya Patel
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
  await page.type('input[placeholder="e.g. 2023BCSE014"]', '2022BIT088');
  await page.type('input[placeholder="Enter your password"]', 'college123');
  await page.click('button[type="submit"]');

  await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
  await new Promise(r => setTimeout(r, 2000));

  // Go to recruitment
  await page.goto('http://localhost:3000/recruitment', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  const pageInfo = await page.evaluate(() => {
    return {
      title: document.title,
      url: window.location.href,
      text: document.body.innerText,
    };
  });

  console.log('--- PAGE INFO ---');
  console.log('URL:', pageInfo.url);
  console.log('Includes Arjun Mehta?', pageInfo.text.includes('Arjun Mehta'));
  console.log('Includes No candidates match?', pageInfo.text.includes('No candidates match the selected filters'));
  
  // Let's capture the state of recruitment
  const details = await page.evaluate(() => {
    const selectorEl = document.querySelector('select');
    const options = Array.from(selectorEl ? selectorEl.querySelectorAll('option') : []).map(o => ({ value: o.value, text: o.text }));
    const buttons = Array.from(document.querySelectorAll('button')).map(b => b.innerText);
    return {
      options,
      buttons,
      cards: document.querySelectorAll('.divide-y > div').length
    };
  });

  console.log('Details:', JSON.stringify(details, null, 2));

  await browser.close();
}

test().catch(console.error);
