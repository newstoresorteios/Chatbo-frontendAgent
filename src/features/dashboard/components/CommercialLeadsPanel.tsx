import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { useCommercialLeads, stageCounts, type CommercialLead } from '../hooks/useCommercialLeads';
import { conversationsService } from '@/services/conversations.service';
import { usersService } from '@/services/users.service';
import { useNotification } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { ChannelBadge } from '@/components/ui/ChannelBadge';

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
  const currentPage = Math.min(page, Math.max(0, Math.ceil(filtered.length / 20) - 1));
  return <section id={funnel ? 'commercial-funnel' : 'leads'} className="space-y-4 rounded-2xl border border-gray-200 p-5 dark:border-gray-700">
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-lg font-bold">{funnel ? 'Clientes por etapa comercial' : 'Pontuação de leads — ações comerciais'}</h2>
      <Button variant="outline" onClick={() => void query.refetch()} loading={query.isFetching}>Atualizar</Button>
    </div>
    <p className="text-sm text-gray-500">{leads.length} contatos mapeados. Etapas e pontuação estimadas pelas mensagens do cliente, não pelas respostas da IA. “Histórico” conta quem já demonstrou o sinal; não representa vendas confirmadas.</p>
    {query.isPending && <p role="status">Carregando clientes e histórico…</p>}
    {query.isError && <p role="alert" className="text-red-500">Não foi possível carregar o mapa comercial completo. Tente atualizar.</p>}
    {query.data && !query.data.complete && <p role="alert" className="text-amber-500">Histórico extenso: parte das mensagens antigas não foi analisada. As contagens históricas são parciais.</p>}
    <div className="flex flex-wrap gap-2">
      <Button variant={stage === 'all' ? 'primary' : 'outline'} onClick={() => { setStage('all'); setPage(0); }}>Todos ({leads.length})</Button>
      {Object.entries(query.data?.stages ?? {}).map(([id, name]) => {
        const counts = stageCounts(leads, id);
        return <Button key={id} variant={stage === id ? 'primary' : 'outline'} onClick={() => { setStage(id); setPage(0); }}>{name}: {counts.current} agora · {counts.historical} histórico</Button>;
      })}
    </div>
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={historical} onChange={e => { setHistorical(e.target.checked); setPage(0); }} />Incluir clientes que já passaram pelo sinal selecionado (histórico)</label>
    <input aria-label="Buscar cliente no mapa comercial" placeholder="Buscar cliente…" className="w-full rounded-lg border bg-transparent p-2" value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} />
    <div className="overflow-x-auto"><table className="w-full text-left text-sm">
      <thead><tr>{['Cliente / canal', 'Etapa / pontuação', 'Sinal do cliente', 'Responsável', 'Ações'].map(h => <th key={h} className="p-3">{h}</th>)}</tr></thead>
      <tbody>{filtered.slice(currentPage * 20, (currentPage + 1) * 20).map(lead => <tr key={lead.id} className="cursor-pointer border-t border-gray-200 hover:bg-blue-50 dark:border-gray-700 dark:hover:bg-slate-800" onClick={() => navigate(`/atendimento?conversa=${encodeURIComponent(lead.id)}`)}>
        <td className="p-3"><Link className="text-blue-500 underline" to={`/atendimento?conversa=${encodeURIComponent(lead.id)}`}>{lead.customerName}</Link><ChannelBadge channel={lead.channel} /></td>
        <td className="p-3">{lead.stageName}<br />{lead.score}/100 · {lead.label}</td>
        <td className="max-w-sm p-3"><p>{lead.evidence || lead.reason}</p>{lead.evidenceAt && <small className="text-gray-500">{new Date(lead.evidenceAt).toLocaleString('pt-BR')}</small>}</td>
        <td className="p-3">{lead.assignedName || (lead.assignedTo ? 'Atendente atribuído' : 'Sem responsável')}</td>
        <td className="min-w-52 space-y-2 p-3" onClick={event => event.stopPropagation()}><p>{lead.nextAction}</p><div className="flex flex-wrap gap-2">
          <Link className="text-blue-500 underline" to={`/atendimento?conversa=${encodeURIComponent(lead.id)}`}>Abrir conversa</Link>
          <Button variant="outline" disabled={lead.status === 'closed' || action.isPending} onClick={() => action.mutate({ lead })}>Assumir</Button>
          <Button variant="outline" disabled={lead.status === 'closed' || action.isPending} onClick={() => { setSelected(lead); setAssignee(''); }}>Atribuir comercial</Button>
        </div></td>
      </tr>)}</tbody>
    </table></div>
    {!query.isPending && !query.isError && !filtered.length && <p>Nenhum cliente neste filtro.</p>}
    <div className="flex items-center gap-3"><Button variant="outline" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Anterior</Button><span>{filtered.length} clientes · página {currentPage + 1}</span><Button variant="outline" disabled={(currentPage + 1) * 20 >= filtered.length} onClick={() => setPage(currentPage + 1)}>Próxima</Button></div>
    <Modal open={!!selected} onClose={() => setSelected(null)} title={`Atribuir ${selected?.customerName ?? 'cliente'}`} footer={<Button disabled={!assignee || action.isPending} onClick={() => selected && action.mutate({ lead: selected, user: assignee })}>Confirmar atribuição</Button>}>
      <p className="mb-4">O responsável receberá a conversa e a IA ficará pausada para que ele conduza o atendimento.</p>
      {users.isError && <p role="alert">Não foi possível carregar os atendentes.</p>}
      <Select label="Atendente / comercial" value={assignee} onChange={e => setAssignee(e.target.value)} options={[{ value: '', label: 'Selecione um responsável' }, ...(users.data ?? []).filter(u => u.active).map(u => ({ value: u.id, label: u.name }))]} />
    </Modal>
  </section>;
}
