/**
 * Landing — src/Components/Landing.jsx
 * The front page hero, in three acts:
 *
 *   1. Loader    a counter on black, stepping through every number 0–100%
 *   2. Takeover  square blocks scatter across the screen until it's full,
 *                then dissolve away, leaving a dot-matrix background
 *   3. Hero      the dot field keeps slowly morphing; label, heading,
 *                paragraph, latest-work card and info bar animate in
 *
 * The intro plays on a fresh page load or reload only. Coming back to the
 * home page from another route skips straight to the finished hero.
 * Visitors who ask for reduced motion get a short fade and a still field.
 *
 * The background is drawn on a small canvas (one pixel per dot) and scaled
 * up, with a CSS mask that turns each pixel into a round dot. With a
 * `video` (default: your /background.mp4) the dots follow the footage
 * during the intro, then fade away as the clear video takes over.
 *
 * Positions measured off the reference at 1440px:
 *   gutter 40px    paragraph column 74.8%    info bar rule 58px from bottom
 *   heading ~4.9vw, three lines, tight leading    card 160px wide, top-right
 *
 * Fonts: 'Suisse-M' (heading), 'f2' (paragraph), 'f3' (labels, info bar,
 * counter).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { WORKS } from "./worksData";

/* ---------------------------------------------------------------- */
/* content defaults — edit freely                                    */
/* ---------------------------------------------------------------- */

/* The last line ends with a word that cycles through DEFAULT_CYCLE. */
const DEFAULT_HEADING = ["Web developer", "working across"];
const DEFAULT_CYCLE = ["design", "concept", "motion"];

const DEFAULT_INTRO =
"I work across interfaces, integrations and the systems that hold them together. From first sketch to shipped product.";

const DEFAULT_FACTS = ["Web developer / designer", "Calicut, IN"];

const DEFAULT_LINKS = [
  { label: "GitHub", href: "https://github.com/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/" },
];

/* Module-level, so it survives route changes but resets on reload. */
let introHasPlayed = false;

/* ---------------------------------------------------------------- */
/* small helpers                                                      */
/* ---------------------------------------------------------------- */

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const smoothstep = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/* 3D value noise — cheap, smooth enough for an organic field. */
const PERM = (() => {
  const p = Array.from({ length: 256 }, (_, i) => i);
  let seed = 7;
  for (let i = 255; i > 0; i -= 1) {
    seed = (seed * 16807) % 2147483647;
    const j = seed % (i + 1);
    [p[i], p[j]] = [p[j], p[i]];
  }
  return Uint8Array.from([...p, ...p]);
})();
const GRAD = Float32Array.from({ length: 256 }, (_, i) => ((PERM[i] / 255) * 2 - 1));
const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
function noise3(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const X = xi & 255, Y = yi & 255, Z = zi & 255;
  const u = fade(xf), v = fade(yf), w = fade(zf);
  const h = (a, b, c) => GRAD[PERM[PERM[PERM[X + a] + Y + b] + Z + c]];
  const l = (a, b, t) => a + (b - a) * t;
  return l(
    l(l(h(0, 0, 0), h(1, 0, 0), u), l(h(0, 1, 0), h(1, 1, 0), u), v),
    l(l(h(0, 0, 1), h(1, 0, 1), u), l(h(0, 1, 1), h(1, 1, 1), u), v),
    w
  );
}

const SCRAMBLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#*/+=-<>[]{}@%$&";

/** Types text in from the left with a short flicker trail. */
function useScramble(text, active, delay = 0) {
  const [out, setOut] = useState(active ? "" : "");
  useEffect(() => {
    if (!active) {
      setOut("");
      return undefined;
    }
    if (prefersReducedMotion()) {
      setOut(text);
      return undefined;
    }
    let cursor = 0;
    let handle;
    const trail = 5;
    const tick = () => {
      setOut(
        [...text]
          .map((ch, i) => {
            if (ch === " ") return i < cursor ? " " : " ";
            if (i < cursor - trail) return ch;
            if (i < cursor) return SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)];
            return " ";
          })
          .join("")
      );
      cursor += 1;
      if (cursor <= text.length + trail) handle = setTimeout(tick, 32);
      else setOut(text);
    };
    const start = setTimeout(tick, delay);
    return () => {
      clearTimeout(start);
      clearTimeout(handle);
    };
  }, [text, active, delay]);
  return out;
}

