import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function createPNG(width, height, drawFn) {
  // CRC table
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    crcTable[n] = c;
  }

  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(12 + len);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4);
    data.copy(buf, 8);
    const crcVal = crc32(buf.subarray(4, 8 + len));
    buf.writeUInt32BE(crcVal, 8 + len);
    return buf;
  }

  // Raw image data: height scanlines, each (1 + width * 4) bytes
  const rowSize = 1 + width * 4;
  const raw = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    raw[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawFn(x, y, width, height);
      const pixelOffset = rowOffset + 1 + x * 4;
      raw[pixelOffset] = r;
      raw[pixelOffset + 1] = g;
      raw[pixelOffset + 2] = b;
      raw[pixelOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(raw, { level: 9 });

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth
  ihdr[9] = 6; // Color type: RGBA
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Drawing function for ODS Catering Master icon
function drawIcon(x, y, w, h, isMaskable = false) {
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.hypot(x - cx, y - cy);
  const maxR = w / 2;

  // Background: Rich midnight slate gradient #0f172a to #070a11
  const tY = y / h;
  let bgR = Math.round(15 * (1 - tY) + 7 * tY);
  let bgG = Math.round(23 * (1 - tY) + 10 * tY);
  let bgB = Math.round(42 * (1 - tY) + 17 * tY);

  // Rounded corners if not maskable
  const cornerR = w * 0.22;
  let inBounds = true;
  if (!isMaskable) {
    const rx = Math.max(0, Math.abs(x - cx) - (w / 2 - cornerR));
    const ry = Math.max(0, Math.abs(y - cy) - (h / 2 - cornerR));
    if (Math.hypot(rx, ry) > cornerR) {
      inBounds = false;
    }
  }

  if (!inBounds) {
    return [0, 0, 0, 0];
  }

  // Golden circular emblem ring
  const ringR = w * 0.36;
  const ringWidth = Math.max(2, w * 0.02);
  const distToRing = Math.abs(r - ringR);

  // Gold colors: #f59e0b (245, 158, 11) to #d97706 (217, 119, 6)
  if (distToRing < ringWidth) {
    return [245, 158, 11, 255];
  }

  // Inner subtle border
  const innerRingR = w * 0.32;
  if (Math.abs(r - innerRingR) < 1.5) {
    return [217, 119, 6, 180];
  }

  // Cloche dome in upper half
  // Center (cx, cy - h*0.06), radius w*0.18
  const clocheCy = cy - h * 0.05;
  const clocheR = w * 0.18;
  const clocheDist = Math.hypot(x - cx, y - clocheCy);

  if (y <= clocheCy && clocheDist < clocheR && clocheDist > clocheR - Math.max(3, w * 0.025)) {
    return [251, 191, 36, 255];
  }

  // Cloche plate line
  if (Math.abs(y - clocheCy) <= Math.max(2, w * 0.015) && Math.abs(x - cx) <= w * 0.22) {
    return [251, 191, 36, 255];
  }

  // Cloche handle
  const handleCy = clocheCy - clocheR;
  if (Math.hypot(x - cx, y - handleCy) < Math.max(3, w * 0.035)) {
    return [245, 158, 11, 255];
  }

  // Monogram stylized "ODS" in center-lower
  // We draw a prominent stylized gold bar / emblem
  const letterY = cy + h * 0.12;
  // O (left: cx - w*0.14)
  const oCx = cx - w * 0.14;
  const oDist = Math.hypot((x - oCx) * 1.3, y - letterY);
  if (oDist < w * 0.08 && oDist > w * 0.05) {
    return [254, 243, 199, 255];
  }

  // D (center: cx)
  const dCx = cx;
  if (x >= dCx - w * 0.05 && x <= dCx - w * 0.025 && Math.abs(y - letterY) <= w * 0.08) {
    return [254, 243, 199, 255];
  }
  const dDist = Math.hypot((x - (dCx - w * 0.025)), y - letterY);
  if (x >= dCx - w * 0.025 && dDist < w * 0.08 && dDist > w * 0.05) {
    return [254, 243, 199, 255];
  }

  // S (right: cx + w*0.14)
  const sCx = cx + w * 0.14;
  const sDy = (y - letterY) / (w * 0.08);
  const sDx = (x - sCx) / (w * 0.06);
  if (Math.abs(sDy) <= 1 && Math.abs(sDx) <= 1) {
    // S curves
    if (Math.abs(sDy - 0.95) < 0.25 || Math.abs(sDy) < 0.22 || Math.abs(sDy + 0.95) < 0.25) {
      return [254, 243, 199, 255];
    }
    if (sDy < 0 && sDx < -0.6) return [254, 243, 199, 255];
    if (sDy > 0 && sDx > 0.6) return [254, 243, 199, 255];
  }

  return [bgR, bgG, bgB, 255];
}

const outDir = path.resolve('public');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log('Generating PNG icons for PWA and iOS...');

// 1. Apple Touch Icon (180x180) - Required for iPhone Home Screen
const appleTouchBuf = createPNG(180, 180, (x, y, w, h) => drawIcon(x, y, w, h, false));
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), appleTouchBuf);
console.log('✓ apple-touch-icon.png (180x180)');

// 2. PWA 192x192
const pwa192Buf = createPNG(192, 192, (x, y, w, h) => drawIcon(x, y, w, h, false));
fs.writeFileSync(path.join(outDir, 'pwa-192x192.png'), pwa192Buf);
console.log('✓ pwa-192x192.png (192x192)');

// 3. PWA 512x512
const pwa512Buf = createPNG(512, 512, (x, y, w, h) => drawIcon(x, y, w, h, false));
fs.writeFileSync(path.join(outDir, 'pwa-512x512.png'), pwa512Buf);
console.log('✓ pwa-512x512.png (512x512)');

// 4. PWA Maskable 512x512 (with safe-zone bleed)
const pwaMaskableBuf = createPNG(512, 512, (x, y, w, h) => drawIcon(x, y, w, h, true));
fs.writeFileSync(path.join(outDir, 'pwa-maskable-512x512.png'), pwaMaskableBuf);
console.log('✓ pwa-maskable-512x512.png (512x512 maskable)');

// 5. Favicon 48x48 PNG (named favicon.ico or favicon.png)
const faviconBuf = createPNG(48, 48, (x, y, w, h) => drawIcon(x, y, w, h, false));
fs.writeFileSync(path.join(outDir, 'favicon.ico'), faviconBuf);
console.log('✓ favicon.ico (48x48)');

console.log('All icons generated successfully!');
