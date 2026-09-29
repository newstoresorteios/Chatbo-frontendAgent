import { access, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const projectRoot = path.resolve(import.meta.dirname, '..');
const defaultSource = path.resolve(projectRoot, '..', '..', '..', 'Tironi Tech', 'tironitech');
const sourceRoot = path.resolve(process.argv[2] || process.env.TIRONI_TECH_SITE_PATH || defaultSource);
const sourceModule = path.join(sourceRoot, 'src', 'content', 'blogArticles.js');
const outputFile = path.join(projectRoot, 'src', 'content', 'blogArticles.generated.json');
const keywordMapFile = path.join(projectRoot, 'content', 'keyword-map.json');

const pagePlan = [
  { slug: 'chatbot-com-ia-no-whatsapp-guia-completo', primaryKeyword: 'chatbot para WhatsApp', variations: ['chatbot WhatsApp com IA', 'chatbot com inteligência artificial', 'chatbot inteligente para WhatsApp'], cluster: 'WhatsApp + IA', intent: 'commercial', funnel: 'BOFU', pageType: 'pillar', targetUrl: '/solucoes/chatbot-whatsapp' },
  { slug: 'ia-para-whatsapp-guia-completo', primaryKeyword: 'IA para WhatsApp', variations: ['inteligência artificial para WhatsApp', 'IA no WhatsApp'], cluster: 'WhatsApp + IA', intent: 'informational', funnel: 'TOFU', pageType: 'pillar', targetUrl: '/solucoes/ia-para-whatsapp' },
  { slug: 'atendimento-automatizado-com-ia', primaryKeyword: 'atendimento com IA', variations: ['IA para atendimento ao cliente', 'automação de atendimento'], cluster: 'Atendimento com IA', intent: 'commercial', funnel: 'MOFU', pageType: 'pillar', targetUrl: '/solucoes/atendimento-com-ia' },
  { slug: 'chatbot-para-empresas-como-funciona-beneficios', primaryKeyword: 'chatbot para empresas', variations: ['chatbot empresarial', 'chatbot vale a pena'], cluster: 'Chatbot + IA', intent: 'commercial', funnel: 'MOFU', pageType: 'pillar', targetUrl: '/solucoes/chatbot-para-empresas' },
  { slug: 'ia-para-vendas-no-whatsapp', primaryKeyword: 'chatbot para vendas', variations: ['IA para vendas no WhatsApp', 'chatbot de vendas'], cluster: 'Vendas com IA', intent: 'commercial', funnel: 'BOFU', pageType: 'pillar', targetUrl: '/solucoes/chatbot-para-vendas' },
  { slug: 'agente-de-ia-para-vendas', primaryKeyword: 'agente de IA para vendas', variations: ['agentes de vendas com IA', 'IA comercial para vendas'], cluster: 'Agentes de IA', intent: 'commercial', funnel: 'BOFU', pageType: 'pillar', targetUrl: '/solucoes/agente-ia-para-vendas' },
  { slug: 'agente-de-ia-para-atendimento', primaryKeyword: 'agente de IA para atendimento', variations: ['agente virtual com IA', 'agente de atendimento IA'], cluster: 'Agentes de IA', intent: 'commercial', funnel: 'BOFU', pageType: 'pillar', targetUrl: '/solucoes/agente-ia-para-atendimento' },
  { slug: 'atendimento-omnichannel-com-ia', primaryKeyword: 'atendimento omnichannel com IA', variations: ['chatbot omnichannel', 'plataforma omnichannel com IA'], cluster: 'Omnichannel', intent: 'commercial', funnel: 'MOFU', pageType: 'pillar', targetUrl: '/solucoes/atendimento-omnichannel' },
  { slug: 'ia-whatsapp-lojas-e-commerce', primaryKeyword: 'chatbot para ecommerce', variations: ['IA para ecommerce', 'chatbot integrado ao ecommerce'], cluster: 'Ecommerce', intent: 'commercial', funnel: 'BOFU', pageType: 'pillar', targetUrl: '/solucoes/chatbot-ecommerce' },
  { slug: 'automacao-de-whatsapp-com-ia', primaryKeyword: 'automação WhatsApp com IA', variations: ['automatizar WhatsApp com IA', 'software para automatizar WhatsApp'], cluster: 'Automação comercial', intent: 'commercial', funnel: 'BOFU', pageType: 'pillar', targetUrl: '/solucoes/automacao-whatsapp' },
  { slug: 'automacao-de-vendas-whatsapp-guia-pratico', primaryKeyword: 'automação de vendas com IA', variations: ['automação comercial com IA', 'automatizar vendas no WhatsApp'], cluster: 'Automação comercial', intent: 'commercial', funnel: 'BOFU', pageType: 'pillar', targetUrl: '/solucoes/automacao-vendas-ia' },
  { slug: 'agente-ia-personalizado-empresa', primaryKeyword: 'agente de IA para empresas', variations: ['agente de IA personalizado', 'inteligência artificial para empresas'], cluster: 'IA para empresas', intent: 'commercial', funnel: 'BOFU', pageType: 'pillar', targetUrl: '/solucoes/agente-ia-para-empresas' },
  { slug: 'automatizar-atendimento-cliente-jornada', primaryKeyword: 'automação de atendimento', variations: ['automatizar atendimento ao cliente', 'atendimento automatizado'], cluster: 'Atendimento com IA', intent: 'commercial', funnel: 'MOFU', pageType: 'pillar', targetUrl: '/solucoes/automacao-atendimento' },
  { slug: 'chatbot-com-ia-para-suporte-tecnico', primaryKeyword: 'IA para suporte ao cliente', variations: ['chatbot para suporte', 'IA para SAC'], cluster: 'Suporte/SAC', intent: 'commercial', funnel: 'BOFU', pageType: 'pillar', targetUrl: '/solucoes/suporte-com-ia' },
  { slug: 'como-vender-mais-whatsapp-fila-prioridade-atendimento', primaryKeyword: 'como aumentar vendas pelo WhatsApp', variations: ['como vender mais pelo WhatsApp', 'vendas conversacionais'], cluster: 'Vendas com IA', intent: 'informational', funnel: 'TOFU', pageType: 'guide', targetUrl: '/guias/como-aumentar-vendas-whatsapp' },
  { slug: 'ia-para-atendimento-ao-cliente-guia-pratico', primaryKeyword: 'como usar IA para atendimento ao cliente', variations: ['IA para responder clientes', 'como usar IA no atendimento'], cluster: 'Atendimento com IA', intent: 'informational', funnel: 'TOFU', pageType: 'guide', targetUrl: '/guias/como-usar-ia-atendimento' },
  { slug: 'ia-para-vendas-empresas', primaryKeyword: 'como usar IA para vendas', variations: ['IA para aumentar vendas', 'inteligência artificial em vendas'], cluster: 'Vendas com IA', intent: 'informational', funnel: 'TOFU', pageType: 'guide', targetUrl: '/guias/como-usar-ia-vendas' },
  { slug: 'chatbot-ia-whatsapp-como-escolher', primaryKeyword: 'como implementar chatbot na empresa', variations: ['como implementar chatbot no WhatsApp', 'implantação de chatbot'], cluster: 'Chatbot + IA', intent: 'informational', funnel: 'MOFU', pageType: 'guide', targetUrl: '/guias/como-implementar-chatbot' },
  { slug: 'agente-de-ia-ou-chatbot-diferencas', primaryKeyword: 'chatbot vs agente de IA', variations: ['chatbot tradicional vs chatbot com IA', 'diferença entre chatbot e agente de IA'], cluster: 'Comparativos', intent: 'commercial', funnel: 'MOFU', pageType: 'comparison', targetUrl: '/comparar/chatbot-vs-agente-de-ia' },
  { slug: 'quanto-custa-chatbot-com-ia-whatsapp', primaryKeyword: 'quanto custa chatbot com IA', variations: ['chatbot WhatsApp preço', 'preço de chatbot para WhatsApp'], cluster: 'Preço/contratação', intent: 'transactional', funnel: 'BOFU', pageType: 'article', targetUrl: '/blog/quanto-custa-chatbot-com-ia-whatsapp' },
  { slug: 'melhor-chatbot-para-whatsapp-como-escolher', primaryKeyword: 'melhor chatbot para WhatsApp', variations: ['como escolher chatbot para WhatsApp', 'plataforma de chatbot WhatsApp'], cluster: 'Preço/contratação', intent: 'commercial', funnel: 'BOFU', pageType: 'comparison', targetUrl: '/comparar/melhor-chatbot-para-whatsapp' },
  { slug: 'ia-whatsapp-estoque-e-preco', primaryKeyword: 'chatbot que consulta estoque', variations: ['chatbot que consulta preços', 'IA para estoque e preço no WhatsApp'], cluster: 'Ecommerce', intent: 'commercial', funnel: 'BOFU', pageType: 'integration', targetUrl: '/integracoes/chatbot-estoque-preco' },
  { slug: 'chatbot-integrado-ao-crm', primaryKeyword: 'chatbot integrado ao CRM', variations: ['WhatsApp integrado ao CRM', 'chatbot com CRM'], cluster: 'Integrações', intent: 'commercial', funnel: 'BOFU', pageType: 'integration', targetUrl: '/integracoes/chatbot-crm' },
  { slug: 'qualificacao-de-leads-no-whatsapp', primaryKeyword: 'IA para qualificar leads', variations: ['qualificação de leads com IA', 'chatbot para captação de leads'], cluster: 'Leads', intent: 'commercial', funnel: 'MOFU', pageType: 'article', targetUrl: '/blog/ia-para-qualificar-leads' },
  { slug: 'como-atender-whatsapp-fora-horario-retomada-equipe', primaryKeyword: 'atendimento 24 horas com IA', variations: ['WhatsApp fora do horário', 'atendimento automático 24 horas'], cluster: 'Atendimento com IA', intent: 'informational', funnel: 'MOFU', pageType: 'article', targetUrl: '/blog/atendimento-24-horas-com-ia' },
];
const selectedSlugs = new Set(pagePlan.map((page) => page.slug));

const commonEntities = ['ChatBô', 'inteligência artificial', 'atendimento digital', 'WhatsApp', 'automação', 'empresas brasileiras'];

function questionsFor(keyword) {
  return [
    `O que é ${keyword}?`,
    `Como funciona ${keyword}?`,
    `Quais são os benefícios de ${keyword}?`,
    `Quais são as limitações de ${keyword}?`,
    `Quando vale a pena usar ${keyword}?`,
    `Quanto custa implementar ${keyword}?`,
    `Como implementar ${keyword}?`,
    `${keyword} pode transferir para um atendente humano?`,
    `${keyword} pode consultar sistemas da empresa?`,
    `Como medir o resultado de ${keyword}?`,
  ];
}

function quickAnswer(intro, sections = []) {
  const source = [intro, ...sections.slice(0, 2).flatMap((section) => section.paragraphs || [])].join(' ');
  const sentences = source.match(/[^.!?]+[.!?]+/g) || [source];
  const selected = [];
  let words = 0;
  for (const sentence of sentences) {
    const count = sentence.trim().split(/\s+/).length;
    if (words >= 40 && words + count > 80) break;
    selected.push(sentence.trim());
    words += count;
    if (words >= 55) break;
  }
  return selected.join(' ');
}

function sentenceCase(value) {
  return value.charAt(0).toLocaleUpperCase('pt-BR') + value.slice(1);
}

function seoTitle(plan) {
  const suffix = plan.pageType === 'comparison' ? ': comparação | ChatBô'
    : plan.pageType === 'integration' ? ': integração | ChatBô'
      : plan.pageType === 'guide' ? ' | Guia ChatBô'
        : plan.pageType === 'pillar' ? ': guia completo | ChatBô'
          : ': guia prático | ChatBô';
  return `${sentenceCase(plan.primaryKeyword)}${suffix}`;
}

function seoDescription(article, plan) {
  if (article.description.length >= 120 && article.description.length <= 160) return article.description;
  return `Entenda ${plan.primaryKeyword}: como funciona, benefícios, limitações, implementação e critérios para escolher uma solução adequada à sua empresa.`;
}

function adaptCopy(value) {
  if (typeof value === 'string') {
    return value
      .replaceAll('https://www.chatbo.com.br/', '/cadastro')
      .replaceAll('https://chatbo.com.br/', '/cadastro')
      .replaceAll('/#contato', '/cadastro')
      .replaceAll('O ChatBô, produto da Tironi Tech,', 'O ChatBô')
      .replaceAll('O ChatBô pode avaliar o uso do ChatBô', 'O ChatBô pode apoiar')
      .replaceAll('Converse com a Tironi Tech', 'Converse com o time do ChatBô')
      .replaceAll('A Tironi Tech pode', 'O ChatBô pode')
      .replaceAll('A Tironi Tech desenvolve', 'O ChatBô oferece')
      .replaceAll('A Tironi Tech', 'O time do ChatBô')
      .replaceAll('O ChatBô pode avaliar o uso do ChatBô', 'O ChatBô pode apoiar')
      .replaceAll('Leve à Tironi Tech', 'Leve ao time do ChatBô')
      .replaceAll('pela Tironi Tech', 'pelo ChatBô');
  }
  if (Array.isArray(value)) return value.map(adaptCopy);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, adaptCopy(nested)]));
  }
  return value;
}

