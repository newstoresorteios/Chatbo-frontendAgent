import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageState } from '@/components/ui/PageState';
import { useNotification } from '@/contexts/NotificationContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { storyReferenceService, type StoryReference } from '@/services/storyReference.service';
import { extractApiErrorMessage } from '@/utils/apiErrors';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, Images, Pencil, Plus, Save, Search, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';

const queryKey = ['story-highlight-references'] as const;

function validStoreUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && ['newstorerj.com', 'www.newstorerj.com', 'newstorerj.com.br', 'www.newstorerj.com.br'].includes(url.hostname.toLowerCase()) && url.pathname !== '/';
  } catch {
    return false;
  }
}

export function StoryReferencesPage() {
  const queryClient = useQueryClient();
  const { addToast } = useNotification();
  const { role } = useWorkspace();
  const canEdit = role === 'owner' || role === 'admin';
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [filter, setFilter] = useState('');
  const [editing, setEditing] = useState<StoryReference | null>(null);
  const references = useQuery({ queryKey, queryFn: storyReferenceService.list });

  const refresh = async () => { await queryClient.invalidateQueries({ queryKey }); };
  const create = useMutation({
    mutationFn: storyReferenceService.create,
    onSuccess: async () => {
      setName(''); setUrl(''); await refresh();
      addToast({ title: 'Referência cadastrada', message: 'O agente já pode consultá-la nas buscas.', type: 'success' });
    },
    onError: (error) => addToast({ title: 'Não foi possível cadastrar', message: extractApiErrorMessage(error), type: 'error' }),
  });
  const update = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Partial<Pick<StoryReference, 'name' | 'url' | 'active'>> }) => storyReferenceService.update(id, body),
    onSuccess: async () => { setEditing(null); await refresh(); addToast({ title: 'Referência atualizada', type: 'success' }); },
    onError: (error) => addToast({ title: 'Não foi possível atualizar', message: extractApiErrorMessage(error), type: 'error' }),
  });
  const remove = useMutation({
    mutationFn: storyReferenceService.remove,
    onSuccess: async () => { await refresh(); addToast({ title: 'Referência removida', type: 'success' }); },
    onError: (error) => addToast({ title: 'Não foi possível remover', message: extractApiErrorMessage(error), type: 'error' }),
  });

  const items = useMemo(() => {
    const needle = filter.trim().toLocaleLowerCase('pt-BR');
    return (references.data?.items ?? []).filter((item) => !needle || item.name.toLocaleLowerCase('pt-BR').includes(needle));
  }, [filter, references.data]);

  const submit = () => {
    if (name.trim().length < 2) return addToast({ title: 'Informe o nome do relógio', type: 'error' });
    if (!validStoreUrl(url)) return addToast({ title: 'Link inválido', message: 'Use o link HTTPS completo do produto na New Store.', type: 'error' });
    create.mutate({ name: name.trim(), url: url.trim() });
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-10">
      <div>
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-cyan-500/10 p-2 text-cyan-600 dark:text-cyan-300"><Images className="h-6 w-6" /></span>
          <div><h1 className="text-2xl font-bold text-gray-950 dark:text-white">Referências dos Stories</h1><p className="text-sm text-gray-500 dark:text-gray-400">Relógios exibidos nos Destaques que o agente deve reconhecer.</p></div>
        </div>
        <div className="mt-4 rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-950 dark:border-cyan-800/60 dark:bg-cyan-950/30 dark:text-cyan-100">
          Na análise do Story e na busca por nome/modelo, o agente consulta esta base primeiro. O link serve como pista de identidade; preço e estoque continuam sendo confirmados no catálogo da Tray antes da resposta.
        </div>
      </div>

      {canEdit && <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
        <h2 className="mb-4 text-base font-bold text-gray-900 dark:text-white">Cadastrar relógio de referência</h2>
        <div className="grid gap-4 md:grid-cols-[1fr_1.7fr_auto] md:items-end">
          <Input label="Nome do relógio" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Mido Baroncelli Heritage" maxLength={200} />
          <Input label="Link do produto" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.newstorerj.com.br/..." type="url" maxLength={2000} />
          <Button onClick={submit} loading={create.isPending}><Plus className="h-4 w-4" /> Cadastrar</Button>
        </div>
      </section>}

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div><h2 className="font-bold text-gray-900 dark:text-white">Relógios cadastrados</h2><p className="text-sm text-gray-500">{references.data?.total ?? 0} referência(s)</p></div>
          <div className="relative sm:w-72"><Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" /><Input aria-label="Filtrar referências" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Buscar por nome" className="pl-9" /></div>
        </div>
        {references.isLoading && <PageState />}
        {references.isError && <PageState error={extractApiErrorMessage(references.error, 'Não foi possível carregar as referências.')} />}
        {!references.isLoading && !references.isError && items.length === 0 && <PageState empty={filter ? 'Nenhuma referência encontrada.' : 'Nenhum relógio de referência cadastrado.'} />}
        <div className="space-y-3">
          {items.map((item) => {
            const isEditing = editing?.id === item.id;
            return <article key={item.id} className="rounded-xl border border-gray-200 p-4 dark:border-white/10">
              {isEditing ? <div className="grid gap-3 md:grid-cols-[1fr_1.7fr_auto] md:items-end">
                <Input label="Nome" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                <Input label="Link" value={editing.url} onChange={(e) => setEditing({ ...editing, url: e.target.value })} />
                <div className="flex gap-2"><Button size="icon" aria-label="Salvar" loading={update.isPending} onClick={() => {
                  if (!validStoreUrl(editing.url)) return addToast({ title: 'Link inválido', type: 'error' });
                  update.mutate({ id: item.id, body: { name: editing.name.trim(), url: editing.url.trim() } });
                }}><Save className="h-4 w-4" /></Button><Button size="icon" variant="ghost" aria-label="Cancelar" onClick={() => setEditing(null)}><X className="h-4 w-4" /></Button></div>
              </div> : <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className={item.active ? '' : 'opacity-55'}><h3 className="font-semibold text-gray-900 dark:text-white">{item.name}</h3><a href={item.url} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 break-all text-sm text-cyan-700 hover:underline dark:text-cyan-300">{item.url}<ExternalLink className="h-3.5 w-3.5 shrink-0" /></a></div>
                {canEdit && <div className="flex shrink-0 items-center gap-2"><Button size="sm" variant="outline" onClick={() => update.mutate({ id: item.id, body: { active: !item.active } })}>{item.active ? 'Desativar' : 'Ativar'}</Button><Button size="icon" variant="ghost" aria-label={`Editar ${item.name}`} onClick={() => setEditing(item)}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" aria-label={`Excluir ${item.name}`} onClick={() => { if (window.confirm(`Excluir a referência “${item.name}”?`)) remove.mutate(item.id); }}><Trash2 className="h-4 w-4 text-red-500" /></Button></div>}
              </div>}
            </article>;
          })}
        </div>
      </section>
    </div>
  );
}
