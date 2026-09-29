import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const siteUrl = (process.env.SITE_URL || 'https://www.chatbo.com.br').replace(/\/$/, '');
const template = await readFile(path.join(dist, 'index.html'), 'utf8');
const articles = JSON.parse(await readFile(path.join(root, 'src', 'content', 'blogArticles.generated.json'), 'utf8'));

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const absolute = (pathname) => new URL(pathname, `${siteUrl}/`).toString();
const jsonLd = (value) => JSON.stringify(value).replaceAll('<', '\\u003c');

function withSeo({ title, description, pathname, type = 'website', structuredData, body }) {
  const canonical = absolute(pathname);
  let html = template
    .replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${escapeHtml(description)}" />`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${escapeHtml(title)}" />`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${escapeHtml(description)}" />`)
    .replace(/<meta property="og:type" content="[^"]*"\s*\/>/, `<meta property="og:type" content="${type}" />`)
    .replace(/<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${canonical}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*"\s*\/>/, `<meta name="twitter:title" content="${escapeHtml(title)}" />`)
    .replace(/<meta name="twitter:description" content="[^"]*"\s*\/>/, `<meta name="twitter:description" content="${escapeHtml(description)}" />`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${canonical}" />`)
    .replace('</head>', `${structuredData.map((data) => `<script type="application/ld+json" data-chatbo-seo>${jsonLd(data)}</script>`).join('')}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root" data-prerendered="true">${body}</div>`);
  return html;
}

function articleSchema(article) {
  const url = absolute(article.targetUrl);
  const schemas = [{
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    dateModified: article.updated,
    inLanguage: 'pt-BR',
    mainEntityOfPage: url,
    url,
    keywords: article.keywords.join(', '),
    author: { '@type': 'Organization', name: 'ChatBô by Tironi Tech', url: siteUrl },
    publisher: { '@type': 'Organization', name: 'ChatBô by Tironi Tech', url: siteUrl, logo: { '@type': 'ImageObject', url: absolute('/branding/chatbo-logo-oficial.png') } },
    citation: article.sources.map((source) => source.url),
  }, {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: `${siteUrl}/` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: absolute('/blog') },
      { '@type': 'ListItem', position: 3, name: article.title, item: url },
    ],
  }];
  if (article.faqs?.length) schemas.push({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: article.faqs.map((faq) => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })),
  });
  return schemas;
}

function renderArticle(article) {
  const headingId = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const sections = article.sections.map((section) => `<section id="${headingId(section.heading)}"><h2>${escapeHtml(section.heading)}</h2>${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}${section.bullets?.length ? `<ul>${section.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}</ul>` : ''}</section>`).join('');
  const faqs = article.faqs?.length ? `<section><h2>Perguntas frequentes</h2>${article.faqs.map((faq) => `<h3>${escapeHtml(faq.question)}</h3><p>${escapeHtml(faq.answer)}</p>`).join('')}</section>` : '';
  const toc = article.sections.length > 3 ? `<nav aria-label="Índice do artigo"><h2>Neste artigo</h2><ol>${article.sections.map((section) => `<li><a href="#${headingId(section.heading)}">${escapeHtml(section.heading)}</a></li>`).join('')}</ol></nav>` : '';
  const related = [...new Set([...(article.relatedSolutions || []), ...(article.relatedArticles || [])])];
  const relatedNav = related.length ? `<nav aria-label="Conteúdos relacionados"><h2>Conteúdos relacionados</h2><ul>${related.map((target) => `<li><a href="${escapeHtml(target)}">${escapeHtml(target.split('/').filter(Boolean).at(-1).replaceAll('-', ' '))}</a></li>`).join('')}</ul></nav>` : '';
  return `<header><nav><a href="/">ChatBô</a> · <a href="/blog">Blog</a></nav><p>${escapeHtml(article.category)} · ${escapeHtml(article.readTime)}</p><h1>${escapeHtml(article.title)}</h1><p>${escapeHtml(article.description)}</p><p>Publicado em <time datetime="${article.date}">${article.date}</time> · Atualizado em <time datetime="${article.updated}">${article.updated}</time></p></header><main><article><p>${escapeHtml(article.intro)}</p><aside><h2>Resposta rápida</h2><p>${escapeHtml(article.quickAnswer)}</p><ul>${article.takeaways.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></aside>${toc}${sections}${faqs}<section><h2>${escapeHtml(article.cta.title)}</h2><p>${escapeHtml(article.cta.text)}</p><a href="/cadastro">${escapeHtml(article.cta.label)}</a></section><section><h2>Fontes e referências</h2><ul>${article.sources.map((source) => `<li><a href="${escapeHtml(source.url)}">${escapeHtml(source.label)}</a></li>`).join('')}</ul></section>${relatedNav}</article></main><footer><a href="/blog">Conheça todos os artigos do ChatBô</a></footer>`;
}

const collectionSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Blog ChatBô — IA comercial, chatbot e WhatsApp',
  description: 'Guias práticos sobre chatbot com IA, atendimento, WhatsApp, vendas e automação comercial.',
  url: absolute('/blog'),
  isPartOf: { '@type': 'WebSite', name: 'ChatBô', url: siteUrl },
  mainEntity: articles.map((article) => ({ '@type': 'BlogPosting', headline: article.title, url: absolute(article.targetUrl), dateModified: article.updated })),
};
const indexBody = `<header><nav><a href="/">ChatBô</a></nav><h1>Blog ChatBô</h1><p>Guias sobre chatbot com IA, atendimento no WhatsApp, automação comercial, CRM e vendas.</p></header><main><section><h2>Conteúdos em destaque</h2>${articles.map((article) => `<article><p>${escapeHtml(article.category)} · ${escapeHtml(article.readTime)}</p><h2><a href="${escapeHtml(article.targetUrl)}">${escapeHtml(article.title)}</a></h2><p>${escapeHtml(article.description)}</p><time datetime="${article.updated}">Atualizado em ${article.updated}</time></article>`).join('')}</section></main>`;

await mkdir(path.join(dist, 'blog'), { recursive: true });
await writeFile(path.join(dist, 'blog', 'index.html'), withSeo({
  title: 'Blog ChatBô | Chatbot com IA, WhatsApp e vendas',
  description: 'Guias práticos e aprofundados sobre chatbot com IA, atendimento no WhatsApp, automação comercial, CRM, vendas e experiência do cliente.',
  pathname: '/blog',
  structuredData: [collectionSchema],
  body: indexBody,
}), 'utf8');

for (const article of articles) {
  const articleDirectory = path.join(dist, ...article.targetUrl.split('/').filter(Boolean));
  await mkdir(articleDirectory, { recursive: true });
  await writeFile(path.join(articleDirectory, 'index.html'), withSeo({
    title: article.seoTitle,
    description: article.seoDescription,
    pathname: article.targetUrl,
    type: 'article',
    structuredData: articleSchema(article),
    body: renderArticle(article),
  }), 'utf8');
}

const staticUrls = [
  { path: '/', priority: '1.0', frequency: 'weekly' },
  { path: '/planos', priority: '0.8', frequency: 'monthly' },
  { path: '/blog', priority: '0.9', frequency: 'weekly' },
  { path: '/politica-privacidade', priority: '0.3', frequency: 'yearly' },
];
const sitemapEntries = [
  ...staticUrls.map((entry) => `<url><loc>${absolute(entry.path)}</loc><changefreq>${entry.frequency}</changefreq><priority>${entry.priority}</priority></url>`),
  ...articles.map((article) => `<url><loc>${absolute(article.targetUrl)}</loc><lastmod>${article.updated}</lastmod><changefreq>monthly</changefreq><priority>${article.pageType === 'pillar' ? '0.9' : article.featured ? '0.8' : '0.7'}</priority></url>`),
].join('');
await writeFile(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapEntries}</urlset>`, 'utf8');
await writeFile(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /dashboard\nDisallow: /atendimento\nDisallow: /system/\nSitemap: ${absolute('/sitemap.xml')}\n`, 'utf8');

const rssItems = articles.slice(0, 30).map((article) => `<item><title>${escapeHtml(article.title)}</title><link>${absolute(article.targetUrl)}</link><guid>${absolute(article.targetUrl)}</guid><pubDate>${new Date(`${article.date}T12:00:00Z`).toUTCString()}</pubDate><description>${escapeHtml(article.description)}</description></item>`).join('');
await writeFile(path.join(dist, 'feed.xml'), `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Blog ChatBô</title><link>${absolute('/blog')}</link><description>Chatbot com IA, WhatsApp e vendas</description><language>pt-BR</language>${rssItems}</channel></rss>`, 'utf8');

const llms = [`# ChatBô`, '', '> ChatBô é uma plataforma brasileira de atendimento e vendas com inteligência artificial, criada para automatizar conversas, qualificação de leads, vendas, suporte e operações digitais em diferentes canais.', '', '## Conteúdo editorial', '', `- [Blog ChatBô](${absolute('/blog')}): guias sobre chatbot com IA, WhatsApp, atendimento e vendas.`, ...articles.map((article) => `- [${article.title}](${absolute(article.targetUrl)}): ${article.description}`), '', '## Páginas principais', '', `- [Página inicial](${siteUrl}/)`, `- [Planos](${absolute('/planos')})`, `- [Política de privacidade](${absolute('/politica-privacidade')})`, ''].join('\n');
await writeFile(path.join(dist, 'llms.txt'), llms, 'utf8');

console.log(`Pré-renderizadas ${articles.length} páginas de artigo, índice, sitemap, feed, robots e llms.txt.`);
