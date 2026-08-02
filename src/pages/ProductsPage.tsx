import { ProductCard } from '@/components/cards/ProductCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Loading, SkeletonTable } from '@/components/ui/EmptyState';
import { CatalogSourceHint, ProductsEmptyState } from '@/components/ui/GuidedEmptyState';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { Search } from '@/components/ui/Search';
import { Select } from '@/components/ui/Select';
import { Table } from '@/components/ui/Table';
import { useMercosSync } from '@/hooks/useMercosSync';
import { usePermissions } from '@/hooks/usePermissions';
import { useProducts } from '@/hooks/useQueries';
import { formatCurrency } from '@/utils';
import type { Product } from '@/types';
import { LayoutGrid, List, Package, RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';

export function ProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selected, setSelected] = useState<Product | null>(null);
  const { can } = usePermissions();
  const canSync = can('manageIntegrations');
  const syncMutation = useMercosSync();

  const { data, isLoading } = useProducts({ page, pageSize: 6, search, category: category || undefined });

  const handleSync = () => {
    if (!canSync) return;
    syncMutation.mutate('products');
  };

  const products = useMemo(() => data?.data ?? [], [data?.data]);
  const isEmpty = (data?.total ?? 0) === 0;
  const hasFilters = Boolean(search.trim() || category);
  const categories = useMemo(() => {
    const productCategories = Array.from(
      new Set(products.map((product) => product.category).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b));

    return [
      { value: '', label: 'Todas categorias' },
      ...productCategories.map((value) => ({ value, label: value })),
    ];
  }, [products]);

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
      key: 'image',
      header: '',
      className: 'w-12',
      render: () => (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
          <Package className="h-5 w-5 text-gray-400" />
        </div>
      ),
    },
    { key: 'code', header: 'Código' },
    { key: 'name', header: 'Nome' },
    {
      key: 'price',
      header: 'Preço',
      render: (p: Product) => formatCurrency(p.price),
    },
    {
      key: 'stock',
      header: 'Estoque',
      render: (p: Product) => (
        <Badge variant={p.stock > 20 ? 'success' : p.stock > 0 ? 'warning' : 'danger'}>
          {p.stock}
        </Badge>
      ),
    },
    { key: 'category', header: 'Categoria' },
    {
      key: 'synced',
      header: 'Sync',
      render: (p: Product) => (
        <Badge variant={p.synced ? 'success' : 'warning'}>
          {p.synced ? 'Sim' : 'Não'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Produtos</h1>
          <p className="text-gray-500 dark:text-gray-400">Catálogo comercial disponível para o agente e para a equipe.</p>
          {canSync && <p className="mt-1 text-xs text-gray-400">Fonte técnica atual: Mercos</p>}
        </div>
        <div className="flex gap-2">
          {canSync && (
            <Button onClick={handleSync} loading={syncMutation.isPending}>
              <RefreshCw className="h-4 w-4" /> Atualizar catálogo
            </Button>
          )}
          <Button variant={viewMode === 'table' ? 'primary' : 'outline'} size="icon" onClick={() => setViewMode('table')}>
            <List className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === 'cards' ? 'primary' : 'outline'} size="icon" onClick={() => setViewMode('cards')}>
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <CatalogSourceHint />

      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row dark:border-gray-700">
          <Search
            placeholder="Pesquisar produtos..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="max-w-sm"
          />
          <Select
            options={categories}
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="max-w-xs"
          />
        </div>

        {isEmpty ? (
          <ProductsEmptyState searched={hasFilters} />
        ) : viewMode === 'table' ? (
          <Table columns={columns} data={products} keyExtractor={(p) => p.id} onRowClick={setSelected} />
        ) : (
          <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} onClick={() => setSelected(p)} />
            ))}
          </div>
        )}

        {data && !isEmpty && (
          <Pagination page={data.page} totalPages={data.totalPages} total={data.total} onPageChange={setPage} />
        )}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Detalhes do produto" footer={
        <Button variant="outline" onClick={() => setSelected(null)}>Fechar</Button>
      }>
        {selected && (
          <div className="space-y-3 text-sm">
            <p><strong>Código:</strong> {selected.code}</p>
            <p><strong>Nome:</strong> {selected.name}</p>
            <p><strong>Preço:</strong> {formatCurrency(selected.price)}</p>
            <p><strong>Estoque:</strong> {selected.stock} unidades</p>
            <p><strong>Categoria:</strong> {selected.category}</p>
            <p><strong>Sincronizado:</strong> {selected.synced ? 'Sim' : 'Não'}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
