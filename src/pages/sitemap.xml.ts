import type { APIRoute } from 'astro';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const DATA_DIR = path.resolve('./src/data');
const SITE = 'https://pcmcdiary.com';

export const GET: APIRoute = async () => {
  const urls: string[] = [];

  const staticPages = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/directory', priority: '0.9', changefreq: 'daily' },
    { path: '/coupons', priority: '0.8', changefreq: 'daily' },
    { path: '/expert-advice', priority: '0.8', changefreq: 'weekly' },
    { path: '/plans', priority: '0.7', changefreq: 'weekly' },
    { path: '/about', priority: '0.5', changefreq: 'monthly' },
    { path: '/contact', priority: '0.5', changefreq: 'monthly' },
    { path: '/register', priority: '0.6', changefreq: 'monthly' },
    { path: '/payment', priority: '0.5', changefreq: 'monthly' },
    { path: '/terms', priority: '0.3', changefreq: 'yearly' },
    { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
    { path: '/refund', priority: '0.3', changefreq: 'yearly' },
    { path: '/disclaimer', priority: '0.3', changefreq: 'yearly' },
    { path: '/grievance-officer', priority: '0.3', changefreq: 'yearly' },
  ];

  for (const page of staticPages) {
    urls.push(
      `  <url>\n` +
      `    <loc>${SITE}${page.path}</loc>\n` +
      `    <changefreq>${page.changefreq}</changefreq>\n` +
      `    <priority>${page.priority}</priority>\n` +
      `  </url>`
    );
  }

  // Read categories from local src/data/
  let categories: any[] = [];
  try {
    const catRaw = await readFile(path.join(DATA_DIR, 'categories.json'), 'utf8');
    const catData = JSON.parse(catRaw);
    categories = catData.categories || [];
  } catch (e) { /* ignore */ }

  for (const cat of categories) {
    urls.push(
      `  <url>\n` +
      `    <loc>${SITE}/category/${cat.categoryId}</loc>\n` +
      `    <changefreq>daily</changefreq>\n` +
      `    <priority>0.8</priority>\n` +
      `  </url>`
    );
  }

  // Read locations from local src/data/
  try {
    const locRaw = await readFile(path.join(DATA_DIR, 'locations.json'), 'utf8');
    const locData = JSON.parse(locRaw);
    const locs = locData.locations || [];
    for (const loc of locs) {
      urls.push(
        `  <url>\n` +
        `    <loc>${SITE}/location/${loc.locationId}</loc>\n` +
        `    <changefreq>daily</changefreq>\n` +
        `    <priority>0.8</priority>\n` +
        `  </url>`
      );
    }
  } catch (e) { /* ignore */ }

  // Read each category's businesses from local src/data/clients/
  const bizResults = await Promise.all(
    categories.map(async (cat) => {
      try {
        const bizRaw = await readFile(path.join(DATA_DIR, 'clients', cat.file), 'utf8');
        const data = JSON.parse(bizRaw);
        return Array.isArray(data) ? data : [];
      } catch (e) { return []; }
    })
  );

  const allBusinesses = bizResults.flat();

  for (const biz of allBusinesses) {
    if (!biz.businessId) continue;

    urls.push(
      `  <url>\n` +
      `    <loc>${SITE}/business/${biz.businessId}</loc>\n` +
      `    <changefreq>weekly</changefreq>\n` +
      `    <priority>0.7</priority>\n` +
      `  </url>`
    );

    const tier = (biz.tier || '').toLowerCase();
    const isVerified = ['featured','premium','premium_pro','vp','vb'].includes(tier);
    if (!isVerified) {
      urls.push(
        `  <url>\n` +
        `    <loc>${SITE}/claim/${biz.businessId}</loc>\n` +
        `    <changefreq>monthly</changefreq>\n` +
        `    <priority>0.4</priority>\n` +
        `  </url>`
      );
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.join('\n') +
    `\n</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
