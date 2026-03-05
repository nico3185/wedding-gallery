#!/usr/bin/env node
/**
 * Create simple test images for local development
 * Run: node scripts/create-test-media.js
 */

const fs = require("fs");
const path = require("path");

// Simple 1x1 PNG pixel (transparent support)
const minimalPng = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
  0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
  0x0d, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x62, 0xf8, 0xcf, 0xc0, 0x00,
  0x00, 0x00, 0x03, 0x00, 0x01, 0x4b, 0x6f, 0x0b, 0x62, 0x00, 0x00, 0x00,
  0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
]);

const albums = [
  "ceremonie",
  "reception",
  "famille",
];

const imageNames = [
  "IMG_0001.jpg",
  "IMG_0002.jpg",
  "IMG_0003.jpg",
  "IMG_0004.jpg",
  "IMG_0005.jpg",
];

const baseDir = path.join(__dirname, "..", "public", "media");

// Create directories and test files
albums.forEach((album) => {
  const albumPath = path.join(baseDir, album);
  if (!fs.existsSync(albumPath)) {
    fs.mkdirSync(albumPath, { recursive: true });
    console.log(`✓ Created ${albumPath}`);
  }

  imageNames.forEach((name) => {
    const filePath = path.join(albumPath, name);
    // Skip if file already exists
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, minimalPng);
      console.log(`✓ Created ${path.relative(baseDir, filePath)}`);
    }
  });
});

console.log("\n✨ Test media files created! You can now:");
console.log("   1. Place your own images in public/media/");
console.log("   2. Visit http://localhost:3000/gallery to see them");
console.log("   3. Add folders like 'ceremonie/', 'reception/', 'famille/' to organize by album");
