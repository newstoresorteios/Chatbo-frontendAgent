# Arquitetura de conteúdo e SEO do ChatBô

## Diagnóstico do projeto

O frontend é uma aplicação React 19 com TypeScript, Vite 6, React Router e Tailwind CSS. A aplicação reúne o site público e a plataforma autenticada. Antes deste trabalho, havia página inicial, planos e páginas legais, mas não existiam blog, repositório editorial, sitemap, `robots.txt`, canonical por rota, dados estruturados por página ou geração de HTML estático para conteúdo.

O projeto não usa CMS nem banco para conteúdo público. As rotas são declaradas em `src/routes/index.tsx`; o cabeçalho e o rodapé públicos são compartilhados em `src/components/landing/LandingLayout.tsx`. O `index.html` fornecia metadata genérica para toda a SPA e a Vercel redirecionava as rotas públicas ao mesmo documento.

As capacidades apresentadas no código atual incluem atendimento multicanal, WhatsApp, Instagram, Facebook, Telegram, WebChat e e-mail; assistência comercial com IA; qualificação; funil; campanhas; relatórios; integrações; transferência e trabalho humano. O conteúdo não deve prometer uma integração ou automação específica apenas porque ela é tecnicamente possível. Dados de produto, preço, disponibilidade e roadmap precisam continuar sendo validados antes de uma afirmação comercial.

## Problemas encontrados

- Ausência de uma biblioteca editorial própria do ChatBô.
- Uma única metadata genérica para todas as URLs.
- Renderização exclusivamente cliente para páginas públicas.
- Ausência de sitemap, feed editorial e arquivo `llms.txt`.
- Ausência de canonical, `BlogPosting`, `BreadcrumbList` e `FAQPage` por conteúdo.
- Risco de canibalização ao importar diretamente centenas de artigos semelhantes da Tironi Tech.
- Ausência de mapa formal entre keyword, intenção, funil, cluster e URL canônica.
- Ausência de busca, filtro, índice do artigo, fontes e atualização editorial no frontend.

## Estratégia adotada

O conteúdo da Tironi Tech é usado como origem editorial, não como dependência de produção. O comando `npm run content:sync` seleciona apenas conteúdos aderentes ao produto, adapta CTAs e autoria, enriquece o modelo editorial e grava um snapshot versionável no projeto. O runtime nunca chama IA nem lê o outro repositório.

Variações com a mesma intenção compartilham uma URL canônica. Por exemplo, “chatbot para WhatsApp”, “chatbot WhatsApp com IA” e “chatbot inteligente para WhatsApp” pertencem à mesma página pilar. O primeiro lote possui 25 páginas canônicas que cobrem as 30 pautas prioritárias sem criar 30 URLs artificialmente diferentes. O segundo lote acrescenta 100 artigos de cauda longa. O terceiro lote acrescenta outros 500 conteúdos e amplia a cobertura para governança, RAG, agentes, integrações e MCP, Voice AI, ROI, GEO/AEO, ecommerce e adoção empresarial. Os 600 artigos de expansão possuem intenção própria e pelo menos 15.000 caracteres editoriais, totalizando 625 conteúdos públicos.

As páginas são organizadas por função:

- `/solucoes/`: páginas pilares e comerciais;
- `/guias/`: implementação e educação;
- `/comparar/`: decisões e comparativos factuais;
- `/integracoes/`: conexão com sistemas e dados;
- `/blog/`: artigos específicos e hub pesquisável.

O build gera HTML independente por URL, preservando a aplicação React para navegação e interação. Também gera sitemap, RSS, `robots.txt` e `llms.txt`. Cada artigo recebe título, descrição, canonical, Open Graph, Twitter Card, `BlogPosting`, breadcrumb e FAQ quando a fonte possui perguntas. A página exibe resposta rápida, índice, atualização, autoria organizacional, fontes, CTA e artigos relacionados.

## Modelo de publicação

1. Atualizar o plano principal em `scripts/sync-blog-content.mjs` ou revisar os lotes congelados em `content/expansion-plan.json` e `content/expansion-plan-500.json`.
2. Para planejar um novo lote a partir da origem, executar `npm run content:plan` ou `npm run content:plan:500`; esses comandos nunca rodam durante o build.
3. Executar `npm run content:sync` com o repositório Tironi Tech disponível no caminho padrão ou em `TIRONI_TECH_SITE_PATH`.
4. Revisar o diff de `src/content/blogArticles.generated.json`, `content/keyword-map.json` e dos planos de expansão.
5. Validar fatos do produto, fontes, intenção, CTA, sobreposição, extensão e data editorial.
6. Executar `npm run lint`, `npm test` e `npm run build`.
7. Publicar somente o snapshot aprovado. A data `updated` muda apenas após revisão editorial real.

## Arquivos centrais

- `content/keyword-map.json`: mapa de keyword, variações, intenção, funil, cluster, entidades, perguntas e destino canônico.
- `content/expansion-plan.json`: seleção congelada das 100 pautas long-form e sua extensão mínima.
- `content/expansion-plan-500.json`: seleção congelada das 500 pautas adicionais, distribuídas em 15 clusters.
- `src/content/blogArticles.generated.json`: snapshot dos conteúdos aprovados.
- `src/content/blog.ts`: contrato tipado e relacionamentos editoriais.
- `src/pages/BlogIndexPage.tsx`: hub com busca e filtros sem URLs indexáveis de faceta.
- `src/pages/BlogArticlePage.tsx`: layout editorial reutilizável.
- `src/components/seo/SeoHead.tsx`: metadata e JSON-LD no cliente.
- `scripts/prerender-blog.mjs`: HTML estático, sitemap, feed, robots e `llms.txt`.
- `scripts/sync-blog-content.mjs`: seleção, consolidação semântica e importação editorial.
- `scripts/plan-blog-expansion.mjs`: planejador manualmente acionado para novos lotes; não participa do runtime nem do build.
- `scripts/plan-blog-expansion-500.mjs`: planejador do terceiro lote, com cotas por cluster e bloqueios de URL, keyword e família editorial.

## Próximas fases

O próximo lote deve preencher lacunas, não multiplicar sinônimos. Prioridades: páginas de integração verificadas, hubs por cluster, glossário com definições substanciais, páginas de segmento e infraestrutura para pesquisas próprias. Antes de ampliar o volume, medir indexação, consultas, cliques, páginas citadas e conversões por cluster.
