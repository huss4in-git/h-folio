/**
 * AboutIntro — src/Components/AboutIntro.jsx
 * The block below the About hero: label + arrow in the left rail, a large
 * sans heading, a body paragraph, then a blurb/tags column beside a spec
 * panel.
 *
 * Column positions measured off the reference at 2420px (1210 CSS):
 *   left rail   1.4%
 *   content     33.4% → 96.7%
 *   blurb col   34.0% → 55.4%
 *   panel       56.8% → 98.1%
 *
 * Fonts: 'f2' (heading, body, tags), 'f3' (small label), 'f1' (arrow glyph,
 * panel readout).
 */

const DEFAULT_TAGS = ["Web Design", "Development", "UX/UI"];

const DEFAULT_BODY =
  "I work across interfaces, integrations, and the systems that hold them together, from first sketch to shipped product. My background sits at the intersection of backend engineering and design, and that cross-disciplinary perspective is still at the core of how I work. Having experience with every layer of a product tends to surface connections others miss — I like finding the right idea, the right structure, and the kind of solution that feels both inevitable and surprising when you see it.";

const DEFAULT_BLURB = [
  "I'm at my best when I get to stay close to the craft,",
  "combining a strategic view with hands-on",
  "execution.",
];

const DEFAULT_SPECS = [
  { key: "Role", value: "Web developer / designer" },
  { key: "Based", value: "Kochi, IN — IST" },
  { key: "Stack", value: "React, Go, SQL Server" },
  { key: "Focus", value: "Interfaces & integrations" },
  { key: "Status", value: "Open to work" },
];

/**
 * A ">" set in the display face, not an SVG — the font draws it as the
 * rounded arrow mark, so it matches the rest of the type automatically.
 */
function ArrowMark() {
  return (
    <span className="ai-arrow" aria-hidden="true">
      &gt;
    </span>
  );
}

