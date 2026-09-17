import { DashboardStatCard } from '@/components/dashboard/DashboardWidgets';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Loading, SkeletonTable } from '@/components/ui/EmptyState';
import { OrdersEmptyState } from '@/components/ui/GuidedEmptyState';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { Search } from '@/components/ui/Search';
import { Select } from '@/components/ui/Select';
import { Table } from '@/components/ui/Table';
import { useOrders, useSalesMetrics } from '@/hooks/useQueries';
import { useNotification } from '@/contexts/NotificationContext';
import { commercialBiService } from '@/services/commercialBi.service';
import { extractApiErrorMessage } from '@/utils/apiErrors';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  formatCurrency,
  formatDate,
  orderStatusLabels,
} from '@/utils';
import {
  formatOrderCustomerName,
  getOrderTypeLabel,
  isOrderQuote,
  orderStatusDescriptions,
} from '@/utils/orderHelpers';
import type { Order, OrderStatus } from '@/types';
import { Banknote, FileText, RefreshCw, ShoppingCart } from 'lucide-react';
import { useMemo, useState } from 'react';

const statusOptions = [
  { value: '', label: 'Todos os status' },
  { value: 'pending', label: 'Pendente' },
  { value: 'processing', label: 'Processando' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregue' },
  { value: 'cancelled', label: 'Cancelado' },
];

const statusVariant: Record<OrderStatus, 'default' | 'warning' | 'info' | 'success' | 'danger'> = {
  pending: 'warning',
  processing: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'danger',
};

const typeVariant: Record<'Orçamento' | 'Pedido' | 'Cancelado', 'warning' | 'info' | 'danger'> = {
  Orçamento: 'warning',
  Pedido: 'info',
  Cancelado: 'danger',
};

export function OrdersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState<Order | null>(null);
  const queryClient = useQueryClient();
  const { addToast } = useNotification();

  const { data, isLoading } = useOrders({ page, pageSize: 10, search, status: status || undefined });
  const { data: metrics } = useSalesMetrics();

  const orders = data?.data ?? [];
  const isEmpty = (data?.total ?? 0) === 0;
  const hasFilters = Boolean(search.trim() || status);

  const quoteCount = useMemo(
    () => metrics?.porStatus?.find((s) => s.status === 'pending')?.quantidade ?? 0,
    [metrics],
  );

  const refreshMutation = useMutation({
    mutationFn: () => commercialBiService.analyze(30),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['orders'] }),
        queryClient.invalidateQueries({ queryKey: ['sales-metrics'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ]);
      addToast({
        type: 'success',
        title: 'Pedidos atualizados',
        message: 'A lista do ChatBô foi recalculada para o mês atual.',
      });
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'Não foi possível atualizar',
        message: extractApiErrorMessage(error),
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonTable />
        <Loading />
      </div>
    );
  }

  const columns = [
    {
      key: 'number',
      header: 'Número',
      render: (o: Order) => (
        <span className="font-medium text-gray-900 dark:text-white">#{o.number}</span>
      ),
    },
    {
      key: 'customerName',
      header: 'Cliente',
      render: (o: Order) => {
        const label = formatOrderCustomerName(o);
        const missing = !o.customerName?.trim();
        return (
          <span className={missing ? 'italic text-gray-500' : 'text-gray-900 dark:text-white'}>
            {label}
          </span>
        );
      },
    },
    {
      key: 'type',
      header: 'Tipo',
      render: (o: Order) => {
        const type = getOrderTypeLabel(o);
        return <Badge variant={typeVariant[type]}>{type}</Badge>;
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (o: Order) => (
        <Badge variant={statusVariant[o.status]}>
          {orderStatusLabels[o.status]}
        </Badge>
      ),
    },
    {
      key: 'total',
      header: 'Valor',
      render: (o: Order) => (
        <span className={o.total <= 0 ? 'text-gray-400' : 'font-medium'}>
          {formatCurrency(o.total)}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Data',
      render: (o: Order) => formatDate(o.createdAt),
    },
    {
      key: 'items',
      header: 'Item comprado',
      render: (o: Order) => o.itemDetails?.length ? (
        <div className="space-y-1">
          {o.itemDetails.map((item) => (
            <p key={`${o.id}-${item.productId}`} className="font-medium text-gray-900 dark:text-white">
              {item.quantity}× {item.name}
            </p>
          ))}
        </div>
      ) : (
        <span className="text-gray-500">{o.items} item(ns) — detalhe indisponível</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pedidos</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Pedidos atribuídos aos atendimentos do ChatBô no mês atual.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => refreshMutation.mutate()}
          loading={refreshMutation.isPending}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar pedidos
        </Button>
      </div>

      {!isEmpty && metrics && (
        <div className="grid gap-4 sm:grid-cols-3">
          <DashboardStatCard
            title="Pedidos no total"
            value={metrics.quantidadeVendas}
            icon={ShoppingCart}
            variant="primary"
            delta={`${quoteCount} orçamento(s) pendente(s)`}
          />
          <DashboardStatCard
            title="Volume confirmado"
            value={formatCurrency(metrics.valorTotalVendido)}
            icon={Banknote}
            variant="violet"
            delta={`Ticket ${formatCurrency(metrics.ticketMedio)}`}
          />
          <DashboardStatCard
            title="Em pipeline"
            value={formatCurrency(metrics.valorPipeline)}
            icon={FileText}
            variant="warning"
            delta="Pendentes + processando"
          />
        </div>
      )}

      {isEmpty ? (
        <OrdersEmptyState searched={hasFilters} />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
          <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row dark:border-gray-700">
            <Search
              placeholder="Pesquisar pedido, cliente..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="max-w-sm"
            />
            <Select
              options={statusOptions}
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="max-w-xs"
            />
          </div>

          <Table columns={columns} data={orders} keyExtractor={(o) => o.id} onRowClick={setSelected} />

          {data && (
            <Pagination page={data.page} totalPages={data.totalPages} total={data.total} onPageChange={setPage} />
          )}
        </div>
      )}

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `Pedido #${selected.number}` : 'Pedido'}
        footer={<Button variant="outline" onClick={() => setSelected(null)}>Fechar</Button>}
      >
        {selected && (
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap gap-2">
              <Badge variant={typeVariant[getOrderTypeLabel(selected)]}>
                {getOrderTypeLabel(selected)}
              </Badge>
              <Badge variant={statusVariant[selected.status]}>
                {orderStatusLabels[selected.status]}
              </Badge>
            </div>

            <p className="rounded-lg bg-gray-50 px-3 py-2 text-gray-600 dark:bg-gray-800/60 dark:text-gray-300">
              {orderStatusDescriptions[selected.status]}
            </p>

            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Cliente</dt>
                <dd className={`mt-1 font-medium ${!selected.customerName?.trim() ? 'italic text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                  {formatOrderCustomerName(selected)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Valor total</dt>
                <dd className="mt-1 font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(selected.total)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Itens comprados</dt>
                <dd className="mt-1 space-y-2 text-gray-900 dark:text-white">
                  {selected.itemDetails?.length ? selected.itemDetails.map((item) => (
                    <div key={`${selected.id}-${item.productId}`}>
                      <p className="font-medium">{item.quantity}× {item.name}</p>
                      <p className="text-xs text-gray-500">{formatCurrency(item.price)} cada</p>
                    </div>
                  )) : `${selected.items} item(ns) — detalhe indisponível`}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Data</dt>
                <dd className="mt-1 text-gray-900 dark:text-white">{formatDate(selected.createdAt)}</dd>
              </div>
              {selected.customerId && (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Contato relacionado</dt>
                  <dd className="mt-1 font-mono text-xs text-gray-600 dark:text-gray-400">{selected.customerId}</dd>
                </div>
              )}
            </dl>

            {isOrderQuote(selected) && (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
                {selected.total <= 0
                  ? 'Oportunidade sem valor confirmado. Revise a negociação antes de concluir.'
                  : 'Confirme a venda no atendimento para que ela entre nos resultados do ChatBô.'}
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
