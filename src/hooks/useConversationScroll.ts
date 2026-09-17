import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { Message } from '@/types';

/** Follow the latest message until the operator deliberately reads older history. */
export function useConversationScroll(conversationId: string | null, messages: Message[], ready: boolean) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const currentIdRef = useRef<string | null>(null);
  const followingRef = useRef(true);
  const openingRef = useRef(true);
  const prependRef = useRef<{ top: number; height: number } | null>(null);
  const geometryRef = useRef({ height: 0, viewportHeight: 0, width: 0 });
  const [showLatestButton, setShowLatestButton] = useState(false);

  const rememberGeometry = useCallback((viewport: HTMLDivElement) => {
    geometryRef.current = { height: viewport.scrollHeight, viewportHeight: viewport.clientHeight, width: viewport.clientWidth };
  }, []);

  const scrollToLatest = useCallback(() => {
    followingRef.current = true;
    prependRef.current = null;
    setShowLatestButton(false);
    const viewport = viewportRef.current;
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
      rememberGeometry(viewport);
    }
  }, [rememberGeometry]);

  useLayoutEffect(() => {
    currentIdRef.current = conversationId;
    followingRef.current = true;
    openingRef.current = true;
    prependRef.current = null;
    setShowLatestButton(false);
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return;

    // Images, fonts and expanding the inbox can change heights after the first render.
    const observer = new ResizeObserver(() => {
      if (followingRef.current) viewport.scrollTop = viewport.scrollHeight;
      rememberGeometry(viewport);
    });
    observer.observe(viewport);
    observer.observe(content);
    return () => {
      observer.disconnect();
      currentIdRef.current = null;
    };
  }, [conversationId, rememberGeometry]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !ready) return;
    const anchor = prependRef.current;
    if (anchor) {
      viewport.scrollTop = anchor.top + viewport.scrollHeight - anchor.height;
      rememberGeometry(viewport);
      prependRef.current = null;
    } else if (openingRef.current || followingRef.current) {
      scrollToLatest();
    }
    // Do not consume the initial scroll while the request is still loading.
    openingRef.current = false;
  }, [conversationId, messages, ready, scrollToLatest, rememberGeometry]);

  const onScroll = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport || openingRef.current || prependRef.current) return;
    const previous = geometryRef.current;
    if (viewport.scrollHeight !== previous.height || viewport.clientHeight !== previous.viewportHeight
      || viewport.clientWidth !== previous.width) {
      // A resize can dispatch scroll before ResizeObserver; it is not a request to read history.
      if (followingRef.current) viewport.scrollTop = viewport.scrollHeight;
      rememberGeometry(viewport);
      return;
    }
    const nearBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 80;
    followingRef.current = nearBottom;
    setShowLatestButton(!nearBottom);
  }, [rememberGeometry]);

  const preserveHistoryPosition = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    followingRef.current = false;
    prependRef.current = { top: viewport.scrollTop, height: viewport.scrollHeight };
    setShowLatestButton(true);
  }, []);

  const isCurrentConversation = useCallback((id: string) => currentIdRef.current === id, []);
  return { viewportRef, contentRef, onScroll, scrollToLatest, showLatestButton, preserveHistoryPosition, isCurrentConversation };
}
