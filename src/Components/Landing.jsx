import { useEffect, useRef, useState } from "react";

/**
 * Landing
 * -------
 * Hero where each headline line stacks in with a "scramble/decode" text
 * effect: every character starts random and resolves left-to-right into its
 * final word. Replays each time the hero scrolls back into view.
 *
 * Pass your own clip via `videoSrc` (defaults to "/background.mp4", so drop
 * a file at that path in public/, or pass a full URL). `posterSrc` shows
 * while the video buffers.
 *
 * Fonts 'f1' (display) and 'f2' (sans) are expected to be registered
 * globally in index.css.
 *
 * The nav lives in its own fixed-position component and is no longer part
 * of this file.
 */

const SCRAMBLE_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#*/+=-<>[]{}@%$&";
function randomChar() {
  return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
}

/**
 * Reveals `finalText` left-to-right, scrambling unrevealed characters each
 * tick. While `active` is false it holds a scrambled state, so the reveal
 * plays fresh the next time the block enters the viewport.
 */
function useScrambleText(finalText, { active = true, revealDelay = 0, holdMs = 90 } = {}) {
  const [display, setDisplay] = useState(() =>
    finalText.replace(/\S/g, () => randomChar())
  );
  const revealedRef = useRef(0);

  useEffect(() => {
    if (!active) {
      // Reset to noise while off-screen so the next entry re-runs visibly.
      setDisplay(finalText.replace(/\S/g, () => randomChar()));
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

      // Reveal roughly one more character each tick while still scrambling
      // the rest, so it reads as a decode rather than a typewriter.
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
  }, [finalText, active, revealDelay, holdMs]);

  return display;
}

/** True whenever the element is in view; flips back out so it can re-fire. */
function useInView(ref, { threshold = 0.25 } = {}) {
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

function ScrambleLine({ text, delay = 0, className, active = true }) {
  const value = useScrambleText(text, { active, revealDelay: delay, holdMs: 55 });
  // Each character is its own flex item so the line justifies edge-to-edge,
  // the way the display type is set in the reference. A space becomes an
  // empty slot, producing the wider gap between letter groups.
  return (
    <span className={`fl-line ${className || ""}`}>
      {value.split("").map((ch, i) => (
        <span className="fl-glyph" key={i}>
          {ch === " " ? "\u00A0" : ch}
        </span>
      ))}
    </span>
  );
}

function CyclingWord({ words, interval = 2200, className }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % words.length);
        setVisible(true);
      }, 280); // keep in sync with the CSS transition duration below
    }, interval);
    return () => clearInterval(id);
  }, [words, interval]);

  return (
    <span className={`fl-cycle-word ${visible ? "is-visible" : ""} ${className || ""}`}>
      {words[index]}
    </span>
  );
}

