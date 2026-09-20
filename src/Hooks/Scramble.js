import { useEffect, useRef, useState } from "react";

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function randomChar() {
  return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
}

/**
 * Resolves `finalText` left-to-right, scrambling unrevealed characters each
 * tick. While `active` is false it holds a scrambled state, so the reveal
 * plays fresh the next time it's switched on.
 */
export function useScrambleText(
  finalText,
  { active = true, revealDelay = 0, holdMs = 55, idleResolved = false } = {}
) {
  const [display, setDisplay] = useState(() =>
    idleResolved ? finalText : finalText.replace(/\S/g, () => randomChar())
  );
  const revealedRef = useRef(0);

  useEffect(() => {
    if (!active) {
      // idleResolved: sit on the real text when off (buttons at rest).
      // Otherwise sit on noise, so scrolling back re-runs the reveal.
      setDisplay(idleResolved ? finalText : finalText.replace(/\S/g, () => randomChar()));
      return;
    }

    revealedRef.current = 0;
    let tickHandle;

    const tick = () => {
      setDisplay(
        finalText
          .split("")
          .map((ch, i) => {
            if (ch === " ") return " ";
            if (i < revealedRef.current) return finalText[i];
            return randomChar();
          })
          .join("")
      );

      if (Math.random() < 0.6 && revealedRef.current < finalText.length) {
        revealedRef.current += 1;
      }

      if (revealedRef.current >= finalText.length) {
        setDisplay(finalText);
        return;
      }
      tickHandle = setTimeout(tick, holdMs);
    };

    const startTimeout = setTimeout(tick, revealDelay);
    return () => {
      clearTimeout(startTimeout);
      clearTimeout(tickHandle);
    };
  }, [finalText, active, revealDelay, holdMs, idleResolved]);

  return display;
}

/** True whenever the element is in view; flips back out so it can re-fire. */
export function useInView(ref, { threshold = 0.25 } = {}) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return inView;
}