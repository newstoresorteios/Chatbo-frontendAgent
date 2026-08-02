import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { cn, formatCurrency } from '@/utils';
import { Package } from 'lucide-react';
import { useState } from 'react';
import type { Product } from '@/types';
import type { ProductCatalogSectionProps, ProductSort } from '../types';
import { DashboardDataTable, DashboardEmptyInsight, DashboardSection, statusToneClass } from './DashboardSectionPrimitives';

const SORT_OPTIONS = [
  { value: 'best', label: 'Mais vendidos' }, { value: 'worst', label: 'Menos vendidos' },
  { value: 'revenue', label: 'Maior receita' }, { value: 'idle', label: 'Sem movimento' },
  { value: 'recent', label: 'Mais recentes' }, { value: 'az', label: 'A-Z' },
];

export function ProductCatalogSection({ products, sort, presentationMode, onSortChange }: ProductCatalogSectionProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  return <>
    <DashboardSection id="produtos" title="Produtos e catálogo comercial" subtitle="Catálogo disponível para atendimento, propostas e campanhas." icon={Package} hidden={presentationMode}>
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200/80 bg-white/90 p-4 shadow-sm dark:border-white/10 dark:bg-gray-900/90 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-gray-500">Quantidade vendida e receita por produto dependem de detalhamento de itens nos pedidos. Quando o backend fornecer esses dados, o painel pode preencher essas colunas.</p>
        <Select className="md:w-56" aria-label="Ordenar produtos" value={sort} onChange={(event) => onSortChange(event.target.value as ProductSort)} options={SORT_OPTIONS} />
      </div>
      {products.length ? <DashboardDataTable headers={['Nome','Código','Categoria','Preço','Estoque','Status','Qtd. vendida','Receita','Última atualização','Ações']}>
        {products.map((product) => <tr key={product.id}>
          <td className="min-w-52 px-3 py-2.5 font-semibold text-gray-900 dark:text-white">{product.name}</td><td className="px-3 py-2.5 text-gray-500">{product.code || '-'}</td>
          <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">{product.category || '-'}</td><td className="px-3 py-2.5 font-semibold tabular-nums">{formatCurrency(product.price)}</td><td className="px-3 py-2.5 tabular-nums">{product.stock}</td>
          <td className="px-3 py-2.5"><span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold ring-1', statusToneClass(product.stock > 10 ? 'green' : product.stock > 0 ? 'amber' : 'red'))}>{product.stock > 10 ? 'Disponível' : product.stock > 0 ? 'Baixo estoque' : 'Sem estoque'}</span></td>
          <td className="px-3 py-2.5 text-gray-500">Sem dado</td><td className="px-3 py-2.5 text-gray-500">Sem dado</td><td className="px-3 py-2.5 text-gray-500">{product.synced ? 'Sincronizado' : 'Local'}</td>
          <td className="px-3 py-2.5"><div className="flex min-w-48 flex-nowrap gap-1.5">{['Detalhes','Editar','Pedidos'].map((label) => <Button key={label} type="button" size="sm" variant="outline" className="px-2 text-xs" onClick={() => setSelectedProduct(product)}>{label}</Button>)}</div></td>
        </tr>)}
      </DashboardDataTable> : <DashboardEmptyInsight text="Nenhum produto encontrado com os filtros atuais." />}
    </DashboardSection>
    <Modal open={!!selectedProduct} onClose={() => setSelectedProduct(null)} title={selectedProduct?.name ?? 'Produto'} footer={<Button variant="outline" onClick={() => setSelectedProduct(null)}>Fechar</Button>}>
      {selectedProduct && <div className="space-y-4 text-sm"><div className="grid gap-3 sm:grid-cols-2"><p><strong>Código:</strong> {selectedProduct.code || '-'}</p><p><strong>Categoria:</strong> {selectedProduct.category || '-'}</p><p><strong>Preço:</strong> {formatCurrency(selectedProduct.price)}</p><p><strong>Estoque:</strong> {selectedProduct.stock}</p></div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">A edição local de produtos depende do endpoint de atualização no backend. Nenhuma alteração será salva por este modal.</div>
        <p className="text-gray-500">Pedidos relacionados por item ainda dependem do backend retornar itens de pedido por produto. O painel não inventa dados quando essa relação não está disponível.</p></div>}
    </Modal>
  </>;
}
