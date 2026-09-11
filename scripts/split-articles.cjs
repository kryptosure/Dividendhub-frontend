/* scripts/split-articles.cjs
 * One-time script to split articles.js into individual files.
 */

const fs = require('fs');
const path = require('path');

async function main() {
  console.log('\n📖 Loading existing articles.js...\n');

  const moduleURL = new URL('../src/content/articles.js', `file://${__filename}`).href;
  const { articles } = await import(moduleURL);

  if (!articles || !Array.isArray(articles)) {
    console.error('❌ Could not load articles.');
    process.exit(1);
  }

  console.log(`   Found ${articles.length} articles.\n`);

  const outputDir = path.join(__dirname, '../src/content/articles');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const slugs = [];

  for (const article of articles) {
    const { slug } = article;
    slugs.push(slug);
    const filePath = path.join(outputDir, `${slug}.js`);
    const content = `export const article = ${JSON.stringify(article, null, 2)};\n`;
    fs.writeFileSync(filePath, content);
    console.log(`   ✅ ${slug}.js`);
  }

  // Build the index file that combines them all
  const imports = slugs.map((s, i) => `import { article as a${i} } from './${s}.js';`).join('\n');
  const list = slugs.map((_, i) => `a${i}`).join(', ');

  const indexContent = `// Auto-generated: combines all article files into one array
// To add a new article: create a new .js file in this folder, then add its import below.

${imports}

export const articles = [${list}].sort((a, b) => new Date(b.date) - new Date(a.date));
`;

  fs.writeFileSync(path.join(outputDir, 'index.js'), indexContent);
  console.log(`\n   ✅ index.js (combines ${slugs.length} articles)`);

  console.log(`\n🎉 Migration complete!\n`);
  console.log(`Next steps:`);
  console.log(`   1. DELETE src/content/articles.js (the old big file)`);
  console.log(`   2. Update imports in Blog.jsx and Article.jsx`);
  console.log(`   3. Run: npm run dev\n`);
}

main().catch((err) => {
  console.error('💥 Error:', err);
  process.exit(1);
});