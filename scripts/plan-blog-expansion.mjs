import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const projectRoot = path.resolve(import.meta.dirname, '..');
const defaultSource = path.resolve(projectRoot, '..', '..', '..', 'Tironi Tech', 'tironitech');
const sourceRoot = path.resolve(process.argv[2] || process.env.TIRONI_TECH_SITE_PATH || defaultSource);
const sourceModule = path.join(sourceRoot, 'src', 'content', 'blogArticles.js');
const currentContentFile = path.join(projectRoot, 'src', 'content', 'blogArticles.generated.json');
const outputFile = path.join(projectRoot, 'content', 'expansion-plan.json');

const quotas = new Map([
  ['WhatsApp + IA', 14],
  ['Atendimento com IA', 3],
  ['Vendas com IA', 28],
  ['Leads e CRM', 28],
  ['Integrações', 7],
  ['Automação e agentes de IA', 12],
  ['Ecommerce', 8],
]);

const stopwords = new Set(['a', 'ao', 'as', 'com', 'como', 'da', 'de', 'do', 'e', 'em', 'na', 'no', 'o', 'os', 'para', 'por', 'sem', 'um', 'uma']);
const normalize = (value = '') => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
const tokens = (value) => new Set(normalize(value).split(/[^a-z0-9]+/).filter((token) => token.length > 2 && !stopwords.has(token)));

function similarity(left, right) {
  const leftTokens = tokens(left);
  const rightTokens = tokens(right);
  const intersection = [...leftTokens].filter((token) => rightTokens.has(token)).length;
  const union = new Set([...leftTokens, ...rightTokens]).size;
  return union ? intersection / union : 0;
}

function contentCharacters(article) {
  return [
    article.title,
    article.description,
    article.intro,
    ...(article.takeaways || []),
    ...article.sections.flatMap((section) => [section.heading, ...(section.paragraphs || []), ...(section.bullets || [])]),
    ...(article.faqs || []).flatMap((faq) => [faq.question, faq.answer]),
  ].filter(Boolean).join(' ').length;
}

function clusterFor(article) {
  const text = normalize([article.slug, article.title, article.category, ...(article.keywords || [])].join(' '));
  if (/ecommerce|e-commerce|loja virtual|carrinho|catalogo|produto|estoque|pedido/.test(text)) return 'Ecommerce';
  if (article.category === 'IA para WhatsApp') return 'WhatsApp + IA';
  if (article.category === 'Prospecção e CRM') return 'Leads e CRM';
  if (article.category === 'Vendas e crescimento') return 'Vendas com IA';
  if (article.category === 'ChatBô e atendimento') return /whatsapp|\bwhats\b/.test(text) ? 'WhatsApp + IA' : 'Atendimento com IA';
  if (article.category === 'Integrações com CRM, ERP e APIs') return 'Integrações';
  if (article.category === 'Automação com IA' || article.category === 'Serviços de IA') return 'Automação e agentes de IA';
  if (/integracao|integrar|\bcrm\b|\berp\b|\bapi\b|webhook|sistema/.test(text)) return 'Integrações';
  if (/agente de ia|agentic|automacao|automatizar/.test(text)) return 'Automação e agentes de IA';
  if (/whatsapp|\bwhats\b/.test(text)) return 'WhatsApp + IA';
  if (/atendimento|suporte|\bsac\b|cliente/.test(text)) return 'Atendimento com IA';
  if (/lead|prospeccao|qualificacao|\bcrm\b/.test(text)) return 'Leads e CRM';
  if (/venda|comercial|proposta|conversao|funil|receita/.test(text)) return 'Vendas com IA';
  return null;
}

function intentFor(article) {
  const text = normalize(`${article.slug} ${article.title}`);
  if (/quanto custa|preco|orcamento/.test(text)) return 'transactional';
  if (/melhor|comparar|comparacao|vs|contratar|escolher|plataforma|software/.test(text)) return 'commercial';
  return 'informational';
}

function funnelFor(intent, article) {
  const text = normalize(`${article.slug} ${article.title}`);
  if (intent === 'transactional' || /contratar|melhor|preco|orcamento|fornecedor/.test(text)) return 'BOFU';
  if (intent === 'commercial' || /implementar|integrar|metricas|roi|estrategia|comparar/.test(text)) return 'MOFU';
  return 'TOFU';
}

