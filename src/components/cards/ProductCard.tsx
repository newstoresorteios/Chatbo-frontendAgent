import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { cn, formatCurrency } from '@/utils';
import type { Product } from '@/types';
import { Package } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <div
      className={cn(onClick && 'cursor-pointer')}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <Card className="transition-shadow hover:shadow-md">
      <div className="flex flex-col items-center text-center">
        <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
          {product.image ? (
            <img src={product.image} alt={product.name} className="h-full w-full rounded-xl object-cover" />
          ) : (
            <Package className="h-8 w-8 text-gray-400" />
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{product.code}</p>
        <h4 className="mt-1 font-medium text-gray-900 dark:text-gray-100">{product.name}</h4>
        <p className="mt-1 text-lg font-bold text-primary-600 dark:text-primary-400">
          {formatCurrency(product.price)}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <Badge variant={product.stock > 20 ? 'success' : product.stock > 0 ? 'warning' : 'danger'}>
            Estoque: {product.stock}
          </Badge>
          <Badge variant="default">{product.category}</Badge>
        </div>
      </div>
      </Card>
    </div>
  );
}
