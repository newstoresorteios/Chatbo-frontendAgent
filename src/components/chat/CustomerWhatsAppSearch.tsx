import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { conversationsService } from '@/services/conversations.service';
import type { Conversation } from '@/types';
import { customersService } from '@/services/data.service';
import { Modal } from '@/components/ui/Modal';
import { Search } from '@/components/ui/Search';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { extractApiErrorMessage } from '@/utils/apiErrors';

export function CustomerWhatsAppSearch({ open, onClose, onOpenConversation }: {
  open: boolean; onClose: () => void; onOpenConversation: (conversation: Conversation) => void;
}) {
  const [search, setSearch] = useState('');
  const [term, setTerm] = useState('');
  const [page, setPage] = useState(1);
  const openConversation = useMutation({
    mutationFn: conversationsService.openCustomer,
    onSuccess: (conversation) => { onOpenConversation(conversation); onClose(); },
  });
  const resetOpenConversation = openConversation.reset;
  useEffect(() => { if (!open) resetOpenConversation(); }, [open, resetOpenConversation]);
  useEffect(() => {
    const timer = window.setTimeout(() => { setTerm(search.trim()); setPage(1); }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);
  const { data, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['customers-whatsapp', term, page],
    queryFn: () => customersService.getCustomers({ search: term, page, pageSize: 8, whatsappOnly: true }),
    enabled: open,
  });
  return (
    <Modal open={open} onClose={onClose} title="Iniciar conversa com cliente" size="lg">
      <div className="space-y-4">
        <p className="text-sm text-gray-500">Escolha um cliente para abrir a conversa na Central e enviar sua mensagem por aqui.</p>
        {openConversation.isError && <p role="alert" className="text-sm text-red-500">{extractApiErrorMessage(openConversation.error, 'Não foi possível abrir a conversa.')}</p>}
        <Search aria-label="Buscar cliente por nome ou telefone" placeholder="Digite o nome, empresa ou telefone..." value={search}
          onChange={(event) => setSearch(event.target.value)} />
        <div className="max-h-[50vh] space-y-2 overflow-y-auto" aria-live="polite">
          {isFetching ? <p className="py-6 text-center text-sm text-gray-500">Buscando clientes...</p>
            : isError ? <div role="alert" className="space-y-2 text-sm text-red-500">
              <p>{extractApiErrorMessage(error, 'Não foi possível buscar os clientes.')}</p>
              <Button variant="outline" onClick={() => { void refetch(); }}>Tentar novamente</Button>
            </div>
            : !data?.data.length ? <p className="py-6 text-center text-sm text-gray-500">Nenhum cliente com número disponível para WhatsApp encontrado.</p>
            : data.data.map((customer) => (
              <div key={customer.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{customer.name}</p>
                  {customer.company !== customer.name && <p className="truncate text-xs text-gray-500">{customer.company}</p>}
                  <p className="text-sm text-gray-500">+{customer.phone}</p>
                </div>
                <Button disabled={openConversation.isPending}
                  onClick={() => openConversation.mutate(customer.id)}
                  aria-label={`Abrir conversa com ${customer.name}`}>
                  {openConversation.isPending && openConversation.variables === customer.id ? 'Abrindo...' : 'Abrir conversa'}
                </Button>
              </div>
            ))}
        </div>
        {!isFetching && !isError && data && <Pagination page={page} totalPages={data.totalPages} total={data.total} onPageChange={setPage} />}
        <p className="text-xs text-gray-500">A mensagem será enviada pelo canal WhatsApp da empresa na Central de Atendimento.</p>
      </div>
    </Modal>
  );
}
