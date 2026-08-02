import { ChartPanel, ChartTooltipContent, DashboardStatCard } from '@/components/dashboard/DashboardWidgets';
import { SalesFunnel } from '@/components/sales/SalesFunnel';
import { Loading } from '@/components/ui/EmptyState';
import { useSalesMetrics } from '@/hooks/useQueries';
import { formatCurrency } from '@/utils';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Banknote,
  CircleDollarSign,
  Filter,
  Package,
  ShoppingCart,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Link } from 'react-router-dom';

const STATUS_COLORS: Record<string, string> = {
  delivered: '#10b981',
  shipped: '#2563eb',
  processing: '#f59e0b',
  pending: '#8b5cf6',
  cancelled: '#ef4444',
};

function MoneyFlowBar({ bruto, retido }: { bruto: number; retido: number }) {
  const retencaoPct = bruto > 0 ? (retido / bruto) * 100 : 0;
  const pipeline = Math.max(0, bruto - retido);

  return (
    <div className="space-y-4">
      <div className="flex h-12 overflow-hidden rounded-xl ring-1 ring-gray-200 dark:ring-gray-700">
        <div
          className="flex items-center justify-center bg-emerald-500 text-xs font-semibold text-white transition-all"
          style={{ width: `${retencaoPct}%`, minWidth: retido > 0 ? '4rem' : 0 }}
        >
          Retido {retencaoPct.toFixed(0)}%
        </div>
        <div
          className="flex items-center justify-center bg-amber-400 text-xs font-semibold text-amber-950 transition-all"
          style={{ width: `${100 - retencaoPct}%`, minWidth: pipeline > 0 ? '4rem' : 0 }}
        >
          Em pipeline
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/60">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Volume bruto</p>
          <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(bruto)}</p>
          <p className="mt-1 text-xs text-gray-500">Total que passou pelos pedidos</p>
        </div>
        <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/40">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            Receita retida
          </p>
          <p className="mt-1 text-xl font-bold text-emerald-700 dark:text-emerald-300">{formatCurrency(retido)}</p>
          <p className="mt-1 text-xs text-emerald-600/80">Pedidos entregues — dinheiro concretizado</p>
        </div>
        <div className="rounded-xl bg-amber-50 p-4 dark:bg-amber-950/40">
          <p className="text-xs font-medium uppercase tracking-wide text-amber-600 dark:text-amber-400">
            Ainda em fluxo
          </p>
          <p className="mt-1 text-xl font-bold text-amber-700 dark:text-amber-300">{formatCurrency(pipeline)}</p>
          <p className="mt-1 text-xs text-amber-600/80">Pendentes, processando ou em trânsito</p>
        </div>
      </div>
    </div>
  );
}

export function ReportsPage() {
  const { data: metrics, isLoading } = useSalesMetrics();

  if (isLoading) return <Loading />;

  const sparkline = metrics?.vendasPorDia.map((d) => d.vendas) ?? [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Relatórios Comerciais</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Acompanhamento de vendas, funil comercial e receita retida
        </p>
      </div>

      <Link
        to="/insights"
        className="flex items-center justify-between gap-4 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-white p-5 shadow-sm transition hover:border-blue-300 dark:border-blue-900/50 dark:from-blue-950/30 dark:to-gray-900"
      >
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">Inteligência de vendas</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Produtos e clientes que mais e menos compram
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400">
          Abrir rankings
          <ArrowRight className="h-4 w-4" />
        </span>
      </Link>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          title="Quantidade de vendas"
          value={metrics?.quantidadeVendas ?? 0}
          icon={ShoppingCart}
          variant="primary"
          delta={`${metrics?.quantidadeConcluidas ?? 0} enviados/entregues`}
          sparkline={sparkline}
        />
        <DashboardStatCard
          title="Valor total vendido"
          value={formatCurrency(metrics?.valorTotalVendido ?? 0)}
          icon={CircleDollarSign}
          variant="success"
          delta={`Ticket ${formatCurrency(metrics?.ticketMedio ?? 0)}`}
        />
        <DashboardStatCard
          title="Volume em pipeline"
          value={formatCurrency(metrics?.valorPipeline ?? 0)}
          icon={Banknote}
          variant="violet"
          delta={`${metrics?.quantidadeVendas ?? 0} pedidos confirmados`}
        />
        <DashboardStatCard
          title="Receita retida"
          value={formatCurrency(metrics?.valorRetido ?? 0)}
          icon={Wallet}
          variant="success"
          delta={`${metrics?.quantidadeEntregues ?? 0} entregues · ${metrics?.taxaRetencao ?? 0}% do bruto`}
        />
      </div>

      <ChartPanel
        title="Funil de vendas"
        subtitle="Do primeiro contato até a receita concretizada — estilo Mercado Livre"
        accent="violet"
        delay={0.1}
      >
        <SalesFunnel steps={metrics?.funil ?? []} />
        {(metrics?.pipelineNegocios ?? 0) > 0 && (
          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            <Filter className="mr-1 inline h-4 w-4" />
            Pipeline comercial: <strong>{metrics?.pipelineNegocios}</strong> negócios ·{' '}
            {formatCurrency(metrics?.pipelineValor ?? 0)}
          </p>
        )}
      </ChartPanel>

      <ChartPanel
        title="Dinheiro que passou vs. o que retemos"
        subtitle="Volume bruto dos pedidos versus receita já entregue"
        accent="teal"
        delay={0.15}
      >
        <MoneyFlowBar bruto={metrics?.volumeBruto ?? 0} retido={metrics?.valorRetido ?? 0} />
      </ChartPanel>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartPanel title="Vendas por dia" subtitle="Últimos 30 dias" accent="teal" delay={0.2}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={metrics?.vendasPorDia}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} hide />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="vendas"
                fill="#2563eb"
                name="Vendas"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                yAxisId="right"
                dataKey="valor"
                fill="#ef4444"
                name="Valor (R$)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Pedidos por status" subtitle="Distribuição do volume" accent="amber" delay={0.25}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={metrics?.porStatus} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="label" width={90} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value: number, name: string) =>
                  name === 'valor' ? formatCurrency(value) : value
                }
              />
              <Bar dataKey="valor" name="Valor" radius={[0, 4, 4, 0]}>
                {(metrics?.porStatus ?? []).map((entry) => (
                  <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? '#6b7280'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>

      <ChartPanel title="Resumo operacional" accent="none" delay={0.3}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Pipeline aberto', value: formatCurrency(metrics?.valorPipeline ?? 0), icon: TrendingUp },
            { label: 'Cancelados', value: formatCurrency(metrics?.valorCancelado ?? 0), icon: Package },
            { label: 'Negócios no funil', value: metrics?.pipelineNegocios ?? 0, icon: Filter },
            { label: 'Taxa de retenção', value: `${metrics?.taxaRetencao ?? 0}%`, icon: Wallet },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-800/40"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-gray-900">
                <Icon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="font-bold text-gray-900 dark:text-white">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </ChartPanel>
    </motion.div>
  );
}
