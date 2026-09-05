import { useLayoutEffect, useRef, type RefObject } from 'react';

/** One dialog lifecycle for cart, filters and gallery: focus, inert siblings and scroll. */
export function useStoreDialog(open: boolean, panel: RefObject<HTMLElement | null>, close: () => void) {
  const closeRef = useRef(close);
  closeRef.current = close;
  useLayoutEffect(() => {
    if (!open || !panel.current) return;
    const restore = document.activeElement;
    const overflow = document.body.style.overflow;
    const inertNodes: { node: HTMLElement; inert: boolean }[] = [];
    let branch: HTMLElement | null = panel.current;
    while (branch && branch !== document.body) {
      const parent: HTMLElement | null = branch.parentElement;
      if (!parent) break;
      for (const sibling of parent.children) if (sibling instanceof HTMLElement && sibling !== branch && !sibling.classList.contains('store-drawer-backdrop')) { inertNodes.push({ node: sibling, inert: sibling.inert }); sibling.inert = true; }
      branch = parent;
    }
    document.body.style.overflow = 'hidden';
    panel.current.focus({ preventScroll: true });
    const frame = requestAnimationFrame(() => {
      const current = panel.current;
      if (current && !current.contains(document.activeElement)) current.focus({ preventScroll: true });
    });
    const onFocusIn = (event: FocusEvent) => {
      const current = panel.current;
      if (!current || current.contains(event.target as Node)) return;
      current.focus({ preventScroll: true });
    };
    document.addEventListener('focusin', onFocusIn);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); closeRef.current(); }
      if (event.key !== 'Tab') return;
      const items = [...(panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), [tabindex="0"]') ?? [])].filter((item) => item.getClientRects().length > 0);
      const first = items[0]; const last = items.at(-1);
      if (!first) { event.preventDefault(); panel.current?.focus(); }
      else if (event.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === panel.current)) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => { cancelAnimationFrame(frame); document.removeEventListener('focusin', onFocusIn); document.removeEventListener('keydown', onKey); document.body.style.overflow = overflow; inertNodes.forEach(({ node, inert }) => { node.inert = inert; }); if (restore instanceof HTMLElement && restore.isConnected) restore.focus(); };
  }, [open, panel]);
}
