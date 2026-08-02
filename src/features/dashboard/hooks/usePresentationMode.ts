import { useCallback, useState } from 'react';

export function usePresentationMode() {
  const [presentationMode, setPresentationMode] = useState(false);
  const togglePresentationMode = useCallback(() => setPresentationMode((current) => !current), []);
  return { presentationMode, togglePresentationMode };
}