function Scramble({ text, active, delay }) {
  const out = useScramble(text, active, delay);
  return (
    <span className="ld-scramble" aria-label={text}>
      <span aria-hidden="true">{out || " "}</span>
    </span>
  );
}

/** Live clock for a time zone, as  HH : MM : SS. */
function useClock(timeZone) {
  const format = () => {
    try {
      return new Intl.DateTimeFormat("en-GB", {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
        .format(new Date())
        .split(":")
        .join(" : ");
    } catch {
      return "";
    }
  };
  const [time, setTime] = useState(format);
  useEffect(() => {
    const id = setInterval(() => setTime(format()), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeZone]);
  return time;
}

/** Blocks the page scrolling (wheel, touch, keys) while `on` is true. */
function useScrollLock(on) {
  useEffect(() => {
    if (!on) return undefined;
    const stop = (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
    };
    const keys = (e) => {
      if ([" ", "PageDown", "PageUp", "ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) stop(e);
    };
    const opts = { capture: true, passive: false };
    window.addEventListener("wheel", stop, opts);
    window.addEventListener("touchmove", stop, opts);
    window.addEventListener("keydown", keys, opts);
    return () => {
      window.removeEventListener("wheel", stop, opts);
      window.removeEventListener("touchmove", stop, opts);
      window.removeEventListener("keydown", keys, opts);
    };
  }, [on]);
}

/* ---------------------------------------------------------------- */
/* dot-matrix field                                                   */
/* ---------------------------------------------------------------- */

/**
 * The animated background. `intro` (0→1) drives the opening: dots start
 * large and faint and settle to their fine size and full strength.
 */
function DotField({ introRef, video, still }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return undefined;
    const ctx = canvas.getContext("2d", { willReadFrequently: Boolean(video) });

    let frame;
    let last = 0;
    let visible = true;
    let cols = 0;
    let rows = 0;
    let cell = 0;
    let image = null;
    const start = performance.now();

    const baseCell = () => (window.innerWidth < 720 ? 5 : 6);

    const layout = (size) => {
      const { width, height } = wrap.getBoundingClientRect();
      const nextCols = Math.ceil(width / size) + 1;
      const nextRows = Math.ceil(height / size) + 1;
      if (size === cell && nextCols === cols && nextRows === rows) return;
      cell = size;
      cols = nextCols;
      rows = nextRows;
      canvas.width = cols;
      canvas.height = rows;
      canvas.style.width = `${cols * cell}px`;
      canvas.style.height = `${rows * cell}px`;
      wrap.style.setProperty("--ld-cell", `${cell}px`);
      image = ctx.createImageData(cols, rows);
    };

    const draw = (now) => {
      const intro = introRef.current ?? 1;
      const settle = easeOut(clamp01(intro));
      layout(Math.round(baseCell() + (1 - settle) * 16));

      const t = (now - start) / 1000;
      const z = t * 0.07;
      const strength = 0.25 + 0.75 * settle;
      const data = image.data;
      const scale = (cell / 230) * (window.innerWidth < 720 ? 1.5 : 1);

      // When following a video, sample it down to the grid first.
      let lum = null;
      const v = videoRef.current;
      if (video && v && v.readyState >= 2) {
        ctx.drawImage(v, 0, 0, cols, rows);
        lum = ctx.getImageData(0, 0, cols, rows).data;
      }

      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
          const i = (y * cols + x) * 4;
          let value;
          if (lum) {
            value = (lum[i] * 0.3 + lum[i + 1] * 0.59 + lum[i + 2] * 0.11) / 255;
          } else {
            const nx = x * scale;
            const ny = y * scale;
            const n = noise3(nx, ny, z) * 0.7 + noise3(nx * 2.3, ny * 2.3, z * 1.6) * 0.3;
            // Bright winding channels with dark islands between them.
            value = 1 - smoothstep(0.12, 0.26, Math.abs(n));
          }
          const g = 18 + value * 92 * strength;
          data[i] = g;
          data[i + 1] = g;
          data[i + 2] = g * 0.97;
          data[i + 3] = 255;
        }
      }
      ctx.putImageData(image, 0, 0);
    };

    const loop = (now) => {
      frame = requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      const intro = introRef.current ?? 1;
      // Hidden under the black loader: skip, so the counter stays smooth.
      if (intro === 0 && last !== 0) return;
      // With a video, the dots only matter until the footage has faded in.
      if (video && intro >= 1 && now - start > 9000) return;
      const minGap = intro < 1 ? 16 : 40; // full rate during the intro, ~25fps after
      if (now - last < minGap) return;
      last = now;
      draw(now);
    };

    const observer =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
          })
        : null;
    observer?.observe(wrap);

    const onResize = () => draw(performance.now());
    window.addEventListener("resize", onResize);

    if (still) draw(start + 4000);
    else frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [introRef, video, still]);

  return (
    <div className={`ld-field${video ? " has-video" : ""}`} ref={wrapRef} aria-hidden="true">
      <canvas ref={canvasRef} className="ld-field-canvas" />
      {video && (
        <video
          ref={videoRef}
          className="ld-field-video"
          src={video}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
        />
      )}
      <span className="ld-field-shade" />
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* intro overlay                                                      */
/* ---------------------------------------------------------------- */

function Intro({ onReveal, onDone, introRef, msPerNumber = 35 }) {
  const canvasRef = useRef(null);
  const [count, setCount] = useState(0);
  const [stage, setStage] = useState("count"); // count → blocks → done

  // Counter: shows every number, 0, 1, 2 … 100, at a steady pace you
  // can read — `msPerNumber` each (default 35ms, so about 3.5 seconds).
  // It never moves more than one number per painted frame, so it can't
  // skip even if the page is busy; it only slows down. Holds at 99 until
  // the fonts are ready.
  useEffect(() => {
    let raf;
    let wait;
    let fontsReady = false;
    (document.fonts?.ready ?? Promise.resolve()).then(() => {
      fontsReady = true;
    });
    let n = 0;
    let begin = null;
    const tick = (now) => {
      if (begin === null) begin = now;
      const due = Math.floor((now - begin) / msPerNumber);
      if (due > n && (n < 99 || fontsReady)) {
        n += 1;
        setCount(n);
      }
      if (n >= 100) {
        wait = setTimeout(() => setStage("blocks"), 300);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(wait);
    };
  }, [msPerNumber]);

  // Block takeover, drawn on a canvas: fill in random order, then clear.
  useEffect(() => {
    if (stage !== "blocks") return undefined;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.scale(dpr, dpr);

    const size = Math.max(26, Math.round(w / 40));
    const step = size * 1.42;
    const cols = Math.ceil(w / step) + 1;
    const rows = Math.ceil(h / step) + 1;
    const offX = (w - (cols - 1) * step) / 2 - size / 2;
    const offY = (h - (rows - 1) * step) / 2 - size / 2;
    const cells = [];
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const dx = (c - cols / 2) / cols;
        const dy = (r - rows / 2) / rows;
        const dist = Math.sqrt(dx * dx + dy * dy);
        cells.push({
          x: offX + c * step + (r % 2 ? step / 2 : 0),
          y: offY + r * step,
          // roughly centre-out, with plenty of scatter
          on: clamp01(dist * 0.9 + Math.random() * 0.55) * 0.62,
          off: 0.62 + Math.random() * 0.38,
          tone: 70 + Math.random() * 40,
        });
      }
    }

    const FILL = 650;
    const CLEAR = 900;
    const total = FILL + CLEAR;
    const begin = performance.now();
    let revealed = false;
    let raf;

    const draw = (now) => {
      const t = clamp01((now - begin) / total);
      ctx.clearRect(0, 0, w, h);
      // Behind the blocks the page goes from black to the hero.
      const cover = 1 - smoothstep(0.5, 1, t);
      ctx.fillStyle = `rgba(0,0,0,${cover})`;
      ctx.fillRect(0, 0, w, h);

      for (const cell of cells) {
        if (t < cell.on) continue;
        if (t > cell.off) continue;
        const life = clamp01((t - cell.on) / 0.06);
        const dying = clamp01((cell.off - t) / 0.08);
        // blocks dim from grey to near-black as the field takes over
        const g = cell.tone * (1 - smoothstep(0.35, 0.9, t) * 0.75);
        ctx.fillStyle = `rgba(${g},${g},${g * 0.98},${Math.min(life, dying)})`;
        // squares widen into bars as the grid densifies, like the reference
        const stretch = 1 + smoothstep(0.3, 0.55, t) * 0.42;
        ctx.fillRect(cell.x, cell.y, size * stretch, size);
      }

      introRef.current = smoothstep(0.45, 1, t);
      if (!revealed && t > 0.55) {
        revealed = true;
        onReveal();
      }
      if (t < 1) raf = requestAnimationFrame(draw);
      else {
        introRef.current = 1;
        setStage("done");
        onDone();
      }
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [stage, introRef, onReveal, onDone]);

  if (stage === "done") return null;

  return (
    <div className={`ld-intro ld-intro--${stage}`} aria-hidden="true">
      <span className="ld-count">{count}%</span>
      <canvas ref={canvasRef} className="ld-blocks" />
    </div>
  );
}

/** Swaps through `words`, fading each one out and the next one in. */
function CyclingWord({ words, interval = 2200, active }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!active || words.length < 2 || prefersReducedMotion()) return undefined;
    let swap;
    const id = setInterval(() => {
      setVisible(false);
      swap = setTimeout(() => {
        setIndex((i) => (i + 1) % words.length);
        setVisible(true);
      }, 280); // matches the .ld-cycle transition
    }, interval);
    return () => {
      clearInterval(id);
      clearTimeout(swap);
    };
  }, [words, interval, active]);

  return <span className={`ld-cycle${visible ? " is-visible" : ""}`}>{words[index]}</span>;
}

