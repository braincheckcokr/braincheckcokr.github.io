#!/usr/bin/env node
'use strict';

const nunjucks = require('nunjucks');
const fs = require('fs');
const path = require('path');

// ── Paths ──────────────────────────────────────────────────────
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(__dirname, 'data');
const TMPL_DIR = path.join(__dirname, 'templates');

// ── Load data ──────────────────────────────────────────────────
const site = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'site.json'), 'utf8'));

const translations = {};
for (const lang of site.languages) {
  translations[lang] = JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, `${lang}.json`), 'utf8')
  );
}

// ── Configure Nunjucks ─────────────────────────────────────────
const env = nunjucks.configure(TMPL_DIR, {
  autoescape: false,
  throwOnUndefined: false,
  trimBlocks: true,
  lstripBlocks: true,
});

// ── Helpers ────────────────────────────────────────────────────
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getAssetVersion(fileName) {
  const filePath = path.join(ROOT, fileName);
  try {
    const stat = fs.statSync(filePath);
    return String(Math.floor(stat.mtimeMs));
  } catch (_) {
    return String(Date.now());
  }
}

// ── Build pages ────────────────────────────────────────────────
const generated = [];
const css_version = getAssetVersion('styles.css');
const js_version = getAssetVersion('common.js');

for (const lang of site.languages) {
  const t = translations[lang];
  const isDefault = lang === site.default_lang;
  const outDir = isDefault ? ROOT : path.join(ROOT, lang);
  ensureDir(outDir);

  for (const page of site.pages) {
    const page_t = t.pages[page.slug];
    if (!page_t) {
      console.warn(`⚠ Missing translation: ${lang}.pages.${page.slug} — skipping`);
      continue;
    }

    const asset_prefix = isDefault ? './' : '../';

    // Canonical URL logic:
    //   Korean index  → base_url + "/"
    //   Korean others → base_url + "/about.html"
    //   English index → base_url + "/en/"
    //   English others→ base_url + "/en/about.html"
    let canonical_url;
    if (isDefault) {
      canonical_url = page.slug === 'index'
        ? site.base_url + '/'
        : site.base_url + '/' + page.file;
    } else {
      canonical_url = page.slug === 'index'
        ? site.base_url + '/' + lang + '/'
        : site.base_url + '/' + lang + '/' + page.file;
    }

    const context = {
      t,
      page_t,
      site,
      canonical_url,
      og_type: page.og_type,
      asset_prefix,
      nav_prefix: './',
      page_file: page.file,
      page_slug: page.slug,
      css_version,
      js_version,
    };

    const html = env.render(page.file, context);
    const outPath = path.join(outDir, page.file);
    fs.writeFileSync(outPath, html, 'utf8');

    const relPath = path.relative(ROOT, outPath);
    generated.push(relPath);
  }
}

// ── Generate sitemap.xml ───────────────────────────────────────
function buildSitemap() {
  const now = new Date().toISOString().split('T')[0];
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

  for (const page of site.pages) {
    // Each page gets entries for each language
    for (const lang of site.languages) {
      const isDefault = lang === site.default_lang;
      let loc;
      if (isDefault) {
        loc = page.slug === 'index'
          ? site.base_url + '/'
          : site.base_url + '/' + page.file;
      } else {
        loc = page.slug === 'index'
          ? site.base_url + '/' + lang + '/'
          : site.base_url + '/' + lang + '/' + page.file;
      }

      xml += '  <url>\n';
      xml += `    <loc>${loc}</loc>\n`;
      xml += `    <lastmod>${now}</lastmod>\n`;

      // Priority: index highest, then main pages, then articles
      const priority = page.slug === 'index' ? '1.0'
        : ['about', 'support', 'review'].includes(page.slug) ? '0.8'
        : page.slug === 'information' ? '0.5'
        : '0.7';
      xml += `    <priority>${priority}</priority>\n`;

      // hreflang alternates
      for (const altLang of site.languages) {
        const altDefault = altLang === site.default_lang;
        let altHref;
        if (altDefault) {
          altHref = page.slug === 'index'
            ? site.base_url + '/'
            : site.base_url + '/' + page.file;
        } else {
          altHref = page.slug === 'index'
            ? site.base_url + '/' + altLang + '/'
            : site.base_url + '/' + altLang + '/' + page.file;
        }
        xml += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${altHref}" />\n`;
      }
      // x-default → default language
      const xDefaultHref = page.slug === 'index'
        ? site.base_url + '/'
        : site.base_url + '/' + page.file;
      xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${xDefaultHref}" />\n`;

      xml += '  </url>\n';
    }
  }

  xml += '</urlset>\n';
  const outPath = path.join(ROOT, 'sitemap.xml');
  fs.writeFileSync(outPath, xml, 'utf8');
  generated.push('sitemap.xml');
}

