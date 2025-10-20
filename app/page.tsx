"use client";

import { useEffect, useRef } from "react";

// clamp helper
const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

// stable page offsetTop
function getPageOffsetTop(el: HTMLElement) {
  let y = 0;
  let node: HTMLElement | null = el;
  while (node) {
    y += node.offsetTop || 0;
    node = node.offsetParent as HTMLElement | null;
  }
  return y;
}

export default function Page() {
  const rightViewportRef = useRef<HTMLDivElement | null>(null); // sticky viewport (no scroll)
  const rightContentRef = useRef<HTMLDivElement | null>(null);  // tall content (translated)

  useEffect(() => {
    const viewport = rightViewportRef.current;
    const content = rightContentRef.current;
    if (!viewport || !content) return;

    let stickyTop = 0;           // CSS sticky offset (px)
    let viewportTop = 0;         // page Y where the viewport sits
    let anchorY = 0;             // scrollY at which the viewport hits stickyTop
    let viewportH = 0;
    let contentH = 0;
    let maxTranslate = 0;
    let ticking = false;

    const measure = () => {
      // read sticky top from CSS (e.g., top: 52px)
      stickyTop = parseFloat(getComputedStyle(viewport).top || "0") || 0;
      viewportTop = getPageOffsetTop(viewport);
      anchorY = viewportTop - stickyTop; // when scrollY >= anchorY, viewport is stuck
      viewportH = viewport.getBoundingClientRect().height;
      contentH = content.scrollHeight;
      maxTranslate = Math.max(0, contentH - viewportH);
      content.style.willChange = "transform";
      apply(); // re-apply with current scroll
    };

    const apply = () => {
      ticking = false;
      // translate in sync with page once sticky is engaged
      const delta = window.scrollY - anchorY;
      const translate = clamp(delta, 0, maxTranslate);
      content.style.transform = `translateY(-${translate}px)`;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(apply);
      }
    };
    const onResize = () => requestAnimationFrame(measure);

    // initial
    measure();
    apply();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    // observe dynamic size changes
    const ro = new ResizeObserver(() => onResize());
    ro.observe(content);
    ro.observe(viewport);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="min-h-[200dvh] bg-gray-50">
      {/* Fixed header (height ~52px) */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3 text-sm text-gray-600">Header</div>
      </header>

      {/* 3-column layout */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left sidebar */}
          <aside className="col-span-12 md:col-span-3">
            <div className="sticky top-[52px]">
              <div className="h-8 w-40 rounded bg-gray-200" />
              <div className="mt-3 h-28 w-full rounded bg-gray-200" />
              <div className="mt-3 h-12 w-3/4 rounded bg-gray-200" />
              <div className="mt-3 h-48 w-full rounded bg-gray-200" />
              <div className="mt-3 h-20 w-5/6 rounded bg-gray-200" />
            </div>
          </aside>

          {/* Main content (page scroll) */}
          <main className="col-span-12 md:col-span-6">
            <div className="space-y-6">
              <div className="h-56 w-full rounded-xl bg-gray-200" />
              <div className="h-96 w-full rounded-xl bg-gray-200" />
              <div className="h-72 w-full rounded-xl bg-gray-200" />
              <div className="h-[28rem] w-full rounded-xl bg-gray-200" />
              <div className="h-80 w-full rounded-xl bg-gray-200" />
              <div className="h-[32rem] w-full rounded-xl bg-gray-200" />
              <div className="h-64 w-full rounded-xl bg-gray-200" />
              <div className="h-[26rem] w-full rounded-xl bg-gray-200" />
            </div>
          </main>

          {/* Right sidebar: sticky viewport, translated content, no sidebar scrollbar */}
          <aside className="col-span-12 md:col-span-3">
            <div
              ref={rightViewportRef}
              className="sticky top-[52px] h-[calc(100dvh-52px)] overflow-hidden"
            >
              <div ref={rightContentRef} className="space-y-4">
                {/* Tall dummy blocks */}
                <div className="h-24 w-full rounded-lg bg-gray-200" />
                <div className="h-40 w-full rounded-lg bg-gray-200" />
                <div className="h-32 w-full rounded-lg bg-gray-200" />
                <div className="h-56 w-full rounded-lg bg-gray-200" />
                <div className="h-40 w-full rounded-lg bg-gray-200" />
                <div className="h-28 w-full rounded-lg bg-gray-200" />
                <div className="h-48 w-full rounded-lg bg-gray-200" />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}