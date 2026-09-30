import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useCommercialLeads, stageCounts, type CommercialLead } from '../hooks/useCommercialLeads';
import { conversationsService } from '@/services/conversations.service';
import { usersService } from '@/services/users.service';
import { useNotification } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { ChannelBadge } from '@/components/ui/ChannelBadge';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { cn, formatRelativeTime } from '@/utils';
import { ArrowRight, Clock3, Flame, History, Search, Target, UserCheck, Users } from 'lucide-react';

const PAGE_SIZE = 12;

function stageTone(stage: string) {
  if (stage === 'high_intent') return { badge: 'danger' as const, bar: 'bg-red-500', ring: 'border-red-500/40', icon: 'bg-red-500/10 text-red-400' };
  if (stage === 'interest') return { badge: 'warning' as const, bar: 'bg-amber-500', ring: 'border-amber-500/30', icon: 'bg-amber-500/10 text-amber-400' };
  if (stage === 'follow_up') return { badge: 'info' as const, bar: 'bg-blue-500', ring: 'border-blue-500/30', icon: 'bg-blue-500/10 text-blue-400' };
  if (stage === 'post_sale') return { badge: 'primary' as const, bar: 'bg-violet-500', ring: 'border-violet-500/30', icon: 'bg-violet-500/10 text-violet-400' };
  return { badge: 'default' as const, bar: 'bg-slate-500', ring: 'border-slate-700', icon: 'bg-slate-500/10 text-slate-400' };
}

