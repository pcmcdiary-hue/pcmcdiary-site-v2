import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://pcmcdiary.com',
  output: 'static',
  build: {
    format: 'directory'
  }
});
