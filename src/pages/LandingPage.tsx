import { LandingFooter, LandingNavbar, LandingSection } from '@/components/landing/LandingLayout';
import { LandingChatDemo } from '@/components/landing/LandingChatDemo';
import { AuroraBackground } from '@/components/landing/AuroraBackground';
import { Marquee } from '@/components/landing/Marquee';
import { ScrollProgress } from '@/components/landing/ScrollProgress';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  ChevronDown,
  Clock,
  GitBranch,
  Headphones,
  Instagram,
  Mail,
  MessageCircle,
  Mic,
  Radio,
  Send,
  Shield,
  Sparkles,
  Star,
  Users,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

const channels = [
  { icon: MessageCircle, name: 'WhatsApp', color: 'text-green-400' },
  { icon: Instagram, name: 'Instagram', color: 'text-pink-400' },
  { icon: MessageCircle, name: 'Facebook', color: 'text-blue-400' },
  { icon: Send, name: 'Telegram', color: 'text-sky-400' },
  { icon: Headphones, name: 'WebChat', color: 'text-red-300' },
  { icon: Mail, name: 'E-mail', color: 'text-gray-400' },
];

const features = [
  {
    icon: Bot,
    title: 'Agente Automático',
    desc: 'Qualifique leads 24/7, responda rápido e entregue oportunidades prontas para o time comercial.',
    tag: '24/7',
  },
  {
    icon: Sparkles,
    title: 'Assistente ChatBô',
    desc: 'Gere respostas, contorne objeções e acelere follow-ups usando dados reais de clientes e pedidos.',
    tag: 'Sales IA',
  },
  {
    icon: GitBranch,
    title: 'Funil de Vendas',
    desc: 'Pipeline visual para acompanhar leads, propostas e recuperação de oportunidades.',
    tag: 'Sales CRM',
  },
  {
    icon: BarChart3,
    title: 'Pulso de Receita',
    desc: 'Métricas de conversão, tempo de resposta e pedidos em um cockpit comercial em tempo real.',
    tag: 'Revenue',
  },
];

const segments = [
  'Varejo', 'E-commerce', 'Saúde', 'Educação', 'Jurídico',
  'Financeiro', 'Imobiliário', 'Tecnologia', 'Indústria', 'Turismo',
];

const steps = [
  {
    step: '01',
    icon: MessageCircle,
    title: 'Capture conversas',
    desc: 'WhatsApp, Instagram, WebChat e e-mail em minutos — um cockpit único para não perder leads.',
    color: 'text-green-400',
    glow: 'group-hover:shadow-green-900/30',
  },
  {
    step: '02',
    icon: Sparkles,
    title: 'Qualifique com IA + time',
    desc: 'A automação faz triagem, o Assistente ChatBô sugere respostas e humanos fecham a negociação.',
    color: 'text-red-400',
    glow: 'group-hover:shadow-red-900/30',
  },
  {
    step: '03',
    icon: BarChart3,
    title: 'Converta e recupere',
    desc: 'Funil de vendas, campanhas e dashboards para acelerar receita e recuperar oportunidades.',
    color: 'text-blue-400',
    glow: 'group-hover:shadow-blue-900/30',
  },
];

const benefits = [
  { icon: Headphones, title: 'Operação assistida', desc: 'Time humano com IA no fluxo' },
  { icon: Shield, title: 'Confiança LGPD', desc: 'Governança para dados comerciais' },
  { icon: Zap, title: 'Setup rápido', desc: 'Implantação guiada sem atrito' },
  { icon: Users, title: 'Time treinado', desc: 'Onboarding para acelerar vendas' },
];

const faqs = [
  {
    q: 'O que é o ChatBô?',
    a: 'O ChatBô é uma plataforma comercial com IA para transformar conversas em vendas, centralizando canais, leads, funil e respostas inteligentes.',
  },
  {
    q: 'Funciona com WhatsApp API Oficial?',
    a: 'Sim. Múltiplos atendentes em um número, automação, campanhas e governança — sem depender de celular.',
  },
  {
    q: 'O ChatBô ajuda a recuperar oportunidades?',
    a: 'Sim. A plataforma organiza leads, histórico, campanhas e próximos passos para reduzir perda de oportunidades.',
  },
  {
    q: 'Tem teste grátis?',
    a: '5 dias gratuitos com treinamento e suporte inclusos. Sem cartão de crédito.',
  },
];

const stats = [
  { value: '7+', label: 'Canais integrados' },
  { value: '68%', label: 'Resolução assistida por IA' },
  { value: '1m 48s', label: 'Tempo médio de resposta' },
  { value: '4.6/5', label: 'Experiência média' },
];

const statCounters: Record<
  string,
  {
    value: number;
    suffix?: string;
    decimals?: number;
    duration?: number;
    format?: 'number' | 'time';
  }
> = {
  '7+': { value: 7, suffix: '+', duration: 1300 },
  '68%': { value: 68, suffix: '%', duration: 1500 },
  '1m 48s': { value: 108, format: 'time', duration: 1700 },
  '4.6/5': { value: 4.6, suffix: '/5', decimals: 1, duration: 1600 },
};