function pageTypeFor(article) {
  const text = normalize(`${article.slug} ${article.title}`);
  if (/comparar|comparacao|\bvs\b|diferenca/.test(text)) return 'comparison';
  if (/integrar|integracao|\bcrm\b|\berp\b|\bapi\b|webhook/.test(text)) return 'integration';
  if (/como |guia|passo a passo|implementar|montar|criar/.test(text)) return 'guide';
  return 'article';
}

function primaryKeywordFor(article, usedKeywords) {
  const candidates = [...(article.keywords || []), article.title]
    .map((value) => value.trim())
    .filter((value) => value.length >= 8 && value.length <= 90);
  return candidates.find((value) => !usedKeywords.has(normalize(value))) || article.title;
}

await access(sourceModule);
const [{ blogArticles }, currentArticles] = await Promise.all([
  import(`${pathToFileURL(sourceModule).href}?plan=${Date.now()}`),
  readFile(currentContentFile, 'utf8').then(JSON.parse),
]);

const baseArticles = currentArticles.filter((article) => article.minimumCharacters !== 15_000);
const excludedSlugs = new Set(baseArticles.map((article) => article.slug));
const selected = [];
const usedKeywords = new Set(baseArticles.map((article) => normalize(article.primaryKeyword)));
const familyFor = (slug) => slug.replace(/-(guia-pratico|implementacao-passo-a-passo|estrategia-diagnostico|custos-metricas-roi|comparativo-erros-checklist)$/, '');
const usedFamilies = new Set(baseArticles.map((article) => familyFor(article.slug)));
const relevantCategory = new Set(['ChatBô e atendimento', 'IA para WhatsApp', 'Vendas e crescimento', 'Prospecção e CRM', 'Serviços de IA', 'Automação com IA', 'Integrações com CRM, ERP e APIs']);

const candidates = blogArticles
  .filter((article) => !excludedSlugs.has(article.slug))
  .filter((article) => !article.slug.startsWith('pesquisa-'))
  .filter((article) => relevantCategory.has(article.category))
  .filter((article) => contentCharacters(article) >= 10_000)
  .filter((article) => clusterFor(article))
  .sort((left, right) => {
    const sourceDifference = (right.sources?.length || 0) - (left.sources?.length || 0);
    const faqDifference = (right.faqs?.length || 0) - (left.faqs?.length || 0);
    return sourceDifference * 3000 + faqDifference * 1000 + contentCharacters(right) - contentCharacters(left);
  });

for (const [cluster, quota] of quotas) {
  const clusterCandidates = candidates.filter((article) => clusterFor(article) === cluster);
  for (const article of clusterCandidates) {
    if (selected.filter((entry) => entry.cluster === cluster).length >= quota) break;
    const family = familyFor(article.slug);
    if (usedFamilies.has(family)) continue;
    if (selected.some((entry) => similarity(entry.title, article.title) >= 0.68)) continue;
    const primaryKeyword = primaryKeywordFor(article, usedKeywords);
    if (usedKeywords.has(normalize(primaryKeyword))) continue;
    usedKeywords.add(normalize(primaryKeyword));
    usedFamilies.add(family);
    const intent = intentFor(article);
    selected.push({
      sourceSlug: article.slug,
      title: article.title,
      primaryKeyword,
      variations: (article.keywords || []).filter((keyword) => normalize(keyword) !== normalize(primaryKeyword)).slice(0, 8),
      cluster,
      intent,
      funnel: funnelFor(intent, article),
      pageType: pageTypeFor(article),
      targetUrl: `/blog/${article.slug}`,
      sourceCharacters: contentCharacters(article),
      minimumCharacters: 15000,
      status: 'approved',
    });
  }
}

if (selected.length !== 100) {
  const counts = Object.fromEntries([...quotas.keys()].map((cluster) => [cluster, selected.filter((entry) => entry.cluster === cluster).length]));
  throw new Error(`Não foi possível fechar 100 pautas distintas: ${JSON.stringify(counts)}`);
}

await mkdir(path.dirname(outputFile), { recursive: true });
await writeFile(outputFile, `${JSON.stringify(selected, null, 2)}\n`, 'utf8');
console.log(`Plano congelado com ${selected.length} novos artigos em ${path.relative(projectRoot, outputFile)}.`);
console.log(Object.fromEntries([...quotas.keys()].map((cluster) => [cluster, selected.filter((entry) => entry.cluster === cluster).length])));
