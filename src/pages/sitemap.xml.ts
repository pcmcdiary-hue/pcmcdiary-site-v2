import type { APIRoute } from 'astro';

const CDN = 'https://raw.githubusercontent.com/pcmcdiary-hue/pcmcdiary-data-v2/main/data';
const SITE = 'https://pcmcdiary.com';

export const GET: APIRoute = async () => {
  const urls: string[] = [];

  // Static pages
  const staticPages = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/directory', priority: '0.9', changefreq: 'daily' },
    { path: '/coupons', priority: '0.8', changefreq: 'daily' },
    { path: '/expert-salla', priority: '0.8', changefreq: 'weekly' },
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

  // Category pages
  try {
    const catRes = await fetch(`${CDN}/categories.json`);
    const catData = await catRes.json();
    const cats = catData.categories || [];
    for (const cat of cats) {
      urls.push(
        `  <url>\n` +
        `    <loc>${SITE}/category/${cat.categoryId}</loc>\n` +
        `    <changefreq>daily</changefreq>\n` +
        `    <priority>0.8</priority>\n` +
        `  </url>`
      );
    }
  } catch (e) { /* ignore */ }

  // Location pages
  try {
    const locRes = await fetch(`${CDN}/locations.json`);
    const locData = await locRes.json();
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