// ── Generate robots.txt ────────────────────────────────────────
function buildRobots() {
  const content = `User-agent: *
Allow: /

# AI Crawlers - Explicitly Allowed
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Bytespider
Allow: /

User-agent: CCBot
Allow: /

Sitemap: ${site.base_url}/sitemap.xml
`;

  const outPath = path.join(ROOT, 'robots.txt');
  fs.writeFileSync(outPath, content, 'utf8');
  generated.push('robots.txt');
}

// ── Generate llms.txt ──────────────────────────────────────────
function buildLlmsTxt() {
  // Korean llms.txt (root)
  const koT = translations.ko;
  const koLines = [
    `# ${koT.site_name} (BrainCheck)`,
    '',
    `> ${koT.global.og.description}`,
    '',
    '## 주요 링크',
    '',
  ];
  for (const page of site.pages) {
    if (['index', 'about', 'support', 'information'].includes(page.slug)) {
      const pt = koT.pages[page.slug];
      const url = page.slug === 'index'
        ? site.base_url + '/'
        : site.base_url + '/' + page.file;
      const label = page.slug === 'index' ? '홈페이지' : pt.breadcrumb_name || pt.title.replace(/ - .*$/, '');
      koLines.push(`- [${label}](${url}): ${pt.description}`);
    }
  }
  koLines.push('', '## 기술 문서', '');
  for (const page of site.pages) {
    if (['mlsystem', 'tts', 'stt', 'ai-content', 'multiplatform'].includes(page.slug)) {
      const pt = koT.pages[page.slug];
      const url = site.base_url + '/' + page.file;
      const label = pt.breadcrumb_name || pt.title.replace(/ - .*$/, '');
      koLines.push(`- [${label}](${url}): ${pt.description}`);
    }
  }
  koLines.push('', '## 앱 다운로드', '');
  koLines.push(`- [App Store (iOS)](${site.app_links.app_store})`);
  koLines.push(`- [Google Play (Android)](${site.app_links.google_play})`);
  koLines.push('');

  fs.writeFileSync(path.join(ROOT, 'llms.txt'), koLines.join('\n'), 'utf8');
  generated.push('llms.txt');

  // English llms.txt
  const enT = translations.en;
  if (enT) {
    const enDir = path.join(ROOT, 'en');
    ensureDir(enDir);
    const enLines = [
      `# ${enT.site_name}`,
      '',
      `> ${enT.global.og.description}`,
      '',
      '## Main Links',
      '',
    ];
    for (const page of site.pages) {
      if (['index', 'about', 'support', 'information'].includes(page.slug)) {
        const pt = enT.pages[page.slug];
        const url = page.slug === 'index'
          ? site.base_url + '/en/'
          : site.base_url + '/en/' + page.file;
        const label = page.slug === 'index' ? 'Home' : pt.breadcrumb_name || pt.title.replace(/ - .*$/, '');
        enLines.push(`- [${label}](${url}): ${pt.description}`);
      }
    }
    enLines.push('', '## Technical Documentation', '');
    for (const page of site.pages) {
      if (['mlsystem', 'tts', 'stt', 'ai-content', 'multiplatform'].includes(page.slug)) {
        const pt = enT.pages[page.slug];
        const url = site.base_url + '/en/' + page.file;
        const label = pt.breadcrumb_name || pt.title.replace(/ - .*$/, '');
        enLines.push(`- [${label}](${url}): ${pt.description}`);
      }
    }
    enLines.push('', '## Download', '');
    enLines.push(`- [App Store (iOS)](${site.app_links.app_store})`);
    enLines.push(`- [Google Play (Android)](${site.app_links.google_play})`);
    enLines.push('');

    fs.writeFileSync(path.join(enDir, 'llms.txt'), enLines.join('\n'), 'utf8');
    generated.push('en/llms.txt');
  }
}

// ── Run generators ─────────────────────────────────────────────
buildSitemap();
buildRobots();
buildLlmsTxt();

// ── Summary ────────────────────────────────────────────────────
console.log(`\n✅ Build complete — ${generated.length} files generated:\n`);
for (const f of generated) {
  console.log(`   ${f}`);
}
console.log('');
