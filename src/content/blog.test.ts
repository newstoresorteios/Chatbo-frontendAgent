import { describe, expect, it } from 'vitest';
import { blogArticles, getBlogArticleByUrl } from './blog';

describe('blog editorial contract', () => {
  it('keeps one canonical page per planned intent', () => {
    expect(new Set(blogArticles.map((article) => article.targetUrl)).size).toBe(blogArticles.length);
    expect(new Set(blogArticles.map((article) => article.primaryKeyword)).size).toBe(blogArticles.length);
  });

  it('resolves every public route to its source article', () => {
    for (const article of blogArticles) {
      expect(getBlogArticleByUrl(article.targetUrl)?.slug).toBe(article.slug);
      expect(article.canonical).toBe(`https://www.chatbo.com.br${article.targetUrl}`);
    }
  });

  it('provides extractable answers and valid internal relationships', () => {
    const knownUrls = new Set(blogArticles.map((article) => article.targetUrl));
    for (const article of blogArticles) {
      const answerWords = article.quickAnswer.trim().split(/\s+/).length;
      expect(answerWords).toBeGreaterThanOrEqual(40);
      expect(answerWords).toBeLessThanOrEqual(80);
      for (const target of [...article.relatedArticles, ...article.relatedSolutions]) {
        expect(knownUrls.has(target)).toBe(true);
      }
    }
  });
});
