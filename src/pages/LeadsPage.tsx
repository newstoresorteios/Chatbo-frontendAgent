import { CommercialLeadsPanel } from '@/features/dashboard/components/CommercialLeadsPanel';

export function LeadsPage() {
  return <div className="space-y-6">
    <div><h1 className="font-display text-2xl font-bold">Leads comerciais</h1>
      <p className="mt-2 text-gray-500">Priorize as oportunidades das últimas 24 horas. Depois disso, o lead sai de quente; após sete dias, fica frio. A pontuação é recalculada ao abrir e a cada minuto.</p>
    </div>
    <CommercialLeadsPanel />
  </div>;
}
