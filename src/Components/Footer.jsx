import { useEffect, useRef, useState } from "react";

/**
 * Footer — src/Components/Footer.jsx
 * Contact block, live clock, and the oversized CONTACT wordmark, which
 * decodes from scrambled characters every time it scrolls into view.
 * Fonts: 'f1' (display — wordmark, CONTACT label, logo), 'f2' (contact
 * values), 'f3' (small labels: mail, linkedin, time, date).
 */

const SCRAMBLE_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#*/+=-<>[]{}@%$&";
function randomChar() {
  return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
}

/**
 * Resolves `finalText` left-to-right, scrambling unrevealed characters each
 * tick. While `active` is false it holds a scrambled state, so the reveal
 * always plays fresh the next time the block enters the viewport.
 */
function useScrambleText(finalText, { active = true, revealDelay = 0, holdMs = 55 } = {}) {
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
function useInView(ref, { threshold = 0.35 } = {}) {
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
      className="ft-arrow"
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

/** Ticks once a second; cleared on unmount so it can't leak. */
function useClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n) => String(n).padStart(2, "0");

  return {
    time: `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
    date: `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`,
  };
}

export default function Footer({
  wordmark = "/ CONTACT",
  logo = ["H/", "NIZAAN"],
  mail = "hussain.nizaan@example.com",
  linkedin = "hussain_nizaan",
  linkedinHref = "#",
  copyright = "© 2026 Hussain Nizaan.",
}) {
  const { time, date } = useClock();
  const wordmarkRef = useRef(null);
  const inView = useInView(wordmarkRef);
  const decoded = useScrambleText(wordmark, { active: inView, revealDelay: 120 });

  return (
    <footer className="ft-root">
      <div className="ft-contact">
        <div className="ft-logo">
          {logo.map((line, i) => (
            <span key={i}>{line}</span>
          ))}
        </div>

        <div className="ft-details">
          <span className="ft-label">
            <span className="ft-dot" aria-hidden="true" />
            Contact
          </span>

          <dl className="ft-rows">
            <div className="ft-row">
              <dt>Mail</dt>
              <dd>
                <a href={`mailto:${mail}`}>{mail}</a>
              </dd>
            </div>
            <div className="ft-row">
              <dt>LinkedIn</dt>
              <dd>
                <a href={linkedinHref} target="_blank" rel="noreferrer">
                  {linkedin}
                  <ArrowIcon />
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="ft-meta">
        <div className="ft-clock">
          <div>
            <span>Time:</span>
            <span>{time}</span>
          </div>
          <div>
            <span>Date:</span>
            <span>{date}</span>
          </div>
        </div>
        <span className="ft-copy">{copyright}</span>
      </div>

      {/* aria-label carries the real text, since the visible characters
          are mid-scramble for the first second. */}
      <div className="ft-wordmark" ref={wordmarkRef} aria-label={wordmark}>
        {decoded.split("").map((ch, i) => (
          <span className="ft-glyph" key={i} aria-hidden="true">
            {ch === " " ? "\u00A0" : ch}
          </span>
        ))}
      </div>

      <style>{`
        .ft-root {
          --ft-gutter: 1.4%;
          --ft-accent: #e5352b;

          --ft-bright: #ededed;  /* contact values */
          --ft-display: #c4c4c4; /* the big CONTACT wordmark */
          --ft-label: #8d8d8d;   /* labels */
          --ft-faint: #6a6a6a;   /* clock, copyright */

          position: relative;
          background: #161819;
          padding: 0 var(--ft-gutter);
          font-family: 'f1', 'Segoe UI', sans-serif;
          letter-spacing: normal;
          overflow: hidden;
        }

        .ft-root *, .ft-root *::before, .ft-root *::after { box-sizing: border-box; }

        /* --- contact ------------------------------------------------ */
        .ft-contact {
          display: grid;
          grid-template-columns: 33.6% 1fr;
          padding-top: clamp(60px, 6.5vw, 130px);
        }

        .ft-logo {
          display: flex;
          flex-direction: column;
          font-size: clamp(9px, 0.56vw, 12px);
          line-height: 1.45;
          text-transform: uppercase;
          color: var(--ft-bright);
        }

        .ft-label {
          display: inline-flex;
          align-items: center;
          gap: 0.75em;
          font-size: clamp(11px, 0.72vw, 15px);
          line-height: 1;
          text-transform: uppercase;
          color: var(--ft-label);
        }

        .ft-dot {
          width: 0.42em;
          height: 0.42em;
          border-radius: 50%;
          background: var(--ft-accent);
          flex: 0 0 auto;
        }

        .ft-rows { margin: clamp(22px, 2vw, 40px) 0 0; }

        .ft-row {
          display: grid;
          grid-template-columns: 9em 1fr;
          align-items: baseline;
          padding-bottom: clamp(10px, 0.9vw, 18px);
        }

        .ft-row dt {
          font-family: 'f3', 'Segoe UI', sans-serif;
          font-size: clamp(11px, 0.72vw, 15px);
          text-transform: uppercase;
          color: var(--ft-label);
        }

        .ft-row dd { margin: 0; }

        .ft-row dd a {
          display: inline-flex;
          align-items: center;
          gap: 0.6em;
          font-family: 'f2', 'Segoe UI', sans-serif;
          font-size: clamp(12px, 0.8vw, 17px);
          text-transform: uppercase;
          color: var(--ft-bright);
          text-decoration: none;
          transition: opacity 0.2s ease;
        }

        .ft-row dd a:hover { opacity: 0.6; }

        .ft-arrow { width: 1em; height: 1em; flex: 0 0 auto; }

        /* --- clock + copyright -------------------------------------- */
        .ft-meta {
          display: grid;
          grid-template-columns: 33.6% 1fr;
          padding-top: clamp(70px, 8vw, 160px);
          font-family: 'f3', 'Segoe UI', sans-serif;
          font-size: clamp(8px, 0.48vw, 11px);
          text-transform: uppercase;
          color: var(--ft-faint);
        }

        .ft-clock > div {
          display: grid;
          grid-template-columns: 4.5em 1fr;
          line-height: 1.6;
        }

        /* Tabular figures stop the seconds jittering the layout. */
        .ft-clock > div > span:last-child { font-variant-numeric: tabular-nums; }

        /* --- wordmark ----------------------------------------------- */
        /* Glyphs are individual flex items so the line holds its width
           while characters swap — otherwise it would jitter sideways as
           each random letter has a different advance width. */
           .ft-wordmark {
            display: flex;
            justify-content: flex-start;
            padding: clamp(60px, 7vw, 150px) 0 clamp(20px, 2vw, 40px);
            font-size: clamp(56px, 9.2vw, 190px);
            line-height: 0.9;
            text-transform: uppercase;
            color: var(--ft-display);
            white-space: nowrap;
          }

        .ft-glyph { display: inline-block; flex: 0 0 auto; }

        /* --- responsive --------------------------------------------- */
        @media (max-width: 1024px) {
          .ft-root { --ft-gutter: 3.4%; }
          .ft-contact, .ft-meta { grid-template-columns: 24% 1fr; }
        }

        @media (max-width: 720px) {
          .ft-root { --ft-gutter: 5%; }
          .ft-contact, .ft-meta { grid-template-columns: 1fr; gap: 30px; }
          .ft-row { grid-template-columns: 1fr; gap: 4px; }
          .ft-wordmark { font-size: clamp(42px, 15vw, 90px); }
        }
      `}</style>
    </footer>
  );
}