const puppeteer = require('puppeteer');
const path = require('path');
const { execSync } = require('child_process');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    // App Store screenshot size (6.7 inch iPhone)
    const targetWidth = 1290;
    const targetHeight = 2796;

    // Capture hero section
    const captureWidth = 1600;
    const captureHeight = 1000;

    await page.setViewport({ width: captureWidth, height: captureHeight, deviceScaleFactor: 1 });

    const filePath = path.resolve(__dirname, 'screenshot.html');
    await page.goto(`file://${filePath}`, { waitUntil: 'networkidle0' });

    await new Promise(r => setTimeout(r, 3000));

    const screenshotsDir = path.join(__dirname, 'screenshots');
    const bgColor = '#ffffff';

    // Screenshot 1: Badges (left area with 1위 marks)
    const badges = path.join(screenshotsDir, 'badges.png');
    await page.screenshot({
        path: badges,
        clip: { x: 0, y: 0, width: 350, height: 950 }
    });

    // Screenshot 2: Center text
    const centerText = path.join(screenshotsDir, 'center.png');
    await page.screenshot({
        path: centerText,
        clip: { x: 350, y: 200, width: 1000, height: 500 }
    });

    await browser.close();

    // 1. Badges - scale 3x, trim whitespace, then place left of center
    execSync(`magick "${badges}" -trim -resize 300% -background "${bgColor}" -gravity west -extent ${targetWidth}x${targetHeight} "${path.join(screenshotsDir, 'appstore_1.png')}"`);
    console.log('Screenshot 1 (badges 3x) saved');

    // 2. Center text - trim, scale 273% (210% * 1.3) and center
    execSync(`magick "${centerText}" -trim -resize 273% -background "${bgColor}" -gravity center -extent ${targetWidth}x${targetHeight} "${path.join(screenshotsDir, 'appstore_2.png')}"`);
    console.log('Screenshot 2 (center text 2.73x) saved');

    // 3. Just background color
    execSync(`magick -size ${targetWidth}x${targetHeight} xc:"${bgColor}" "${path.join(screenshotsDir, 'appstore_3.png')}"`);
    console.log('Screenshot 3 (background) saved');

    // Cleanup
    execSync(`rm -f "${badges}" "${centerText}"`);
    console.log('Done!');
})();
