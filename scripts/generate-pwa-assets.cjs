const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const BG_COLOR = { r: 238, g: 252, b: 255, alpha: 1 }; // #eefcff

async function generateSquareIcon(svgPath, size, outputPath) {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Render SVG to buffer
  const svgBuffer = await sharp(svgPath)
    .resize(size, size, { fit: 'fill' })
    .toBuffer();

  // Composite over a solid 100% opaque #eefcff background
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BG_COLOR
    }
  })
    .composite([{ input: svgBuffer }])
    .png({ compressionLevel: 9 })
    .toFile(outputPath);

  console.log(`Generated: ${outputPath} (${size}x${size})`);
}

async function generateSplashScreen(svgPath, width, height, logoSize, outputPath) {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const logoBuffer = await sharp(svgPath)
    .resize(logoSize, logoSize, { fit: 'contain' })
    .toBuffer();

  await sharp({
    create: {
      width: width,
      height: height,
      channels: 4,
      background: BG_COLOR
    }
  })
    .composite([{
      input: logoBuffer,
      top: Math.round((height - logoSize) / 2),
      left: Math.round((width - logoSize) / 2)
    }])
    .png({ compressionLevel: 9 })
    .toFile(outputPath);

  console.log(`Generated Splash: ${outputPath} (${width}x${height})`);
}

async function main() {
  const svgSource = path.resolve(__dirname, '../public/app-icon.svg');
  if (!fs.existsSync(svgSource)) {
    console.error('Source SVG not found:', svgSource);
    process.exit(1);
  }

  console.log('Generating square icons with #eefcff background...');

  const squareTargets = [
    // public/images/app
    { size: 192, path: 'public/images/app/android-chrome-192x192.png' },
    { size: 384, path: 'public/images/app/android-chrome-384x384.png' },
    { size: 512, path: 'public/images/app/icon-512x512.png' },
    { size: 192, path: 'public/images/app/icons-192.png' },
    { size: 256, path: 'public/images/app/icons-256.png' },
    { size: 512, path: 'public/images/app/icons-512.png' },
    { size: 512, path: 'public/images/app/favicon.png' },

    // public/icons
    { size: 192, path: 'public/icons/android-chrome-192x192.png' },
    { size: 192, path: 'public/icons/icons-192.png' },
    { size: 256, path: 'public/icons/icons-256.png' },
    { size: 512, path: 'public/icons/icons-512.png' },
    { size: 180, path: 'public/icons/apple-touch-icon.png' },
    { size: 180, path: 'public/icons/touch-icon-iphone.png' },
    { size: 180, path: 'public/icons/touch-icon-iphone-retina.png' },
    { size: 167, path: 'public/icons/touch-icon-ipad-retina.png' },
    { size: 32,  path: 'public/icons/favicon-32x32.png' },
    { size: 16,  path: 'public/icons/favicon-16x16.png' },
    { size: 512, path: 'public/icons/favicon.png' },

    // public root
    { size: 192, path: 'public/site-icon.png' },
    { size: 180, path: 'public/apple-touch-icon.png' },
    { size: 512, path: 'public/app-icon.png' },
    { size: 512, path: 'public/favicon.png' },
    { size: 192, path: 'public/favicon-192.png' },
    { size: 32,  path: 'public/favicon-32.png' },
    { size: 16,  path: 'public/favicon-16.png' },

    // mirror to images/app & images/icons for fallback / dev
    { size: 192, path: 'images/app/android-chrome-192x192.png' },
    { size: 384, path: 'images/app/android-chrome-384x384.png' },
    { size: 512, path: 'images/app/icon-512x512.png' },
    { size: 192, path: 'images/app/icons-192.png' },
    { size: 256, path: 'images/app/icons-256.png' },
    { size: 512, path: 'images/app/icons-512.png' },
    { size: 512, path: 'images/app/favicon.png' },

    { size: 192, path: 'images/icons/android-chrome-192x192.png' },
    { size: 192, path: 'images/icons/icons-192.png' },
    { size: 256, path: 'images/icons/icons-256.png' },
    { size: 512, path: 'images/icons/icons-512.png' },
    { size: 180, path: 'images/icons/apple-touch-icon.png' },
    { size: 180, path: 'images/icons/touch-icon-iphone.png' },
    { size: 180, path: 'images/icons/touch-icon-iphone-retina.png' },
    { size: 167, path: 'images/icons/touch-icon-ipad-retina.png' },
    { size: 32,  path: 'images/icons/favicon-32x32.png' },
    { size: 16,  path: 'images/icons/favicon-16x16.png' },
    { size: 512, path: 'images/icons/favicon.png' },

    { size: 192, path: 'images/site-icon.png' },
    { size: 512, path: 'images/app-icon.png' },
    { size: 512, path: 'images/favicon.png' },
  ];

  for (const t of squareTargets) {
    await generateSquareIcon(svgSource, t.size, path.resolve(__dirname, '..', t.path));
  }

  // Update SVG files to ensure #eefcff background
  const appSvg = fs.readFileSync(svgSource, 'utf8');
  fs.writeFileSync(path.resolve(__dirname, '../public/images/app/app-500x500.svg'), appSvg, 'utf8');
  fs.writeFileSync(path.resolve(__dirname, '../public/icons/app-500x500.svg'), appSvg, 'utf8');
  if (fs.existsSync(path.resolve(__dirname, '../images/app'))) {
    fs.writeFileSync(path.resolve(__dirname, '../images/app/app-500x500.svg'), appSvg, 'utf8');
  }
  if (fs.existsSync(path.resolve(__dirname, '../images/icons'))) {
    fs.writeFileSync(path.resolve(__dirname, '../images/icons/app-500x500.svg'), appSvg, 'utf8');
  }

  console.log('Generating iOS splash screens with #eefcff background...');
  const splashTargets = [
    { w: 2048, h: 2732, logo: 512, name: 'apple_splash_2048.png' },
    { w: 1668, h: 2224, logo: 450, name: 'apple_splash_1668.png' },
    { w: 1536, h: 2048, logo: 400, name: 'apple_splash_1536.png' },
    { w: 1242, h: 2208, logo: 350, name: 'apple_splash_1242.png' },
    { w: 1125, h: 2436, logo: 320, name: 'apple_splash_1125.png' },
    { w: 750,  h: 1334, logo: 220, name: 'apple_splash_750.png' },
    { w: 640,  h: 1136, logo: 180, name: 'apple_splash_640.png' }
  ];

  for (const s of splashTargets) {
    await generateSplashScreen(svgSource, s.w, s.h, s.logo, path.resolve(__dirname, `../public/icons/${s.name}`));
    await generateSplashScreen(svgSource, s.w, s.h, s.logo, path.resolve(__dirname, `../images/icons/${s.name}`));
  }

  console.log('All assets generated successfully!');
}

main().catch(err => {
  console.error('Fatal error generating assets:', err);
  process.exit(1);
});
