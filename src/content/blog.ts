import generatedArticles from './blogArticles.generated.json';
export { formatArticleDate } from '@/utils/articleDate';

export interface BlogSource {
  label: string;
  url: string;
}

export interface BlogSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface BlogArticle {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  updated: string;
  readTime: string;
  featured?: boolean;
  keywords: string[];
  intro: string;
  takeaways: string[];
  sections: BlogSection[];
  faqs?: Array<{ question: string; answer: string }>;
  cta: { title: string; text: string; label: string; href: string };
  sources: BlogSource[];
  primaryKeyword: string;
  seoTitle: string;
  seoDescription: string;
  secondaryKeywords: string[];
  searchIntent: 'informational' | 'commercial' | 'transactional' | 'navigational';
  funnelStage: 'TOFU' | 'MOFU' | 'BOFU';
  cluster: string;
  pageType: 'pillar' | 'article' | 'solution' | 'comparison' | 'integration' | 'industry' | 'glossary' | 'faq' | 'guide';
  targetUrl: string;
  canonical: string;
  author: string;
  featuredImage: string;
  entities: string[];
  questions: string[];
  quickAnswer: string;
  relatedArticles: string[];
  relatedSolutions: string[];
  minimumCharacters: number | null;
  editorialCharacterCount: number;
  editorialBatch?: string;
}

export const blogArticles = generatedArticles as BlogArticle[];

export const blogCategories = [
  'Todos',
  ...Array.from(new Set(blogArticles.map((article) => article.cluster))).sort((a, b) => a.localeCompare(b, 'pt-BR')),
];

export const featuredBlogArticles = blogArticles
  .filter((article) => article.featured)
  .slice(0, 6);

export function getBlogArticle(slug?: string) {
  return blogArticles.find((article) => article.slug === slug);
}

export function getBlogArticleByUrl(targetUrl: string) {
  return blogArticles.find((article) => article.targetUrl === targetUrl);
}

export function relatedBlogArticles(article: BlogArticle, limit = 3) {
  return blogArticles
    .filter((candidate) => candidate.slug !== article.slug)
    .map((candidate) => ({
      candidate,
      score:
        (candidate.category === article.category ? 4 : 0)
        + candidate.keywords.filter((keyword) => article.keywords.includes(keyword)).length,
    }))
    .sort((left, right) => right.score - left.score || right.candidate.updated.localeCompare(left.candidate.updated))
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}
