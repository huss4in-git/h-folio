import { useEffect, useRef, useState } from "react";

/**
 * Cursor — src/Components/Cursor.jsx
 * A small red dot that replaces the arrow, with a thin ring easing along
 * behind it. Over anything clickable (links, buttons) the ring grows and
 * fills slightly; pressing the mouse shrinks it for a moment.
 *
 * Add it once, in App.jsx, inside <Router> — it then works on every page.
 *
 * - Only on devices with a real mouse or trackpad. Phones and tablets keep
 *   normal tapping and never see it.
 * - Over text fields the normal text cursor comes back, so typing is easy.
 * - The ring uses mix-blend-mode: difference, so it shows on your dark hero
 *   and your light sections alike.
 * - Reduced motion: the ring follows instantly instead of easing.
 */

const CLICKABLE = 'a, button, [role="button"], label, select, summary, .ld-card-head';
const TEXT_FIELD = 'input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"]';

export default function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [enabled, setEnabled] = useState(false);

  // Mouse/trackpad only.
  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setEnabled(query.matches);
    update();
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const root = document.documentElement;
    root.classList.add("has-cursor");

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ease = reduced ? 1 : 0.18;

    let x = -100;
    let y = -100;
    let rx = -100;
    let ry = -100;
    let raf;

    const onMove = (e) => {
      x = e.clientX;
      y = e.clientY;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      const target = e.target instanceof Element ? e.target : null;
      const overText = Boolean(target?.closest(TEXT_FIELD));
      const overLink = !overText && Boolean(target?.closest(CLICKABLE));
      root.classList.toggle("cursor-link", overLink);
      root.classList.toggle("cursor-text", overText);
      root.classList.add("cursor-visible");
    };

    const onLeave = () => root.classList.remove("cursor-visible");
    const onDown = () => root.classList.add("cursor-down");
    const onUp = () => root.classList.remove("cursor-down");

    const loop = () => {
      rx += (x - rx) * ease;
      ry += (y - ry) * ease;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      root.classList.remove("has-cursor", "cursor-visible", "cursor-link", "cursor-text", "cursor-down");
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <span ref={ringRef} className="cu-ring" aria-hidden="true">
        <span className="cu-ring-shape" />
      </span>
      <span ref={dotRef} className="cu-dot" aria-hidden="true">
        <span className="cu-dot-shape" />
      </span>

      <style>{`
        /* Hide the normal arrow everywhere except text fields. */
        html.has-cursor,
        html.has-cursor * { cursor: none !important; }
        html.has-cursor input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"]),
        html.has-cursor textarea,
        html.has-cursor [contenteditable="true"] { cursor: text !important; }

        /* The outer spans only move (transform set from JS); the inner
           shapes do the growing, so the two never fight. */
        .cu-dot,
        .cu-ring {
          position: fixed;
          top: 0;
          left: 0;
          z-index: 2147483000;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.2s ease;
          will-change: transform;
        }

        html.cursor-visible .cu-dot,
        html.cursor-visible .cu-ring { opacity: 1; }

        html.cursor-text .cu-dot,
        html.cursor-text .cu-ring { opacity: 0; }

        .cu-dot-shape {
          position: absolute;
          width: 7px;
          height: 7px;
          margin: -3.5px 0 0 -3.5px;
          border-radius: 50%;
          background: #e5352b;
          transition: transform 0.2s ease;
        }

        .cu-ring { mix-blend-mode: difference; }

        .cu-ring-shape {
          position: absolute;
          width: 34px;
          height: 34px;
          margin: -17px 0 0 -17px;
          border: 1px solid rgba(255, 255, 255, 0.75);
          border-radius: 50%;
          background: rgba(255, 255, 255, 0);
          transition:
            transform 0.3s cubic-bezier(0.2, 0.75, 0.2, 1),
            background-color 0.3s ease,
            border-color 0.3s ease;
        }

        /* Over links and buttons: bigger, softly filled. */
        html.cursor-link .cu-ring-shape {
          transform: scale(1.9);
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.5);
        }

        html.cursor-link .cu-dot-shape { transform: scale(0.7); }

        /* Press feedback. */
        html.cursor-down .cu-ring-shape { transform: scale(0.75); }
        html.cursor-down.cursor-link .cu-ring-shape { transform: scale(1.6); }

        @media (prefers-reduced-motion: reduce) {
          .cu-ring-shape, .cu-dot-shape { transition: none; }
        }
      `}</style>
    </>
  );
}