import { createContext, useCallback, useContext, useState } from 'react';

/**
 * Replaces the PHP session flash messages (setFlash/getFlash/renderFlash).
 * A message is pushed after a successful save or a failed action, shown at
 * the top of the layout, and auto-dismissed after 5 seconds - the same
 * behaviour the original assets/js/app.js gave the server-rendered alerts.
 */
const FlashContext = createContext(null);

export function FlashProvider({ children }) {
  const [messages, setMessages] = useState([]);

  const dismiss = useCallback((id) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const flash = useCallback(
    (type, text) => {
      const id = Date.now() + Math.random();
      setMessages((prev) => [...prev, { id, type, text }]);
      setTimeout(() => dismiss(id), 5000);
    },
    [dismiss]
  );

  const value = {
    messages,
    dismiss,
    flashSuccess: (text) => flash('success', text),
    flashError: (text) => flash('danger', text),
    flashWarning: (text) => flash('warning', text),
  };

  return <FlashContext.Provider value={value}>{children}</FlashContext.Provider>;
}

export function useFlash() {
  const ctx = useContext(FlashContext);
  if (!ctx) throw new Error('useFlash must be used inside FlashProvider');
  return ctx;
}
