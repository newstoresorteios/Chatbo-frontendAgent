import { useEffect } from 'react';

const SITE_URL = 'https://www.chatbo.com.br';
const DEFAULT_IMAGE = `${SITE_URL}/branding/chatbo-logo-oficial.png`;

interface SeoHeadProps {
  title: string;
  description: string;
  path: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

function setMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([name, value]) => element?.setAttribute(name, value));
}

export function SeoHead({ title, description, path, type = 'website', publishedTime, modifiedTime, jsonLd }: SeoHeadProps) {
  useEffect(() => {
    const canonicalUrl = new URL(path, SITE_URL).toString();
    document.title = title;
    setMeta('meta[name="description"]', { name: 'description', content: description });
    setMeta('meta[property="og:title"]', { property: 'og:title', content: title });
    setMeta('meta[property="og:description"]', { property: 'og:description', content: description });
    setMeta('meta[property="og:type"]', { property: 'og:type', content: type });
    setMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
    setMeta('meta[property="og:image"]', { property: 'og:image', content: DEFAULT_IMAGE });
    setMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    setMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
    setMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
    if (publishedTime) setMeta('meta[property="article:published_time"]', { property: 'article:published_time', content: publishedTime });
    if (modifiedTime) setMeta('meta[property="article:modified_time"]', { property: 'article:modified_time', content: modifiedTime });

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    document.querySelectorAll('script[data-chatbo-seo]').forEach((element) => element.remove());
    if (jsonLd) {
      const blocks = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      blocks.forEach((block) => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.dataset.chatboSeo = 'true';
        script.textContent = JSON.stringify(block).replace(/</g, '\\u003c');
        document.head.appendChild(script);
      });
    }
  }, [description, jsonLd, modifiedTime, path, publishedTime, title, type]);

  return null;
}
