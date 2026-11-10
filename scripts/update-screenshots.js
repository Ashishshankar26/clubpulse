const puppeteer = require('puppeteer-core');

async function snap() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Login as Priya Patel
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
  await page.type('input[placeholder="e.g. 2023BCSE014"]', '2022BIT088');
  await page.type('input[placeholder="Enter your password"]', 'college123');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 2000));

  // Dashboard
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'docs/report_screenshots/02_dashboard_lead.png' });

  // Workload
  await page.goto('http://localhost:3000/workload', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'docs/report_screenshots/07_workload_burnout.png' });

  console.log('Screenshots updated successfully!');
  await browser.close();
}
snap().catch(console.error);

