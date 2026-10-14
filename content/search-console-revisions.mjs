// Revisões editoriais mantidas também durante a sincronização do conteúdo.
export function applySearchConsoleRevisions(articles) {
  const answers = {
    'atendimento-24-horas-com-ia': 'Atendimento com IA fora do expediente deve informar os limites da operação, registrar a necessidade do cliente e preparar a retomada pela equipe. Uma resposta imediata não significa resolução: o assistente precisa consultar informações confiáveis, evitar promessas de prazo sem confirmação e encaminhar exceções com contexto. Meça separadamente respostas, solicitações resolvidas e pendências assumidas por uma pessoa.',
    'como-automatizar-aprovacao-descontos-regras-alcadas': 'A aprovação automática de descontos começa por regras explícitas de margem, valor e responsabilidade. O fluxo recebe uma proposta identificada, verifica os limites permitidos e encaminha exceções ao aprovador correto. Registre a versão da proposta e a decisão antes de comunicar o preço ao cliente. Teste solicitações duplicadas, mudanças de valor e ausência do responsável para evitar concessões indevidas.',
    'pesquisa-241': 'IA generativa pode apoiar rascunhos, variações de campanhas e análise de materiais de marketing. A equipe precisa conferir fatos, adequação à marca e direitos de uso antes de publicar. Comece por uma tarefa delimitada, compare tempo de produção e qualidade com o processo anterior e acompanhe conversões reais. Mais conteúdo publicado, sozinho, não demonstra melhora do resultado comercial.',
    'pesquisa-363': 'Para uma pequena empresa, adotar IA exige escolher um problema concreto, como organizar solicitações ou preparar respostas para revisão. Antes de contratar, confira os dados necessários, o custo total e a capacidade de manter a operação. Um piloto deve comparar resultados com a rotina anterior, registrar erros e preservar atendimento humano. A adoção por outras empresas não comprova retorno no seu negócio.',
    'pesquisa-110': 'Um agente de IA para execução de vendas pode apoiar tarefas como organizar informações da oportunidade, preparar mensagens e registrar próximos passos. A autonomia deve respeitar regras comerciais e permissões do CRM. Teste primeiro um fluxo completo, com revisão humana para propostas e compromissos. Avalie registros corretos, avanço das oportunidades e retrabalho, distinguindo apoio à equipe de vendas comprovadamente atribuídas à automação.',
    'pesquisa-493': 'A decisão entre desenvolver e contratar software com IA depende da adequação ao processo, das integrações e do custo de manter a solução. Compare implantação, consumo, suporte, portabilidade dos dados e responsabilidade por falhas. Teste o mesmo cenário em cada alternativa antes de decidir. Uma solução própria não garante vantagem, e uma assinatura não elimina custos de integração e operação.',
    'pesquisa-096-ai-sales-agent-guia-aplicacao': 'Um agente de IA para vendas é um sistema que interpreta solicitações e executa tarefas comerciais dentro de regras e permissões definidas. Pode apoiar qualificação, consulta de informações e atualização de oportunidades no CRM, conforme as integrações disponíveis. Comece com um fluxo limitado, revise compromissos com clientes e meça qualidade dos registros, encaminhamentos e resultado antes de ampliar a autonomia.',
  };
  for (const article of articles) {
    const key = Object.keys(answers).find(key => article.slug === key || article.targetUrl === `/blog/${key}` || (key.startsWith('pesquisa-') && key.length === 12 && article.slug.startsWith(`${key}-`) && article.slug.endsWith(['pesquisa-110', 'pesquisa-493'].includes(key) ? '-guia-aplicacao' : '-analise-executiva')));
    if (!key) continue;
    article.quickAnswer = answers[key];
    article.updated = '2026-10-14';
    if (key === 'pesquisa-096-ai-sales-agent-guia-aplicacao') {
      article.title = 'Agente de IA para vendas: funcionamento e implantação';
      article.seoTitle = 'Agente de IA para vendas: como implementar | ChatBô';
      article.description = 'Entenda o funcionamento de um agente de IA para vendas, as integrações com CRM e os critérios para testar um fluxo comercial antes de ampliar a autonomia.';
      article.seoDescription = article.description;
      article.faqs[0].answer = answers[key];
      if (!article.sections.some(section => section.heading === 'Exemplo de qualificação com revisão humana')) article.sections.push({
        heading: 'Exemplo de qualificação com revisão humana',
        paragraphs: ['Em um cenário ilustrativo, um cliente pede uma solução de atendimento pelo WhatsApp. O agente identifica o objetivo, pergunta quais canais e sistemas a equipe utiliza e registra as respostas em uma oportunidade, se houver integração autorizada com o CRM. Informações ausentes permanecem pendentes: o agente não inventa orçamento, volume ou prazo de implantação.', 'Antes de enviar uma proposta, o vendedor revisa os requisitos e confirma os compromissos comerciais. Para avaliar o piloto, conte oportunidades com campos corretos, encaminhamentos aceitos pelo responsável e mensagens que exigiram correção. Compare esses resultados com uma amostra do atendimento anterior. Esse exemplo descreve um fluxo possível, não uma garantia de funcionalidades ou aumento de vendas.'],
      });
      const repeated = 'Como aplicar as ideias de “AI Sales Agent” em uma empresa';
      for (const section of article.sections) {
        section.heading = section.heading.replaceAll(repeated, 'um agente de IA para vendas').replace('Como enquadrar um agente de IA para vendas como uma decisão operacional', 'Qual tarefa comercial automatizar primeiro');
        section.paragraphs = section.paragraphs.map(paragraph => paragraph.replaceAll(repeated, 'um agente de IA para vendas'));
      }
    }
    // Recontagem independente de qualquer limite editorial.
    article.editorialCharacterCount = [article.title, article.description, article.intro, ...article.takeaways, ...article.sections.flatMap(section => [section.heading, ...section.paragraphs, ...(section.bullets || [])]), ...(article.faqs || []).flatMap(faq => [faq.question, faq.answer])].join(' ').length;
  }
  return articles;
}
