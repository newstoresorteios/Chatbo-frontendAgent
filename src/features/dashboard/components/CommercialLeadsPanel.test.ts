import { describe, expect, it } from 'vitest';
import { stageCounts, type CommercialLead } from '../hooks/useCommercialLeads';
import { hasBuyingIntent } from '../utils/leadScoring';

describe('commercial mapping', () => {
  it('separates current stages from historical signals without counting messages as customers', () => {
    const leads = [
      { stage: 'post_sale', observedStages: ['contact', 'high_intent', 'post_sale'] },
      { stage: 'high_intent', observedStages: ['contact', 'high_intent'] },
    ] as CommercialLead[];
    expect(stageCounts(leads, 'high_intent')).toEqual({ current: 1, historical: 2 });
    expect(stageCounts(leads, 'closed')).toEqual({ current: 0, historical: 0 });
  });
  it('does not turn shipment inquiries into purchase intent', () => {
    expect(hasBuyingIntent('Meu pedido foi enviado?')).toBe(false);
    expect(hasBuyingIntent('Despachou amigão?')).toBe(false);
    expect(hasBuyingIntent('Tissot salmão a pronta entrega?')).toBe(true);
  });
});
