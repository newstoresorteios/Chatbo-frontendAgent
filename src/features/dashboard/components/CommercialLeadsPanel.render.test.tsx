import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CommercialLeadsPanel } from './CommercialLeadsPanel';

vi.mock('@/contexts/NotificationContext', () => ({ useNotification: () => ({ addToast: vi.fn() }) }));
vi.mock('../hooks/useCommercialLeads', async importOriginal => {
  const original = await importOriginal<typeof import('../hooks/useCommercialLeads')>();
  return { ...original, useCommercialLeads: () => ({ data: {
    leads: [{ id: 'contact-old', customerName: 'thi.toffanelli', channel: 'instagram', score: 90,
      label: 'Quente', stage: 'high_intent', stageName: 'Alta intenção de compra', observedStages: ['contact', 'high_intent'],
      evidence: 'Tissot salmão à pronta entrega?', status: 'active', nextAction: 'Encaminhar ao comercial' }],
    stages: { high_intent: 'Alta intenção de compra' }, complete: true,
  }, refetch: vi.fn() }) };
});

describe('commercial lead actions', () => {
  it('renders the customer, evidence, stage counts and actionable handoff controls', () => {
    const html = renderToStaticMarkup(<QueryClientProvider client={new QueryClient()}><MemoryRouter><CommercialLeadsPanel /></MemoryRouter></QueryClientProvider>);
    for (const text of ['thi.toffanelli', 'Assumir', 'Atribuir comercial', 'Abrir conversa', '1 agora', '1 histórico', '90/100', 'conversa=contact-old']) expect(html).toContain(text);
  });
});
