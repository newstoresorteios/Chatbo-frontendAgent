import { BlogCard } from '@/components/blog/BlogCard';
import { LandingFooter, LandingNavbar } from '@/components/landing/LandingLayout';
import { SeoHead } from '@/components/seo/SeoHead';
import { formatArticleDate, getBlogArticle, getBlogArticleByUrl, relatedBlogArticles } from '@/content/blog';
import { ArrowLeft, ArrowRight, Check, Clock3, ExternalLink, Quote, Sparkles } from 'lucide-react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';

function headingId(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function BlogArticlePage() {
  const { slug } = useParams();
  const location = useLocation();
  const normalizedPath = location.pathname.length > 1 ? location.pathname.replace(/\/$/, '') : location.pathname;
  const article = getBlogArticleByUrl(normalizedPath) ?? getBlogArticle(slug);
  if (!article) return <Navigate to="/blog" replace />;

  const articleUrl = article.canonical;
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    dateModified: article.updated,
    inLanguage: 'pt-BR',
    mainEntityOfPage: articleUrl,
    url: articleUrl,
    keywords: article.keywords.join(', '),
    author: { '@type': 'Organization', name: 'ChatBô by Tironi Tech', url: 'https://www.chatbo.com.br' },
    publisher: { '@type': 'Organization', name: 'ChatBô by Tironi Tech', url: 'https://www.chatbo.com.br', logo: { '@type': 'ImageObject', url: 'https://www.chatbo.com.br/branding/chatbo-logo-oficial.png' } },
    about: article.keywords.map((keyword) => ({ '@type': 'Thing', name: keyword })),
    citation: article.sources.map((source) => source.url),
  };
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://www.chatbo.com.br/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.chatbo.com.br/blog' },
      { '@type': 'ListItem', position: 3, name: article.title, item: articleUrl },
    ],
  };
  const faqSchema = article.faqs?.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: article.faqs.map((faq) => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })),
  } : null;
  const schemas = faqSchema ? [articleSchema, breadcrumbSchema, faqSchema] : [articleSchema, breadcrumbSchema];
  const related = relatedBlogArticles(article);
  const relatedSolutions = article.relatedSolutions.map(getBlogArticleByUrl).filter((item) => item !== undefined);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SeoHead title={article.seoTitle} description={article.seoDescription} path={article.targetUrl} type="article" publishedTime={article.date} modifiedTime={article.updated} jsonLd={schemas} />
      <LandingNavbar />
      <main>
        <header className="relative overflow-hidden border-b border-white/10 pt-28 pb-14 sm:pt-36 sm:pb-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_0%,rgba(34,211,238,.16),transparent_36%),radial-gradient(circle_at_85%_35%,rgba(139,92,246,.14),transparent_30%)]" />
          <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
            <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-100"><ArrowLeft className="h-4 w-4" />Voltar ao blog</Link>
            <div className="mt-8 flex flex-wrap items-center gap-3 text-sm"><span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 font-semibold text-cyan-200">{article.category}</span><span className="inline-flex items-center gap-1.5 text-slate-400"><Clock3 className="h-4 w-4" />{article.readTime}</span></div>
            <h1 className="mt-6 font-display text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-6xl">{article.title}</h1>
            <p className="mt-6 text-xl leading-8 text-slate-300">{article.description}</p>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 pt-6 text-sm text-slate-400"><span>Por ChatBô by Tironi Tech</span><time dateTime={article.date}>Publicado em {formatArticleDate(article.date)}</time><time dateTime={article.updated}>Atualizado em {formatArticleDate(article.updated)}</time></div>
          </div>
        </header>

        <article className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
          <p className="text-xl leading-9 text-slate-200">{article.intro}</p>

          <aside className="my-12 rounded-3xl border border-cyan-300/20 bg-cyan-300/8 p-6 sm:p-8" aria-labelledby="resumo-artigo">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-cyan-300"><Sparkles className="h-4 w-4" />Resposta rápida</div>
            <h2 id="resumo-artigo" className="mt-3 text-2xl font-bold">O que você precisa levar deste guia</h2>
            <p className="mt-5 text-lg leading-8 text-slate-200">{article.quickAnswer}</p>
            <ul className="mt-6 space-y-3">{article.takeaways.map((takeaway) => <li key={takeaway} className="flex gap-3 leading-7 text-slate-200"><Check className="mt-1 h-5 w-5 shrink-0 text-cyan-300" />{takeaway}</li>)}</ul>
          </aside>

          {article.sections.length > 3 && <nav className="mb-12 rounded-3xl border border-white/10 bg-white/[0.03] p-6" aria-label="Índice do artigo"><h2 className="text-lg font-bold">Neste artigo</h2><ol className="mt-4 grid gap-2 sm:grid-cols-2">{article.sections.map((section, index) => <li key={section.heading}><a href={`#${headingId(section.heading)}`} className="text-sm leading-6 text-slate-300 hover:text-cyan-200"><span className="mr-2 text-cyan-400">{String(index + 1).padStart(2, '0')}</span>{section.heading}</a></li>)}</ol></nav>}

          {!!relatedSolutions.length && <aside className="mb-12 flex flex-col gap-4 rounded-2xl border border-violet-300/20 bg-violet-300/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-violet-300">Página pilar relacionada</p><p className="mt-1 font-semibold text-white">Aprofunde o tema e conheça a aplicação no ChatBô.</p></div><div className="flex flex-wrap gap-2">{relatedSolutions.map((solution) => <Link key={solution.targetUrl} to={solution.targetUrl} className="rounded-full border border-violet-200/20 px-4 py-2 text-sm font-semibold text-violet-100 hover:bg-violet-200/10">{solution.primaryKeyword}</Link>)}</div></aside>}

          <div className="space-y-12">
            {article.sections.map((section) => (
              <section key={section.heading} id={headingId(section.heading)} className="scroll-mt-24">
                <h2 className="font-display text-3xl font-bold leading-tight text-white">{section.heading}</h2>
                <div className="mt-5 space-y-5">{section.paragraphs.map((paragraph) => <p key={paragraph.slice(0, 80)} className="text-lg leading-8 text-slate-300">{paragraph}</p>)}</div>
                {!!section.bullets?.length && <ul className="mt-6 grid gap-3 sm:grid-cols-2">{section.bullets.map((bullet) => <li key={bullet} className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 leading-7 text-slate-200"><Check className="mt-1 h-5 w-5 shrink-0 text-emerald-300" />{bullet}</li>)}</ul>}
              </section>
            ))}
          </div>

          {!!article.faqs?.length && <section className="mt-16 border-t border-white/10 pt-12"><h2 className="font-display text-3xl font-bold">Perguntas frequentes</h2><div className="mt-6 space-y-4">{article.faqs.map((faq) => <details key={faq.question} className="group rounded-2xl border border-white/10 bg-white/5 p-5"><summary className="cursor-pointer list-none pr-6 font-semibold text-white">{faq.question}</summary><p className="mt-4 leading-7 text-slate-300">{faq.answer}</p></details>)}</div></section>}

          <section className="mt-16 rounded-3xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600 p-[1px]"><div className="rounded-[calc(1.5rem-1px)] bg-slate-950 p-7 sm:p-10"><Quote className="h-8 w-8 text-cyan-300" /><h2 className="mt-5 text-3xl font-bold">{article.cta.title}</h2><p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">{article.cta.text}</p><Link to={article.cta.href.startsWith('/') ? article.cta.href : '/cadastro'} className="mt-7 inline-flex items-center gap-2 rounded-full bg-cyan-300 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-200">{article.cta.label}<ArrowRight className="h-4 w-4" /></Link></div></section>

          <section className="mt-14 border-t border-white/10 pt-10"><h2 className="text-xl font-bold">Fontes e referências</h2><p className="mt-2 text-sm leading-6 text-slate-400">Referências consultadas na elaboração do conteúdo. Links externos abrem a fonte original.</p><ul className="mt-5 space-y-3">{article.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-start gap-2 text-sm leading-6 text-cyan-300 hover:text-cyan-100"><ExternalLink className="mt-1 h-4 w-4 shrink-0" />{source.label}</a></li>)}</ul></section>
        </article>

        <section className="border-t border-white/10 bg-slate-900/35 py-16"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><p className="text-sm font-bold uppercase tracking-[0.16em] text-cyan-300">Continue aprendendo</p><h2 className="mt-3 text-3xl font-bold">Artigos relacionados</h2><div className="mt-8 grid gap-6 md:grid-cols-3">{related.map((item) => <BlogCard key={item.slug} article={item} />)}</div></div></section>
      </main>
      <LandingFooter />
    </div>
  );
}
