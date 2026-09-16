import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://pcmcdiary.com',
  output: 'static',
  build: {
    format: 'directory'
  },
  redirects: {
    // Page rename
    '/expert-salla': '/expert-advice',

    // Old expert labels → new ones
    '/search/label/dr-saala':     '/search/label/dr-advisor',
    '/search/label/arthik-saala': '/search/label/arthik-advisor',
    '/search/label/vastu-saala':  '/search/label/vastu-advisor',
    '/search/label/fit-saala':    '/search/label/fit-advisor',
    '/search/label/kanoon-saala': '/search/label/kanoon-advisor',
    '/search/label/rashi-saala':  '/search/label/rashi-advisor',
    '/search/label/career-saala': '/search/label/career-advisor',
    '/search/label/beauty-saala': '/search/label/beauty-advisor',
    '/search/label/food-saala':   '/search/label/food-advisor',
    '/search/label/tech-saala':   '/search/label/tech-advisor',

    // Old article URL → new one
    '/article/dr-saala-diabetes-signs': '/article/dr-advisor-diabetes-signs',
  }
});
