// puppeteer.config.cjs – Config oficial do Render
const {executablePath} = require('puppeteer');
const {join} = require('path');

module.exports = {
  cacheDirectory: join(__dirname, '.puppeteer'),
  executablePath: executablePath(),
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--single-process',
    '--disable-gpu'
  ]
};