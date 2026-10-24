"use client";

import React, { useEffect } from "react";

/**
 * Remembers the widest label width ever measured for each form container.
 * Prevents label columns from shrinking when a tab containing the widest
 * label unmounts (tab switch) — the width only grows, never jumps around.
 */
const formMaxLabelWidths = new WeakMap<HTMLElement, number>();

/**
 * Form-wide label alignment (Form-Widest-Label method)
 * ---------------------------------------------------
 * Measures the WIDEST label across the ENTIRE form (top fields, bands,
 * bottom tabs, ...) and applies that single width to every horizontal
 * label inside the form, so all input fields align vertically with the
 * widest label of the form (fields above/below each other share the
 * same label column width).
 *
 * - Vertical labels (label stacked above the input, e.g. descriptions)
 *   are excluded from both measuring and fixing.
 * - Hidden labels (inactive tabs) are not measurable; alignment
 *   automatically re-runs (via MutationObserver) when they become visible.
 * - Re-runs on: mount, field/tab changes, DOM mutations, window resize
 *   and after web-fonts load.
 * - Writes made by this hook (inline style on .form-label-container)
 *   are filtered out of the observer to prevent feedback loops.
 */
export function useFormLabelAlignment(formRef: React.RefObject<HTMLElement | null>, deps: any[] = []) {
  useEffect(() => {
    const getRoot = (): HTMLElement | null => {
      const el = formRef.current;
      if (!el) return null;
      // Always align against the whole form, even if a sub-section ref is passed
      return (el.closest(".form-container") as HTMLElement) || el;
    };

    const isHorizontalLabel = (el: HTMLElement): boolean => {
      // skip labels stacked above their input (vertical layout / descriptions)
      if (el.classList.contains("form-label-vertical")) return false;
      const row = el.parentElement;
      if (row && getComputedStyle(row).flexDirection === "column") return false;
      return true;
    };

    const isVisible = (el: HTMLElement): boolean =>
      !!(el.offsetParent || el.getClientRects().length);

    // canvas context used to measure hidden (display:none) labels
    let measureCtx: CanvasRenderingContext2D | null | undefined;

    const naturalWidth = (el: HTMLElement): number => {
      if (isVisible(el)) {
        // visible: temporarily free the inline width and measure real layout
        el.style.width = "auto";
        el.style.minWidth = "0px";
        return el.getBoundingClientRect().width;
      }
      // hidden labels (e.g. inactive tabs) cannot be laid out; measure the
      // text with the canvas 2D API using the label's own font + padding
      try {
        if (measureCtx === undefined) {
          measureCtx = document.createElement("canvas").getContext("2d");
        }
        const ctx = measureCtx;
        if (!ctx) return 0;
        const cs = getComputedStyle(el);
        ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        const text = (el.textContent || "").trim();
        const extra =
          parseFloat(cs.paddingLeft || "0") +
          parseFloat(cs.paddingRight || "0") +
          parseFloat(cs.borderLeftWidth || "0") +
          parseFloat(cs.borderRightWidth || "0");
        return ctx.measureText(text).width + extra;
      } catch {
        return 0;
      }
    };

    let rafId: number | null = null;

    const alignLabels = () => {
      const root = getRoot();
      if (!root) return;

      const allLabels = Array.from(root.querySelectorAll<HTMLElement>(".form-label-container"));
      if (allLabels.length === 0) return;

      const horizontal = allLabels.filter(isHorizontalLabel);
      if (horizontal.length === 0) return;

      // measure the natural width of EVERY horizontal label (visible + hidden)
      let measuredMax = 0;
      horizontal.forEach((el) => {
        if (!el.textContent?.trim()) return;
        measuredMax = Math.max(measuredMax, naturalWidth(el));
      });

      // never shrink within the same form instance: if the widest label lives
      // in a tab that is currently unmounted, keep the already-applied width
      const prevMax = formMaxLabelWidths.get(root) || 0;
      const maxWidth = Math.max(measuredMax, prevMax);

      if (maxWidth <= 0) return;
      formMaxLabelWidths.set(root, maxWidth);

      const width = `${Math.ceil(maxWidth)}px`;

      // apply the single form-wide width to EVERY horizontal label
      // (including currently hidden ones, so tab switches stay aligned)
      horizontal.forEach((el) => {
        el.style.width = width;
        el.style.minWidth = width;
      });
    };

    const schedule = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        alignLabels();
      });
    };

    alignLabels();
    const t1 = setTimeout(alignLabels, 80);
    const t2 = setTimeout(alignLabels, 300);
    const fonts = (typeof document !== "undefined" ? (document as any).fonts : null);
    if (fonts?.ready?.then) {
      fonts.ready.then(() => alignLabels()).catch(() => {});
    }

    // re-run when fields appear/disappear, tabs switch or layout mutates
    const rootEl = getRoot();
    let observer: MutationObserver | null = null;
    if (rootEl) {
      observer = new MutationObserver((mutations) => {
        // ignore mutations caused by this hook's own style writes on labels
        const relevant = mutations.some((m) => {
          if (
            m.type === "attributes" &&
            m.attributeName === "style" &&
            (m.target as HTMLElement)?.classList?.contains("form-label-container")
          ) {
            return false;
          }
          return true;
        });
        if (relevant) schedule();
      });
      observer.observe(rootEl, { childList: true, subtree: true, attributes: true });
    }

    window.addEventListener("resize", schedule);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", schedule);
      if (rafId !== null) cancelAnimationFrame(rafId);
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
