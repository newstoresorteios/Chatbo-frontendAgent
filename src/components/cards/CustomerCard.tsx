import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { cn, formatCurrency, formatDate } from '@/utils';
import type { Customer } from '@/types';
import { Building2, Mail, MapPin, Phone } from 'lucide-react';

interface CustomerCardProps {
  customer: Customer;
  onClick?: () => void;
}

export function CustomerCard({ customer, onClick }: CustomerCardProps) {
  return (
    <div
      className={cn(onClick && 'cursor-pointer')}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <Card className="transition-shadow hover:shadow-md">
      <div className="flex items-start gap-4">
        <Avatar name={customer.name} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">{customer.name}</h4>
            <Badge variant={customer.synced ? 'success' : 'warning'}>
              {customer.synced ? 'Sincronizado' : 'Pendente'}
            </Badge>
          </div>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <Building2 className="h-3.5 w-3.5" />
            {customer.company}
          </p>
          <div className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <p className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> {customer.email}
            </p>
            <p className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" /> {customer.phone}
            </p>
            <p className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> {customer.city}
            </p>
          </div>
          <div className="mt-3 flex gap-4 text-sm">
            <span>
              <strong>{customer.ordersCount}</strong> pedidos
            </span>
            <span>
              <strong>{formatCurrency(customer.totalSpent)}</strong> total
            </span>
            <span className="text-gray-400">Último: {formatDate(customer.lastContact)}</span>
          </div>
        </div>
      </div>
      </Card>
    </div>
  );
}
