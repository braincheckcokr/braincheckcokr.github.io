#!/usr/bin/env node
'use strict';

const nunjucks = require('nunjucks');
const fs = require('fs');
const path = require('path');

// ── Paths ──────────────────────────────────────────────────────
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(__dirname, 'data');
const TMPL_DIR = path.join(__dirname, 'templates');
const HOME_FEATURE = 'home';
const STORE_FEATURE = 'store';
const LOCALIZED_ASSET_DIR = 'assets';

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

function pageSupportsLang(page, lang) {
  return !Array.isArray(page.langs) || page.langs.includes(lang);
}

function langOutputDir(lang) {
  return path.join(ROOT, HOME_FEATURE, lang);
}

function publicHomePath(lang, page) {
  const suffix = page.slug === 'index' ? '' : page.file;
  return suffix === ''
    ? `/${HOME_FEATURE}/${lang}/`
    : `/${HOME_FEATURE}/${lang}/${suffix}`;
}

function publicHomeURL(lang, page) {
  return site.base_url + publicHomePath(lang, page);
}

function publicStorePath(lang, suffix = '') {
  return `/${STORE_FEATURE}/${lang}${suffix}`;
}

function publicStoreURL(lang, suffix = '') {
  return site.base_url + publicStorePath(lang, suffix);
}

function relativePrefix(fromFile, lang) {
  const langDir = langOutputDir(lang);
  const fromDir = path.dirname(path.join(langDir, fromFile));
  const rel = path.relative(fromDir, langDir);
  return rel === '' ? './' : rel.split(path.sep).join('/') + '/';
}

function assetPrefix(fromFile, lang) {
  const langDir = langOutputDir(lang);
  const fromDir = path.dirname(path.join(langDir, fromFile));
  const rel = path.relative(fromDir, path.join(langDir, LOCALIZED_ASSET_DIR));
  return rel === '' ? './' : rel.split(path.sep).join('/') + '/';
}

function copyLocalizedAssets(lang) {
  const assetDir = path.join(langOutputDir(lang), LOCALIZED_ASSET_DIR);
  ensureDir(assetDir);
  fs.cpSync(path.join(ROOT, 'assets'), assetDir, { recursive: true });
  fs.copyFileSync(path.join(ROOT, 'styles.css'), path.join(assetDir, 'styles.css'));
  fs.copyFileSync(path.join(ROOT, 'common.js'), path.join(assetDir, 'common.js'));
}

function localizedAlternates(page) {
  return site.languages
    .filter((lang) => pageSupportsLang(page, lang))
    .map((lang) => ({
      lang,
      href: publicHomeURL(lang, page),
    }));
}

function localizedStoreAlternates(suffix) {
  return site.languages.map((lang) => ({
    lang,
    href: publicStoreURL(lang, suffix),
  }));
}

// ── Build pages ────────────────────────────────────────────────
const generated = [];
const css_version = getAssetVersion('styles.css');
const js_version = getAssetVersion('common.js');

for (const lang of site.languages) {
  const t = translations[lang];
  const outDir = langOutputDir(lang);
  ensureDir(outDir);
  copyLocalizedAssets(lang);

  for (const page of site.pages) {
    if (!pageSupportsLang(page, lang)) {
      continue;
    }

    const page_t = t.pages[page.slug];
    if (!page_t) {
      console.warn(`⚠ Missing translation: ${lang}.pages.${page.slug} — skipping`);
      continue;
    }

    const asset_prefix = assetPrefix(page.file, lang);
    const nav_prefix = relativePrefix(page.file, lang);
    const canonical_url = publicHomeURL(lang, page);
    const alternates = localizedAlternates(page);

    const context = {
      t,
      page_t,
      site,
      canonical_url,
      canonical_home_url: publicHomeURL(lang, { slug: 'index', file: 'index.html' }),
      public_asset_url: site.base_url + publicHomePath(lang, { slug: 'index', file: 'index.html' }) + LOCALIZED_ASSET_DIR,
      og_type: page.og_type,
      asset_prefix,
      nav_prefix,
      page_file: page.file,
      page_slug: page.slug,
      page_langs: page.langs || site.languages,
      alternates,
      x_default_url: pageSupportsLang(page, site.default_lang)
        ? publicHomeURL(site.default_lang, page)
        : '',
      css_version,
      js_version,
    };

    const html = env.render(page.file, context);
    const outPath = path.join(outDir, page.file);
    ensureDir(path.dirname(outPath));
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

  const addURL = ({ loc, priority, alternates, xDefaultHref }) => {
    xml += '  <url>\n';
    xml += `    <loc>${loc}</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <priority>${priority}</priority>\n`;

    for (const { lang: altLang, href: altHref } of alternates) {
      xml += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${altHref}" />\n`;
    }
    if (xDefaultHref) {
      xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${xDefaultHref}" />\n`;
    }

    xml += '  </url>\n';
  };

  for (const page of site.pages) {
    for (const lang of site.languages) {
      if (!pageSupportsLang(page, lang)) {
        continue;
      }

      const priority = page.slug === 'index' ? '1.0'
        : ['about', 'support', 'review'].includes(page.slug) ? '0.8'
        : page.slug === 'information' ? '0.5'
        : '0.7';

      addURL({
        loc: publicHomeURL(lang, page),
        priority,
        alternates: localizedAlternates(page),
        xDefaultHref: pageSupportsLang(page, site.default_lang)
          ? publicHomeURL(site.default_lang, page)
          : '',
      });
    }
  }

  for (const storePage of [
    { suffix: '', priority: '0.9' },
    { suffix: '/books', priority: '0.8' },
    { suffix: '/charts', priority: '0.8' },
  ]) {
    for (const lang of site.languages) {
      addURL({
        loc: publicStoreURL(lang, storePage.suffix),
        priority: storePage.priority,
        alternates: localizedStoreAlternates(storePage.suffix),
        xDefaultHref: publicStoreURL(site.default_lang, storePage.suffix),
      });
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

Sitemap: ${site.base_url}/sitemap.xml
`;

  const outPath = path.join(ROOT, 'robots.txt');
  fs.writeFileSync(outPath, content, 'utf8');
  generated.push('robots.txt');
}

// ── Generate llms.txt ──────────────────────────────────────────
function buildLlmsTxt() {
  // Curated global llms.txt (root discovery file).
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
      const url = publicHomeURL('ko', page);
      const label = page.slug === 'index' ? '홈페이지' : pt.breadcrumb_name || pt.title.replace(/ - .*$/, '');
      koLines.push(`- [${label}](${url}): ${pt.description}`);
    }
  }
  koLines.push('', '## Store', '');
  koLines.push(`- [Brain Check Store](${site.base_url}/store/ko)`);
  koLines.push(`- [Brain Check Store EN](${site.base_url}/store/en)`);
  koLines.push(`- [Books](${site.base_url}/store/ko/books)`);
  koLines.push(`- [Books EN](${site.base_url}/store/en/books)`);
  koLines.push(`- [Sitemap](${site.base_url}/sitemap.xml)`);
  koLines.push('');

  fs.writeFileSync(path.join(ROOT, 'llms.txt'), koLines.join('\n'), 'utf8');
  generated.push('llms.txt');
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
