import { useEffect, useRef, useState } from "react";

/**
 * Landing
 * -------
 * Hero where each headline line types in from the left: characters appear
 * one at a time, flicker through random glyphs for a few ticks, then lock
 * to their final letter. All three lines start together and replay each
 * time the hero scrolls back into view.
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
 * Types `finalText` in from the left: each position stays hidden until the
 * cursor reaches it, flickers through random characters for a few ticks,
 * then locks to its final glyph. Returns one entry per character so the
 * caller can keep unrevealed slots in the layout without showing them.
 */
function useScrambleText(
  finalText,
  { active = true, revealDelay = 0, holdMs = 100, trail = 3 } = {}
) {
  const blank = () => finalText.split("").map((ch) => ({ ch, hidden: true }));
  const [slots, setSlots] = useState(blank);

  useEffect(() => {
    if (!active) {
      setSlots(blank());
      return;
    }

    let cursor = 0;
    let tickHandle;

    const tick = () => {
      setSlots(
        finalText.split("").map((ch, i) => {
          if (ch === " ") return { ch: " ", hidden: i >= cursor };
          // Locked in.
          if (i < cursor - trail) return { ch, hidden: false };
          // Inside the flickering window just behind the cursor.
          if (i < cursor) return { ch: randomChar(), hidden: false };
          // Not reached yet.
          return { ch, hidden: true };
        })
      );

      cursor += 1;

      if (cursor > finalText.length + trail) {
        setSlots(finalText.split("").map((ch) => ({ ch, hidden: false })));
        return;
      }
      tickHandle = setTimeout(tick, holdMs);
    };

    const startTimeout = setTimeout(tick, revealDelay);
    return () => {
      clearTimeout(startTimeout);
      clearTimeout(tickHandle);
    };
  }, [finalText, active, revealDelay, holdMs, trail]);

  return slots;
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
  const slots = useScrambleText(text, {
    active,
    revealDelay: delay,
    holdMs: 75,
    trail: 6,
  });  // Each character is its own flex item so the line justifies edge-to-edge.
  // Unrevealed slots use visibility rather than display, so the line keeps
  // its full width from the first frame and nothing shifts as letters land.
  return (
    <span className={`fl-line ${className || ""}`} aria-label={text}>
      {slots.map((slot, i) => (
        <span
          className="fl-glyph"
          key={i}
          aria-hidden="true"
          style={{ visibility: slot.hidden ? "hidden" : "visible" }}
        >
          {slot.ch === " " ? "\u00A0" : slot.ch}
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
        {/* Same delay on all three, so the lines type in together. */}
        <div className="fl-headline" ref={headlineRef}>
          <ScrambleLine text="/ H SN" delay={150} className="fl-line-1" active={inView} />
          <ScrambleLine text="N ZAAN" delay={150} className="fl-line-2" active={inView} />
          <ScrambleLine text="PORTFOLIO" delay={150} className="fl-line-3" active={inView} />
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

          /* Content is vertically centred, so bottom padding lifts it. */
          padding-bottom: 8vh;

          /* The nav used to take ~84px of flow above this block and push it
             down. Now that it's fixed and out of flow, that offset is added
             back here so the hero sits exactly where it did before. */
          margin-top: calc(84px - 4vh);

          /* Cancels the margin-top so the section stays exactly one screen
             tall — the video then fills the screen with no gap below. The
             headline doesn't move; only empty space at the bottom is cut. */
          margin-bottom: calc(-84px + 4vh);
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

        .fl-line-1 { width: 64%; }
        .fl-line-2 { width: 66%; margin-left: auto; }

        /* Positioned against the section, not the hero, so these don't
           follow the hero's padding — they carry their own matching lift. */
        .fl-blurb {
          position: absolute;
          top: 22.5%;
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
          left: calc(var(--fl-gutter) + 0.8%);
          top: 39%;
          font-family: 'f2', 'Segoe UI', sans-serif;
          font-size: 12px;
          line-height: 1.3;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          color: #eaeaea;
        }

        /* Tablet / small laptop: pull the blurb in and let line 1 breathe. */
        @media (max-width: 1024px) {
          .fl-root { --fl-gutter: 3.4%; }
          .fl-blurb { left: 62%; top: 20%; }
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
                margin-bottom: 0;
                padding-top: 0;
                padding-bottom: 6.5vh;
              }

          .fl-headline { row-gap: 1.6vh; }

          /* ~11% larger than before on mobile. */
          .fl-line { font-size: clamp(26px, 14.5vw, 100px); }

          .fl-line-1 { width: 50%; }
          .fl-line-2 { width: 66%; margin-left: auto; }

          /* Line 1 overflows its box at this size, so width changes have no
             effect. Pulling the space after the slash left shifts H SN as a
             block while the slash itself stays put. */
          .fl-line-1 .fl-glyph:nth-child(2) { margin-left: -0.15em; }

          .fl-br-mobile { display: inline; }

          /* Raised to clear the taller line 1. */
          .fl-blurb {
            top: auto;
            bottom: 24vh;
            left: 66%;
            right: var(--fl-gutter);
            max-width: none;
            font-size: 9px;
            line-height: 1.3;
          }

          /* Raised to follow the taller line 2. */
          .fl-credit {
            top: auto;
            bottom: 18vh;
            left: var(--fl-gutter);
            font-size: 7.5px;
            line-height: 1.35;
          }
        }
      `}</style>
    </div>
  );
}