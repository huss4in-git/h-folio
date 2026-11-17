/**
 * Works — src/Components/Works.jsx
 * The "Select work" block: a light header strip (label left, "Show all"
 * right), then a dark band holding one large card per project. Each card is
 * a looping background video with the project mark, name and meta laid over
 * it, and the whole card is one link to the case page (/work/<slug>).
 *
 * Positions measured off the reference at 2420px (1210 CSS):
 *   header strip   62px tall, label at 1.4%
 *   card           1.4% inset on all sides, ~85% of the viewport tall
 *   card content   1.35vw from the card edge
 *   mark           51px cap height, name on its baseline 24px to the right
 *   meta           three columns starting under the mark / under the name
 *   arrow          100px, bottom-left      CTA bottom-right
 *
 * The arrow and the CTA type in with the same scramble as the About
 * wordmark, each time the bottom of a card scrolls into view.
 *
 * Fonts: 'f1' (mark, arrow glyph), 'f3' (labels, name, meta, CTA).
 */
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import BackgroundVideo from "./BackgroundVideo";
import { WORKS } from "./worksData";

const SCRAMBLE_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#*/+=-<>[]{}@%$&";
function randomChar() {
  return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
}

/**
 * Same behaviour as the hook in About.jsx: each position stays hidden until
 * the cursor reaches it, flickers through random characters for a few
 * ticks, then locks to its final glyph. Skipped (text shown straight away)
 * for visitors who ask for reduced motion.
 */
