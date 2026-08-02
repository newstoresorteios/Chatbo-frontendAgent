import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { agentService } from '@/services/agent.service';
import { useMutation } from '@tanstack/react-query';
import { Bot, Sparkles } from 'lucide-react';
import { useState } from 'react';
import type { AskNitrosSectionProps } from '../types';
import { DashboardSection } from './DashboardSectionPrimitives';

const QUICK_QUESTIONS = ['Por que minhas vendas caíram?','Quais clientes devo priorizar hoje?','Quais produtos estão parados?','Quais leads estão mais quentes?','O que devo fazer para vender mais esta semana?','Quais clientes posso reativar?'];
export function AskNitrosSection({ conversationId, customerId, presentationMode }: AskNitrosSectionProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const mutation = useMutation({
    mutationFn: (message: string) => agentService.chat({ message, mode: 'copilot', conversationId, customerId }),
    onSuccess: (response) => setAnswer(response.reply),
    onError: () => setAnswer('Não foi possível consultar o ChatBô agora. Tente novamente em instantes.'),
  });
  const ask = (message: string) => { const normalized = message.trim(); if (normalized) mutation.mutate(normalized); };
  return <DashboardSection id="pergunte" title="Pergunte ao ChatBô" subtitle="Use o assistente existente para perguntas em linguagem natural dentro do dashboard." icon={Bot} hidden={presentationMode}>
    <div className="grid gap-4 lg:grid-cols-5">
      <div className="rounded-3xl border border-gray-200/80 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-gray-900/90 lg:col-span-2">
        <div className="space-y-3"><Input label="Pergunta" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ex.: Quais clientes devo priorizar hoje?" /><Button type="button" className="w-full" loading={mutation.isPending} onClick={() => ask(question)}><Sparkles className="h-4 w-4"/> Perguntar ao ChatBô</Button></div>
        <div className="mt-4 flex flex-wrap gap-2">{QUICK_QUESTIONS.map((item) => <button key={item} type="button" onClick={() => { setQuestion(item); ask(item); }} className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-blue-300 hover:text-blue-700 dark:border-white/10 dark:text-gray-300">{item}</button>)}</div>
      </div>
      <div className="rounded-3xl border border-blue-200/80 bg-blue-50/70 p-5 shadow-sm dark:border-blue-900/40 dark:bg-blue-950/20 lg:col-span-3"><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700 dark:text-blue-300">Resposta do ChatBô</p><div className="mt-4 min-h-40 whitespace-pre-wrap rounded-2xl bg-white/80 p-4 text-sm leading-relaxed text-gray-700 shadow-sm dark:bg-gray-900/80 dark:text-gray-200">{mutation.isPending ? 'Analisando os dados disponíveis no ChatBô...' : answer || 'Faça uma pergunta ou use uma sugestão rápida para receber uma análise comercial.'}</div></div>
    </div>
  </DashboardSection>;
}
