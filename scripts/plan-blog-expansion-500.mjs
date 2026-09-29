import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const projectRoot = path.resolve(import.meta.dirname, '..');
const defaultSource = path.resolve(projectRoot, '..', '..', '..', 'Tironi Tech', 'tironitech');
const sourceRoot = path.resolve(process.argv[2] || process.env.TIRONI_TECH_SITE_PATH || defaultSource);
const sourceModule = path.join(sourceRoot, 'src', 'content', 'blogArticles.js');
const currentContentFile = path.join(projectRoot, 'src', 'content', 'blogArticles.generated.json');
const outputFile = path.join(projectRoot, 'content', 'expansion-plan-500.json');

const quotas = new Map([
  ['Leads e CRM', 48],
  ['Vendas com IA', 5],
  ['Atendimento e CX', 35],
  ['WhatsApp + IA', 40],
  ['Integrações e MCP', 40],
  ['Automação e agentes de IA', 71],
  ['Ecommerce', 21],
  ['Governança de IA', 35],
  ['RAG e conhecimento', 30],
  ['Estratégia e adoção', 35],
  ['ROI e business case', 30],
  ['Marketing com IA', 25],
  ['GEO e AEO', 35],
  ['Voice AI', 25],
  ['SaaS e produto com IA', 25],
]);

const categoryClusters = new Map([
  ['Prospecção e CRM', 'Leads e CRM'],
  ['IA para vendas, CRM e geração de leads', 'Leads e CRM'],
  ['Vendas e crescimento', 'Vendas com IA'],
  ['ChatBô e atendimento', 'Atendimento e CX'],
  ['Chat IA, atendimento e Customer Experience', 'Atendimento e CX'],
  ['IA para WhatsApp', 'WhatsApp + IA'],
  ['WhatsApp, IA e conversational commerce', 'WhatsApp + IA'],
  ['Integrações com CRM, ERP e APIs', 'Integrações e MCP'],
  ['MCP, tool use e interoperabilidade', 'Integrações e MCP'],
  ['Serviços de IA', 'Automação e agentes de IA'],
  ['Automação com IA', 'Automação e agentes de IA'],
  ['Agentes de IA e Agentic AI', 'Automação e agentes de IA'],
  ['Automação de processos e operações', 'Automação e agentes de IA'],
  ['IA no e-commerce e varejo', 'Ecommerce'],
  ['Governança, segurança e confiabilidade', 'Governança de IA'],
  ['RAG, conhecimento corporativo e context engineering', 'RAG e conhecimento'],
  ['Estratégia, adoção e transformação com IA', 'Estratégia e adoção'],
  ['IA nas empresas brasileiras e PMEs', 'Estratégia e adoção'],
  ['ROI, custo e business case para IA', 'ROI e business case'],
  ['IA em marketing, aquisição e personalização', 'Marketing com IA'],
  ['SEO e GEO', 'GEO e AEO'],
  ['GEO, AEO e aparecer nas respostas das IAs', 'GEO e AEO'],
  ['GeoAura e GEO', 'GEO e AEO'],
  ['Voice AI e agentes de voz', 'Voice AI'],
  ['SaaS, produto e AI-native software', 'SaaS e produto com IA'],
]);

const stopwords = new Set(['a', 'ao', 'as', 'com', 'como', 'da', 'de', 'do', 'e', 'em', 'na', 'no', 'o', 'os', 'para', 'por', 'sem', 'um', 'uma']);
const normalize = (value = '') => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
const tokens = (value) => new Set(normalize(value).split(/[^a-z0-9]+/).filter((token) => token.length > 2 && !stopwords.has(token)));
const familyFor = (slug) => slug.startsWith('pesquisa-')
  ? slug.replace(/^pesquisa-\d+-/, 'pesquisa-')
  : slug.replace(/-(guia-pratico|implementacao-passo-a-passo|estrategia-diagnostico|custos-metricas-roi|comparativo-erros-checklist)$/, '');
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
    ...(article.sections || []).flatMap((section) => [section.heading, ...(section.paragraphs || []), ...(section.bullets || [])]),
    ...(article.faqs || []).flatMap((faq) => [faq.question, faq.answer]),
  ].filter(Boolean).join(' ').length;
}

