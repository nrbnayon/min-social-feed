const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Helper to write raw PNG
function createPNG(width, height, getPixelRGBA) {
  // Signature
  const signature = Buffer.from([138, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8 bits per channel
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10); // Compression
  ihdrData.writeUInt8(0, 11); // Filter
  ihdrData.writeUInt8(0, 12); // Interlace

  const ihdr = makeChunk('IHDR', ihdrData);

  // Raw image data with filter byte 0 at start of each scanline
  const rawData = Buffer.alloc(height * (width * 4 + 1));
  let offset = 0;

  for (let y = 0; y < height; y++) {
    rawData.writeUInt8(0, offset++); // Filter byte for scanline
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixelRGBA(x, y, width, height);
      rawData.writeUInt8(r, offset++);
      rawData.writeUInt8(g, offset++);
      rawData.writeUInt8(b, offset++);
      rawData.writeUInt8(a, offset++);
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idat = makeChunk('IDAT', compressed);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const crc = crc32(Buffer.concat([typeBuf, data]));
  crcBuf.writeUInt32BE(crc >>> 0, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

// CRC32 table & calculation
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

// Helper color interpolation
function lerp(a, b, t) {
  return a + (b - a) * t;
}

// 1. App Icon Generator (1024x1024)
function generateAppIcon() {
  const size = 1024;
  return createPNG(size, size, (x, y, w, h) => {
    const nx = x / w;
    const ny = y / h;

    // Dark luxury background #090A12
    let r = 9, g = 10, b = 18, a = 255;

    // Center icon geometry
    const cx = w / 2;
    const cy = h / 2;
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Subtle background glow
    if (dist < 420) {
      const glow = Math.pow(1 - dist / 420, 2);
      r = Math.min(255, r + 99 * glow * 0.4);
      g = Math.min(255, g + 102 * glow * 0.3);
      b = Math.min(255, b + 241 * glow * 0.6);
    }

    // Rounded rectangle emblem (center: 480x480)
    const cardSize = 240; // half size
    const cornerRadius = 90;
    const rx = Math.abs(dx);
    const ry = Math.abs(dy);

    let insideCard = false;
    if (rx <= cardSize && ry <= cardSize) {
      if (rx <= cardSize - cornerRadius || ry <= cardSize - cornerRadius) {
        insideCard = true;
      } else {
        const cdx = rx - (cardSize - cornerRadius);
        const cdy = ry - (cardSize - cornerRadius);
        if (cdx * cdx + cdy * cdy <= cornerRadius * cornerRadius) {
          insideCard = true;
        }
      }
    }

    if (insideCard) {
      // Gradient from Indigo (#6366F1 -> 99, 102, 241) to Pink (#EC4899 -> 236, 72, 153)
      const gradT = (nx + ny) / 2;
      let cr = Math.round(lerp(99, 236, gradT));
      let cg = Math.round(lerp(102, 72, gradT));
      let cb = Math.round(lerp(241, 153, gradT));

      // Draw speech bubble icon cutout inside card
      // Chat Bubble: center ellipse/rect + small bottom-left triangle
      const bbx = dx;
      const bby = dy + 15;
      const bw = 120; // width radius
      const bh = 95;  // height radius
      const bdist = (bbx * bbx) / (bw * bw) + (bby * bby) / (bh * bh);

      // Tail of bubble
      const inTail = (bbx >= -110 && bbx <= -40 && bby >= 40 && bby <= 120 && (bbx + bby) < 10);

      if (bdist <= 1.0 || inTail) {
        // Inner white / soft light
        return [255, 255, 255, 255];
      }

      return [cr, cg, cb, 255];
    }

    return [Math.round(r), Math.round(g), Math.round(b), a];
  });
}

// 2. Splash Logo (Transparent background)
function generateLogo() {
  const size = 512;
  return createPNG(size, size, (x, y, w, h) => {
    const cx = w / 2;
    const cy = h / 2;
    const dx = x - cx;
    const dy = y - cy;

    const cardSize = 160;
    const cornerRadius = 60;
    const rx = Math.abs(dx);
    const ry = Math.abs(dy);

    let insideCard = false;
    if (rx <= cardSize && ry <= cardSize) {
      if (rx <= cardSize - cornerRadius || ry <= cardSize - cornerRadius) {
        insideCard = true;
      } else {
        const cdx = rx - (cardSize - cornerRadius);
        const cdy = ry - (cardSize - cornerRadius);
        if (cdx * cdx + cdy * cdy <= cornerRadius * cornerRadius) {
          insideCard = true;
        }
      }
    }

    if (!insideCard) {
      return [0, 0, 0, 0]; // transparent
    }

    const gradT = ((x / w) + (y / h)) / 2;
    let cr = Math.round(lerp(99, 236, gradT));
    let cg = Math.round(lerp(102, 72, gradT));
    let cb = Math.round(lerp(241, 153, gradT));

    const bbx = dx;
    const bby = dy + 10;
    const bw = 80;
    const bh = 65;
    const bdist = (bbx * bbx) / (bw * bw) + (bby * bby) / (bh * bh);
    const inTail = (bbx >= -75 && bbx <= -30 && bby >= 25 && bby <= 80 && (bbx + bby) < 5);

    if (bdist <= 1.0 || inTail) {
      return [255, 255, 255, 255];
    }

    return [cr, cg, cb, 255];
  });
}

// 3. Favicon (48x48)
function generateFavicon() {
  const size = 48;
  return createPNG(size, size, (x, y, w, h) => {
    const cx = w / 2;
    const cy = h / 2;
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 22) return [0, 0, 0, 0];

    const gradT = ((x / w) + (y / h)) / 2;
    let cr = Math.round(lerp(99, 236, gradT));
    let cg = Math.round(lerp(102, 72, gradT));
    let cb = Math.round(lerp(241, 153, gradT));

    if (dist < 10) return [255, 255, 255, 255];

    return [cr, cg, cb, 255];
  });
}

const iconsDir = path.join(__dirname, '..', 'assets', 'icons');
const imagesDir = path.join(__dirname, '..', 'assets', 'images');

fs.mkdirSync(iconsDir, { recursive: true });
fs.mkdirSync(imagesDir, { recursive: true });

fs.writeFileSync(path.join(iconsDir, 'app-icon.png'), generateAppIcon());
fs.writeFileSync(path.join(iconsDir, 'logo.png'), generateLogo());
fs.writeFileSync(path.join(imagesDir, 'favicon.png'), generateFavicon());
fs.writeFileSync(path.join(imagesDir, 'logo.png'), generateLogo());

console.log('✅ Generated brand assets successfully in assets/icons and assets/images');
