const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const brandDir = path.join(publicDir, 'brand');
const uploadsDir = path.join(publicDir, 'uploads');
const postsDir = path.join(rootDir, 'posts');

if (!fs.existsSync(brandDir)) fs.mkdirSync(brandDir, { recursive: true });
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// 1. Copy Logo Black
const logoBlackSrc = path.join(rootDir, 'TOM APPRPVED BLACK.png');
if (fs.existsSync(logoBlackSrc)) {
  fs.copyFileSync(logoBlackSrc, path.join(brandDir, 'logo-black.png'));
  console.log('Copied logo-black.png');
}

// 2. Copy Original Logo JPG
const logoOrigSrc = path.join(rootDir, 'TOM APPRPVED copy.jpg');
if (fs.existsSync(logoOrigSrc)) {
  fs.copyFileSync(logoOrigSrc, path.join(brandDir, 'logo-original.jpg'));
  console.log('Copied logo-original.jpg');
}

// 3. Create SVG White Logo wrapper for high contrast over dark backgrounds
const svgLogoWhite = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
  <filter id="invert">
    <feColorMatrix type="matrix" values="
      -1  0  0  0  1
       0 -1  0  0  1
       0  0 -1  0  1
       0  0  0  1  0"/>
  </filter>
  <image href="/brand/logo-black.png" width="1000" height="1000" filter="url(#invert)" />
</svg>`;
fs.writeFileSync(path.join(brandDir, 'logo-white.svg'), svgLogoWhite);

// 4. Copy and map posts campaign images
if (fs.existsSync(postsDir)) {
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
  files.sort();
  files.forEach((file, index) => {
    const num = String(index + 1).padStart(2, '0');
    const destName = `look-${num}.jpg`;
    fs.copyFileSync(path.join(postsDir, file), path.join(uploadsDir, destName));
    console.log(`Mapped ${file} -> /uploads/${destName}`);
  });
}
