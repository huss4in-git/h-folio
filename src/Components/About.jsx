/**
 * AboutSection — src/Components/About.jsx
 * Fonts: 'f1' (display — wordmark, stat numerals), 'f2' (intro paragraph,
 * tags), 'f3' (small labels: intro, experience, captions, read more,
 * show all). All registered globally in index.css.
 *
 * Sizes and spacing below are measured off the reference at a 2560px-wide
 * viewport, then expressed in vw so the whole block scales as one unit.
 *
 * The wordmark types in from the left each time the section scrolls into
 * view, matching the hero.
 */

import { Fragment, useEffect, useRef, useState } from "react";

const DEFAULT_STATS = [
  { value: "003", caption: "/yrs - designer" },
  { value: "003", caption: "/yrs - developer" },
  { value: "006", caption: "/yrs - editor" },
];

const DEFAULT_TAGS = ["Web Designer", "Web Developer", "UX/UI"];

/* Explicit line breaks — a ch-based max-width shifts with the clamped
   font size, so it gave 3 lines on a wide display and 4 on a laptop. */
const DEFAULT_INTRO = [
  "I'm at my best when I get to stay close to the craft,",
  "combining a strategic view with hands-on",
  "execution.",
];

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
  { active = true, revealDelay = 0, holdMs = 75, trail = 6 } = {}
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

function ArrowIcon() {
  return (
    <svg
      className="ab-arrow"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 17 L17 7" />
      <path d="M8.5 7 H17 V15.5" />
    </svg>
  );
}

function Dot() {
  return <span className="ab-dot" aria-hidden="true" />;
}

