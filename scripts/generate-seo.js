import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const DEFAULT_SITE_URL = 'https://heangdenis-portfolio.vercel.app';

/**
 * Normalizes a site URL so it always starts with http(s):// and has no trailing slash.
 */
export function normalizeSiteUrl(rawUrl) {
  const trimmed = typeof rawUrl === 'string' ? rawUrl.trim() : '';
  if (!trimmed) return DEFAULT_SITE_URL;

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  return withProtocol.replace(/\/+$/, '');
}

/**
 * Reads a simple KEY=VALUE .env file if present so standalone CLI invocations
 * pick up VITE_SITE_URL even outside Vite.
 */
function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};

  const out = {};
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed
      .slice(eqIndex + 1)
      .trim()
      .replace(/^['"]|['"]$/g, '');
    if (key) out[key] = value;
  }
  return out;
}

export function resolveSiteUrl(root = process.cwd(), envOverride = {}) {
  const dotEnv = {
    ...readEnvFile(path.join(root, '.env')),
    ...readEnvFile(path.join(root, '.env.production')),
    ...readEnvFile(path.join(root, '.env.local')),
  };

  const candidate =
    envOverride.VITE_SITE_URL ||
    process.env.VITE_SITE_URL ||
    dotEnv.VITE_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    DEFAULT_SITE_URL;

  return normalizeSiteUrl(candidate);
}

export function buildRobotsTxt(siteUrl) {
  return [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`,
    '',
  ].join('\n');
}

export function buildSitemapXml(siteUrl, lastmod = new Date().toISOString().slice(0, 10)) {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    '  <url>',
    `    <loc>${siteUrl}/</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    '    <changefreq>weekly</changefreq>',
    '    <priority>1.0</priority>',
    '  </url>',
    '</urlset>',
    '',
  ].join('\n');
}

export function generateSeoFiles(root = process.cwd(), envOverride = {}) {
  const siteUrl = resolveSiteUrl(root, envOverride);
  const lastmod = new Date().toISOString().slice(0, 10);
  const publicDir = path.join(root, 'public');

  fs.mkdirSync(publicDir, { recursive: true });
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), buildRobotsTxt(siteUrl), 'utf8');
  fs.writeFileSync(
    path.join(publicDir, 'sitemap.xml'),
    buildSitemapXml(siteUrl, lastmod),
    'utf8',
  );

  const portraitSrc = path.join(root, 'src', 'images', 'HEANG Denis good image.jpg');
  const portraitDest = path.join(publicDir, 'heang-denis.jpg');
  if (fs.existsSync(portraitSrc) && !fs.existsSync(portraitDest)) {
    fs.copyFileSync(portraitSrc, portraitDest);
  }

  return { siteUrl, lastmod };
}

/**
 * Vite plugin that keeps public/robots.txt, public/sitemap.xml, and canonical
 * URLs in index.html synchronized with VITE_SITE_URL at build time.
 */
export default function seoPlugin() {
  let root = process.cwd();
  let siteUrl = DEFAULT_SITE_URL;

  return {
    name: 'portfolio-seo-generator',

    configResolved(config) {
      root = config.root;
      siteUrl = resolveSiteUrl(root, config.env);
    },

    buildStart() {
      const result = generateSeoFiles(root, { VITE_SITE_URL: siteUrl });
      siteUrl = result.siteUrl;
    },

    transformIndexHtml(html) {
      let transformed =
        siteUrl === DEFAULT_SITE_URL ? html : html.replaceAll(DEFAULT_SITE_URL, siteUrl);

      const googleVerification =
        process.env.VITE_GOOGLE_SITE_VERIFICATION ||
        readEnvFile(path.join(root, '.env')).VITE_GOOGLE_SITE_VERIFICATION ||
        readEnvFile(path.join(root, '.env.production')).VITE_GOOGLE_SITE_VERIFICATION ||
        readEnvFile(path.join(root, '.env.local')).VITE_GOOGLE_SITE_VERIFICATION;

      if (
        googleVerification &&
        !transformed.includes('name="google-site-verification"')
      ) {
        transformed = transformed.replace(
          '<meta name="robots"',
          `<meta name="google-site-verification" content="${googleVerification.trim()}" />\n    <meta name="robots"`,
        );
      }

      return transformed;
    },
  };
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  const { siteUrl, lastmod } = generateSeoFiles();
  console.log(`[seo] Generated public/robots.txt & public/sitemap.xml for ${siteUrl} (${lastmod})`);
}
