import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ChatBubble } from './ChatBubble';
import type { Message } from '@/types';

const base: Message = {
  id: 'jota', conversationId: 'conversation', content: 'Qual valor?', sender: 'customer',
  timestamp: '2026-09-30T00:22:42Z', status: 'delivered',
};

describe('received media', () => {
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
