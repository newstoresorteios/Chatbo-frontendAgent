import type { BlogArticle } from '@/content/blog';
import { formatArticleDate } from '@/content/blog';
import { ArrowUpRight, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function BlogCard({ article }: { article: BlogArticle }) {
  return (
    <article className="group flex h-full flex-col rounded-3xl border border-white/10 bg-slate-900/70 p-6 transition hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-slate-900">
      <div className="flex items-center justify-between gap-4 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">
        <span>{article.cluster}</span>
        <span className="inline-flex shrink-0 items-center gap-1 text-slate-400"><Clock3 className="h-3.5 w-3.5" />{article.readTime}</span>
      </div>
      <h2 className="mt-5 font-display text-2xl font-bold leading-tight text-white">
        <Link to={article.targetUrl} className="transition group-hover:text-cyan-200">{article.title}</Link>
      </h2>
      <p className="mt-4 flex-1 text-sm leading-7 text-slate-300">{article.description}</p>
      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5 text-sm">
        <time dateTime={article.updated} className="text-slate-400">Atualizado em {formatArticleDate(article.updated)}</time>
        <Link to={article.targetUrl} aria-label={`Ler ${article.title}`} className="rounded-full bg-white/5 p-2 text-cyan-300 transition group-hover:bg-cyan-300 group-hover:text-slate-950">
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
