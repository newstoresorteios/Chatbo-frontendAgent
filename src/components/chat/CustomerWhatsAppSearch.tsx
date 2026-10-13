import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { customersService } from '@/services/data.service';
import { Modal } from '@/components/ui/Modal';
import { Search } from '@/components/ui/Search';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { extractApiErrorMessage } from '@/utils/apiErrors';

export function CustomerWhatsAppSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [search, setSearch] = useState('');
  const [term, setTerm] = useState('');
  const [page, setPage] = useState(1);
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
    <Modal open={open} onClose={onClose} title="Buscar clientes no WhatsApp" size="lg">
      <div className="space-y-4">
        <p className="text-sm text-gray-500">Encontre clientes com número cadastrado e abra o WhatsApp para escrever sua mensagem.</p>
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
                <a href={`https://wa.me/${customer.phone}`} target="_blank" rel="noopener noreferrer"
                  aria-label={`Abrir WhatsApp de ${customer.name}`}
                  className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600">
                  Abrir WhatsApp
                </a>
              </div>
            ))}
        </div>
        {!isFetching && !isError && data && <Pagination page={page} totalPages={data.totalPages} total={data.total} onPageChange={setPage} />}
        <p className="text-xs text-gray-500">O número cadastrado não confirma uma conta ativa no WhatsApp. O envio é feito no WhatsApp aberto.</p>
      </div>
    </Modal>
  );
}