function intentFor(article) {
  const text = normalize(`${article.slug} ${article.title}`);
  if (/quanto custa|preco|orcamento|custo/.test(text)) return 'transactional';
  if (/melhor|comparar|comparacao|\bvs\b|contratar|escolher|plataforma|software/.test(text)) return 'commercial';
  return 'informational';
}

function funnelFor(intent, article) {
  const text = normalize(`${article.slug} ${article.title}`);
  if (intent === 'transactional' || /contratar|preco|orcamento|fornecedor/.test(text)) return 'BOFU';
  if (intent === 'commercial' || /implementar|integrar|metricas|roi|estrategia|comparar/.test(text)) return 'MOFU';
  return 'TOFU';
}

function pageTypeFor(article) {
  const text = normalize(`${article.slug} ${article.title}`);
  if (article.slug.endsWith('-guia-aplicacao')) return 'guide';
  if (/comparar|comparacao|\bvs\b|diferenca/.test(text)) return 'comparison';
  if (/integrar|integracao|\bcrm\b|\berp\b|\bapi\b|webhook|\bmcp\b/.test(text)) return 'integration';
  if (/como |guia|passo a passo|implementar|montar|criar/.test(text)) return 'guide';
  return 'article';
}

function primaryKeywordFor(article, usedKeywords) {
  const candidates = [...(article.keywords || []), article.title]
    .map((value) => value.trim())
    .filter((value) => value.length >= 8 && value.length <= 100);
  return candidates.find((value) => !usedKeywords.has(normalize(value)));
}

await access(sourceModule);
const [{ blogArticles }, currentArticles] = await Promise.all([
  import(`${pathToFileURL(sourceModule).href}?plan500=${Date.now()}`),
  readFile(currentContentFile, 'utf8').then(JSON.parse),
]);

const excludedSlugs = new Set(currentArticles.map((article) => article.slug));
const usedFamilies = new Set(currentArticles.map((article) => familyFor(article.slug)));
const usedKeywords = new Set(currentArticles.map((article) => normalize(article.primaryKeyword)));
const usedSlugs = new Set(currentArticles.map((article) => article.slug));
const selected = [];

const candidates = blogArticles
  .filter((article) => categoryClusters.has(article.category))
  .filter((article) => !excludedSlugs.has(article.slug))
  .filter((article) => contentCharacters(article) >= 3_000)
  .sort((left, right) => {
    const sourceDifference = (right.sources?.length || 0) - (left.sources?.length || 0);
    const faqDifference = (right.faqs?.length || 0) - (left.faqs?.length || 0);
    return sourceDifference * 3000 + faqDifference * 1000 + contentCharacters(right) - contentCharacters(left);
  });

for (const [cluster, quota] of quotas) {
  for (const article of candidates.filter((candidate) => categoryClusters.get(candidate.category) === cluster)) {
    if (selected.filter((entry) => entry.cluster === cluster).length >= quota) break;
    if (usedSlugs.has(article.slug)) continue;
    const family = familyFor(article.slug);
    if (usedFamilies.has(family)) continue;
    if (selected.some((entry) => similarity(entry.title, article.title) >= 0.94)) continue;
    const primaryKeyword = primaryKeywordFor(article, usedKeywords);
    if (!primaryKeyword) continue;
    usedSlugs.add(article.slug);
    usedFamilies.add(family);
    usedKeywords.add(normalize(primaryKeyword));
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
      minimumCharacters: 15_000,
      editorialBatch: 'chatbo-expansion-500',
      status: 'approved',
    });
  }
}

if (selected.length !== 500) {
  const counts = Object.fromEntries([...quotas.keys()].map((cluster) => [cluster, selected.filter((entry) => entry.cluster === cluster).length]));
  throw new Error(`Não foi possível fechar 500 pautas distintas: ${JSON.stringify(counts)}`);
}

await mkdir(path.dirname(outputFile), { recursive: true });
await writeFile(outputFile, `${JSON.stringify(selected, null, 2)}\n`, 'utf8');
console.log(`Plano congelado com ${selected.length} novos artigos em ${path.relative(projectRoot, outputFile)}.`);
console.log(Object.fromEntries([...quotas.keys()].map((cluster) => [cluster, selected.filter((entry) => entry.cluster === cluster).length])));
