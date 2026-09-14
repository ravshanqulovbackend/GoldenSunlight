"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/** Progress chizig'i "tugadi" animatsiyasining davomiyligi (ms). */
const DONE_MS = 400;
/** Navigatsiya bekor bo'lsa chiziq abadiy osilib qolmasligi uchun chegara (ms). */
const SAFETY_MS = 8000;

/**
 * Sahifalar orasida o'tishda ekranning eng tepasida ingichka progress chizig'i.
 *
 * Navigatsiya BOSHLANGANINI aniqlash uchun hujjat darajasidagi `click`
 * tinglanadi (Next.js App Router global "navigation start" hodisasini bermaydi),
 * tugaganini esa `usePathname()` o'zgarishi bildiradi.
 *
 * Chiziq holati React state'da emas, to'g'ridan-to'g'ri DOM'da boshqariladi —
 * bu sof vizual effekt bo'lib, uni state qilish har bir navigatsiyada butun
 * ilova daraxtini qayta render qilishga majbur qilardi.
 */
export function RouteProgress() {
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    const timers = timersRef.current;

    function clearTimers() {
      for (const id of timers) window.clearTimeout(id);
      timers.length = 0;
    }

    function start() {
      const bar = barRef.current;
      if (!bar || activeRef.current) return;
      activeRef.current = true;
      clearTimers();
      bar.style.opacity = "1";
      bar.style.animation = "gs-progress 6s var(--ease-soft) forwards";
      timers.push(window.setTimeout(stop, SAFETY_MS));
    }

    function stop() {
      const bar = barRef.current;
      if (!bar || !activeRef.current) return;
      activeRef.current = false;
      clearTimers();
      bar.style.animation = `gs-progress-done ${DONE_MS}ms var(--ease-soft) forwards`;
      timers.push(
        window.setTimeout(() => {
          bar.style.opacity = "0";
          bar.style.animation = "";
        }, DONE_MS)
      );
    }

    function handleClick(event: MouseEvent) {
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as HTMLElement | null)?.closest?.("a[href]") as
        | HTMLAnchorElement
        | null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      // Bir xil manzil (yoki faqat #hash) — hech qanday yuklash bo'lmaydi.
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      start();
    }

    // Yangi `pathname` bilan qayta ishga tushgan effekt = navigatsiya tugadi.
    stop();

    // CAPTURE fazasi muhim: Next.js'ning `Link`i klik'ni ushlab, client-side
    // navigatsiya uchun `preventDefault()` qiladi. Bubble fazasida tinglasak,
    // bizgacha yetib kelgan hodisa allaqachon `defaultPrevented` bo'lib qoladi
    // va progress chizig'i hech qachon ishga tushmasdi.
    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
      clearTimers();
    };
  }, [pathname]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[110] h-0.5 overflow-hidden">
      <div
        ref={barRef}
        style={{ opacity: 0 }}
        className="h-full w-full bg-gradient-to-r from-primary via-secondary to-tertiary"
      />
    </div>
  );
}
