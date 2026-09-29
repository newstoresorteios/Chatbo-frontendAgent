import { BlogCard } from '@/components/blog/BlogCard';
import { LandingFooter, LandingNavbar } from '@/components/landing/LandingLayout';
import { SeoHead } from '@/components/seo/SeoHead';
import { blogArticles, blogCategories } from '@/content/blog';
import { BookOpenText, Search, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export function BlogIndexPage() {
  const [category, setCategory] = useState('Todos');
  const [query, setQuery] = useState('');
  const [visibleLimit, setVisibleLimit] = useState(24);
  const articles = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR');
    return blogArticles.filter((article) => {
      const matchesCategory = category === 'Todos' || article.cluster === category;
      const haystack = [article.title, article.description, ...article.keywords].join(' ').toLocaleLowerCase('pt-BR');
      return matchesCategory && (!normalizedQuery || haystack.includes(normalizedQuery));
    });
  }, [category, query]);
  useEffect(() => setVisibleLimit(24), [category, query]);
  const visibleArticles = articles.slice(0, visibleLimit);
  const pillarArticles = blogArticles.filter((article) => article.pageType === 'pillar').slice(0, 6);

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Blog ChatBô — IA comercial, chatbot e WhatsApp',
    description: 'Guias práticos sobre chatbot com IA, atendimento, WhatsApp, vendas e automação comercial.',
    url: 'https://www.chatbo.com.br/blog',
    isPartOf: { '@type': 'WebSite', name: 'ChatBô', url: 'https://www.chatbo.com.br' },
    mainEntity: blogArticles.slice(0, 12).map((article) => ({
      '@type': 'BlogPosting',
      headline: article.title,
      url: `https://www.chatbo.com.br${article.targetUrl}`,
      dateModified: article.updated,
    })),
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SeoHead
        title="Blog ChatBô | Chatbot com IA, WhatsApp e vendas"
        description="Guias práticos e aprofundados sobre chatbot com IA, atendimento no WhatsApp, automação comercial, CRM, vendas e experiência do cliente."
        path="/blog"
        jsonLd={collectionSchema}
      />
      <LandingNavbar />
      <main>
        <section className="relative overflow-hidden border-b border-white/10 pt-32 pb-16 sm:pt-40 sm:pb-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,.18),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(139,92,246,.16),transparent_30%)]" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-200"><Sparkles className="h-4 w-4" />Central de conhecimento</div>
            <h1 className="mt-6 max-w-4xl font-display text-4xl font-black leading-tight sm:text-6xl">Conteúdo para transformar conversas em <span className="landing-gradient-text">receita</span></h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">Respostas diretas, guias de implementação e critérios de decisão sobre chatbot, IA para WhatsApp e operação comercial.</p>
            <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-slate-400"><span className="inline-flex items-center gap-2"><BookOpenText className="h-4 w-4 text-cyan-300" />{blogArticles.length} artigos especializados</span><span>Fontes verificáveis</span><span>Atualização editorial identificada</span></div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-14 rounded-3xl border border-cyan-300/15 bg-gradient-to-br from-cyan-300/[0.08] to-violet-400/[0.06] p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">Páginas pilares</p>
            <h2 className="mt-3 text-2xl font-bold">Comece pelos guias centrais</h2>
            <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">{pillarArticles.map((article) => <a key={article.targetUrl} href={article.targetUrl} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm font-semibold leading-6 text-slate-100 transition hover:border-cyan-300/40 hover:text-cyan-200">{article.primaryKeyword}</a>)}</div>
          </div>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2" aria-label="Filtrar artigos por cluster">
              {blogCategories.map((item) => (
                <button key={item} type="button" onClick={() => setCategory(item)} className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${category === item ? 'border-cyan-300 bg-cyan-300 text-slate-950' : 'border-white/10 bg-white/5 text-slate-300 hover:border-cyan-300/40 hover:text-white'}`}>{item}</button>
              ))}
            </div>
            <label className="relative block min-w-72">
              <span className="sr-only">Buscar no blog</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Busque por tema ou dúvida" className="w-full rounded-full border border-white/10 bg-slate-900 py-3 pr-4 pl-11 text-sm text-white placeholder:text-slate-500" />
            </label>
          </div>

          <p className="mt-8 text-sm text-slate-400" aria-live="polite">{articles.length} {articles.length === 1 ? 'artigo encontrado' : 'artigos encontrados'}</p>
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visibleArticles.map((article) => <BlogCard key={article.slug} article={article} />)}
          </div>
          {visibleLimit < articles.length && <div className="mt-10 text-center"><button type="button" onClick={() => setVisibleLimit((current) => current + 24)} className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-6 py-3 font-semibold text-cyan-100 transition hover:bg-cyan-300/20">Carregar mais artigos</button></div>}
          {!articles.length && <div className="mt-12 rounded-3xl border border-dashed border-white/15 p-12 text-center text-slate-300">Nenhum artigo corresponde a esses filtros. Tente uma busca mais ampla.</div>}
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