export default function AboutSection({
  wordmark = "/ ABT",
  intro = DEFAULT_INTRO,
  tags = DEFAULT_TAGS,
  stats = DEFAULT_STATS,
  statsLabel = "Experience",
  onReadMore,
  onShowAll,
}) {
  const introLines = Array.isArray(intro) ? intro : [intro];
  const wordmarkRef = useRef(null);
  const inView = useInView(wordmarkRef);
  const slots = useScrambleText(wordmark, { active: inView, revealDelay: 120 });

  return (
    <section className="ab-root">
      <div className="ab-grid">
        <div className="ab-rail">
          <span className="ab-label ab-label-lg">
            <Dot />
            Intro
          </span>
        </div>

        <div className="ab-main">
          <div className="ab-head">
            {/* aria-label carries the real text, since the visible
                characters are mid-scramble for the first second. */}
            <span className="ab-wordmark" ref={wordmarkRef} aria-label={wordmark}>
              {slots.map((slot, i) => (
                <span
                  className="ab-glyph"
                  key={i}
                  aria-hidden="true"
                  style={{ visibility: slot.hidden ? "hidden" : "visible" }}
                >
                  {slot.ch === " " ? "\u00A0" : slot.ch}
                </span>
              ))}
            </span>

            <div className="ab-intro">
              <p className="ab-intro-text">
                {introLines.map((line, i) => (
                  <Fragment key={i}>
                    {line}
                    {i < introLines.length - 1 && " "}
                    {i < introLines.length - 1 && <br />}
                  </Fragment>
                ))}
              </p>
              <ul className="ab-tags">
                {tags.map((tag) => (
                  <li className="ab-tag" key={tag}>
                    {tag}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="ab-rule" />

          <div className="ab-stats">
            <span className="ab-label">
              <Dot />
              {statsLabel}
            </span>
            <div className="ab-stats-cells">
              {stats.map((stat) => (
                <div className="ab-stat" key={stat.value + stat.caption}>
                  <span className="ab-stat-value">{stat.value}</span>
                  <span className="ab-stat-caption">{stat.caption}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="ab-rule" />

          <button type="button" className="ab-readmore" onClick={onReadMore}>
            Read more
            <ArrowIcon />
          </button>
        </div>
      </div>

      <div className="ab-footer">
        <span className="ab-label ab-label-lg">
          <Dot />
          Select work
        </span>
        <button type="button" className="ab-showall" onClick={onShowAll}>
          Show all
          <ArrowIcon />
        </button>
      </div>

      <style>{`
        .ab-root {
          --ab-gutter: 1.56%;
          --ab-accent: #e5352b;

          --ab-body: #2b2b2b;    /* intro paragraph, tag text */
          --ab-display: #3c3c3c; /* wordmark, stat numerals */
          --ab-label: #8e8e8e;   /* section labels, read more, show all */
          --ab-caption: #9c9c9c; /* stat captions */
          --ab-rule: #d2d2cf;

          position: relative;
          min-height: 50vh;
          display: flex;
          flex-direction: column;
          padding: clamp(48px, 6.3vw, 160px) var(--ab-gutter) 0;
          background: #f3f3f1;
          font-family: 'f1', 'Segoe UI', sans-serif;
          letter-spacing: normal;
        }

        .ab-root *, .ab-root *::before, .ab-root *::after { box-sizing: border-box; }

        /* Content column starts at 33.6% — where the slash sits. */
        .ab-grid {
          display: grid;
          grid-template-columns: 33.6% 1fr;
          flex: 1;
        }

        .ab-label {
          display: inline-flex;
          align-items: center;
          gap: 0.75em;
          font-family: 'f3', 'Segoe UI', sans-serif;
          font-size: clamp(11px, 0.66vw, 17px);
          line-height: 1;
          letter-spacing: normal;
          text-transform: uppercase;
          color: var(--ab-label);
          white-space: nowrap;
        }

        /* INTRO and SELECT WORK only — EXPERIENCE keeps the base size. */
        .ab-label-lg {
          font-size: clamp(13px, 0.9vw, 21px);
        }

        .ab-dot {
          width: 0.42em;
          height: 0.42em;
          border-radius: 50%;
          background: var(--ab-accent);
          flex: 0 0 auto;
        }

        /* Wordmark and intro split ab-main in half: 33.6% and 66.4% of page. */
        .ab-head {
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: start;
          padding-bottom: clamp(16px, 1.29vw, 33px);
        }

        /* Glyphs are individual inline-blocks so the word holds its shape
           while characters swap, rather than jittering as each random
           letter takes a different advance width. */
        .ab-wordmark {
          display: inline-flex;
          font-size: clamp(48px, 5.86vw, 150px);
          line-height: 0.95;
          letter-spacing: normal;
          text-transform: uppercase;
          font-weight: 400;
          color: var(--ab-display);
          white-space: nowrap;
        }

        .ab-glyph { display: inline-block; flex: 0 0 auto; }

        .ab-intro-text {
          margin: 0;
          font-family: 'f2', 'Segoe UI', sans-serif;
          font-size: clamp(14px, 0.86vw, 22px);
          line-height: 1.55;
          letter-spacing: normal;
          color: var(--ab-body);
        }

        .ab-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5em;
          list-style: none;
          margin: 1.1em 0 0;
          padding: 0;
          font-size: clamp(11px, 0.586vw, 15px);
        }

        .ab-tag {
          font-family: 'f2', 'Segoe UI', sans-serif;
          font-size: 1em;
          line-height: 1;
          letter-spacing: normal;
          padding: 0.5em 0.95em;
          border: 1px solid #d5d5d3;
          border-radius: 999px;
          color: var(--ab-body);
          white-space: nowrap;
        }

        .ab-rule { height: 1px; width: 100%; background: var(--ab-rule); }

        /* Label + three cells on a 4-column grid: cells land at 25/50/75%. */
        .ab-stats {
          display: grid;
          grid-template-columns: 1fr 3fr;
          align-items: center;
          padding: clamp(18px, 1.48vw, 38px) 0;
        }

        .ab-stats-cells {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
        }

        .ab-stat { display: flex; align-items: baseline; gap: 0.5em; }

        .ab-stat-value {
          font-size: clamp(20px, 1.56vw, 40px);
          line-height: 1;
          letter-spacing: normal;
          font-weight: 400;
          color: var(--ab-display);
        }

        .ab-stat-caption {
          font-family: 'f3', 'Segoe UI', sans-serif;
          font-size: clamp(11px, 0.586vw, 15px);
          letter-spacing: normal;
          text-transform: uppercase;
          color: var(--ab-caption);
          white-space: nowrap;
        }

        .ab-readmore,
        .ab-showall {
          display: inline-flex;
          align-items: center;
          gap: 0.7em;
          background: none;
          border: 0;
          padding: 0;
          cursor: pointer;
          font-family: 'f3', 'Segoe UI', sans-serif;
          font-size: clamp(13px, 0.86vw, 22px);
          line-height: 1;
          letter-spacing: normal;
          text-transform: uppercase;
          color: var(--ab-label);
        }

        .ab-readmore { margin: clamp(24px, 2.15vw, 55px) 0 0; }

        .ab-arrow {
          width: 1.4em;
          height: 1.4em;
          color: var(--ab-accent);
          flex: 0 0 auto;
        }

        .ab-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
          padding: clamp(28px, 2.4vw, 62px) 0 clamp(18px, 1.8vw, 46px);
        }

        @media (max-width: 1024px) {
          .ab-root { --ab-gutter: 3.4%; }
          .ab-grid { grid-template-columns: 24% 1fr; }
          .ab-head { grid-template-columns: 1fr; gap: 26px; }
          .ab-stats { grid-template-columns: 1fr; gap: 18px; }
          .ab-wordmark { font-size: clamp(48px, 9vw, 110px); }
          .ab-intro-text { font-size: clamp(14px, 1.5vw, 18px); }
          .ab-intro-text br { display: none; }
        }

        /* Mobile, measured off the reference at 395px wide. Everything
           stacks in one column EXCEPT the stats row, which keeps its label
           column beside three cells — each cell puts its caption under its
           number rather than beside it. */
        @media (max-width: 720px) {
          .ab-root {
            --ab-gutter: 5%;
            padding-top: 48px;
          }

          .ab-grid { grid-template-columns: 1fr; gap: 28px; }

          .ab-label-lg { font-size: 13px; }

          .ab-head { grid-template-columns: 1fr; gap: 16px; padding-bottom: 22px; }

          /* ~30px on a 395px screen — much smaller than desktop. */
          .ab-wordmark { font-size: clamp(28px, 8vw, 44px); }

          .ab-intro-text { font-size: 14px; line-height: 1.45; }
          .ab-intro-text br { display: none; }

          .ab-tags { font-size: 11px; margin-top: 18px; }

          /* Label column + three stat cells side by side, top-aligned. */
          .ab-stats {
            grid-template-columns: 26% 1fr;
            align-items: start;
            gap: 0;
            padding: 16px 0 28px;
          }

          .ab-stats .ab-label { font-size: 10px; padding-top: 0.35em; }

          .ab-stats-cells {
            grid-template-columns: repeat(3, 1fr);
            gap: 0;
          }

          /* Caption drops below the number and is allowed to wrap. */
          .ab-stat {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }

          .ab-stat-value { font-size: clamp(24px, 7.6vw, 40px); }

          .ab-stat-caption {
            font-size: 10px;
            line-height: 1.35;
            white-space: normal;
            padding-right: 6px;
          }

          .ab-readmore { margin-top: 22px; font-size: 14px; }
          .ab-showall { font-size: 14px; }

          .ab-footer { padding: 72px 0 24px; }
        }
      `}</style>
    </section>
  );
}