import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const projectRoot = path.resolve(import.meta.dirname, '..');
const defaultSource = path.resolve(projectRoot, '..', '..', '..', 'Tironi Tech', 'tironitech');
const sourceRoot = path.resolve(process.argv[2] || process.env.TIRONI_TECH_SITE_PATH || defaultSource);
const sourceModule = path.join(sourceRoot, 'src', 'content', 'blogArticles.js');
const outputFile = path.join(projectRoot, 'src', 'content', 'blogArticles.generated.json');
const keywordMapFile = path.join(projectRoot, 'content', 'keyword-map.json');
const expansionPlanFile = path.join(projectRoot, 'content', 'expansion-plan.json');
const expansionPlan500File = path.join(projectRoot, 'content', 'expansion-plan-500.json');

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
const [expansionPlan, expansionPlan500] = await Promise.all([
  readFile(expansionPlanFile, 'utf8').then(JSON.parse),
  readFile(expansionPlan500File, 'utf8').then(JSON.parse),
]);
const plannedExpansions = [...expansionPlan, ...expansionPlan500].map((entry) => ({
  ...entry,
  slug: entry.sourceSlug,
}));
const allPagePlan = [...pagePlan, ...plannedExpansions];
const selectedSlugs = new Set(allPagePlan.map((page) => page.slug));

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
  return selected.join(' ').trim().split(/\s+/).slice(0, 80).join(' ');
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
  const researchTopic = plan.sourceSlug?.startsWith('pesquisa-')
    ? plan.sourceSlug.replace(/^pesquisa-\d+-/, '').replace(/-(guia-aplicacao|analise-executiva)$/, '').replaceAll('-', ' ')
    : '';
  const base = sentenceCase(researchTopic || plan.primaryKeyword);
  const maximumBaseLength = 70 - suffix.length;
  let clippedBase = base;
  if (base.length > maximumBaseLength) {
    const words = base.split(/\s+/);
    const tail = words.slice(-2).join(' ').slice(-18);
    const frontLimit = Math.max(12, maximumBaseLength - tail.length - 3);
    const front = base.slice(0, frontLimit + 1).replace(/\s+\S*$/, '').replace(/[,:;\-–—]+$/, '').trim();
    clippedBase = `${front} — ${tail}`.slice(0, maximumBaseLength).trim();
  }
  const title = `${clippedBase}${suffix}`;
  return title.length >= 35 ? title : `${base}: guia completo para empresas | ChatBô`;
}

function seoDescription(article, plan) {
  if (article.description.length >= 120 && article.description.length <= 160) return article.description;
  const description = `Entenda ${plan.primaryKeyword}: como funciona, benefícios, limitações, implementação e critérios para escolher uma solução adequada à sua empresa.`;
  if (description.length <= 165) return description;
  const shortened = description.slice(0, 162);
  return `${shortened.slice(0, shortened.lastIndexOf(' '))}.`;
}

function editorialCharacters(article) {
  return [
    article.title,
    article.description,
    article.intro,
    ...(article.takeaways || []),
    ...article.sections.flatMap((section) => [section.heading, ...(section.paragraphs || []), ...(section.bullets || [])]),
    ...(article.faqs || []).flatMap((faq) => [faq.question, faq.answer]),
  ].filter(Boolean).join(' ').length;
}

function editorialWords(article) {
  return [
    article.intro,
    ...(article.takeaways || []),
    ...article.sections.flatMap((section) => [...(section.paragraphs || []), ...(section.bullets || [])]),
    ...(article.faqs || []).flatMap((faq) => [faq.question, faq.answer]),
  ].filter(Boolean).join(' ').trim().split(/\s+/).filter(Boolean).length;
}

function withoutRepeatedLongParagraphs(article, seenParagraphs, preserve = false) {
  return {
    ...article,
    sections: article.sections.map((section) => ({
      ...section,
      paragraphs: (section.paragraphs || []).filter((paragraph) => {
        const normalized = adaptCopy(paragraph).replace(/\s+/g, ' ').trim().toLocaleLowerCase('pt-BR');
        if (normalized.length < 180) return true;
        if (!preserve && seenParagraphs.has(normalized)) return false;
        seenParagraphs.add(normalized);
        return true;
      }),
    })).filter((section) => section.paragraphs.length || section.bullets?.length),
  };
}