/* ---------------------------------------------------------------- */
/* the hero                                                           */
/* ---------------------------------------------------------------- */

export default function Landing({
  label = "Hussain Nizaan / Portfolio 2026 ©",
  heading = DEFAULT_HEADING,
  cycle = DEFAULT_CYCLE,
  intro = DEFAULT_INTRO,
  facts = DEFAULT_FACTS,
  timeZone = "Asia/Kolkata",
  status = "Open to work",
  links = DEFAULT_LINKS,
  contactTo = "/about",
  contactLabel = "Get in touch",
  featured = WORKS[0],
  // Loader speed: milliseconds per number (35 → about 3.5s from 0 to 100).
  loaderSpeed = 35,
  // Your existing clip. The dots trace it during the intro, then it fades
  // in clear. Pass video={null} for the dots-only background.
  video = "/background.mp4",
}) {
  // Decided once, on mount — later re-renders (the clock ticks every
  // second) must not change it.
  const [reduced] = useState(prefersReducedMotion);
  const [playIntro] = useState(() => !introHasPlayed && !prefersReducedMotion());
  const introRef = useRef(playIntro ? 0 : 1);
  const [revealed, setRevealed] = useState(!playIntro);
  const [introDone, setIntroDone] = useState(!playIntro);
  const time = useClock(timeZone);

  // Stable callbacks: the clock re-renders this component every second,
  // and the intro must not restart when that happens.
  const handleReveal = useCallback(() => setRevealed(true), []);

  // Latest-work panel: open on wide screens, folded on narrow ones.
  const [workOpen, setWorkOpen] = useState(
    () => typeof window === "undefined" || window.innerWidth > 720
  );
  const handleDone = useCallback(() => setIntroDone(true), []);

  useScrollLock(!introDone);

  // A reload mid-page would otherwise land below the intro.
  useEffect(() => {
    if (!playIntro) return undefined;
    introHasPlayed = true;
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    return () => {
      window.history.scrollRestoration = previous;
    };
  }, [playIntro]);

  // Reduced motion: a short fade instead of the full intro.
  useEffect(() => {
    if (!reduced) return;
    introHasPlayed = true;
  }, [reduced]);

  const featuredMedia = featured?.video || featured?.poster;
  const lines = Array.isArray(heading) ? heading : [heading];

  return (
    <section className={`ld-root${revealed ? " is-in" : ""}${reduced ? " is-still" : ""}`}>
      <DotField introRef={introRef} video={video} still={reduced} />

      {/* top right: contact + latest work */}
      <aside className="ld-card">
        <Link className="ld-card-cta" to={contactTo}>
          <span className="ld-card-dot" aria-hidden="true" />
          {contactLabel}
        </Link>
        {featured && (
          <div className={`ld-card-work${workOpen ? " is-open" : ""}`}>
            <button
              type="button"
              className="ld-card-head"
              onClick={() => setWorkOpen((open) => !open)}
              aria-expanded={workOpen}
              aria-controls="ld-card-body"
            >
              <span>Latest work</span>
              <span className="ld-card-toggle" aria-hidden="true">
                ( {workOpen ? "−" : "+"} )
              </span>
            </button>

            {/* Collapses to just the header row. */}
            <div className="ld-card-body" id="ld-card-body">
              <div className="ld-card-body-inner">
                <Link
                  className="ld-card-link"
                  to={`/work/${featured.slug}`}
                  tabIndex={workOpen ? 0 : -1}
                >
                  <span className="ld-card-media">
                    {featuredMedia &&
                      (featured.video ? (
                        <video src={featured.video} muted loop playsInline autoPlay preload="metadata" />
                      ) : (
                        <img src={featured.poster} alt="" />
                      ))}
                  </span>
                  <span className="ld-card-name">
                    <span>{featured.title}</span>
                    <span>( {featured.code} )</span>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </aside>

      <div className="ld-copy">
        <p className="ld-label">
          [ <Scramble text={label} active={revealed} delay={250} /> ]
        </p>

        <h1 className="ld-heading" aria-label={`${lines.join(" ")} ${cycle?.join(", ") ?? ""}`.trim()}>
          {lines.map((line, i) => (
            <span className="ld-line" key={i} aria-hidden="true">
              <span style={{ transitionDelay: `${0.12 + i * 0.09}s` }}>
                {line}
                {i === lines.length - 1 && cycle?.length > 0 && (
                  <>
                    {" "}
                    <CyclingWord words={cycle} active={revealed} />
                  </>
                )}
              </span>
            </span>
          ))}
        </h1>

        <p className="ld-intro-text">{intro}</p>
      </div>

      <footer className="ld-bar">
        <span className="ld-bar-rule" aria-hidden="true" />
        <ul className="ld-bar-list">
          {facts.map((fact, i) => (
            <li key={fact} className="ld-bar-item" style={{ transitionDelay: `${0.35 + i * 0.06}s` }}>
              <Scramble text={fact} active={revealed} delay={420 + i * 90} />
            </li>
          ))}
          <li className="ld-bar-item ld-bar-clock" style={{ transitionDelay: "0.5s" }}>
            [ <span className="ld-bar-dot" aria-hidden="true" /> {time} ]
          </li>
          <li className="ld-bar-item ld-bar-status" style={{ transitionDelay: "0.56s" }}>
            <Scramble text={status} active={revealed} delay={640} />
          </li>
          {links.map((link, i) => (
            <li key={link.label} className="ld-bar-item" style={{ transitionDelay: `${0.62 + i * 0.06}s` }}>
              <a href={link.href} target="_blank" rel="noreferrer">
                {link.label} <span aria-hidden="true">+</span>
              </a>
            </li>
          ))}
        </ul>
      </footer>

      {playIntro && !introDone && (
        <Intro
          introRef={introRef}
          onReveal={handleReveal}
          onDone={handleDone}
          msPerNumber={loaderSpeed}
        />
      )}

      <style>{`
        .ld-root {
          --ld-gutter: 2.8vw;
          --ld-accent: #e5352b;
          --ld-ink: #f1efe9;
          --ld-muted: #9a9894;
          --ld-bg: #121314;

          position: relative;
          height: 100vh;
          height: 100svh;
          min-height: 560px;
          overflow: hidden;
          background: var(--ld-bg);
          color: var(--ld-ink);
          font-family: 'f2', 'Segoe UI', sans-serif;
        }

        .ld-root *, .ld-root *::before, .ld-root *::after { box-sizing: border-box; }

        /* --- dot field ---------------------------------------------- */
        .ld-field {
          position: absolute;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          --ld-cell: 6px;
        }

        .ld-field-canvas {
          position: absolute;
          top: 0;
          left: 0;
          image-rendering: pixelated;
          -webkit-mask-image: radial-gradient(circle, #000 0 42%, transparent 50%);
                  mask-image: radial-gradient(circle, #000 0 42%, transparent 50%);
          -webkit-mask-size: var(--ld-cell) var(--ld-cell);
                  mask-size: var(--ld-cell) var(--ld-cell);
        }

        /* With a video: the clear footage fades in over the dots. */
        .ld-field-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: blur(1.5px) saturate(0.9);
          transform: scale(1.03);
          opacity: 0;
          transition: opacity 2.4s ease 1.2s;
        }

        /* Once the video is in, it takes over completely: the dots only
           carry the intro, then fade out so nothing sits across the
           footage. */
        .ld-root.is-in .ld-field-video { opacity: 1; }

        .ld-field.has-video .ld-field-canvas { transition: opacity 1.6s ease 1.8s; }
        .ld-root.is-in .ld-field.has-video .ld-field-canvas { opacity: 0; }

        /* Darkens the bottom so the type always reads. */
        .ld-field-shade {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(0deg, rgba(10, 11, 12, 0.85) 0%, rgba(10, 11, 12, 0) 55%),
            linear-gradient(180deg, rgba(10, 11, 12, 0.5) 0%, rgba(10, 11, 12, 0) 22%);
        }

        /* --- copy --------------------------------------------------- */
        .ld-copy {
          position: absolute;
          left: var(--ld-gutter);
          right: var(--ld-gutter);
          bottom: clamp(84px, 8.1vw, 150px);
          display: grid;
          grid-template-columns: minmax(0, 1fr) 22.6vw;
          align-items: end;
          column-gap: 4vw;
        }

        .ld-label {
          grid-column: 1 / -1;
          margin: 0 0 clamp(14px, 1.7vw, 32px);
          font-family: 'f3', 'Segoe UI', monospace;
          font-size: clamp(11px, 0.72vw, 15px);
          line-height: 1;
          text-transform: uppercase;
          color: var(--ld-ink);
          white-space: nowrap;
          opacity: 0;
          transition: opacity 0.4s ease 0.2s;
        }

        .ld-scramble { display: inline-block; }

        .ld-cycle {
          display: inline-block;
          color: var(--ld-accent);
          opacity: 0;
          transform: translateY(0.12em);
          transition: opacity 0.28s ease, transform 0.28s ease;
        }

        .ld-cycle.is-visible { opacity: 1; transform: none; }

        /* Suisse Medium, set like the reference: tight tracking and tight
           leading. Uses the 'Suisse-M' family from your index.css. The
           weight lives in the font file itself, so font-weight stays
           normal here; asking for bold would make the browser fake it. */
        .ld-heading {
          grid-column: 1;
          display: flex;
          flex-direction: column;
          margin: 0;
          font-family: 'f2', 'Helvetica Neue', Arial, sans-serif;
          font-size: clamp(34px, 4.95vw, 124px);
          line-height: 0.9;
          font-weight: normal;
          letter-spacing: -0.03em;
          text-transform: uppercase;
          color: var(--ld-ink);
        }

        /* Each line rises out of its own clipped slot. */
        .ld-line {
          display: block;
          overflow: hidden;
          /* Extra room inside each clipped line so f1's rounded tops and
             bottoms aren't shaved off at the tighter line spacing. */
          padding: 0.08em 0 0.08em;
          margin: -0.08em 0 -0.08em;
        }

        .ld-line > span {
          display: inline-block;
          transform: translateY(110%);
          transition: transform 1s cubic-bezier(0.2, 0.75, 0.2, 1);
        }

        .ld-intro-text {
          grid-column: 2;
          margin: 0;
          font-size: clamp(14px, 1.32vw, 30px);
          line-height: 1.26;
          color: var(--ld-ink);
          opacity: 0;
          transform: translateY(14px);
          transition: opacity 0.8s ease 0.45s, transform 0.9s cubic-bezier(0.2, 0.75, 0.2, 1) 0.45s;
        }

        /* --- info bar ----------------------------------------------- */
        .ld-bar {
          position: absolute;
          left: var(--ld-gutter);
          right: var(--ld-gutter);
          bottom: 0;
          height: clamp(48px, 4.1vw, 80px);
        }

        .ld-bar-rule {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: rgba(241, 239, 233, 0.75);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 1.2s cubic-bezier(0.77, 0, 0.18, 1) 0.15s;
        }

        /* Facts sit in fixed columns on the left; the clock pushes
           the status and links over to the right. */
        .ld-bar-list {
          display: flex;
          align-items: center;
          column-gap: clamp(20px, 5.5vw, 110px);
          height: 100%;
          margin: 0;
          padding: 0;
          list-style: none;
          font-family: 'f3', 'Segoe UI', monospace;
          font-size: clamp(10px, 0.72vw, 15px);
          line-height: 1;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .ld-bar-item {
          opacity: 0;
          transition: opacity 0.5s ease;
        }

        .ld-bar-item:not(.ld-bar-clock):not(.ld-bar-status):not(:has(a)) { min-width: 11vw; }
        .ld-bar-clock { margin-right: auto; }

        .ld-bar-item a {
          color: inherit;
          text-decoration: none;
        }

        .ld-bar-dot {
          display: inline-block;
          width: 0.42em;
          height: 0.42em;
          margin: 0 0.2em 0.12em;
          border-radius: 50%;
          background: var(--ld-accent);
          vertical-align: middle;
        }

        .ld-bar-status::before {
          content: "";
          display: inline-block;
          width: 0.42em;
          height: 0.42em;
          margin-right: 0.7em;
          border-radius: 50%;
          background: #3fbf6a;
          vertical-align: middle;
        }

        /* --- top-right card -----------------------------------------
           Fixed, so it stays in the corner while the rest of the home
           page scrolls past underneath it.                              */
        .ld-card {
          --ld-card-h: clamp(40px, 3.5vw, 64px);   /* one row height for both */
          --ld-card-pad: clamp(12px, 0.9vw, 18px);
          --ld-card-r: 5px;
          position: fixed;
          z-index: 60;
          top: clamp(12px, 1.1vw, 22px);
          right: clamp(12px, 1.1vw, 22px);
          width: clamp(140px, 11.1vw, 220px);
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-family: 'f3', 'Segoe UI', monospace;
          font-size: clamp(10px, 0.68vw, 14px);
          text-transform: uppercase;
          opacity: 0;
          transform: translateY(-12px);
          transition: opacity 0.6s ease 0.55s, transform 0.8s cubic-bezier(0.2, 0.75, 0.2, 1) 0.55s;
        }

        .ld-card a { color: inherit; text-decoration: none; }

        .ld-card-cta {
          display: flex;
          align-items: center;
          gap: 0.8em;
          height: var(--ld-card-h);
          padding: 0 var(--ld-card-pad);
          border-radius: var(--ld-card-r);
          /* Warm off-white frosted glass, the same blur as Latest work. */
          background: rgba(232, 230, 225, 0.8);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          color: #161819 !important;
        }

        .ld-card-dot {
          width: 0.55em;
          height: 0.55em;
          border-radius: 50%;
          background: var(--ld-accent);
        }

        .ld-card-work {
          display: flex;
          flex-direction: column;
          padding: 0 var(--ld-card-pad);
          border-radius: var(--ld-card-r);
          overflow: hidden;
          /* Frosted, the same as the nav. */
          background: rgba(8, 8, 8, 0.78);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          color: var(--ld-ink);
        }

        .ld-card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          height: var(--ld-card-h);   /* same height as Get in touch */
          padding: 0;
          border: 0;
          background: none;
          color: inherit;
          font: inherit;
          text-transform: inherit;
          cursor: pointer;
        }

        .ld-card-toggle { white-space: pre; }

        /* Height animates by moving the grid row between 0fr and 1fr. */
        .ld-card-body {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.5s cubic-bezier(0.2, 0.75, 0.2, 1);
        }

        .ld-card-work.is-open .ld-card-body { grid-template-rows: 1fr; }

        .ld-card-body-inner { min-height: 0; overflow: hidden; }

        .ld-card-link {
          display: flex;
          flex-direction: column;
          gap: 0.8em;
          padding-bottom: var(--ld-card-pad);
        }

        .ld-card-media {
          position: relative;
          display: block;
          aspect-ratio: 3 / 4;
          border-radius: 2px;
          overflow: hidden;
          background: #0c0d0e;
        }

        .ld-card-media video,
        .ld-card-media img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: grayscale(1) contrast(1.1);
        }

        .ld-card-name {
          display: flex;
          justify-content: space-between;
          color: var(--ld-muted);
        }

        /* --- revealed state ----------------------------------------- */
        .ld-root.is-in .ld-label,
        .ld-root.is-in .ld-bar-item { opacity: 1; }
        .ld-root.is-in .ld-line > span { transform: none; }
        .ld-root.is-in .ld-intro-text { opacity: 1; transform: none; }
        .ld-root.is-in .ld-bar-rule { transform: scaleX(1); }
        .ld-root.is-in .ld-card { opacity: 1; transform: none; }

        .ld-root.is-still * { transition-duration: 0.4s !important; transition-delay: 0s !important; }

        /* --- intro overlay ------------------------------------------ */
        .ld-intro {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: grid;
          place-items: center;
          background: #000;
          transition: background-color 0.01s linear;
        }

        .ld-intro--blocks { background: transparent; }

        .ld-count {
          position: absolute;
          font-family: 'f3', 'Segoe UI', monospace;
          font-size: clamp(14px, 1.05vw, 20px);
          letter-spacing: 0.06em;
          font-variant-numeric: tabular-nums;
          color: #e6e2da;
          transition: opacity 0.25s ease;
        }

        .ld-intro--blocks .ld-count { opacity: 0; }

        .ld-blocks {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        /* --- responsive --------------------------------------------- */
        @media (max-width: 1024px) {
          .ld-root { --ld-gutter: 4vw; }
          .ld-copy { grid-template-columns: minmax(0, 1fr); row-gap: 22px; bottom: 120px; }
          .ld-intro-text { grid-column: 1; max-width: 46ch; font-size: clamp(15px, 2vw, 19px); }
          .ld-heading { font-size: clamp(34px, 7.4vw, 76px); }
          .ld-bar { height: auto; padding: 16px 0 18px; }
          .ld-bar-list { justify-content: space-between; column-gap: 16px; }
          .ld-bar-item:not(.ld-bar-clock):not(.ld-bar-status):not(:has(a)) { min-width: 0; }
          .ld-bar-clock { margin-right: 0; }
          .ld-bar-list > :nth-child(n + 4) { display: none; }
        }

        @media (max-width: 720px) {
          .ld-root { --ld-gutter: 5vw; min-height: 600px; }
          .ld-copy { bottom: 92px; }
          .ld-heading { font-size: clamp(30px, 10.4vw, 52px); line-height: 0.92; }
          .ld-intro-text { font-size: 15px; }
          .ld-label { white-space: normal; line-height: 1.4; }
          .ld-card { display: none; }
          .ld-bar-list > :nth-child(2) { display: none; }
        }
      `}</style>
    </section>
  );
}