export default function Landing({ videoSrc = "/background.mp4", posterSrc }) {
  const headlineRef = useRef(null);
  const inView = useInView(headlineRef);

  return (
    <div className="fl-root">
      <video
        className="fl-backdrop-video"
        src={videoSrc}
        poster={posterSrc}
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
      />
      <div className="fl-scrim" aria-hidden="true" />

      <main className="fl-hero">
        <div className="fl-headline" ref={headlineRef}>
          <ScrambleLine text="/ H SN" delay={150} className="fl-line-1" active={inView} />
          <ScrambleLine text="N ZAAN" delay={450} className="fl-line-2" active={inView} />
          <ScrambleLine text="PORTFOLIO" delay={750} className="fl-line-3" active={inView} />
        </div>

        <p className="fl-blurb">
          Web Developer with
          
          decent taste working
          <br />
          across <CyclingWord words={["design", "concept", "motion"]} />
        </p>

        <p className="fl-credit">
          Hussain Nizaan
          <br />
          Portfolio 2026 ©
        </p>
      </main>

      <style>{`
        .fl-root {
          position: relative;
          min-height: 100vh;
          width: 100%;
          overflow: hidden;
          background: #3a3c3f;
          font-family: 'f1', 'Segoe UI', sans-serif;
          color: #f3f3f1;

          /* Single source of truth for the page gutter — used by the
             headline, the credit and the blurb so all three stay aligned. */
          --fl-gutter: 2.7%;

          /* Optical edge correction. The display font's rounded terminals
             sit inside the glyph box by different amounts left and right,
             so box-aligned text reads as if the right margin is tighter.
             More negative = first glyph moves left; more positive = last
             glyph moves right (wider right margin). */
          --fl-edge-l: -0.055em;
          --fl-edge-r: 0.045em;
        }

        .fl-root *, .fl-root *::before, .fl-root *::after {
          box-sizing: border-box;
        }

        .fl-backdrop-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: blur(1.5px) saturate(0.9);
          transform: scale(1.03);
          background: #3a3c3f; /* shows while the video loads */
        }

        .fl-scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.25) 100%);
        }

        .fl-hero {
          position: relative;
          z-index: 2;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding-left: var(--fl-gutter);
          padding-right: var(--fl-gutter);

          /* The nav used to take ~84px of flow above this block and push it
             down. Now that it's fixed and out of flow, that offset is added
             back here so the hero sits exactly where it did before. */
          margin-top: calc(84px - 4vh);
        }

        .fl-headline {
          display: flex;
          flex-direction: column;
        }

        /* Cap height in the reference measures ~132px on a 1210px-wide
           viewport, putting the em size near 15.5vw. The vh term keeps all
           three lines on screen on short/wide displays, where 15.5vw would
           overflow vertically. line-height 0.92 reproduces the ~175px
           baseline-to-baseline spacing. */
        .fl-line {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          font-size: clamp(34px, min(15.5vw, 24.5vh), 240px);
          line-height: 0.92;
          font-weight: 500;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .fl-glyph { display: inline-block; flex: 0 0 auto; }
        .fl-glyph:first-child { margin-left: var(--fl-edge-l); }
        .fl-glyph:last-child { margin-right: var(--fl-edge-r); }

        /* Line 1 stops short of the right edge so the blurb sits beside it.
           Line 2 is indented from the left, leaving the empty column the
           credit text occupies. */
        .fl-line-1 { width: 64%; }
        .fl-line-2 { width: 66%; margin-left: auto; }

        .fl-blurb {
          position: absolute;
          top: 26.5%;
          left: 69.4%;
          right: var(--fl-gutter);
          max-width: 24ch;
          text-align: left;
          font-family: 'f2', 'Segoe UI', sans-serif;
          font-size: clamp(14px, 1.65vw, 20px);
          line-height: 1.18;
          letter-spacing: 0.01em;
          text-transform: uppercase;
          color: #f0f0ee;
        }

        /* Extra break that only applies below 720px — collapses to nothing
           on desktop, so the blurb keeps its two-line setting there. */
        .fl-br-mobile { display: none; }

        .fl-cycle-word {
          display: inline-block;
          opacity: 0;
          transform: translateY(6px);
          transition: opacity 0.28s ease, transform 0.28s ease;
        }
        .fl-cycle-word.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .fl-credit {
          position: absolute;
          z-index: 4;
          left: var(--fl-gutter);
          top: 43%;
          font-family: 'f2', 'Segoe UI', sans-serif;
          font-size: 11px;
          line-height: 1.3;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          color: #eaeaea;
        }

        /* Tablet / small laptop: pull the blurb in and let line 1 breathe. */
        @media (max-width: 1024px) {
          .fl-root { --fl-gutter: 3.4%; }
          .fl-blurb { left: 62%; top: 24%; }
          .fl-line-1 { width: 58%; }
        }

        /* Reference caps the whole hero at ~78vh rather than a full screen —
           the About section's top edge is visible without scrolling. The
           video fills that shorter hero, so it needs no separate height. */
        @media (max-width: 720px) {
            .fl-root {
                --fl-gutter: 5%;
                min-height: 86vh;
              }
              
              .fl-hero {
                min-height: 86vh;
                justify-content: flex-end;
                margin-top: 0;
                padding-top: 0;
                padding-bottom: 6.5vh;
              }

          .fl-headline { row-gap: 1.6vh; }

          .fl-line { font-size: clamp(24px, 13vw, 90px); }

          .fl-line-1 { width: 50%; }
          .fl-line-2 { width: 66%; margin-left: auto; }

          .fl-br-mobile { display: inline; }

          .fl-blurb {
            top: auto;
            bottom: 21vh;
            left: 66%;
            right: var(--fl-gutter);
            max-width: none;
            font-size: 9px;
            line-height: 1.3;
          }

          .fl-credit {
            top: auto;
            bottom: 16vh;
            left: var(--fl-gutter);
            font-size: 7.5px;
            line-height: 1.35;
          }
        }
      `}</style>
    </div>
  );
}