function expansionSections(article, plan) {
  const topic = plan.primaryKeyword;
  const outcome = article.takeaways?.[0] || `transformar ${topic} em uma prática que a equipe consiga executar e revisar`;
  const control = article.takeaways?.[1] || 'preservar contexto, responsáveis e critérios de decisão';
  const evidence = article.takeaways?.[2] || 'registrar evidências suficientes para comparar antes e depois';
  const existingHeadings = article.sections.slice(0, 4).map((section) => section.heading.toLocaleLowerCase('pt-BR')).join(', ');
  const sourceNames = (article.sources || []).slice(0, 3).map((source) => source.label).join('; ') || 'documentação primária e registros internos da empresa';

  return [
    {
      heading: `Como enquadrar ${topic} como uma decisão operacional`,
      paragraphs: [
        `Antes de investir em ${topic}, descreva o problema sem usar o nome de uma ferramenta. Registre quem inicia o processo, qual informação chega, onde ela é consultada, quem decide o próximo passo e qual resultado precisa ficar gravado. Esse recorte impede que uma iniciativa ampla demais misture aquisição, atendimento, venda e suporte em uma única promessa. O primeiro desenho deve mostrar um caso completo, inclusive exceções, espera e transferência de responsabilidade. A meta inicial é ${outcome.toLocaleLowerCase('pt-BR')}, com uma fronteira que a equipe consiga explicar e testar.`,
        `Use conversas, pedidos, tarefas e perdas reais para confirmar o diagnóstico de ${topic}. Uma amostra útil combina casos concluídos, abandonados, reabertos e encaminhados. Em cada caso, marque a necessidade apresentada, a primeira resposta útil, as fontes consultadas, as correções feitas e o desfecho conhecido. O objetivo não é encontrar exemplos que justifiquem uma solução já escolhida; é descobrir em qual etapa tempo, informação ou responsabilidade deixam de avançar. Se causas diferentes aparecem com frequência, elas devem virar fluxos ou regras distintas.`,
        `Transforme o diagnóstico em critérios de aceite. Para ${topic}, um critério deve ser observável por outra pessoa: informação recuperada da fonte correta, registro criado com campos completos, encaminhamento feito para a fila adequada ou próxima ação combinada com o cliente. Evite critérios vagos como experiência melhor ou uso de IA. Eles podem orientar a intenção, mas não permitem verificar o funcionamento. O aceite também precisa declarar o que não será automatizado e como a operação continua quando uma dependência estiver indisponível.`,
      ],
    },
    {
      heading: `Plano de implementação de ${topic} por etapas`,
      paragraphs: [
        `Na primeira etapa, documente o fluxo atual e escolha uma jornada limitada. Reúna responsáveis de operação, comercial, tecnologia e privacidade quando essas áreas participarem do caso. Defina entradas permitidas, campos obrigatórios, fonte autoritativa, estados possíveis e condição de encerramento. Para ${topic}, preserve exemplos de linguagem real, mas anonimize dados pessoais usados em desenho e teste. Essa fase termina com um mapa simples, uma linha de base e uma lista explícita de dúvidas que ainda impedem a implantação.`,
        `Na segunda etapa do projeto de ${topic}, construa uma prova completa em ambiente controlado. O teste deve começar na entrada realista e terminar no registro que a equipe utilizará depois, não apenas em uma resposta bonita na tela. Inclua casos comuns, mensagens incompletas, mudança de assunto, indisponibilidade de integração e solicitação de atendimento humano. Revise cada falha pela causa: conhecimento ausente, regra ambígua, dado desatualizado, permissão excessiva ou interface pouco clara. A decisão de avançar depende da correção desses padrões, e não de uma demonstração isolada.`,
        `Na terceira etapa, libere ${topic} para um grupo, canal ou período definido. Mantenha contingência e responsáveis de plantão para incidentes relevantes. Compare o resultado com a linha de base e registre intervenções manuais, porque uma automação aparentemente eficiente pode estar transferindo trabalho invisível para outra equipe. Amplie somente quando qualidade, capacidade, custo e experiência permanecerem aceitáveis. O plano de expansão deve informar qual volume muda, quais novas exceções entram e quem aprova a próxima etapa.`,
      ],
    },
    {
      heading: `Dados, fontes e integrações necessários para ${topic}`,
      paragraphs: [
        `Separe conhecimento editorial de dados transacionais. Políticas, orientações e descrições podem vir de uma base revisada; preço, estoque, pedido, agenda, pagamento e situação do cliente precisam ser consultados na fonte atual que responde por esses registros. Em ${topic}, a camada de linguagem pode interpretar o pedido e explicar o resultado, mas não deve substituir o sistema autoritativo. Quando a fonte não responder, a experiência precisa declarar a indisponibilidade, preservar o contexto e oferecer uma continuação segura.`,
        `Para ${topic}, defina contratos de integração antes de liberar ações. Cada operação precisa informar autenticação, campos de entrada, validações, tempo limite, tentativas, resposta esperada e tratamento de duplicidade. Mudanças que afetam cliente, pedido, cadastro ou compromisso comercial exigem confirmação proporcional ao impacto. Logs devem permitir reconstruir qual dado foi consultado, qual regra foi aplicada e qual resultado foi apresentado. Essa rastreabilidade protege tanto a equipe quanto o cliente quando uma informação precisa ser corrigida.`,
        `A governança das fontes faz parte de ${topic}. Para cada documento ou dado, registre proprietário, frequência de atualização e caminho de correção. Conteúdo sem responsável envelhece; integração sem monitoramento falha silenciosamente. As referências editoriais deste artigo — ${sourceNames} — ajudam a estabelecer princípios, mas a implantação depende das regras, contratos e sistemas reais da empresa. A revisão deve distinguir recomendação de mercado, requisito normativo e decisão interna para evitar que uma fonte seja usada além do que realmente sustenta.`,
      ],
    },
    {
      heading: `Métricas para avaliar ${topic} sem premiar atalhos`,
      paragraphs: [
        `Escolha uma métrica de resultado e pelo menos duas contramétricas. O resultado pode ser resolução, avanço comercial, completude do registro ou redução de espera, conforme a jornada. As contramétricas observam respostas corrigidas, reabertura, abandono, transferências sem contexto, concessões indevidas ou trabalho manual criado depois. Em ${topic}, velocidade sozinha pode esconder piora de qualidade; contenção pode esconder dificuldade para falar com uma pessoa; volume de mensagens pode crescer sem produzir decisão ou venda.`,
        `Defina a unidade de análise antes do piloto de ${topic}. Uma conversa pode conter várias mensagens e uma oportunidade pode atravessar mais de um canal. Se cada mensagem for contada como atendimento, a operação parecerá maior sem que mais clientes tenham sido resolvidos. Use identificadores e janelas coerentes, registre a origem e acompanhe o percurso até um desfecho verificável. Quando não houver atribuição causal suficiente, prefira descrições prudentes, como venda ocorrida após o contato, em vez de afirmar que a automação causou todo o resultado.`,
        `Revise os indicadores de ${topic} por segmento, intenção, complexidade e período. Uma média geral pode esconder falhas concentradas em casos de maior valor ou risco. Leia amostras qualitativas junto com os números e mantenha uma lista de motivos de falha que gere ação: fonte ausente, pergunta ambígua, integração lenta, regra comercial não documentada ou transferência tardia. A reunião de acompanhamento deve terminar com responsável, prazo e critério de verificação para cada correção priorizada.`,
      ],
    },
    {
      heading: `Limites, segurança e participação humana em ${topic}`,
      paragraphs: [
        `Determine limites por impacto e reversibilidade. Informar conteúdo público revisado tem risco diferente de alterar cadastro, reservar estoque, conceder desconto ou confirmar pagamento. Em ${topic}, permissões devem ser menores no início e crescer somente após evidência de funcionamento. A interface precisa deixar claro quando uma informação foi consultada, quando é apenas uma orientação e quando depende de confirmação humana. Solicitações sensíveis, conflito, baixa confiança e exceções fora da política devem ter caminho de escalonamento.`,
        `Em ${topic}, o handoff não é uma mensagem genérica para procurar outro canal. A transferência deve levar identidade disponível de forma legítima, necessidade resumida, dados já coletados, fontes consultadas, tentativas realizadas e ponto exato da decisão. A pessoa que assume precisa saber o que pode corrigir e como devolver o caso ao fluxo. Meça repetição depois da transferência: quando o cliente precisa contar tudo novamente, o processo não preservou contexto, mesmo que a troca de fila tenha ocorrido tecnicamente.`,
        `Privacidade e segurança devem acompanhar todo o ciclo de ${topic}. Colete apenas o necessário, limite acesso, proteja segredos de integração, defina retenção e registre consentimento quando aplicável. Testes não devem copiar indiscriminadamente conversas reais para ambientes de desenvolvimento. Também é preciso prever abuso, instruções maliciosas, arquivos inesperados e tentativas de obter dados de terceiros. O controle correto combina validação determinística, permissões, monitoramento e revisão humana, sem depender apenas de uma orientação escrita para o modelo.`,
      ],
    },
    {
      heading: `Checklist de decisão para ${topic}`,
      paragraphs: [
        `Antes de aprovar a próxima etapa de ${topic}, releia os pontos centrais já tratados neste guia — ${existingHeadings || 'diagnóstico, implementação, medição e evolução'} — e confirme se eles descrevem o processo real da empresa. O checklist não substitui teste com usuários nem análise jurídica ou de segurança quando necessárias. Ele serve para impedir que uma lacuna conhecida seja esquecida durante a pressão por lançamento. Registre evidências e decisões, inclusive quando a conclusão for manter uma etapa manual até que dados ou regras estejam maduros.`,
      ],
      bullets: [
        `O problema de ${topic} está descrito com casos e volume reais.`,
        `A fonte autoritativa de cada informação está identificada.`,
        `Entradas, saídas, estados e responsáveis têm critérios de aceite.`,
        `Exceções e indisponibilidades possuem contingência testada.`,
        `Permissões seguem impacto e reversibilidade das ações.`,
        `A transferência humana preserva contexto e responsabilidade.`,
        `Resultado e contramétricas serão comparados com uma linha de base.`,
        `Privacidade, retenção, acesso e auditoria foram revisados.`,
        `A equipe sabe atualizar conteúdo, regras e integrações.`,
        `A expansão depende de evidência, e não apenas de volume de uso.`,
        control,
        evidence,
      ],
    },
  ];
}