await access(sourceModule);
const { blogArticles } = await import(`${pathToFileURL(sourceModule).href}?sync=${Date.now()}`);
const selected = blogArticles
  .filter((article) => selectedSlugs.has(article.slug))
  .map((article) => {
    const plan = pagePlan.find((entry) => entry.slug === article.slug);
    const relatedArticles = pagePlan
      .filter((entry) => entry.slug !== article.slug && entry.cluster === plan.cluster)
      .slice(0, 5)
      .map((entry) => entry.targetUrl);
    const relatedSolutions = plan.targetUrl.startsWith('/solucoes/')
      ? [plan.targetUrl]
      : pagePlan.filter((entry) => entry.cluster === plan.cluster && entry.pageType === 'pillar').slice(0, 2).map((entry) => entry.targetUrl);
    const adapted = adaptCopy({
      ...article,
      primaryKeyword: plan.primaryKeyword,
      seoTitle: seoTitle(plan),
      seoDescription: seoDescription(article, plan),
      secondaryKeywords: [...new Set([...(plan.variations || []), ...(article.keywords || [])])].slice(0, 20),
      searchIntent: plan.intent,
      funnelStage: plan.funnel,
      cluster: plan.cluster,
      pageType: plan.pageType,
      targetUrl: plan.targetUrl,
      author: 'ChatBô by Tironi Tech',
      featuredImage: '/branding/chatbo-logo-oficial.png',
      entities: [...new Set([...commonEntities, ...(plan.variations || [])])],
      questions: questionsFor(plan.primaryKeyword),
      quickAnswer: quickAnswer(article.intro, article.sections),
      relatedArticles,
      relatedSolutions,
    });
    return { ...adapted, canonical: `https://www.chatbo.com.br${plan.targetUrl}` };
  })
  .sort((left, right) => right.updated.localeCompare(left.updated) || left.title.localeCompare(right.title));

const missing = [...selectedSlugs].filter((slug) => !selected.some((article) => article.slug === slug));
if (missing.length) throw new Error(`Artigos não encontrados na origem: ${missing.join(', ')}`);

await mkdir(path.dirname(outputFile), { recursive: true });
await writeFile(outputFile, `${JSON.stringify(selected, null, 2)}\n`, 'utf8');
const keywordMap = pagePlan.map((plan) => ({
  keyword: plan.primaryKeyword,
  variations: plan.variations,
  cluster: plan.cluster,
  intent: plan.intent,
  funnel: plan.funnel,
  pageType: plan.pageType,
  targetUrl: plan.targetUrl,
  primaryKeyword: plan.primaryKeyword,
  secondaryKeywords: selected.find((article) => article.slug === plan.slug).secondaryKeywords,
  entities: selected.find((article) => article.slug === plan.slug).entities,
  questions: questionsFor(plan.primaryKeyword),
  status: 'published',
}));
await mkdir(path.dirname(keywordMapFile), { recursive: true });
await writeFile(keywordMapFile, `${JSON.stringify(keywordMap, null, 2)}\n`, 'utf8');
console.log(`Sincronizados ${selected.length} conteúdos e ${keywordMap.length} registros do mapa editorial.`);