export default function AboutIntro({
  label = "About me",
  heading = ["Developer &", "designer"],
  body = DEFAULT_BODY,
  blurb = DEFAULT_BLURB,
  tags = DEFAULT_TAGS,
  specs = DEFAULT_SPECS,
  panelTitle = "H.NIZAAN",
}) {
  const blurbLines = Array.isArray(blurb) ? blurb : [blurb];

  return (
    <section className="ai-root">
      <div className="ai-rail">
        <span className="ai-label">
          <span className="ai-dot" aria-hidden="true" />
          {label}
        </span>
        <ArrowMark />
      </div>

      <div className="ai-main">
        <h2 className="ai-heading">
          {heading.map((line, i) => (
            <span key={i}>{line}</span>
          ))}
        </h2>

        <p className="ai-body">{body}</p>

        <div className="ai-lower">
          <div className="ai-aside">
            <p className="ai-blurb">
              {blurbLines.map((line, i) => (
                <span key={i}>{line} </span>
              ))}
            </p>
            <ul className="ai-tags">
              {tags.map((tag) => (
                <li className="ai-tag" key={tag}>
                  {tag}
                </li>
              ))}
            </ul>
          </div>

          {/* Spec panel — the dark counterweight to the light page, and a
              place for the details that don't belong in prose. */}
          <div className="ai-panel">
            <div className="ai-panel-head">
              <span>{panelTitle}</span>
              <span className="ai-panel-mark">&gt;</span>
            </div>

            <dl className="ai-specs">
              {specs.map((spec) => (
                <div className="ai-spec" key={spec.key}>
                  <dt>{spec.key}</dt>
                  <dd>{spec.value}</dd>
                </div>
              ))}
            </dl>

            <div className="ai-panel-foot">
              <span className="ai-caret" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .ai-root {
          --ai-gutter: 1.3%;
          --ai-accent: #e5352b;
          --ai-display: #3c3c3c;  /* heading */
          --ai-body: #2b2b2b;     /* paragraph */
          --ai-label: #8e8e8e;    /* small label */
          --ai-mark: #404040;     /* arrow glyph */
          --ai-panel-bg: #161819;
          --ai-panel-key: #7d7d7d;
          --ai-panel-val: #ededed;

          position: relative;
          display: grid;
          /* Rail column ends where the content begins, at 33.4%. */
          grid-template-columns: 33.4% 1fr;
          padding: 8vh var(--ai-gutter) 10vh;
          background: #f3f3f1;
          font-family: 'f1', 'Segoe UI', sans-serif;
          letter-spacing: normal;
        }

        .ai-root *, .ai-root *::before, .ai-root *::after { box-sizing: border-box; }

        /* --- left rail: label at the top, arrow well below ---------- */
        .ai-rail {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: 6vh;
        }

        .ai-label {
          display: inline-flex;
          align-items: center;
          gap: 0.75em;
          font-family: 'f3', 'Segoe UI', sans-serif;
          font-size: clamp(11px, 0.72vw, 16px);
          line-height: 1;
          text-transform: uppercase;
          color: var(--ai-label);
          white-space: nowrap;
        }

        .ai-dot {
          width: 0.45em;
          height: 0.45em;
          border-radius: 50%;
          background: var(--ai-accent);
          flex: 0 0 auto;
        }

        /* 100px in the reference; clamped so it scales down on smaller
           screens. line-height 1.4em matches the source. */
        .ai-arrow {
          font-family: 'f1', monospace;
          font-size: clamp(44px, 8.3vw, 100px);
          line-height: 1.4em;
          font-weight: 400;
          color: var(--ai-mark);
          white-space: nowrap;
          pointer-events: none;
        }

        /* --- heading ------------------------------------------------ */
        .ai-heading {
          display: flex;
          flex-direction: column;
          margin: 0;
          font-family: 'f2', 'Segoe UI', sans-serif;
          font-size: clamp(32px, 5.8vw, 140px);
          line-height: 1.02;
          font-weight: 400;
          letter-spacing: -0.015em;
          color: var(--ai-display);
        }

        /* --- body paragraph ----------------------------------------- */
        .ai-body {
          margin: clamp(20px, 2.8vw, 80px) 0 0;
          padding-left: 0.9%;
          padding-right: 3.5%;
          font-family: 'f2', 'Segoe UI', sans-serif;
          font-size: clamp(14px, 1.07vw, 26px);
          line-height: 1.55;
          color: var(--ai-body);
        }

        /* --- blurb + panel ------------------------------------------ */
        .ai-lower {
          display: grid;
          grid-template-columns: 34% 1fr;
          gap: 2.2%;
          padding-top: clamp(36px, 4.5vw, 110px);
          align-items: start;
        }

        /* Smaller than the body above it, and carrying the same left
           indent so both blocks start on the same line. */
        .ai-blurb {
          margin: 0;
          padding-left: 0.9%;
          font-family: 'f2', 'Segoe UI', sans-serif;
          font-size: clamp(13px, 0.95vw, 22px);
          line-height: 1.4;
          color: var(--ai-body);
        }

        .ai-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5em;
          list-style: none;
          margin: 1.4em 0 0;
          padding: 0 0 0 0.9%;
          font-size: clamp(11px, 0.72vw, 17px);
        }

        .ai-tag {
          font-family: 'f2', 'Segoe UI', sans-serif;
          font-size: 1em;
          line-height: 1;
          letter-spacing: normal;
          padding: 0.55em 1em;
          border: 1px solid #d5d5d3;
          border-radius: 999px;
          color: var(--ai-body);
          white-space: nowrap;
        }

        /* --- spec panel --------------------------------------------- */
        .ai-panel {
          display: flex;
          flex-direction: column;
          aspect-ratio: 4 / 5;
          padding: clamp(20px, 2vw, 44px);
          background: var(--ai-panel-bg);
          color: var(--ai-panel-val);
        }

        .ai-panel-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          padding-bottom: clamp(16px, 1.6vw, 34px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.14);
          font-size: clamp(13px, 1.1vw, 26px);
          text-transform: uppercase;
        }

        .ai-panel-mark { color: var(--ai-accent); }

        .ai-specs {
          margin: 0;
          padding: clamp(16px, 1.6vw, 34px) 0 0;
          display: flex;
          flex-direction: column;
          gap: clamp(12px, 1.2vw, 26px);
        }

        /* Key above value rather than beside it — the values are long
           enough that a two-column split would wrap badly in this width. */
        .ai-spec { display: flex; flex-direction: column; gap: 0.35em; }

        .ai-spec dt {
          font-family: 'f3', 'Segoe UI', sans-serif;
          font-size: clamp(9px, 0.62vw, 14px);
          text-transform: uppercase;
          color: var(--ai-panel-key);
        }

        .ai-spec dd {
          margin: 0;
          font-size: clamp(12px, 0.92vw, 21px);
          line-height: 1.25;
          text-transform: uppercase;
          color: var(--ai-panel-val);
        }

        .ai-panel-foot { margin-top: auto; }

        .ai-caret {
          display: block;
          width: clamp(14px, 1.1vw, 26px);
          height: clamp(16px, 1.3vw, 30px);
          background: var(--ai-accent);
          animation: ai-blink 1.1s steps(1) infinite;
        }

        @keyframes ai-blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .ai-caret { animation: none; }
        }

        /* --- responsive --------------------------------------------- */
        @media (max-width: 1024px) {
          .ai-root { --ai-gutter: 3.4%; grid-template-columns: 24% 1fr; }
          .ai-heading { font-size: clamp(30px, 7vw, 74px); }
          .ai-body { font-size: clamp(14px, 1.7vw, 20px); padding-right: 0; }
          .ai-arrow { font-size: clamp(40px, 7vw, 76px); }
          .ai-panel { aspect-ratio: auto; }
        }

        @media (max-width: 720px) {
          .ai-root {
            --ai-gutter: 5%;
            grid-template-columns: 1fr;
            gap: 26px;
            padding: 6vh var(--ai-gutter) 8vh;
          }

          /* Rail flattens: label on the left, arrow beside it. */
          .ai-rail {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            padding-bottom: 0;
          }

          .ai-arrow { font-size: 44px; line-height: 1; }

          .ai-heading { font-size: clamp(28px, 10vw, 56px); }
          .ai-body { margin-top: 28px; font-size: 14px; padding-left: 0; }

          .ai-lower { grid-template-columns: 1fr; gap: 28px; padding-top: 32px; }

          /* Flush left on mobile — cancel the desktop indents. */
          .ai-blurb { font-size: 14px; padding-left: 0; }
          .ai-tags { font-size: 11px; padding-left: 0; }

          .ai-panel { aspect-ratio: auto; padding: 24px; }
          .ai-spec dd { font-size: 14px; }
        }
      `}</style>
    </section>
  );
}