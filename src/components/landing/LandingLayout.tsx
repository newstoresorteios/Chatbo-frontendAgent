import { Logo } from '@/components/layout/Logo';
import { Button } from '@/components/ui/Button';
import { CHATBO_WHATSAPP_URL } from '@/constants/contact';
import { cn } from '@/utils';
import { Menu, MessageCircle, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const navLinks = [
  { href: '#recursos', label: 'IA comercial' },
  { href: '#canais', label: 'Canais' },
  { href: '#segmentos', label: 'Receita' },
  { href: '#como-funciona', label: 'Como funciona' },
  { href: '/blog', label: 'Blog' },
  { href: '#faq', label: 'FAQ' },
];

export function LandingNavbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const scrollTo = (href: string) => {
    setOpen(false);
    if (href.startsWith('/')) {
      navigate(href);
      return;
    }
    if (location.pathname !== '/') {
      navigate(`/${href}`);
      return;
    }
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-cyan-100/15 bg-[#06111f]/95 shadow-[0_8px_30px_rgba(2,6,23,.28)] backdrop-blur-xl">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="shrink-0">
          <Logo size="md" showCompany />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className="text-sm font-semibold text-slate-200 transition-colors hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" className="text-slate-100 hover:bg-white/10 hover:text-white focus-visible:ring-cyan-300" onClick={() => navigate('/login')}>
            Entrar
          </Button>
          <a href={CHATBO_WHATSAPP_URL} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
            <MessageCircle className="h-4 w-4" /> Falar no WhatsApp
          </a>
        </div>

        <button className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-gray-950 px-4 py-4 md:hidden">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className="block w-full py-2.5 text-left text-base font-semibold text-slate-100 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              {link.label}
            </button>
          ))}
          <div className="mt-4 flex flex-col gap-2">
            <Button variant="outline" onClick={() => navigate('/login')}>Entrar</Button>
            <Button onClick={() => navigate('/login')}>Teste grátis</Button>
            <a href={CHATBO_WHATSAPP_URL} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-emerald-950"><MessageCircle className="h-4 w-4" />Falar no WhatsApp</a>
          </div>
        </div>
      )}
    </header>
  );
}

interface SectionProps {
  id?: string;
  className?: string;
  children: React.ReactNode;
}

export function LandingSection({ id, className, children }: SectionProps) {
  return (
    <section id={id} className={cn('py-20 sm:py-28', className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t border-white/10 bg-gray-950 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <Logo size="sm" showCompany />
          <p className="text-sm text-slate-300">© 2026 Tironi Tech · ChatBô. Todos os direitos reservados.</p>
          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-slate-300">
            <Link to="/blog" className="hover:text-white">Blog</Link>
            <Link to="/politica-privacidade" className="hover:text-white">Privacidade</Link>
            <Link to="/legal/termos" className="hover:text-white">Termos</Link>
            <Link to="/legal/suporte" className="hover:text-white">Suporte</Link>
            <a href={CHATBO_WHATSAPP_URL} target="_blank" rel="noreferrer" className="text-emerald-300 hover:text-emerald-200">WhatsApp</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