const statIcons = {
  '7+': Radio,
  '68%': Bot,
  '1m 48s': Clock,
  '4.6/5': Star,
};

export function LandingPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => document.documentElement.classList.remove('dark');
  }, []);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <ScrollProgress />
      <LandingNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-32">
        <AuroraBackground />

        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm font-semibold text-blue-200"
          >
            <Sparkles className="h-4 w-4" /> IA comercial para receita
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto max-w-4xl font-display text-4xl font-bold leading-tight tracking-tight text-slate-50 sm:text-5xl lg:text-[3.4rem]"
          >
            Transforme conversas em vendas com a IA comercial do <span className="landing-gradient-text">ChatBô</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-300"
          >
            Centralize canais, qualifique leads, gere respostas inteligentes e acompanhe oportunidades em um cockpit feito para acelerar receita.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button size="lg" className="min-w-[200px]" onClick={() => navigate('/login')}>
              Começar teste grátis <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="min-w-[200px] border-slate-400/50 text-white hover:border-cyan-300/70 hover:bg-cyan-400/10 focus-visible:ring-cyan-300"
              onClick={() => navigate('/login')}
            >
              Entrar na plataforma
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4 text-sm text-slate-400"
          >
            5 dias grátis · Treinamento incluso · Sem cartão
          </motion.p>

          <LandingChatDemo />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="mt-12"
          >
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Feito para operações comerciais em movimento
            </p>
            <Marquee duration={28}>
              {segments.map((seg) => (
                <span
                  key={seg}
                  className="mx-2 shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2 text-sm font-medium text-slate-400 transition-colors hover:border-blue-500/30 hover:text-white"
                >
                  {seg}
                </span>
              ))}
            </Marquee>
          </motion.div>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="mt-8 flex justify-center"
          >
            <ChevronDown className="h-6 w-6 text-slate-400" />
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <LandingSection className="relative overflow-hidden border-y border-white/5 bg-gray-900/50 py-14">
        <div className="pointer-events-none absolute inset-0 dashboard-grid-bg opacity-20" />
        <div className="relative grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {stats.map(({ value, label }) => {
            const counter = statCounters[value];
            const Icon = statIcons[value as keyof typeof statIcons] ?? Sparkles;

            return (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glow-border glass-card rounded-2xl border border-white/5 p-5 text-center transition-transform duration-300 hover:-translate-y-1 sm:p-6"
              >
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="font-display text-3xl font-bold text-white tabular-nums sm:text-4xl">
                  {counter ? (
                    <AnimatedCounter
                      value={counter.value}
                      suffix={counter.suffix}
                      decimals={counter.decimals}
                      duration={counter.duration}
                      format={counter.format}
                    />
                  ) : (
                    value
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-400">{label}</p>
              </motion.div>
            );
          })}
        </div>
      </LandingSection>

      {/* Canais */}
      <LandingSection id="canais">
        <div className="text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Leads de todos os canais em uma so tela
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            Conversas, histórico e oportunidades conectadas para vender com mais velocidade.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {channels.map(({ icon: Icon, name, color }) => (
            <div
              key={name}
              className="group flex cursor-default flex-col items-center rounded-2xl border border-white/5 bg-gray-900/50 p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-blue-500/40 hover:bg-gray-900 hover:shadow-xl hover:shadow-blue-900/25"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] transition-all duration-300 ease-out group-hover:-translate-y-3 group-hover:bg-white/[0.08] group-hover:shadow-lg group-hover:shadow-black/20">
                <Icon
                  className={`h-8 w-8 ${color} transition-all duration-300 ease-out group-hover:-translate-y-0.5 group-hover:scale-110`}
                />
              </div>
                <span className="mt-4 text-sm font-medium text-slate-300 transition-colors duration-300 group-hover:text-white">
                {name}
              </span>
            </div>
          ))}
        </div>
      </LandingSection>

      {/* Recursos */}
      <LandingSection id="recursos" className="relative overflow-hidden bg-gray-900/30">
        <AuroraBackground withGrid={false} className="opacity-45" />
        <div className="relative text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Ferramentas para converter mais</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            Ecossistema comercial para qualificar, responder, vender e recuperar oportunidades.
          </p>
        </div>
        <div className="relative mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, desc, tag }) => (
            <div
              key={title}
              className="glow-border group rounded-2xl border border-white/5 bg-gray-900/50 p-6 transition-all hover:border-blue-500/20 hover:shadow-lg hover:shadow-blue-900/10"
            >
              <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-medium text-blue-300">
                {tag}
              </span>
              <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300 transition-colors group-hover:bg-blue-500/20">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{desc}</p>
            </div>
          ))}
        </div>

        <div className="relative mt-16 grid gap-6 lg:grid-cols-3">
          {[
            { icon: Mic, title: 'Transcrição de áudios', desc: 'Converta mensagens de voz em texto automaticamente' },
            { icon: Sparkles, title: 'Resposta comercial', desc: 'Gere mensagens prontas para avançar negociações' },
            { icon: Star, title: 'Recuperação de oportunidades', desc: 'Priorize leads parados e follow-ups importantes' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4 rounded-xl border border-white/5 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-300">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold">{title}</h4>
                <p className="mt-1 text-sm text-slate-300">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </LandingSection>

      {/* Segmentos */}
      <LandingSection id="segmentos">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Receita para cada operação comercial</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            Do pequeno negócio a operações maiores, com fluxos adaptáveis ao seu ciclo de vendas.
          </p>
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {segments.map((seg) => (
            <span
              key={seg}
              className="rounded-full border border-white/10 bg-gray-900/50 px-4 py-2 text-sm text-gray-300 transition-colors hover:border-blue-500/30 hover:text-white"
            >
              {seg}
            </span>
          ))}
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { title: 'Pequenas Empresas', desc: 'Centralize canais, responda rápido e transforme interesse em pedido.', cta: 'Começar agora' },
            { title: 'Médias Empresas', desc: 'Funil, campanhas e inteligência para escalar times comerciais.', cta: 'Escalar receita' },
            { title: 'Enterprise', desc: 'Governança, APIs e operação comercial conectada ponta a ponta.', cta: 'Falar com especialista' },
          ].map(({ title, desc, cta }) => (
            <div key={title} className="rounded-2xl border border-white/5 bg-gradient-to-b from-gray-900/80 to-gray-950 p-6">
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="mt-3 text-sm text-slate-300">{desc}</p>
              <Button variant="outline" className="mt-6 border-slate-400/50 text-slate-100 hover:border-cyan-300/70 hover:bg-cyan-400/10" onClick={() => navigate('/login')}>
                {cta}
              </Button>
            </div>
          ))}
        </div>
      </LandingSection>

      {/* Como funciona */}
      <LandingSection id="como-funciona" className="bg-gray-900/30">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10"
          >
            <Zap className="h-6 w-6 text-blue-300" />
          </motion.div>
          <h2 className="text-3xl font-bold sm:text-4xl">Como funciona o ChatBô</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            Do primeiro contato ao fechamento — três passos para acelerar sua receita.
          </p>
        </div>

        <div className="relative mt-14 grid gap-6 md:grid-cols-3">
          <div className="pointer-events-none absolute top-16 hidden h-0.5 w-full bg-gradient-to-r from-transparent via-blue-500/30 to-transparent md:block" />

          {steps.map(({ step, icon: Icon, title, desc, color, glow }, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className={`group relative rounded-2xl border border-white/5 bg-gray-900/60 p-8 transition-all duration-300 ease-out hover:-translate-y-2 hover:border-blue-500/30 hover:bg-gray-900 hover:shadow-xl ${glow}`}
            >
              <span className="text-xs font-bold tracking-widest text-blue-400/90">{step}</span>
              <div className="mt-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] transition-all duration-300 group-hover:-translate-y-2 group-hover:bg-white/[0.08]">
                <Icon className={`h-7 w-7 ${color} transition-transform duration-300 group-hover:scale-110`} />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">{desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button size="lg" onClick={() => navigate('/login')}>
            Começar em 3 passos <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </LandingSection>

      {/* Benefícios */}
      <LandingSection>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-300">
                <Icon className="h-7 w-7" />
              </div>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-slate-300">{desc}</p>
            </div>
          ))}
        </div>
      </LandingSection>

      {/* FAQ */}
      <LandingSection id="faq" className="bg-gray-900/30">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-bold sm:text-4xl">Perguntas frequentes</h2>
          <div className="mt-10 space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-xl border border-white/5 bg-gray-900/50 overflow-hidden">
                <button
                  className="flex w-full items-center justify-between px-5 py-4 text-left font-medium"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {faq.q}
                  <ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="border-t border-white/10 px-5 py-4 text-sm text-slate-300">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </LandingSection>

      {/* CTA Final */}
      <LandingSection>
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl gradient-hero p-10 text-center sm:p-16"
        >
          <motion.div
            className="absolute inset-0 opacity-55"
            style={{
              backgroundImage: 'linear-gradient(135deg, #0b1220 0%, #2563eb 45%, #ef4444 100%)',
              backgroundSize: '200% 200%',
            }}
            animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="pointer-events-none absolute inset-0 dashboard-grid-bg opacity-20" />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Pronto para transformar conversas em vendas?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-blue-100">
              Teste grátis por 5 dias. Treinamento e suporte inclusos.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" variant="secondary" className="min-w-[220px] bg-white text-blue-800 hover:bg-gray-100" onClick={() => navigate('/login')}>
                Começar teste grátis
              </Button>
              <Button size="lg" variant="outline" className="min-w-[220px] border-white/30 text-white hover:bg-white/10" onClick={() => navigate('/login')}>
                Entrar na plataforma
              </Button>
            </div>
            <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-blue-100">
              {['Sem cartão', 'Setup rápido', 'LGPD', 'Suporte humano'].map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </LandingSection>

      <LandingFooter />
    </div>
  );
}
