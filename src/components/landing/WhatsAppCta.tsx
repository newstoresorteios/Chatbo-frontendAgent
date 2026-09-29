import { CHATBO_WHATSAPP_LABEL, CHATBO_WHATSAPP_URL } from '@/constants/contact';
import { MessageCircle } from 'lucide-react';

export function WhatsAppCta() {
  return (
    <a
      href={CHATBO_WHATSAPP_URL}
      target="_blank"
      rel="noreferrer"
      aria-label={`Falar com o ChatBô pelo WhatsApp no número ${CHATBO_WHATSAPP_LABEL}`}
      className="group fixed bottom-5 left-4 z-50 inline-flex min-h-14 items-center gap-3 rounded-full border border-emerald-300/40 bg-emerald-500 px-4 py-3 font-bold text-emerald-950 shadow-[0_16px_45px_rgba(16,185,129,.35)] transition hover:-translate-y-1 hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:bottom-6 sm:left-6"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-emerald-600">
        <MessageCircle className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="hidden pr-1 text-sm sm:block">Falar no WhatsApp</span>
    </a>
  );
}
