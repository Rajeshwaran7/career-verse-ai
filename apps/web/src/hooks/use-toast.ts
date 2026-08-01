'use client';

import { useState, useEffect, useCallback } from 'react';

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
}

interface ToastItem extends ToastOptions {
  id: string;
  open: boolean;
}

const toastState: { toasts: ToastItem[]; listeners: Set<() => void> } = {
  toasts: [],
  listeners: new Set(),
};

function notify() {
  toastState.listeners.forEach((l) => l());
}

export function toast(options: ToastOptions) {
  const id = Math.random().toString(36).slice(2);
  const item: ToastItem = { ...options, id, open: true };
  toastState.toasts = [item, ...toastState.toasts].slice(0, 5);
  notify();

  setTimeout(() => {
    toastState.toasts = toastState.toasts.map((t) =>
      t.id === id ? { ...t, open: false } : t,
    );
    notify();
    setTimeout(() => {
      toastState.toasts = toastState.toasts.filter((t) => t.id !== id);
      notify();
    }, 300);
  }, options.duration || 4000);
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>(toastState.toasts);

  useEffect(() => {
    const listener = () => setToasts([...toastState.toasts]);
    toastState.listeners.add(listener);
    return () => { toastState.listeners.delete(listener); };
  }, []);

  return { toasts, toast };
}