export function CommercialLeadsPanel({ funnel = false }: { funnel?: boolean }) {
  const navigate = useNavigate();
  const [stage, setStage] = useState('all');
  const [historical, setHistorical] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<CommercialLead | null>(null);
  const [assignee, setAssignee] = useState('');
  const qc = useQueryClient();
  const { addToast } = useNotification();
  const query = useCommercialLeads();
  const users = useQuery({ queryKey: ['usuarios'], queryFn: usersService.list, enabled: !!selected });
  const action = useMutation({
    mutationFn: async ({ lead, user }: { lead: CommercialLead; user?: string }) => {
      if (user) return conversationsService.transfer(lead.id, user);
      return conversationsService.assume(lead.id);
    },
    onSuccess: () => {
      setSelected(null);
      void qc.invalidateQueries({ queryKey: ['commercial-leads'] });
      void qc.invalidateQueries({ queryKey: ['conversations'] });
      addToast({ title: 'Responsável definido', message: 'O agente automático foi pausado para atendimento humano.', type: 'success' });
    },
    onError: () => addToast({ title: 'Não foi possível atribuir', message: 'Verifique sua permissão e se a conversa está aberta. Nenhuma atribuição foi confirmada.', type: 'error' }),
  });
  const leads = query.data?.leads ?? [];
  const filtered = leads.filter(l => (stage === 'all' || (historical ? l.observedStages.includes(stage) : l.stage === stage)) && l.customerName.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.score - a.score || a.customerName.localeCompare(b.customerName));
  const currentPage = Math.min(page, Math.max(0, Math.ceil(filtered.length / PAGE_SIZE) - 1));
  const hotCount = leads.filter(lead => lead.stage === 'high_intent').length;
  const unassignedCount = leads.filter(lead => !lead.assignedTo && lead.status !== 'closed').length;
  const followUpCount = leads.filter(lead => lead.stage === 'follow_up').length;
  return <section id={funnel ? 'commercial-funnel' : 'leads'} className="space-y-5">
    <div className="grid gap-3 sm:grid-cols-3">
      {[
        { label: 'Quentes agora', value: hotCount, helper: 'agir em até 24h', icon: Flame, tone: 'text-red-400 bg-red-500/10 border-red-500/20' },
        { label: 'Sem responsável', value: unassignedCount, helper: 'aguardando ação', icon: Users, tone: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
        { label: 'Para acompanhar', value: followUpCount, helper: 'reativar interesse', icon: History, tone: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
      ].map(item => <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{item.label}</p><p className="mt-1 text-3xl font-black tabular-nums text-slate-950 dark:text-white">{item.value}</p><p className="text-xs text-slate-500">{item.helper}</p></div><div className={cn('flex h-11 w-11 items-center justify-center rounded-xl border', item.tone)}><item.icon className="h-5 w-5" /></div></div>
      </div>)}
    </div>

    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
      <div className="border-b border-slate-200 p-4 dark:border-slate-800 sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div><h2 className="text-lg font-bold text-slate-950 dark:text-white">{funnel ? 'Clientes por etapa comercial' : 'Fila comercial'}</h2><p className="mt-1 text-sm text-slate-500">{filtered.length} de {leads.length} contatos · ordenados por prioridade</p></div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative min-w-64"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input aria-label="Buscar cliente no mapa comercial" placeholder="Buscar cliente..." className="h-10 w-full rounded-xl border border-slate-300 bg-transparent pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700" value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} /></div>
            <Button variant="outline" onClick={() => void query.refetch()} loading={query.isFetching}>Atualizar agora</Button>
          </div>
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          <button className={cn('whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition', stage === 'all' ? 'border-blue-500 bg-blue-600 text-white' : 'border-slate-300 text-slate-600 hover:border-blue-400 dark:border-slate-700 dark:text-slate-300')} onClick={() => { setStage('all'); setPage(0); }}>Todos <span className="ml-1 opacity-75">{leads.length}</span></button>
          {Object.entries(query.data?.stages ?? {}).map(([id, name]) => {
            const counts = stageCounts(leads, id);
            return <button key={id} className={cn('whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition', stage === id ? 'border-blue-500 bg-blue-600 text-white' : 'border-slate-300 text-slate-600 hover:border-blue-400 dark:border-slate-700 dark:text-slate-300')} onClick={() => { setStage(id); setPage(0); }}>{name} <span className="ml-1 opacity-75">{historical ? counts.historical : counts.current}</span></button>;
          })}
        </div>
        <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-xs text-slate-500"><input className="h-4 w-4 rounded border-slate-600 accent-blue-600" type="checkbox" checked={historical} onChange={e => { setHistorical(e.target.checked); setPage(0); }} />Mostrar também quem já passou por essa etapa</label>
      </div>

    {query.isPending && <p role="status">Carregando clientes e histórico…</p>}
    {query.isError && <p role="alert" className="text-red-500">Não foi possível carregar o mapa comercial completo. Tente atualizar.</p>}
    {query.data && !query.data.complete && <p role="alert" className="text-amber-500">Histórico extenso: parte das mensagens antigas não foi analisada. As contagens históricas são parciais.</p>}
      <div className="grid gap-3 p-4 lg:grid-cols-2">
        {filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE).map(lead => {
          const tone = stageTone(lead.stage);
          return <article key={lead.id} role="button" tabIndex={0} onKeyDown={event => event.key === 'Enter' && navigate(`/atendimento?conversa=${encodeURIComponent(lead.id)}`)} onClick={() => navigate(`/atendimento?conversa=${encodeURIComponent(lead.id)}`)} className={cn('group relative cursor-pointer overflow-hidden rounded-2xl border bg-slate-50/70 p-4 transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-slate-900/70', tone.ring)}>
            <div className={cn('absolute inset-y-0 left-0 w-1', tone.bar)} />
            <div className="flex items-start gap-3">
              <Avatar src={lead.customerAvatar} name={lead.customerName} size="lg" className="shrink-0 ring-2 ring-white dark:ring-slate-800" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><h3 className="truncate font-bold text-slate-950 dark:text-white">{lead.customerName}</h3><ChannelBadge channel={lead.channel} /><Badge variant={tone.badge}>{lead.label}</Badge></div>
                <div className="mt-2 flex items-center gap-2"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"><div className={cn('h-full rounded-full', tone.bar)} style={{ width: `${lead.score}%` }} /></div><strong className="text-xs tabular-nums">{lead.score}/100</strong></div>
              </div>
              <ArrowRight className="mt-1 h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-500" />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2"><Badge variant={tone.badge}>{lead.stageName}</Badge>{lead.evidenceAt && <span className="inline-flex items-center gap-1 text-xs text-slate-500"><Clock3 className="h-3.5 w-3.5" />{formatRelativeTime(lead.evidenceAt)}</span>}</div>
            <blockquote className="mt-3 line-clamp-2 min-h-10 border-l-2 border-slate-300 pl-3 text-sm leading-5 text-slate-600 dark:border-slate-700 dark:text-slate-300">“{lead.evidence || lead.reason}”</blockquote>
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-200 pt-3 dark:border-slate-800">
              <div className="flex min-w-0 items-center gap-2 text-xs text-slate-500"><UserCheck className="h-4 w-4 shrink-0" /><span className="truncate">{lead.assignedName || (lead.assignedTo ? 'Atendente atribuído' : 'Sem responsável')}</span></div>
              <div className="flex shrink-0 gap-2" onClick={event => event.stopPropagation()}>
                <Button size="sm" variant="outline" disabled={lead.status === 'closed' || action.isPending} onClick={() => action.mutate({ lead })}>Assumir</Button>
                <Button size="sm" disabled={lead.status === 'closed' || action.isPending} onClick={() => { setSelected(lead); setAssignee(''); }}>Atribuir</Button>
              </div>
            </div>
          </article>;
        })}
      </div>
      {!query.isPending && !query.isError && !filtered.length && <div className="flex flex-col items-center px-4 py-14 text-center"><div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"><Target className="h-6 w-6 text-slate-400" /></div><p className="font-semibold">Nenhum cliente neste filtro</p><p className="mt-1 text-sm text-slate-500">Altere a etapa ou limpe a busca para ver outros leads.</p></div>}
      {filtered.length > PAGE_SIZE && <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-4 py-4 dark:border-slate-800 sm:flex-row"><span className="text-sm text-slate-500">Mostrando {currentPage * PAGE_SIZE + 1}–{Math.min((currentPage + 1) * PAGE_SIZE, filtered.length)} de {filtered.length}</span><div className="flex gap-2"><Button size="sm" variant="outline" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Anterior</Button><Button size="sm" variant="outline" disabled={(currentPage + 1) * PAGE_SIZE >= filtered.length} onClick={() => setPage(currentPage + 1)}>Próxima</Button></div></div>}
    </div>
    <Modal open={!!selected} onClose={() => setSelected(null)} title={`Atribuir ${selected?.customerName ?? 'cliente'}`} footer={<Button disabled={!assignee || action.isPending} onClick={() => selected && action.mutate({ lead: selected, user: assignee })}>Confirmar atribuição</Button>}>
      <p className="mb-4">O responsável receberá a conversa e a IA ficará pausada para que ele conduza o atendimento.</p>
      {users.isError && <p role="alert">Não foi possível carregar os atendentes.</p>}
      <Select label="Atendente / comercial" value={assignee} onChange={e => setAssignee(e.target.value)} options={[{ value: '', label: 'Selecione um responsável' }, ...(users.data ?? []).filter(u => u.active).map(u => ({ value: u.id, label: u.name }))]} />
    </Modal>
  </section>;
}
