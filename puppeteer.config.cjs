// puppeteer.config.cjs
const { join } = require('path');

module.exports = {
  cacheDirectory: '/opt/render/.cache/puppeteer',
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