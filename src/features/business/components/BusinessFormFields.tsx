import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { cn } from '@/utils';
import type { BusinessProfileDraft } from '@/features/business/types';

interface BusinessFormProps {
  value: BusinessProfileDraft;
  onChange: (value: BusinessProfileDraft) => void;
  disabled?: boolean;
}

function setField<K extends keyof BusinessProfileDraft>(
  value: BusinessProfileDraft,
  key: K,
  fieldValue: BusinessProfileDraft[K],
): BusinessProfileDraft {
  return { ...value, [key]: fieldValue };
}

function CheckboxField({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex min-h-11 items-center gap-3 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-200">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        disabled={disabled}
        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
      />
      <span>{label}</span>
    </label>
  );
}

export function BusinessIdentityForm({ value, onChange, disabled }: BusinessFormProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Input label="Nome empresarial" value={value.name} onChange={(event) => onChange(setField(value, 'name', event.target.value))} disabled={disabled} />
      <Input label="Nome da marca" value={value.brandName ?? ''} onChange={(event) => onChange(setField(value, 'brandName', event.target.value))} disabled={disabled} />
      <Input label="Segmento" value={value.segment ?? ''} onChange={(event) => onChange(setField(value, 'segment', event.target.value))} disabled={disabled} />
      <Input label="Site" value={value.website ?? ''} onChange={(event) => onChange(setField(value, 'website', event.target.value))} disabled={disabled} />
      <Input label="País" value={value.country ?? ''} onChange={(event) => onChange(setField(value, 'country', event.target.value))} disabled={disabled} />
      <Input label="Moeda" value={value.currency ?? ''} onChange={(event) => onChange(setField(value, 'currency', event.target.value))} disabled={disabled} />
      <Select
        label="Modelo de vendas"
        value={value.salesModel ?? ''}
        onChange={(event) => onChange(setField(value, 'salesModel', event.target.value as BusinessProfileDraft['salesModel']))}
        disabled={disabled}
        options={[
          { value: '', label: 'Não configurado' },
          { value: 'b2b', label: 'B2B' },
          { value: 'b2c', label: 'B2C' },
          { value: 'mixed', label: 'Misto' },
        ]}
      />
    </div>
  );
}

export function BusinessOperationForm({ value, onChange, disabled }: BusinessFormProps) {
  const channels = value.salesChannels ?? [];
  const toggleChannel = (channel: string, checked: boolean) => {
    onChange({
      ...value,
      salesChannels: checked ? [...channels, channel] : channels.filter((item) => item !== channel),
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Canais utilizados</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {['WhatsApp', 'E-commerce', 'Loja física', 'Vendas consultivas'].map((channel) => (
            <CheckboxField
              key={channel}
              label={channel}
              checked={channels.includes(channel)}
              onChange={(checked) => toggleChannel(channel, checked)}
              disabled={disabled}
            />
          ))}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <CheckboxField label="Atendimento por WhatsApp" checked={Boolean(value.whatsappSupport)} onChange={(checked) => onChange(setField(value, 'whatsappSupport', checked))} disabled={disabled} />
        <CheckboxField label="E-commerce" checked={Boolean(value.ecommerce)} onChange={(checked) => onChange(setField(value, 'ecommerce', checked))} disabled={disabled} />
        <CheckboxField label="Loja física" checked={Boolean(value.physicalStore)} onChange={(checked) => onChange(setField(value, 'physicalStore', checked))} disabled={disabled} />
        <CheckboxField label="Vendas consultivas" checked={Boolean(value.consultativeSales)} onChange={(checked) => onChange(setField(value, 'consultativeSales', checked))} disabled={disabled} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Horário de atendimento" value={value.businessHours ?? ''} onChange={(event) => onChange(setField(value, 'businessHours', event.target.value))} disabled={disabled} />
        <Input label="Contato principal" value={value.primaryContact ?? ''} onChange={(event) => onChange(setField(value, 'primaryContact', event.target.value))} disabled={disabled} />
      </div>
    </div>
  );
}

export function BusinessAgentConfigForm({ value, onChange, disabled }: BusinessFormProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Input label="Nome visível do agente" value={value.agentDisplayName ?? ''} onChange={(event) => onChange(setField(value, 'agentDisplayName', event.target.value))} disabled={disabled} />
      <Input label="Função principal" value={value.agentMainRole ?? ''} onChange={(event) => onChange(setField(value, 'agentMainRole', event.target.value))} disabled={disabled} />
      <Input label="Idioma" value={value.agentLanguage ?? ''} onChange={(event) => onChange(setField(value, 'agentLanguage', event.target.value))} disabled={disabled} />
      <Input label="Canal principal" value={value.agentMainChannel ?? ''} onChange={(event) => onChange(setField(value, 'agentMainChannel', event.target.value))} disabled={disabled} />
      <div className="md:col-span-2">
        <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Status de configuração</p>
        <Badge variant={value.agentConfigurationStatus === 'configured' ? 'success' : value.agentConfigurationStatus === 'draft' ? 'warning' : 'default'}>
          {value.agentConfigurationStatus === 'configured' ? 'Configurado' : value.agentConfigurationStatus === 'draft' ? 'Rascunho' : 'Não configurado'}
        </Badge>
      </div>
    </div>
  );
}

export function PersistenceNotice({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200', className)}>
      Este ambiente já está preparado. A persistência completa dos dados empresariais depende da próxima atualização do backend.
    </div>
  );
}
