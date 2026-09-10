/* scripts/generate-covers.cjs
 * Auto-generates branded cover images for all DividendBro articles.
 * 
 * FREE by default using Pollinations.ai (no API key required).
 * Optionally uses OpenAI DALL-E 3 if OPENAI_API_KEY is set in .env
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// ---------- CONFIG ----------
const OUTPUT_DIR = path.join(__dirname, '../public/images/blog');
const IMAGE_WIDTH = 1200;
const IMAGE_HEIGHT = 630;
const USE_OPENAI = !!process.env.OPENAI_API_KEY; // Set env var to use DALL-E 3

// Brand style guide appended to every prompt for consistency
const BRAND_STYLE = `Professional financial editorial photograph, dark navy background with subtle blue and teal gradients, 
clean minimalist composition, modern magazine cover style, wide landscape format, 16:9 aspect ratio, 
no text, no watermarks, sharp focus, high quality, editorial photography`;

// ---------- ARTICLE COVERS ----------
const COVERS = [
  {
    slug: 'build-500-month-dividend-portfolio-us',
    prompt: `A green ascending dividend growth chart made of glowing bars, rising over a subtle blurred American flag pattern. 
    Clean dark background, professional financial magazine aesthetic, green accent colors, symbolic of building wealth over time.`
  },
  {
    slug: 'best-singapore-dividend-stocks-2026',
    prompt: `A dramatic aerial view of the Singapore Marina Bay skyline at blue hour, with the three iconic bank towers glowing in the foreground. 
    Reflections of lights on water, cinematic finance magazine cover style.`
  },
  {
    slug: '3-metrics-safe-dividends-vs-yield-traps',
    prompt: `An abstract minimalist illustration of three ascending bar charts in green, amber, and red side by side. 
    A subtle magnifying glass hovers over the middle bar suggesting risk analysis. Dark professional background, flat design, finance magazine style.`
  },
  {
    slug: 'weekly-vs-monthly-dividend-etfs',
    prompt: `A clean editorial illustration of two side-by-side calendars. 
    The left calendar displays 52 small dollar icons, the right displays 12 larger ones. 
    Dark background with cyan and green accent colors, minimalist geometric style, financial magazine aesthetic.`
  },
  {
    slug: 'top-10-us-brokers-comparison',
    prompt: `Three modern smartphones lying on a dark textured wooden desk, each displaying a colorful stock trading interface. 
    Subtle blue and green screen glow, shallow depth of field, editorial finance photography style.`
  },
  {
    slug: 'comparing-brokerage-fees-singapore',
    prompt: `An abstract illustration showing a fee comparison chart with descending cost bars transitioning from red to green. 
    A subtle silhouette of the Singapore skyline in the background. Dark background with cyan accents, editorial finance style.`
  },
];

// ---------- HELPERS ----------
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const client = url.startsWith('https') ? https : http;

    client
      .get(url, (response) => {
        // Handle redirects
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          file.close();
          fs.unlinkSync(destPath);
          return downloadImage(response.headers.location, destPath).then(resolve).catch(reject);
        }
        if (response.statusCode !== 200) {
          file.close();
          fs.unlinkSync(destPath);
          return reject(new Error(`HTTP ${response.statusCode}`));
        }
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      })
      .on('error', (err) => {
        file.close();
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        reject(err);
      });
  });
}

// ---------- POLLINATIONS (FREE) ----------
async function generateWithPollinations(prompt, destPath) {
  const fullPrompt = `${prompt}. ${BRAND_STYLE}`;
  const seed = Math.floor(Math.random() * 1000000);
  const encoded = encodeURIComponent(fullPrompt);
  const url = `https://image.pollinations.ai/prompt/${encoded}?width=${IMAGE_WIDTH}&height=${IMAGE_HEIGHT}&nologo=true&seed=${seed}&model=flux`;

  console.log(`   📡 Fetching from Pollinations.ai (this can take 15-30s)...`);
  await downloadImage(url, destPath);
}

// ---------- OPENAI DALL-E 3 (PAID) ----------
async function generateWithOpenAI(prompt, destPath) {
  const fullPrompt = `${prompt}. ${BRAND_STYLE}`;

  const payload = JSON.stringify({
    model: 'dall-e-3',
    prompt: fullPrompt,
    n: 1,
    size: '1792x1024', // Closest to 16:9 available
    quality: 'hd',
  });

  const options = {
    hostname: 'api.openai.com',
    path: '/v1/images/generations',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Length': Buffer.byteLength(payload),
    },
  };

  const imageUrl = await new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) return reject(new Error(json.error.message));
          if (!json.data?.[0]?.url) return reject(new Error('No image URL returned'));
          resolve(json.data[0].url);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });

  console.log(`   📥 Downloading from OpenAI...`);
  await downloadImage(imageUrl, destPath);
}

// ---------- MAIN ----------
async function main() {
  ensureDir(OUTPUT_DIR);

  console.log(`\n🎨 DividendBro Cover Image Generator\n`);
  console.log(`   Provider: ${USE_OPENAI ? '🤖 OpenAI DALL-E 3 (HD)' : '🌸 Pollinations.ai (Free)'}`);
  console.log(`   Output:   ${OUTPUT_DIR}`);
  console.log(`   Size:     ${IMAGE_WIDTH}x${IMAGE_HEIGHT}\n`);

  let successCount = 0;

  for (const cover of COVERS) {
    const destPath = path.join(OUTPUT_DIR, `${cover.slug}-cover.jpg`);
    console.log(`\n📸 [${COVERS.indexOf(cover) + 1}/${COVERS.length}] ${cover.slug}`);

    // Skip if already exists (use --force flag to regenerate)
    if (fs.existsSync(destPath) && !process.argv.includes('--force')) {
      console.log(`   ⏭️  Already exists. Use --force to regenerate.`);
      continue;
    }

    try {
      if (USE_OPENAI) {
        await generateWithOpenAI(cover.prompt, destPath);
      } else {
        await generateWithPollinations(cover.prompt, destPath);
      }
      const size = (fs.statSync(destPath).size / 1024).toFixed(1);
      console.log(`   ✅ Saved (${size} KB)`);
      successCount++;
    } catch (err) {
      console.error(`   ❌ Failed: ${err.message}`);
      console.log(`   💡 Retrying once...`);
      try {
        await new Promise((r) => setTimeout(r, 3000));
        if (USE_OPENAI) {
          await generateWithOpenAI(cover.prompt, destPath);
        } else {
          await generateWithPollinations(cover.prompt, destPath);
        }
        console.log(`   ✅ Saved on retry`);
        successCount++;
      } catch (retryErr) {
        console.error(`   ❌ Retry failed: ${retryErr.message}`);
      }
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🎉 Complete! ${successCount}/${COVERS.length} images generated.`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  console.log(`Next step: Update src/content/articles.js with these image paths:\n`);
  COVERS.forEach((c) => console.log(`   image: "/images/blog/${c.slug}-cover.jpg"`));
  console.log('');
}

main().catch((err) => {
  console.error('\n💥 Fatal error:', err);
  process.exit(1);
});