#!/usr/bin/env node
// PBI-066 / TASK-302
// SVG マスター（public/icon.svg）と幾何学的に一致する PNG / ICO を生成する。
// 追加依存を導入せず Node 組込み（node:zlib / Buffer）のみで PNG を符号化する。
// 生成物:
//   public/favicon-16.png, favicon-32.png, favicon-48.png
//   public/favicon.ico（16/32/48 PNG を ICO コンテナに格納）
//   public/apple-touch-icon.png (180px)
//   public/icon-192.png, icon-512.png（PWA manifest）
//   public/icon-maskable-512.png（maskable 安全領域配慮）
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = resolve(__dirname, '..', 'public');
mkdirSync(PUBLIC_DIR, { recursive: true });

// --- カラー定義（icon.svg と一致させる） ----------------------------------
const BRAND = [0x09, 0x69, 0xda]; // #0969da
const WHITE = [0xff, 0xff, 0xff];

// --- CRC32（PNG 仕様準拠の table 計算） -----------------------------------
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

// --- PNG エンコーダ（RGBA 8bit） -----------------------------------------
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}
function encodePng(width, height, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  // 各行の先頭にフィルタバイト 0 を付与
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// --- 幾何描画（icon.svg を pixel 化） -------------------------------------
// SVG viewBox 0..512 を size に正規化して描画する。
function setPx(buf, size, x, y, color) {
  if (x < 0 || y < 0 || x >= size || y >= size) return;
  const i = (y * size + x) * 4;
  buf[i] = color[0];
  buf[i + 1] = color[1];
  buf[i + 2] = color[2];
  buf[i + 3] = color.length > 3 ? color[3] : 0xff;
}
function fillRect(buf, size, x0, y0, x1, y1, color) {
  for (let y = Math.max(0, y0); y < Math.min(size, y1); y++) {
    for (let x = Math.max(0, x0); x < Math.min(size, x1); x++) {
      setPx(buf, size, x, y, color);
    }
  }
}
// 角丸長方形を塗る（インテジャー近似）
function fillRoundedRect(buf, size, x0, y0, x1, y1, r, color) {
  for (let y = Math.max(0, y0); y < Math.min(size, y1); y++) {
    for (let x = Math.max(0, x0); x < Math.min(size, x1); x++) {
      // 角の判定
      let cx = x;
      let cy = y;
      let inCorner = false;
      let dx = 0;
      let dy = 0;
      if (x < x0 + r && y < y0 + r) {
        cx = x0 + r;
        cy = y0 + r;
        inCorner = true;
      } else if (x >= x1 - r && y < y0 + r) {
        cx = x1 - r - 1;
        cy = y0 + r;
        inCorner = true;
      } else if (x < x0 + r && y >= y1 - r) {
        cx = x0 + r;
        cy = y1 - r - 1;
        inCorner = true;
      } else if (x >= x1 - r && y >= y1 - r) {
        cx = x1 - r - 1;
        cy = y1 - r - 1;
        inCorner = true;
      }
      if (inCorner) {
        dx = x - cx;
        dy = y - cy;
        if (dx * dx + dy * dy > r * r) continue;
      }
      setPx(buf, size, x, y, color);
    }
  }
}

/**
 * インバスケットアイコンを描画（インセット率 inset で安全領域に縮小可能）。
 * @param {number} size 出力サイズ（px）
 * @param {boolean} maskable maskable=true は背景塗りを全面（角丸なし）にする
 * @param {number} inset 0..0.2 程度。要素全体を内側に縮める比率
 */
function drawIcon(size, maskable = false, inset = 0) {
  const buf = Buffer.alloc(size * size * 4);
  // 透過初期化
  for (let i = 0; i < buf.length; i += 4) {
    buf[i] = 0;
    buf[i + 1] = 0;
    buf[i + 2] = 0;
    buf[i + 3] = 0;
  }
  const s = (v) => Math.round((v / 512) * size);
  const insetPx = Math.round(size * inset);
  const x0 = insetPx;
  const y0 = insetPx;
  const x1 = size - insetPx;
  const y1 = size - insetPx;
  // 背景: maskable は安全領域外も塗る必要があるため、insetPx=0 を期待
  if (maskable) {
    fillRect(buf, size, 0, 0, size, size, BRAND);
  } else {
    fillRoundedRect(buf, size, x0, y0, x1, y1, s(112) - insetPx, BRAND);
  }
  // 用紙 3 段（座標は SVG と一致）
  // 上段: x=144..368, y=136..184, r=14
  // 中段: x=120..392, y=216..272, r=16
  // 下段: x=104..408, y=304..384, r=20
  const innerScale = (x1 - x0) / size;
  const baseX = x0;
  const baseY = y0;
  const map = (vx, vy) => [
    baseX + Math.round((vx / 512) * (x1 - x0)),
    baseY + Math.round((vy / 512) * (y1 - y0)),
  ];

  const sheets = [
    { v: [144, 136, 368, 184], r: 14 },
    { v: [120, 216, 392, 272], r: 16 },
    { v: [104, 304, 408, 384], r: 20 },
  ];
  for (const { v, r } of sheets) {
    const [sx0, sy0] = map(v[0], v[1]);
    const [sx1, sy1] = map(v[2], v[3]);
    const sr = Math.max(1, Math.round((r / 512) * size * innerScale));
    // サイズが小さい場合は単純な塗りで安定描画
    if (sx1 - sx0 < sr * 2 || sy1 - sy0 < sr * 2) {
      fillRect(buf, size, sx0, sy0, sx1, sy1, WHITE);
    } else {
      fillRoundedRect(buf, size, sx0, sy0, sx1, sy1, sr, WHITE);
    }
  }
  return buf;
}

function rgbaBuffer(size, maskable, inset) {
  return drawIcon(size, maskable, inset);
}

// --- 生成ターゲット --------------------------------------------------------
const targets = [
  { file: 'favicon-16.png', size: 16, maskable: false, inset: 0 },
  { file: 'favicon-32.png', size: 32, maskable: false, inset: 0 },
  { file: 'favicon-48.png', size: 48, maskable: false, inset: 0 },
  { file: 'apple-touch-icon.png', size: 180, maskable: false, inset: 0 },
  { file: 'icon-192.png', size: 192, maskable: false, inset: 0 },
  { file: 'icon-512.png', size: 512, maskable: false, inset: 0 },
  // maskable: 安全領域（中央 80%）に主要要素を収める。背景は全面塗り。
  { file: 'icon-maskable-512.png', size: 512, maskable: true, inset: 0.1 },
];

const pngs = {};
for (const t of targets) {
  const rgba = rgbaBuffer(t.size, t.maskable, t.inset);
  const png = encodePng(t.size, t.size, rgba);
  const out = resolve(PUBLIC_DIR, t.file);
  writeFileSync(out, png);
  pngs[t.file] = png;
  console.log(`[icons] ${t.file} (${t.size}x${t.size}) ${png.length}B`);
}

// --- ICO（PNG 埋込み形式）生成 -------------------------------------------
// ICONDIR(6) + ICONDIRENTRY*N(16) + 連続 PNG データ
function buildIco(entries) {
  const N = entries.length;
  const dir = Buffer.alloc(6 + 16 * N);
  dir.writeUInt16LE(0, 0); // reserved
  dir.writeUInt16LE(1, 2); // type=icon
  dir.writeUInt16LE(N, 4);
  let offset = 6 + 16 * N;
  const dataChunks = [];
  for (let i = 0; i < N; i++) {
    const e = entries[i];
    const base = 6 + 16 * i;
    dir.writeUInt8(e.size === 256 ? 0 : e.size, base + 0);
    dir.writeUInt8(e.size === 256 ? 0 : e.size, base + 1);
    dir.writeUInt8(0, base + 2); // colors
    dir.writeUInt8(0, base + 3); // reserved
    dir.writeUInt16LE(1, base + 4); // planes
    dir.writeUInt16LE(32, base + 6); // bit count
    dir.writeUInt32LE(e.data.length, base + 8);
    dir.writeUInt32LE(offset, base + 12);
    offset += e.data.length;
    dataChunks.push(e.data);
  }
  return Buffer.concat([dir, ...dataChunks]);
}

const ico = buildIco([
  { size: 16, data: pngs['favicon-16.png'] },
  { size: 32, data: pngs['favicon-32.png'] },
  { size: 48, data: pngs['favicon-48.png'] },
]);
writeFileSync(resolve(PUBLIC_DIR, 'favicon.ico'), ico);
console.log(`[icons] favicon.ico (16/32/48) ${ico.length}B`);
