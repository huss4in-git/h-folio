import { useEffect, useRef, useState } from "react";
import BottomBlur from "../Components/BottomBlur";
import AboutIntro from "../Components/AboutIntro";
import Footer from "../Components/Footer";

/**
 * AboutMe — src/Pages/AboutMe.jsx
 *
 * Each group is placed at an explicit left offset rather than distributed
 * by space-between, so the positions hold regardless of what glyph widths
 * the f1 font happens to have. Offsets are measured off the reference and
 * expressed as % of the content box — tweak a single number to move one
 * group without disturbing the others.
 *
 *   line 1   /  0%      A  18.3%     OUT  42.3%
 *   line 2              B  29.9%     ME   78.3%
 *
 * Fonts: 'f1' (display — wordmark, numerals), 'f3' (small labels).
 */

const SCRAMBLE_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#*/+=-<>[]{}@%$&";

function randomChar() {
  return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
}

const LINE_1 = [
  { text: "/", left: "0%" },
  { text: "A", left: "18.3%" },
  { text: "OUT", left: "42.3%" },
];

const LINE_2 = [
  { text: "B", left: "29.9%" },
  { text: "ME", left: "78.3%" },
];

const DEFAULT_STATS = [
  { label: "Experience [yrs]", value: "003" },
  { label: "Projects shipped", value: "024" },
  { label: "Integrations built", value: "015" },
];

/**
 * Reveals `finalText` left-to-right, scrambling unrevealed characters each
 * tick. While `active` is false it holds a scrambled state, so the reveal
 * plays fresh the next time the block enters the viewport.
 */
