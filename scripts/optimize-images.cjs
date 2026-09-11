/* scripts/optimize-images.cjs
 * Compresses and converts all blog images to WebP + optimized JPG.
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const IMAGE_DIR = path.join(__dirname, '../public/images/blog');
const BACKUP_DIR = path.join(__dirname, '../public/images/blog/_originals');
const MAX_WIDTH = 1200;
const JPG_QUALITY = 80;
const WEBP_QUALITY = 80;

async function optimizeImage(filePath) {
  const filename = path.basename(filePath);
  const ext = path.extname(filename).toLowerCase();
  const name = path.basename(filename, ext);

  // Skip if in _originals subfolder or already WebP
  if (filePath.includes('_originals')) return;
  if (ext === '.webp') return;

  const originalSize = fs.statSync(filePath).size;

  try {
    const image = sharp(filePath);
    const metadata = await image.metadata();

    // Resize if larger than MAX_WIDTH
    const resizeOptions = metadata.width > MAX_WIDTH
      ? { width: MAX_WIDTH }
      : {};

    // Backup original (only once)
    if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
    const backupPath = path.join(BACKUP_DIR, filename);
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(filePath, backupPath);
    }

    // Save optimized JPG (overwrites original)
    await image
      .clone()
      .resize(resizeOptions)
      .jpeg({ quality: JPG_QUALITY, progressive: true, mozjpeg: true })
      .toFile(`${filePath}.tmp`);
    fs.renameSync(`${filePath}.tmp`, filePath);

    // Save WebP version
    const webpPath = path.join(IMAGE_DIR, `${name}.webp`);
    await image
      .clone()
      .resize(resizeOptions)
      .webp({ quality: WEBP_QUALITY })
      .toFile(`${webpPath}.tmp`);
    fs.renameSync(`${webpPath}.tmp`, webpPath);

    const newJpgSize = fs.statSync(filePath).size;
    const webpSize = fs.statSync(webpPath).size;

    console.log(`✅ ${filename}`);
    console.log(`   Original: ${(originalSize / 1024).toFixed(1)} KB`);
    console.log(`   JPG:      ${(newJpgSize / 1024).toFixed(1)} KB (${Math.round((1 - newJpgSize / originalSize) * 100)}% smaller)`);
    console.log(`   WebP:     ${(webpSize / 1024).toFixed(1)} KB (${Math.round((1 - webpSize / originalSize) * 100)}% smaller)\n`);
  } catch (err) {
    console.error(`❌ ${filename}: ${err.message}\n`);
  }
}

async function main() {
  console.log('\n🖼️  DividendBro Image Optimizer\n');
  console.log(`   Directory: ${IMAGE_DIR}\n`);

  if (!fs.existsSync(IMAGE_DIR)) {
    console.error('❌ Image directory not found.');
    process.exit(1);
  }

  const files = fs.readdirSync(IMAGE_DIR)
    .filter(f => /\.(jpg|jpeg|png)$/i.test(f))
    .filter(f => !fs.statSync(path.join(IMAGE_DIR, f)).isDirectory());

  if (files.length === 0) {
    console.log('📭 No images found to optimize.\n');
    process.exit(0);
  }

  console.log(`   Found ${files.length} image(s) to process.\n`);

  for (const file of files) {
    await optimizeImage(path.join(IMAGE_DIR, file));
  }

  console.log('🎉 Done! Original images backed up to /blog/_originals/\n');
  console.log('Next: Run "npm run dev" and test your site.\n');
}

main().catch((err) => {
  console.error('💥 Error:', err);
  process.exit(1);
});