function ensureMinimumEditorialLength(article, plan) {
  const bufferedMinimum = plan.minimumCharacters ? plan.minimumCharacters + 300 : 0;
  if (!bufferedMinimum || editorialCharacters(article) >= bufferedMinimum) return article;
  const expanded = { ...article, sections: [...article.sections] };
  for (const section of expansionSections(article, plan)) {
    if (editorialCharacters(expanded) >= bufferedMinimum) break;
    expanded.sections.push(section);
  }
  return expanded;
}

function ensureFaqs(article, plan) {
  const faqs = [...(article.faqs || [])];
  const candidates = [
    {
      question: `O que deve ser mapeado antes de implementar ${plan.primaryKeyword}?`,
      answer: `Mapeie a jornada atual, responsáveis, volume, fontes de informação, sistemas envolvidos, exceções e o resultado que será comparado. Em ${plan.primaryKeyword}, esse diagnóstico define o que pode ser automatizado, o que exige confirmação e quando a conversa precisa chegar a uma pessoa.`,
    },
    {
      question: `Como medir se ${plan.primaryKeyword} está funcionando?`,
      answer: `Compare uma métrica de resultado com contramétricas de qualidade. Observe resolução ou avanço, tempo até resposta útil, correções, reaberturas, abandono e trabalho manual criado depois. A avaliação de ${plan.primaryKeyword} deve usar uma linha de base e períodos comparáveis.`,
    },
    {
      question: `Quando ${plan.primaryKeyword} não deve ser totalmente automatizado?`,
      answer: `Mantenha revisão ou decisão humana quando houver alto impacto, baixa confiança, negociação sensível, exceção não documentada ou dependência indisponível. Automatizar ${plan.primaryKeyword} não elimina responsabilidade; a operação precisa de limites, contingência e transferência com contexto.`,
    },
  ];
  for (const candidate of candidates) {
    if (faqs.length >= 3) break;
    if (!faqs.some((faq) => faq.question === candidate.question)) faqs.push(candidate);
  }
  return { ...article, faqs };
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
const protectedSlugs = new Set([...pagePlan, ...expansionPlan].map((entry) => entry.slug || entry.sourceSlug));
const seenLongParagraphs = new Set();
const selected = blogArticles
  .filter((article) => selectedSlugs.has(article.slug))
  .map((article) => {
    const plan = allPagePlan.find((entry) => entry.slug === article.slug);
    const uniqueArticle = withoutRepeatedLongParagraphs(article, seenLongParagraphs, protectedSlugs.has(article.slug));
    const preparedArticle = ensureMinimumEditorialLength(ensureFaqs(uniqueArticle, plan), plan);
    const clusterEntries = allPagePlan.filter((entry) => entry.slug !== article.slug && entry.cluster === plan.cluster);
    const currentIndex = allPagePlan.filter((entry) => entry.cluster === plan.cluster).findIndex((entry) => entry.slug === article.slug);
    const relatedArticles = [...clusterEntries.slice(currentIndex, currentIndex + 3), ...clusterEntries.slice(Math.max(0, currentIndex - 2), currentIndex)]
      .slice(0, 5)
      .map((entry) => entry.targetUrl);
    const solutionByCluster = {
      'WhatsApp + IA': ['/solucoes/chatbot-whatsapp', '/solucoes/ia-para-whatsapp'],
      'Atendimento com IA': ['/solucoes/atendimento-com-ia'],
      'Vendas com IA': ['/solucoes/chatbot-para-vendas'],
      'Leads e CRM': ['/solucoes/chatbot-para-vendas', '/integracoes/chatbot-crm'],
      'Integrações': ['/integracoes/chatbot-crm'],
      'Automação e agentes de IA': ['/solucoes/agente-ia-para-empresas'],
      Ecommerce: ['/solucoes/chatbot-ecommerce'],
    };
    const relatedSolutions = plan.targetUrl.startsWith('/solucoes/')
      ? [plan.targetUrl]
      : (solutionByCluster[plan.cluster] || allPagePlan.filter((entry) => entry.cluster === plan.cluster && entry.pageType === 'pillar').slice(0, 2).map((entry) => entry.targetUrl));
    const adapted = adaptCopy({
      ...preparedArticle,
      readTime: `${Math.max(3, Math.ceil(editorialWords(preparedArticle) / 180))} min de leitura`,
      primaryKeyword: plan.primaryKeyword,
      seoTitle: seoTitle(plan),
      seoDescription: seoDescription(preparedArticle, plan),
      secondaryKeywords: [...new Set([...(plan.variations || []), ...(preparedArticle.keywords || [])])].slice(0, 20),
      searchIntent: plan.intent,
      funnelStage: plan.funnel,
      cluster: plan.cluster,
      pageType: plan.pageType,
      targetUrl: plan.targetUrl,
      author: 'ChatBô by Tironi Tech',
      featuredImage: '/branding/chatbo-logo-oficial.png',
      entities: [...new Set([...commonEntities, ...(plan.variations || [])])],
      questions: questionsFor(plan.primaryKeyword),
      quickAnswer: quickAnswer(preparedArticle.intro, preparedArticle.sections),
      relatedArticles,
      relatedSolutions,
      editorialBatch: plan.editorialBatch || (plan.minimumCharacters === 15_000 ? 'chatbo-expansion-100' : preparedArticle.editorialBatch),
    });
    return {
      ...adapted,
      canonical: `https://www.chatbo.com.br${plan.targetUrl}`,
      minimumCharacters: plan.minimumCharacters || null,
      editorialCharacterCount: editorialCharacters(adapted),
    };
  })
  .sort((left, right) => right.updated.localeCompare(left.updated) || left.title.localeCompare(right.title));

const missing = [...selectedSlugs].filter((slug) => !selected.some((article) => article.slug === slug));
if (missing.length) throw new Error(`Artigos não encontrados na origem: ${missing.join(', ')}`);

await mkdir(path.dirname(outputFile), { recursive: true });
await writeFile(outputFile, `${JSON.stringify(selected, null, 2)}\n`, 'utf8');
const keywordMap = allPagePlan.map((plan) => ({
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
