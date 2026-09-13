import { defineCollection, z } from 'astro:content';

const articles = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    expert: z.string(),
    author: z.string().optional(),
    category: z.string(),
    date: z.string(),
    excerpt: z.string().optional(),
    image: z.string().optional(),
    tags: z.array(z.string()).optional(),
    readTime: z.string().optional(),
    sponsored: z.boolean().optional(),
  }),
});

export const collections = { articles };
