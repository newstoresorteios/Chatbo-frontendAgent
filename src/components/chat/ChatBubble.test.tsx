import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ChatBubble } from './ChatBubble';
import type { Message } from '@/types';

const base: Message = {
  id: 'jota', conversationId: 'conversation', content: 'Qual valor?', sender: 'customer',
  timestamp: '2026-09-30T00:22:42Z', status: 'delivered',
};

describe('received media', () => {
  it('shows the internal factual handoff brief beside the message without changing customer content', () => {
    const content = 'Vou encaminhar seu atendimento.';
    const html = renderToStaticMarkup(<ChatBubble message={{ ...base, content, sender: 'ai', handoffSummary: {
      version: 1, consent: { confirmed: true }, objective: 'find', constraints: { occasion: 'casamento', budget_max: 5000 },
      pending_action: 'awaiting_shipping_zipcode', pending_question: 'Qual é o CEP?',
    } }} />);
    expect(html).toContain('Resumo para atendimento');
    expect(html).toContain('casamento');
    expect(html).toContain('Obter o CEP para consultar o frete');
    expect(html).toContain(content);
  });
  it('does not show an unconfirmed handoff as an authorized transfer', () => {
    const html = renderToStaticMarkup(<ChatBubble message={{ ...base, sender: 'ai', handoffSummary: { version: 1, consent: { confirmed: false } } }} />);
    expect(html).not.toContain('Encaminhamento autorizado');
  });
  it('shows a playable story video together with the customer question', () => {
    const html = renderToStaticMarkup(<ChatBubble message={{ ...base, mediaType: 'video', mediaUrl: 'https://example.com/story.mp4' }} />);
    expect(html).toContain('<video');
    expect(html).toContain('controls');
    expect(html).toContain('Qual valor?');
  });
  it('shows an image that can be opened at full size', () => {
    const html = renderToStaticMarkup(<ChatBubble message={{ ...base, mediaType: 'image', mediaUrl: 'https://example.com/photo.jpg' }} />);
    expect(html).toContain('<img');
    expect(html).toContain('aria-label="Abrir imagem"');
    expect(html).toContain('Qual valor?');
  });
  it('makes missing media explicit instead of hiding it', () => {
    const html = renderToStaticMarkup(<ChatBubble message={{ ...base, mediaType: 'image' }} />);
    expect(html).toContain('Anexo indisponível ou expirado');
  });
});
