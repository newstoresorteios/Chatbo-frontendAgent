import { DashboardStatCard } from '@/components/dashboard/DashboardWidgets';
import { Loading } from '@/components/ui/EmptyState';
import { useSalesRankings } from '@/hooks/useQueries';
import { formatCurrency } from '@/utils';
import { motion } from 'framer-motion';
import { Package, TrendingDown, TrendingUp, Users } from 'lucide-react';
import type { CustomerRankingItem, ProductRankingItem } from '@/types';

function RankingTable<T extends ProductRankingItem | CustomerRankingItem>({
  title,
  subtitle,
  rows,
  variant,
  type,
}: {
  title: string;
  subtitle: string;
  rows: T[];
  variant: 'up' | 'down';
  type: 'product' | 'customer';
}) {
  const accent =
    variant === 'up'
      ? 'border-emerald-200 dark:border-emerald-900/50'
      : 'border-amber-200 dark:border-amber-900/50';

  return (
    <div
      className={`rounded-2xl border bg-white p-5 shadow-sm dark:bg-gray-900 ${accent}`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
        {variant === 'up' ? (
          <TrendingUp className="h-5 w-5 shrink-0 text-emerald-500" />
        ) : (
          <TrendingDown className="h-5 w-5 shrink-0 text-amber-500" />
        )}
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-gray-500">Sem dados suficientes ainda.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800">
                <th className="px-2 py-2">#</th>
                <th className="px-2 py-2">{type === 'product' ? 'Produto' : 'Cliente'}</th>
                <th className="px-2 py-2">Pedidos</th>
                <th className="px-2 py-2">Receita</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={`${row.id}-${index}`}
                  className="border-b border-gray-50 last:border-0 dark:border-gray-800/80"
                >
                  <td className="px-2 py-3 font-medium text-gray-400">{index + 1}</td>
                  <td className="px-2 py-3">
                    <p className="font-medium text-gray-900 dark:text-white">{row.name}</p>
                    {type === 'product' && 'code' in row && row.code ? (
                      <p className="text-xs text-gray-500">{row.code}</p>
                    ) : null}
                  </td>
                  <td className="px-2 py-3 text-gray-700 dark:text-gray-300">{row.ordersCount}</td>
                  <td className="px-2 py-3 font-medium text-gray-900 dark:text-white">
                    {formatCurrency(row.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function InsightsPage() {
  const { data, isLoading } = useSalesRankings(10);

  if (isLoading) return <Loading />;

  const totals = data?.totals;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Inteligência de Vendas</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Produtos e clientes que mais e menos compram, com base nos pedidos do ChatBô e WhatsApp
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          title="Pedidos analisados"
          value={totals?.pedidos ?? 0}
          icon={Package}
          variant="primary"
        />
        <DashboardStatCard
          title="Produtos com venda"
          value={totals?.produtosComVenda ?? 0}
          icon={TrendingUp}
          variant="success"
          delta={`${totals?.produtosCatalogo ?? 0} no catálogo`}
        />
        <DashboardStatCard
          title="Clientes com pedido"
          value={totals?.clientesComPedido ?? 0}
          icon={Users}
          variant="violet"
          delta={`${totals?.clientesCadastro ?? 0} cadastrados`}
        />
        <DashboardStatCard
          title="Sem movimento"
          value={Math.max(0, (totals?.produtosCatalogo ?? 0) - (totals?.produtosComVenda ?? 0))}
          icon={TrendingDown}
          variant="warning"
          delta="Produtos sem venda"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <RankingTable
          title="Produtos mais vendidos"
          subtitle="Maior volume de pedidos e receita"
          rows={data?.produtosMaisVendidos ?? []}
          variant="up"
          type="product"
        />
        <RankingTable
          title="Produtos menos vendidos"
          subtitle="Sem venda ou com poucos pedidos"
          rows={data?.produtosMenosVendidos ?? []}
          variant="down"
          type="product"
        />
        <RankingTable
          title="Clientes que mais compram"
          subtitle="Maior frequência e valor gasto"
          rows={data?.clientesMaisCompram ?? []}
          variant="up"
          type="customer"
        />
        <RankingTable
          title="Clientes que menos compram"
          subtitle="Sem pedido ou compras esporádicas"
          rows={data?.clientesMenosCompram ?? []}
          variant="down"
          type="customer"
        />
      </div>
    </motion.div>
  );
}