function useScrambleText(
  finalText,
  { active = true, revealDelay = 0, holdMs = 75, trail = 6 } = {}
) {
  const [slots, setSlots] = useState(() =>
    finalText.split("").map((ch) => ({ ch, hidden: true }))
  );

  useEffect(() => {
    const all = (hidden) => finalText.split("").map((ch) => ({ ch, hidden }));

    if (!active) {
      setSlots(all(true));
      return undefined;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSlots(all(false));
      return undefined;
    }

    let cursor = 0;
    let tickHandle;

    const tick = () => {
      setSlots(
        finalText.split("").map((ch, i) => {
          if (ch === " ") return { ch: " ", hidden: i >= cursor };
          if (i < cursor - trail) return { ch, hidden: false }; // locked in
          if (i < cursor) return { ch: randomChar(), hidden: false }; // flickering
          return { ch, hidden: true }; // not reached yet
        })
      );

      cursor += 1;

      if (cursor > finalText.length + trail) {
        setSlots(all(false));
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
    if (!node) return undefined;

    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return inView;
}

const cell = (ch) => (ch === " " ? "\u00A0" : ch);

/**
 * Scrambling text. Every character sits in a cell sized by its FINAL glyph
 * (kept in the layout, invisible), with the flickering glyph laid on top —
 * so nothing shifts while random letters of other widths pass through.
 */
function ScrambleText({ text, active, delay = 0 }) {
  const slots = useScrambleText(text, { active, revealDelay: delay });

  return (
    <span className="wk-scramble" aria-hidden="true">
      {text.split("").map((finalCh, i) => {
        const slot = slots[i] ?? { ch: finalCh, hidden: true };
        return (
          <span className="wk-glyph" key={i}>
            <span className="wk-glyph-size">{cell(finalCh)}</span>
            <span
              className="wk-glyph-show"
              style={{ visibility: slot.hidden ? "hidden" : "visible" }}
            >
              {cell(slot.ch)}
            </span>
          </span>
        );
      })}
    </span>
  );
}

/** Double chevron drawn as dots, to sit beside the CTA. */
function Chevrons() {
  return (
    <svg className="wk-chev" viewBox="1.5 0 22 20" aria-hidden="true">
      <path
        d="M3 3 L11 10 L3 17 M14 3 L22 10 L14 17"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeDasharray="0 3.543"
      />
    </svg>
  );
}

function WorkCard({ work, basePath }) {
  const awards = work.awards ?? [];
  const hasAwards = awards.length > 0;
  const cta = work.cta ?? "Show website";

  // Watch the bottom strip, so the scramble runs when it is actually on screen.
  const footRef = useRef(null);
  const footInView = useInView(footRef, { threshold: 0.6 });

  // Year / client / type share the middle column; anything missing is skipped.
  const facts = [
    ["Year", work.year],
    ["Client", work.client],
    ["Project type", work.type],
  ].filter(([, value]) => Boolean(value));

  const external = Boolean(work.href);
  const Tag = external ? "a" : Link;
  const linkProps = external
    ? { href: work.href, target: "_blank", rel: "noreferrer" }
    : { to: `${basePath}/${work.slug}` };

  return (
    <Tag className="wk-card" aria-label={`${work.title} — ${cta}`} {...linkProps}>
      {work.video ? (
        <BackgroundVideo className="wk-media" src={work.video} poster={work.poster} />
      ) : (
        work.poster && <img className="wk-media" src={work.poster} alt="" />
      )}
      <span className="wk-shade" aria-hidden="true" />

      <div className={hasAwards ? "wk-info" : "wk-info wk-info--plain"}>
        <span className="wk-code">{work.code}</span>
        <span className="wk-name">[ {work.title} ]</span>

        {hasAwards && (
          <div className="wk-meta wk-meta-a">
            <span className="wk-key">Awards &amp; recognition</span>
            <span className="wk-val">
              {awards.map((award, i) => (
                <span className="wk-line" key={award}>
                  {award}
                  {i < awards.length - 1 ? " /" : ""}
                </span>
              ))}
            </span>
          </div>
        )}

        {facts.length > 0 && (
          <div className="wk-meta wk-meta-b">
            {facts.map(([key, value]) => (
              <span className="wk-pair" key={key}>
                <span className="wk-key">{key}:</span>
                <span className="wk-val">{value}</span>
              </span>
            ))}
          </div>
        )}

        {work.role && (
          <div className="wk-meta wk-meta-c">
            <span className="wk-key">My role:</span>
            <span className="wk-val">{work.role}</span>
          </div>
        )}
      </div>

      {work.badge && (
        <img className="wk-badge" src={work.badge.src} alt={work.badge.alt ?? ""} />
      )}

      <div className="wk-foot" ref={footRef}>
        {/* Same trick as AboutIntro: a ">" in the display face is the arrow. */}
        <span className="wk-arrow" aria-hidden="true">
          <ScrambleText text=">" active={footInView} delay={120} />
        </span>
        <span className="wk-cta">
          <ScrambleText text={cta} active={footInView} delay={120} />
          <Chevrons />
        </span>
      </div>
    </Tag>
  );
}

export default function Works({
  label = "Select work",
  works = WORKS,
  basePath = "/work",
  showAllLabel = "Show all",
  showAllTo = "/work",
}) {
  return (
    <section className="wk-root">
      <div className="wk-head">
        <span className="wk-label">
          <span className="wk-dot" aria-hidden="true" />
          {label}
        </span>
        {showAllTo && (
          <Link className="wk-all" to={showAllTo}>
            {showAllLabel}
            <span className="wk-all-mark" aria-hidden="true">
              &gt;
            </span>
          </Link>
        )}
      </div>

      <div className="wk-band">
        {works.map((work) => (
          <WorkCard key={work.slug} work={work} basePath={basePath} />
        ))}
      </div>

      <style>{`
        .wk-root {
          --wk-gutter: 1.4%;
          --wk-pad: clamp(14px, 1.35vw, 34px);   /* card edge → content */
          --wk-accent: #e5352b;
          --wk-label: #8e8e8e;
          --wk-band: #161819;
          --wk-ink: #f3f3f1;

          background: #f3f3f1;
          font-family: 'f1', 'Segoe UI', sans-serif;
          letter-spacing: normal;
        }

        .wk-root *, .wk-root *::before, .wk-root *::after { box-sizing: border-box; }

        /* --- header strip ------------------------------------------- */
        .wk-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: clamp(22px, 2.5vw, 60px) var(--wk-gutter) clamp(14px, 1.55vw, 38px);
        }

        .wk-label {
          display: inline-flex;
          align-items: center;
          gap: 0.75em;
          font-family: 'f3', 'Segoe UI', sans-serif;
          font-size: clamp(13px, 0.9vw, 21px);   /* same as INTRO in About */
          line-height: 1;
          text-transform: uppercase;
          color: var(--wk-label);
          white-space: nowrap;
        }

        .wk-dot {
          width: 0.45em;
          height: 0.45em;
          border-radius: 50%;
          background: var(--wk-accent);
          flex: 0 0 auto;
        }

        .wk-all {
          display: inline-flex;
          align-items: center;
          gap: 0.6em;
          font-family: 'f3', 'Segoe UI', sans-serif;
          font-size: clamp(14px, 1.02vw, 24px);   /* a step up from the label */
          line-height: 1;
          text-transform: uppercase;
          text-decoration: none;
          color: var(--wk-label);
          white-space: nowrap;
        }

        .wk-all-mark {
          font-family: 'f1', monospace;
          font-size: 1.15em;
          color: var(--wk-accent);
        }

        /* --- dark band + cards -------------------------------------- */
        .wk-band {
          display: flex;
          flex-direction: column;
          gap: clamp(12px, 1.4vw, 34px);
          padding: clamp(12px, 1.4vw, 34px) var(--wk-gutter);
          background: var(--wk-band);
        }

        .wk-card {
          position: relative;
          display: block;
          height: clamp(420px, 85.5vh, 1400px);
          border-radius: clamp(6px, 0.66vw, 16px);
          overflow: hidden;
          isolation: isolate;
          background: #0c0e0f;
          color: var(--wk-ink);
          text-decoration: none;
        }

        .wk-card:focus-visible {
          outline: 2px solid var(--wk-accent);
          outline-offset: 3px;
        }

        .wk-media {
          position: absolute;
          inset: 0;
          z-index: -2;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Keeps the type readable over bright footage. */
        .wk-shade {
          position: absolute;
          inset: 0;
          z-index: -1;
          background:
            linear-gradient(180deg, rgba(0, 0, 0, 0.38) 0%, rgba(0, 0, 0, 0) 42%),
            linear-gradient(0deg, rgba(0, 0, 0, 0.32) 0%, rgba(0, 0, 0, 0) 30%);
          pointer-events: none;
        }

        /* --- mark, name, meta ---------------------------------------
           One grid for both rows, so the name lines up with the second
           meta column however wide the mark is.
             row 1   mark | name ............
             row 2   awards | year/client | role                        */
        .wk-info {
          position: absolute;
          top: clamp(22px, 2.6vw, 64px);
          left: var(--wk-pad);
          right: var(--wk-pad);
          display: grid;
          grid-template-columns: max-content max-content minmax(0, 1fr);
          column-gap: clamp(14px, 1.95vw, 48px);
          row-gap: clamp(14px, 1.5vw, 38px);
          align-items: start;
        }

        .wk-code {
          grid-column: 1;
          align-self: baseline;
          font-family: 'f1', monospace;
          font-size: clamp(40px, 6vw, 144px);
          line-height: 1;
          font-weight: 400;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .wk-name {
          grid-column: 2 / -1;
          align-self: baseline;
          font-family: 'f3', 'Segoe UI', sans-serif;
          font-size: clamp(11px, 1.15vw, 28px);
          line-height: 1;
          text-transform: uppercase;
          opacity: 0.78;
          white-space: nowrap;
        }

        .wk-meta {
          display: flex;
          flex-direction: column;
          gap: 1.1em;
          font-family: 'f3', 'Segoe UI', sans-serif;
          font-size: clamp(9px, 0.75vw, 18px);
          line-height: 1.12;
          text-transform: uppercase;
        }

        .wk-meta-a { grid-column: 1; }
        .wk-meta-b { grid-column: 2; }
        .wk-meta-c { grid-column: 3; }

        /* No awards: the remaining two columns move one step left. */
        .wk-info--plain .wk-meta-b { grid-column: 1; }
        .wk-info--plain .wk-meta-c { grid-column: 2 / -1; }

        .wk-pair { display: flex; flex-direction: column; gap: 1.1em; }

        .wk-key { opacity: 0.82; }
        .wk-val { opacity: 0.4; }
        .wk-line { display: block; }

        .wk-meta-b .wk-val { max-width: 14ch; }
        .wk-meta-c .wk-val { max-width: 28ch; }

        /* --- badge -------------------------------------------------- */
        .wk-badge {
          position: absolute;
          top: clamp(20px, 2.5vw, 60px);
          right: var(--wk-pad);
          width: clamp(64px, 8.6vw, 200px);
          height: auto;
        }

        /* --- arrow + CTA -------------------------------------------- */
        .wk-foot {
          position: absolute;
          left: var(--wk-pad);
          right: var(--wk-pad);
          bottom: clamp(12px, 1.1vw, 28px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .wk-arrow {
          font-family: 'f1', monospace;
          font-size: clamp(44px, 8.3vw, 100px);
          line-height: 1;
          font-weight: 400;
        }

        /* Set in the thin label face ('f3'), not the heavy display one. */
        .wk-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.5em;   /* text → chevrons; raise to move them apart */
          font-family: 'f3', 'Segoe UI', sans-serif;
          font-size: clamp(13px, 1.6vw, 38px);
          font-weight: 400;
          line-height: 1;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          white-space: nowrap;
          position: relative;
          top: 0.3em;   /* sits a touch below the arrow's centre line */
        }

        /* --- scramble cells ----------------------------------------- */
        .wk-scramble { display: inline-flex; }

        .wk-glyph { position: relative; display: inline-block; flex: 0 0 auto; }
        .wk-glyph-size { visibility: hidden; }
        .wk-glyph-show {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
        }

        .wk-chev {
          width: 1.1em;
          height: 1em;
          flex: 0 0 auto;
        }


        /* --- responsive --------------------------------------------- */
        @media (max-width: 1024px) {
          .wk-root { --wk-gutter: 3.4%; --wk-pad: clamp(16px, 2.4vw, 26px); }
          .wk-head { padding-top: 34px; padding-bottom: 18px; }
          .wk-band { padding-top: 3.4%; padding-bottom: 3.4%; gap: 3.4vw; }
          .wk-card { height: clamp(420px, 72vh, 820px); }
          .wk-code { font-size: clamp(40px, 8vw, 80px); }
          .wk-name { font-size: clamp(11px, 1.7vw, 17px); }
          .wk-meta { font-size: clamp(10px, 1.2vw, 12px); }
          .wk-arrow { font-size: clamp(44px, 9vw, 84px); }
          .wk-cta { font-size: clamp(14px, 2.2vw, 22px); }
        }

        @media (max-width: 720px) {
          .wk-root { --wk-gutter: 5%; --wk-pad: 16px; }
          .wk-head { padding-top: 28px; padding-bottom: 16px; }
          .wk-label { font-size: 13px; }
          .wk-all { font-size: 14px; }
          .wk-band { padding-top: 5%; padding-bottom: 5%; gap: 5vw; }
          .wk-card { height: clamp(440px, 76vh, 640px); }

          /* Mark and name stack; meta drops to two even columns. */
          .wk-info {
            top: 20px;
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
            column-gap: 16px;
            row-gap: 14px;
          }

          .wk-code { grid-column: 1 / -1; font-size: 44px; }
          .wk-name { grid-column: 1 / -1; font-size: 12px; white-space: normal; }
          .wk-meta { font-size: 10px; }
          .wk-meta-a { grid-column: 1 / -1; }
          .wk-meta-b,
          .wk-info--plain .wk-meta-b { grid-column: 1; }
          .wk-meta-c,
          .wk-info--plain .wk-meta-c { grid-column: 2; }

          .wk-badge { top: 20px; width: 64px; }
          .wk-foot { bottom: 16px; }
          .wk-arrow { font-size: 48px; }
          .wk-cta { font-size: 14px; }
        }
      `}</style>
    </section>
  );
}