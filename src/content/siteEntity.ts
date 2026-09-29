export const siteEntity = {
  name: 'ChatBô',
  legalBrand: 'ChatBô by Tironi Tech',
  url: 'https://www.chatbo.com.br',
  logo: 'https://www.chatbo.com.br/branding/chatbo-logo-oficial.png',
  description: 'ChatBô é uma plataforma brasileira de atendimento e vendas com inteligência artificial para organizar conversas, qualificação, suporte e operações comerciais em diferentes canais.',
} as const;

export const siteStructuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteEntity.legalBrand,
    url: siteEntity.url,
    logo: siteEntity.logo,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteEntity.name,
    url: siteEntity.url,
    inLanguage: 'pt-BR',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: siteEntity.name,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: siteEntity.url,
    description: siteEntity.description,
  },
];