function useScrambleText(finalText, { active = true, revealDelay = 0, holdMs = 55 } = {}) {
  const [display, setDisplay] = useState(() =>
    finalText.replace(/\S/g, () => randomChar())
  );
  const revealedRef = useRef(0);

  useEffect(() => {
    if (!active) {
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
function useInView(ref, { threshold = 0.2 } = {}) {
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

function ScrambleGroup({ text, left, delay, active }) {
  const value = useScrambleText(text, { active, revealDelay: delay });
  return (
    <span className="ah-group" style={{ left }} aria-label={text}>
      {value.split("").map((ch, i) => (
        <span className="ah-glyph" key={i} aria-hidden="true">
          {ch === " " ? "\u00A0" : ch}
        </span>
      ))}
    </span>
  );
}

function ScrambleLine({ groups, baseDelay = 0, step = 160, active }) {
  return (
    <span className="ah-line">
      {groups.map((g, i) => (
        <ScrambleGroup
          key={i}
          text={g.text}
          left={g.left}
          delay={baseDelay + i * step}
          active={active}
        />
      ))}
    </span>
  );
}

/** Stat numeral that decodes in place. */
function ScrambleValue({ text, delay, active }) {
  const value = useScrambleText(text, { active, revealDelay: delay });
  return (
    <span className="ah-stat-value" aria-label={text}>
      {value.split("").map((ch, i) => (
        <span className="ah-glyph" key={i} aria-hidden="true">
          {ch}
        </span>
      ))}
    </span>
  );
}

function Dot() {
  return <span className="ah-dot" aria-hidden="true" />;
}

export default function AboutMe({
  nameMark = ["H.", "NIZ", "AAN"],
  stats = DEFAULT_STATS,
  scrollCue = "[ Scroll down ]",
}) {
  const headlineRef = useRef(null);
  const inView = useInView(headlineRef);

  // Stats sit at the bottom of the section, so they need their own
  // observer — the headline's can be out of view while they're on screen.
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef);

  return (
    <>
      <section className="ah-root">
        <div className="ah-headline" ref={headlineRef}>
          <ScrambleLine groups={LINE_1} baseDelay={150} active={inView} />
          <ScrambleLine groups={LINE_2} baseDelay={630} active={inView} />
        </div>

        <div className="ah-rail">
          <div className="ah-name">
            {nameMark.map((line, i) => (
              <span key={i}>{line}</span>
            ))}
          </div>
          <span className="ah-scroll">{scrollCue}</span>
        </div>

        <div className="ah-stats" ref={statsRef}>
          {stats.map((stat, i) => (
            <div className="ah-stat" key={stat.label}>
              <span className="ah-stat-label">
                <Dot />
                {stat.label}
              </span>
              <ScrambleValue
                text={stat.value}
                delay={120 + i * 180}
                active={statsInView}
              />
            </div>
          ))}
        </div>

        <style>{`
          .ah-root {
            --ah-gutter: 1.3%;
            --ah-accent: #e5352b;
            --ah-display: #3c3c3c;  /* wordmark + numerals */
            --ah-label: #8e8e8e;    /* small labels, name mark, scroll cue */
            --ah-rule: #cfcfcc;

            position: relative;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            padding: 17vh var(--ah-gutter) 10vh;
            background: #f3f3f1;
            font-family: 'f1', 'Segoe UI', sans-serif;
            letter-spacing: normal;
            overflow: hidden;
          }

          .ah-root *, .ah-root *::before, .ah-root *::after { box-sizing: border-box; }

          /* --- wordmark ----------------------------------------------
             Cap height measures ~127px on a 1210px viewport → ~14.9vw em,
             with line-height 0.93 giving the ~167px baseline spacing. */
          .ah-headline {
            display: flex;
            flex-direction: column;
            font-size: clamp(52px, 14.9vw, 230px);
            line-height: 0.93;
            color: var(--ah-display);
          }

          /* Each line is a positioning context; its height is one line box,
             since the groups inside are taken out of flow. */
          .ah-line {
            position: relative;
            display: block;
            height: 0.93em;
            font-weight: 400;
            text-transform: uppercase;
            white-space: nowrap;
          }

          .ah-group {
            position: absolute;
            top: 0;
            display: inline-flex;
          }

          .ah-glyph { display: inline-block; }

          /* --- left rail: name mark + scroll cue -------------------- */
          .ah-rail {
            position: absolute;
            left: var(--ah-gutter);
            top: 41.5%;
            display: flex;
            flex-direction: column;
            gap: 10vh;
            font-family: 'f3', 'Segoe UI', sans-serif;
            font-size: clamp(12px, 0.95vw, 19px);
            line-height: 1.45;
            text-transform: uppercase;
            color: var(--ah-label);
          }

          .ah-name {
            display: flex;
            flex-direction: column;
            font-size: clamp(15px, 1.25vw, 25px);
          }

          /* --- stats row -------------------------------------------- */
          .ah-stats {
            margin-top: auto;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1.7%;
          }

          .ah-stat { display: flex; flex-direction: column; }

          .ah-stat-label {
            display: inline-flex;
            align-items: center;
            gap: 0.75em;
            padding-bottom: 0.55em;
            border-bottom: 1px solid var(--ah-rule);
            font-family: 'f3', 'Segoe UI', sans-serif;
            font-size: clamp(10px, 0.72vw, 15px);
            line-height: 1;
            text-transform: uppercase;
            color: var(--ah-label);
            white-space: nowrap;
          }

          .ah-dot {
            width: 0.45em;
            height: 0.45em;
            border-radius: 50%;
            background: var(--ah-accent);
            flex: 0 0 auto;
          }

          /* inline-flex so the per-character spans sit in a row; tabular
             figures keep the width steady while digits cycle. */
          .ah-stat-value {
            display: inline-flex;
            margin-top: 0.1em;
            font-size: clamp(44px, 7.3vw, 110px);
            line-height: 1;
            font-weight: 400;
            font-variant-numeric: tabular-nums;
            color: var(--ah-display);
          }

          /* --- responsive ------------------------------------------- */
          @media (max-width: 1024px) {
            .ah-root { --ah-gutter: 3.4%; padding-top: 18vh; }
            .ah-rail { top: 38%; gap: 8vh; }
            .ah-stat-value { font-size: clamp(38px, 8vw, 88px); }
          }

          @media (max-width: 720px) {
            .ah-root { --ah-gutter: 5%; padding-top: 16vh; padding-bottom: 6vh; }
            .ah-headline { font-size: clamp(40px, 17vw, 110px); }
            .ah-rail {
              position: static;
              flex-direction: row;
              justify-content: space-between;
              align-items: flex-end;
              gap: 0;
              margin-top: 5vh;
            }
            .ah-stats {
              grid-template-columns: 1fr;
              gap: 4vh;
              margin-top: 8vh;
            }
            .ah-stat-value { font-size: clamp(44px, 16vw, 80px); }
          }
        `}</style>
      </section>

      <AboutIntro />
      <Footer />

      {/* Last, so the blur strip sits over the whole page rather than
          being clipped by the hero's overflow: hidden. */}
      <BottomBlur height="9vh" />
    </>
  );
}