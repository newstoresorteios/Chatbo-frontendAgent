import { LandingFooter, LandingNavbar } from '@/components/landing/LandingLayout';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

const pages = {
  privacidade: {
    title: 'Política de Privacidade',
    content: [
      'A Tironi Tech, responsável pelo ChatBô, trata seus dados pessoais em conformidade com a LGPD (Lei nº 13.709/2018).',
      'Coletamos informações de cadastro, uso da plataforma e comunicações para prestar o serviço, melhorar a experiência e cumprir obrigações legais.',
      'Seus dados não são vendidos a terceiros. Compartilhamos informações apenas com provedores essenciais (hospedagem, mensageria, IA) sob contratos de proteção.',
      'Você pode solicitar acesso, correção ou exclusão dos seus dados pelo e-mail privacidade@tironitech.com.br.',
    ],
  },
  termos: {
    title: 'Termos de Uso',
    content: [
      'Ao utilizar o ChatBô, você concorda com estes termos e com nossa política de privacidade.',
      'O serviço é oferecido em modelo SaaS, sujeito ao plano contratado. O uso indevido, incluindo spam ou violação de leis, pode resultar em suspensão da conta.',
      'A Tironitech não se responsabiliza por indisponibilidade causada por integrações de terceiros ou força maior.',
      'Alterações nestes termos serão comunicadas por e-mail ou aviso na plataforma com antecedência mínima de 15 dias.',
    ],
  },
  suporte: {
    title: 'Central de Suporte',
    content: [
      'Nossa equipe está disponível de segunda a sexta, das 8h às 18h (horário de Brasília).',
      'E-mail: suporte@tironitech.com.br',
      'WhatsApp comercial: (11) 3000-0000',
      'Para incidentes críticos em planos Enterprise, utilize o canal prioritário indicado no seu contrato.',
      'Consulte tambem a documentacao em docs.nitrus.ai e nossa base de conhecimento.',
    ],
  },
} as const;

type LegalSlug = keyof typeof pages;

export function LegalPage() {
  const { slug } = useParams<{ slug: string }>();
  const page = pages[slug as LegalSlug];

  if (!page) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 text-white">
        <p>Página não encontrada.</p>
        <Link to="/" className="mt-4 text-blue-400 hover:underline">Voltar ao inicio</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <LandingNavbar />
      <main className="mx-auto max-w-3xl px-4 pb-20 pt-28 sm:px-6">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Voltar ao site
        </Link>
        <h1 className="text-3xl font-bold text-white">{page.title}</h1>
        <div className="mt-8 space-y-4 text-gray-300">
          {page.content.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>
        <div className="mt-10">
          <Button onClick={() => window.location.href = 'mailto:suporte@tironitech.com.br'}>
            Falar com suporte
          </Button>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
