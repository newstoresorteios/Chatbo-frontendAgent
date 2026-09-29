import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const articles = JSON.parse(await readFile(path.join(root, 'src', 'content', 'blogArticles.generated.json'), 'utf8'));
const failures = [];
const titles = new Map();
const descriptions = new Map();
const targetUrls = new Map();
const primaryKeywords = new Map();
const longParagraphs = new Map();
const expansionArticles = articles.filter((article) => article.minimumCharacters === 15_000);
const latestExpansionArticles = articles.filter((article) => article.editorialBatch === 'chatbo-expansion-500');

if (articles.length !== 625) failures.push(`Biblioteca editorial deve conter 625 artigos; encontrado ${articles.length}`);
if (expansionArticles.length !== 600) failures.push(`Lotes editoriais devem conter 600 artigos long-form; encontrado ${expansionArticles.length}`);
if (latestExpansionArticles.length !== 500) failures.push(`Novo lote editorial deve conter 500 artigos; encontrado ${latestExpansionArticles.length}`);

function capture(html, pattern) {
  return html.match(pattern)?.[1]?.trim() || '';
}

for (const article of articles) {
  if (targetUrls.has(article.targetUrl)) failures.push(`${article.targetUrl}: URL duplicada com ${targetUrls.get(article.targetUrl)}`);
  else targetUrls.set(article.targetUrl, article.slug);
  const normalizedKeyword = article.primaryKeyword.trim().toLocaleLowerCase('pt-BR');
  if (primaryKeywords.has(normalizedKeyword)) failures.push(`${article.targetUrl}: palavra-chave principal duplicada com ${primaryKeywords.get(normalizedKeyword)}`);
  else primaryKeywords.set(normalizedKeyword, article.targetUrl);
  for (const section of article.sections || []) {
    for (const paragraph of section.paragraphs || []) {
      const normalizedParagraph = paragraph.replace(/\s+/g, ' ').trim().toLocaleLowerCase('pt-BR');
      if (normalizedParagraph.length < 180) continue;
      if (longParagraphs.has(normalizedParagraph)) failures.push(`${article.targetUrl}: parágrafo longo duplicado com ${longParagraphs.get(normalizedParagraph)}`);
      else longParagraphs.set(normalizedParagraph, article.targetUrl);
    }
  }
  const file = path.join(dist, ...article.targetUrl.split('/').filter(Boolean), 'index.html');
  let html;
  try {
    html = await readFile(file, 'utf8');
  } catch {
    failures.push(`${article.targetUrl}: HTML não foi gerado`);
    continue;
  }
  const title = capture(html, /<title>(.*?)<\/title>/s);
  const description = capture(html, /<meta name="description" content="([^"]*)"/);
  const canonical = capture(html, /<link rel="canonical" href="([^"]*)"/);
  const h1Count = (html.match(/<h1(?:\s|>)/g) || []).length;
  const schemas = [...html.matchAll(/<script type="application\/ld\+json" data-chatbo-seo>(.*?)<\/script>/gs)];

  if (!title) failures.push(`${article.targetUrl}: title ausente`);
  if (!description) failures.push(`${article.targetUrl}: description ausente`);
  if (title.length < 35 || title.length > 70) failures.push(`${article.targetUrl}: title fora da faixa editorial (${title.length})`);
  if (description.length < 110 || description.length > 170) failures.push(`${article.targetUrl}: description fora da faixa editorial (${description.length})`);
  if (canonical !== article.canonical) failures.push(`${article.targetUrl}: canonical divergente (${canonical})`);
  if (h1Count !== 1) failures.push(`${article.targetUrl}: esperado 1 H1, encontrado ${h1Count}`);
  if (!schemas.length) failures.push(`${article.targetUrl}: JSON-LD ausente`);
  if (article.minimumCharacters && article.editorialCharacterCount < article.minimumCharacters) failures.push(`${article.targetUrl}: conteúdo abaixo de ${article.minimumCharacters} caracteres`);
  if (article.minimumCharacters && (article.faqs?.length || 0) < 3) failures.push(`${article.targetUrl}: menos de 3 perguntas frequentes`);
  if (!article.sources?.length) failures.push(`${article.targetUrl}: fontes ausentes`);
  for (const schema of schemas) {
    try { JSON.parse(schema[1]); } catch { failures.push(`${article.targetUrl}: JSON-LD inválido`); }
  }
  if (titles.has(title)) failures.push(`${article.targetUrl}: title duplicado com ${titles.get(title)}`);
  else titles.set(title, article.targetUrl);
  if (descriptions.has(description)) failures.push(`${article.targetUrl}: description duplicada com ${descriptions.get(description)}`);
  else descriptions.set(description, article.targetUrl);
}

const blogIndex = await readFile(path.join(dist, 'blog', 'index.html'), 'utf8');
for (const article of articles) {
  if (!blogIndex.includes(`href="${article.targetUrl}"`)) failures.push(`${article.targetUrl}: página órfã do índice do blog`);
}

for (const required of ['sitemap.xml', 'robots.txt', 'feed.xml', 'llms.txt', 'blog/index.html']) {
  try { await access(path.join(dist, required)); } catch { failures.push(`Artefato ausente: ${required}`); }
}

if (failures.length) {
  console.error(`Auditoria SEO falhou com ${failures.length} problema(s):\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`Auditoria SEO aprovada: ${articles.length} URLs, palavras-chave, titles, descriptions e parágrafos longos únicos; canonical, H1 e JSON-LD válidos.`);
