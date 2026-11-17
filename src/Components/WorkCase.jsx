/**
 * WorkCase — src/Components/WorkCase.jsx
 * The page a Works card opens: breadcrumb and large title on the left, a
 * full-height rule, then client / when / category columns on the right, and
 * the project video underneath with an optional awards note laid over it.
 *
 * Below the video comes the case study itself, all driven by worksData:
 * ruled sections (label in the left rail, heading + text on the right,
 * optional big-number stats), each followed by a media block, then a
 * credits row. One vertical rule runs down the whole length; media blocks
 * sit on top of it.
 *
 * Route it as  <Route path="/work/:slug" element={<WorkCase />} />  — the
 * project is looked up in worksData by the slug in the URL. Anything passed
 * as children is rendered after the credits.
 *
 * The site Footer follows straight after the credits, with no gap, so the
 * vertical rule runs down into it. BottomBlur is the same blurred bottom
 * edge used on the other pages.
 *
 * Positions measured off the reference at 2420px (1210 CSS):
 *   gutter        1.4%
 *   rule          63.8% across, from the top of the page to the video
 *   meta columns  three equal columns, 2.6vw right of the rule
 *   site link     optional, bottom of the right-hand panel
 *   breadcrumb    102px from the top (clears the fixed nav)
 *   title         64px, its cap line level with the meta labels
 *   section rail  31.3% across; text starts 1.6vw right of the rule
 *   section rules full-bleed, 51px below the media above
 *   heading       37px      body 11.5px (14.5px for the lead section)
 *   media gap     8.5px     split 66/34     stats: three columns, 92px numerals
 *
 * The project title and every section heading ripple in letter by letter
 * (a "letter wave") the first time they come into view — see WaveHeading.
 *
 * Fonts: 'f2' (title, headings, text), 'f3' (breadcrumb, labels), 'f1'
 * (awards, stat numerals).
 */
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BackgroundVideo from "./BackgroundVideo";
import Footer from "./Footer";
import BottomBlur from "./BottomBlur";
import { WORKS } from "./worksData";

const asList = (value) => (Array.isArray(value) ? value : value ? [value] : []);

/** True once the element has come into view; stays true after that. */
function useSeenOnce(ref, threshold = 0.3) {
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || seen) return undefined;
    if (typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, threshold, seen]);

  return seen;
}

/**
 * Letter wave: every letter sits in its own clipped slot and rises into
 * place a beat after the one before it, so the heading ripples in from the
 * left. Plays once, the first time the heading scrolls into view.
 *
 * Letters are grouped by word so lines still wrap between words, and the
 * real text is on aria-label, since the letter spans are hidden from
 * screen readers.
 */
function WaveHeading({ as: Tag = "h2", className, lines }) {
  const ref = useRef(null);
  const seen = useSeenOnce(ref);
  const list = asList(lines);
  const letterCount = list.join("").replace(/\s/g, "").length || 1;
  // ~28ms per letter, squeezed for long headings so the wave stays under ~1s.
  const step = Math.min(0.028, 0.95 / letterCount);

  let n = 0;
  return (
    <Tag
      ref={ref}
      className={`${className} wc-wave${seen ? " is-in" : ""}`}
      aria-label={list.join(" ")}
    >
      {list.map((line, li) => (
        <span className="wc-wave-line" key={li} aria-hidden="true">
          {line.split(" ").map((word, wi, words) => (
            <span key={wi}>
              <span className="wc-wave-word">
                {[...word].map((ch, ci) => (
                  <span className="wc-wave-ch" key={ci}>
                    <span style={{ transitionDelay: `${(n++ * step).toFixed(3)}s` }}>{ch}</span>
                  </span>
                ))}
              </span>
              {wi < words.length - 1 || li < list.length - 1 ? " " : ""}
            </span>
          ))}
        </span>
      ))}
    </Tag>
  );
}

const isVideo = (src) => /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(src ?? "");

function Label({ children }) {
  return (
    <span className="wc-label">
      <span className="wc-dot" aria-hidden="true" />
      {children}
    </span>
  );
}

/**
 * One picture or clip. Without a src — or if the file is missing — it is a
 * plain tinted block rather than a broken-image icon.
 *
 * fit decides what happens when the picture isn't the tile's shape:
 *   "cover"    (default) fills the tile and crops the overflow — which
 *              zooms in on the picture
 *   "natural"  the tile keeps its full width and takes the picture's (or
 *              clip's) own proportions, so the whole frame shows with no
 *              crop and no zoom. Meant for the "full" layout.
 *   "contain"  the whole picture inside the fixed tile, tile colour around
 */
function Tile({ item }) {
  const natural = item.fit === "natural";
  const imgRef = useRef(null);
  const [imageRatio, setImageRatio] = useState(null);

  // Only landscape media gets its own shape. A portrait picture would make
  // a full-width tile taller than the screen, so it keeps the default
  // wide tile and is cropped to fit instead.
  const measure = (el) => {
    if (!natural || !el) return;
    const w = el.naturalWidth || el.videoWidth;
    const h = el.naturalHeight || el.videoHeight;
    if (w && h && w >= h) setImageRatio(`${w} / ${h}`);
  };

  // Covers an image that finished loading before React attached onLoad.
  useEffect(() => {
    setImageRatio(null);
    if (imgRef.current?.complete) measure(imgRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.src, natural]);

  const className = [
    "wc-tile",
    item.fit === "contain" && "wc-tile--contain",
    isVideo(item.src) && "wc-tile--video",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={className}
      style={{ background: item.color, aspectRatio: item.ratio ?? imageRatio ?? undefined }}
    >
      {item.src &&
        (isVideo(item.src) ? (
          <BackgroundVideo
            className="wc-media"
            src={item.src}
            poster={item.poster}
            onLoadedMetadata={(event) => measure(event.currentTarget)}
          />
        ) : (
          <img
            ref={imgRef}
            className="wc-media"
            src={item.src}
            alt={item.alt ?? ""}
            loading="lazy"
            onLoad={(event) => measure(event.currentTarget)}
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ))}
    </div>
  );
}

/**
 * Media under a section. Photo tiles are uncovered from the bottom up (a
 * "curtain wipe") the first time the block scrolls into view; in split and
 * stack layouts each tile follows the one before.
 * Video tiles are already moving, so they skip the effect.
 *
 * Three arrangements, as in the reference:
 *   full    one wide tile
 *   split   a wide tile (66%) beside a square one (34%)
 *   stack   two stacked tiles (34%) beside one tall tile (66%)
 */
function MediaGrid({ media }) {
  const layout = media.layout ?? "full";
  const count = layout === "stack" ? 3 : layout === "split" ? 2 : 1;
  const items = asList(media.items).slice(0, count);
  const ref = useRef(null);
  // Low threshold: a tall tile may never be 30% on screen at once.
  const seen = useSeenOnce(ref, 0.1);

  return (
    <div ref={ref} className={`wc-grid wc-grid--${layout}${seen ? " is-in" : ""}`}>
      {items.map((item, i) => (
        <Tile item={item} key={i} />
      ))}
    </div>
  );
}

function Section({ section }) {
  const heading = asList(section.heading);
  const stats = section.stats ?? [];

  return (
    <section className="wc-sec">
      <div className="wc-sec-text">
        <div className="wc-sec-rail">
          <Label>{section.label}</Label>
        </div>

        <div className="wc-sec-main">
          <WaveHeading as="h2" className="wc-sec-heading" lines={heading} />

          {asList(section.body).map((paragraph, i) => (
            <p className={section.lead ? "wc-sec-body wc-sec-body--lead" : "wc-sec-body"} key={i}>
              {paragraph}
            </p>
          ))}

          {stats.length > 0 && (
            <dl className="wc-stats">
              {stats.map((stat) => (
                <div className="wc-stat" key={stat.label}>
                  <dt>
                    <Label>{stat.label}</Label>
                  </dt>
                  <dd>{stat.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>

      {section.media && <MediaGrid media={section.media} />}
    </section>
  );
}

function Credits({ credits }) {
  const items = credits.items ?? [];
  const team = credits.team ?? [];

  return (
    <footer className="wc-credits">
      <div className="wc-credits-rail">
        {items.map((item) => (
          <div className="wc-credit" key={item.label}>
            <Label>{item.label}</Label>
            <p>
              {asList(item.lines).map((line) => (
                <span key={line}>{line}</span>
              ))}
            </p>
          </div>
        ))}
      </div>

      {team.length > 0 && (
        <div className="wc-credits-main">
          <Label>{credits.teamLabel ?? "Team"}</Label>
          <ul className="wc-team">
            {team.map((member) => (
              <li key={member}>{member}</li>
            ))}
          </ul>
        </div>
      )}
    </footer>
  );
}

export default function WorkCase({
  work: workProp,
  works = WORKS,
  workPath = "/work",
  workLabel = "Work",
  children,
}) {
  const { slug } = useParams();
  const work = workProp ?? works.find((item) => item.slug === slug);

  if (!work) {
    return (
      <>
      <article className="wc-root wc-root--missing">
        <p className="wc-crumb">
          <Link to={workPath}>{workLabel}</Link>
          <span aria-hidden="true">/</span>
          <span>Not found</span>
        </p>
        <h1 className="wc-title">
          <span>No project here</span>
        </h1>
        <WorkCaseStyles />
      </article>
      <Footer />
      <BottomBlur />
      </>
    );
  }

  const titleLines = work.titleLines ?? [work.title];
  const awards = work.awards ?? [];
  const facts = [
    ["Client", asList(work.client)],
    ["When", [...asList(work.year), ...asList(work.status)]],
    ["Category", asList(work.category)],
  ].filter(([, lines]) => lines.length > 0);
  const sections = work.sections ?? [];
  const hasBody = sections.length > 0 || Boolean(work.credits);

  return (
    <>
    <article className={hasBody ? "wc-root wc-root--flush" : "wc-root"}>
      <header className="wc-header">
        <nav className="wc-crumb" aria-label="Breadcrumb">
          <Link to={workPath}>{workLabel}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{work.title}</span>
        </nav>

        <WaveHeading as="h1" className="wc-title" lines={titleLines} />

        <span className="wc-rule" aria-hidden="true" />

        <div className="wc-side">
          <dl className="wc-facts">
          {facts.map(([key, lines]) => (
            <div className="wc-fact" key={key}>
              <dt>
                <span className="wc-dot" aria-hidden="true" />
                {key}
              </dt>
              <dd>
                {lines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </dd>
            </div>
          ))}
          </dl>

          {work.url && (
            <a className="wc-visit" href={work.url} target="_blank" rel="noreferrer">
              {work.urlLabel ?? "Visit website"}
              <span className="wc-visit-mark" aria-hidden="true">
                &gt;
              </span>
            </a>
          )}
        </div>
      </header>

      <div className="wc-hero">
        {work.video ? (
          <BackgroundVideo className="wc-media" src={work.video} poster={work.poster} />
        ) : (
          work.poster && <img className="wc-media" src={work.poster} alt="" />
        )}

        {awards.length > 0 && (
          <div className="wc-awards">
            <span className="wc-awards-key">Awards &amp; recognition</span>
            <ul>
              {awards.map((award) => (
                <li key={award}>{award}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {hasBody && (
        <>
          {/* The header's rule carries on below the video to the first line. */}
          <div className="wc-tail" aria-hidden="true" />

          <div className="wc-body">
            {sections.map((section) => (
              <Section section={section} key={section.label} />
            ))}
            {work.credits && <Credits credits={work.credits} />}
          </div>
        </>
      )}

      {children}

      <WorkCaseStyles />
    </article>
    <Footer />
    <BottomBlur />
    </>
  );
}

function WorkCaseStyles() {
  return (
    <style>{`
      .wc-root {
        --wc-gutter: 1.4vw;
        --wc-rail: 30.75%;      /* where the section rule sits */
        --wc-tile: #dfdfda;     /* empty media tile */
        --wc-accent: #e5352b;
        --wc-display: #3c3c3c;
        --wc-body: #2b2b2b;
        --wc-label: #8e8e8e;
        --wc-rule: #9a9a98;

        padding: 0 var(--wc-gutter) 10vh;
        background: #f3f3f1;
        font-family: 'f2', 'Segoe UI', sans-serif;
        letter-spacing: normal;
        min-height: 100vh;
      }

      /* With a case study below the video, the credits end the page and the
         footer sits directly against them. */
      .wc-root--flush { padding-bottom: 0; min-height: 0; }

      .wc-root *, .wc-root *::before, .wc-root *::after { box-sizing: border-box; }

      /* --- header -------------------------------------------------
         Two columns, two rows. The rule is its own grid item spanning
         both rows, so it runs from the very top down to the video.
           row 1   breadcrumb | rule
           row 2   title      | rule + meta                           */
      .wc-header {
        display: grid;
        grid-template-columns: 64.24% minmax(0, 1fr);
        grid-template-rows: auto auto;
      }

      .wc-crumb {
        grid-column: 1;
        grid-row: 1;
        display: flex;
        align-items: baseline;
        gap: 0.9em;
        margin: 0;
        padding: clamp(84px, 8.4vw, 200px) 0 clamp(36px, 6.4vw, 150px);
        font-family: 'f3', 'Segoe UI', sans-serif;
        font-size: clamp(11px, 1.1vw, 26px);
        line-height: 1;
        text-transform: uppercase;
        color: var(--wc-label);
      }

      .wc-crumb a {
        color: var(--wc-body);
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .wc-crumb a:hover { color: var(--wc-accent); }

      .wc-title {
        grid-column: 1;
        grid-row: 2;
        display: flex;
        flex-direction: column;
        margin: 0;
        padding-bottom: clamp(24px, 3.3vw, 80px);
        font-family: 'f2', 'Segoe UI', sans-serif;
        font-size: clamp(34px, 5.3vw, 128px);
        line-height: 1.15;
        font-weight: 400;
        letter-spacing: -0.015em;
        color: var(--wc-display);
      }

      .wc-rule {
        grid-column: 2;
        grid-row: 1 / -1;
        justify-self: start;
        width: 1px;
        background: var(--wc-rule);
      }

      /* Right-hand panel: meta at the top, site link at the bottom. */
      .wc-side {
        grid-column: 2;
        grid-row: 2;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: clamp(20px, 2.4vw, 56px);
        padding: 0 0 clamp(24px, 3.3vw, 80px) 2.6vw;
      }

      /* Nudged down so the labels sit level with the title's cap line. */
      .wc-facts {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        column-gap: 0.7vw;
        margin: 0.72vw 0 0;
      }

      .wc-visit {
        align-self: flex-start;
        display: inline-flex;
        align-items: center;
        gap: 0.6em;
        font-family: 'f3', 'Segoe UI', sans-serif;
        font-size: clamp(12px, 0.85vw, 19px);
        line-height: 1;
        text-transform: uppercase;
        text-decoration: none;
        color: var(--wc-body);
      }

      .wc-visit:hover { color: var(--wc-accent); }

      .wc-visit-mark {
        font-family: 'f1', monospace;
        font-size: 1.15em;
        color: var(--wc-accent);
        transition: transform 0.25s ease;
      }

      .wc-visit:hover .wc-visit-mark { transform: translate(0.12em, -0.12em); }

      @media (prefers-reduced-motion: reduce) {
        .wc-visit-mark { transition: none; }
        .wc-visit:hover .wc-visit-mark { transform: none; }
      }

      .wc-fact dt {
        display: flex;
        align-items: center;
        gap: 0.9em;
        font-family: 'f3', 'Segoe UI', sans-serif;
        font-size: clamp(11px, 0.72vw, 16px);
        line-height: 1;
        text-transform: uppercase;
        color: var(--wc-label);
      }

      .wc-dot {
        width: 0.5em;
        height: 0.5em;
        border-radius: 50%;
        background: var(--wc-accent);
        flex: 0 0 auto;
      }

      .wc-fact dd {
        display: flex;
        flex-direction: column;
        margin: clamp(10px, 1vw, 24px) 0 0;
        font-size: clamp(11px, 0.87vw, 21px);
        line-height: 1.18;
        text-transform: uppercase;
        color: var(--wc-body);
      }

      /* --- hero video --------------------------------------------- */
      .wc-hero {
        position: relative;
        aspect-ratio: 16 / 9;
        border-radius: clamp(6px, 0.8vw, 18px);
        overflow: hidden;
        background: #0c0e0f;
      }

      .wc-media {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .wc-awards {
        position: absolute;
        top: clamp(14px, 1.4vw, 34px);
        left: clamp(12px, 1.4vw, 34px);
        display: flex;
        flex-direction: column;
        gap: 1.1em;
        font-family: 'f1', monospace;
        font-size: clamp(9px, 0.72vw, 17px);
        line-height: 1.1;
        text-transform: uppercase;
        color: rgba(243, 243, 241, 0.86);
      }

      .wc-awards ul {
        list-style: none;
        margin: 0;
        padding: 0;
        color: rgba(243, 243, 241, 0.6);
      }

      /* --- case study body ----------------------------------------
         .wc-tail   gap under the video; the header rule continues in it
         .wc-body   holds every section; its ::before is the one long
                    vertical rule, which the media blocks cover            */
      .wc-tail {
        position: relative;
        height: clamp(36px, 5.6vw, 136px);
      }

      .wc-tail::before {
        content: "";
        position: absolute;
        top: 0;
        bottom: 0;
        left: 64.24%;
        width: 1px;
        background: var(--wc-rule);
      }

      .wc-body { position: relative; }

      .wc-body::before {
        content: "";
        position: absolute;
        top: 0;
        bottom: 0;
        left: var(--wc-rail);
        width: 1px;
        background: var(--wc-rule);
      }

      .wc-label {
        display: flex;
        align-items: center;
        gap: 0.9em;
        font-family: 'f3', 'Segoe UI', sans-serif;
        font-size: clamp(11px, 0.72vw, 16px);
        line-height: 1;
        text-transform: uppercase;
        color: var(--wc-label);
      }

      /* --- section ------------------------------------------------ */
      .wc-sec { padding-bottom: clamp(28px, 4.2vw, 102px); }

      .wc-sec-text,
      .wc-credits {
        position: relative;
        display: grid;
        grid-template-columns: var(--wc-rail) minmax(0, 1fr);
      }

      /* Horizontal rule, bleeding past the gutter to the page edges. */
      .wc-sec-text::before,
      .wc-credits::before {
        content: "";
        position: absolute;
        top: 0;
        left: calc(var(--wc-gutter) * -1);
        right: calc(var(--wc-gutter) * -1);
        height: 1px;
        background: var(--wc-rule);
      }

      .wc-sec-text { padding: clamp(24px, 3vw, 72px) 0 clamp(40px, 5.8vw, 140px); }


      .wc-sec-main { padding-left: clamp(14px, 1.6vw, 40px); }

      .wc-sec-heading {
        display: flex;
        flex-direction: column;
        max-width: 15em;
        margin: 0;
        font-family: 'f2', 'Segoe UI', sans-serif;
        font-size: clamp(26px, 3.05vw, 74px);
        line-height: 1.16;
        font-weight: 400;
        letter-spacing: -0.012em;
        color: var(--wc-display);
      }

      .wc-sec-body {
        margin: clamp(8px, 0.75vw, 18px) 0 0;
        font-size: clamp(12px, 0.95vw, 23px);
        line-height: 1.4;
        color: var(--wc-body);
      }

      .wc-sec-body + .wc-sec-body { margin-top: 1em; }

      /* The opening section reads a size up. */
      .wc-sec-body--lead {
        font-size: clamp(14px, 1.2vw, 29px);
        line-height: 1.38;
      }

      /* --- stats -------------------------------------------------- */
      .wc-stats {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        column-gap: clamp(12px, 1.65vw, 40px);
        margin: clamp(32px, 4vw, 96px) 0 0;
      }

      .wc-stat dt {
        padding-bottom: clamp(8px, 0.7vw, 17px);
        border-bottom: 1px solid var(--wc-display);
      }

      .wc-stat dd {
        margin: clamp(6px, 0.55vw, 14px) 0 0;
        font-family: 'f1', monospace;
        font-size: clamp(40px, 7.6vw, 184px);
        line-height: 1;
        white-space: nowrap;
        color: var(--wc-display);
      }

      /* --- media -------------------------------------------------- */
      .wc-grid {
        position: relative;
        z-index: 1;               /* above the vertical rule */
        display: grid;
        gap: clamp(6px, 0.7vw, 17px);
      }

      .wc-tile {
        position: relative;
        overflow: hidden;
        border-radius: clamp(6px, 0.8vw, 18px);
        background: var(--wc-tile);
      }

      .wc-tile--contain .wc-media { object-fit: contain; }

      /* --- curtain wipe up (photos only) ---------------------------
         The tile stays where it is; the photo is uncovered from the
         bottom edge upwards. "round" keeps the corners rounded the whole
         way through the wipe.                                          */
      .wc-grid .wc-tile:not(.wc-tile--video) {
        clip-path: inset(100% 0 0 0 round clamp(6px, 0.8vw, 18px));
        transition: clip-path 1.1s cubic-bezier(0.77, 0, 0.18, 1);
      }

      .wc-grid.is-in .wc-tile:not(.wc-tile--video) {
        clip-path: inset(0 0 0 0 round clamp(6px, 0.8vw, 18px));
      }

      .wc-grid .wc-tile:nth-child(2) { transition-delay: 0.14s; }
      .wc-grid .wc-tile:nth-child(3) { transition-delay: 0.28s; }

      @media (prefers-reduced-motion: reduce) {
        .wc-grid .wc-tile:not(.wc-tile--video) { clip-path: none; transition: none; }
      }

      .wc-grid--full .wc-tile { aspect-ratio: 22 / 13; }

      .wc-grid--split { grid-template-columns: 66fr 34fr; }
      .wc-grid--split .wc-tile:nth-child(2) { aspect-ratio: 1 / 1; }

      .wc-grid--stack { grid-template-columns: 34fr 66fr; }
      .wc-grid--stack .wc-tile:nth-child(1),
      .wc-grid--stack .wc-tile:nth-child(2) { grid-column: 1; aspect-ratio: 6 / 5; }
      .wc-grid--stack .wc-tile:nth-child(3) { grid-column: 2; grid-row: 1 / span 2; }

      /* --- credits ------------------------------------------------ */
      .wc-credits {
        margin-top: clamp(8px, 1.4vw, 34px);
        padding: clamp(24px, 3vw, 72px) 0 clamp(40px, 6.6vw, 160px);
      }

      .wc-credits-rail {
        display: flex;
        flex-wrap: wrap;
        gap: clamp(20px, 2.4vw, 58px) 0;
      }

      .wc-credit { flex: 0 0 36%; padding-right: 12px; }

      .wc-credits-main { padding-left: clamp(14px, 2.5vw, 60px); }

      .wc-credit p,
      .wc-team {
        margin: clamp(14px, 1.7vw, 42px) 0 0;
        font-size: clamp(11px, 0.87vw, 21px);
        line-height: 1.18;
        color: #a3a3a0;
      }

      .wc-credit p {
        display: flex;
        flex-direction: column;
        text-transform: uppercase;
      }

      .wc-team {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 1em clamp(12px, 2vw, 48px);
        max-width: 55vw;
        padding: 0;
        list-style: none;
      }

      /* --- letter wave --------------------------------------------
         Each letter rises out of its own clipped slot. The slot is padded
         (and pulled back with a negative margin) so descenders like g and
         y aren't clipped and line spacing doesn't change.               */
      .wc-wave-line { display: block; }
      .wc-wave-word { display: inline-block; white-space: nowrap; }

      .wc-wave-ch {
        display: inline-block;
        overflow: hidden;
        vertical-align: top;
        padding: 0 0.03em 0.16em;
        margin: 0 -0.03em -0.16em;
      }

      .wc-wave-ch > span {
        display: inline-block;
        transform: translateY(115%);
        transition: transform 0.8s cubic-bezier(0.2, 0.75, 0.2, 1);
      }

      .wc-wave.is-in .wc-wave-ch > span { transform: none; }

      @media (prefers-reduced-motion: reduce) {
        .wc-wave-ch > span { transform: none; transition: none; }
      }

      /* --- not found ---------------------------------------------- */
      .wc-root--missing .wc-crumb { padding-bottom: 48px; }

      /* --- responsive --------------------------------------------- */
      @media (max-width: 1024px) {
        .wc-root { --wc-gutter: 3.4vw; --wc-rail: 24%; }

        /* The rule turns into a line between the title and the meta. */
        .wc-header { grid-template-columns: minmax(0, 1fr); }
        .wc-crumb { padding: 110px 0 44px; font-size: 13px; }
        .wc-title { font-size: clamp(34px, 8vw, 80px); padding-bottom: 32px; }
        .wc-rule { grid-column: 1; grid-row: 3; width: 100%; height: 1px; }
        .wc-side {
          grid-column: 1;
          grid-row: 4;
          gap: 24px;
          padding: 24px 0 32px;
        }
        .wc-facts { column-gap: 16px; margin: 0; }
        .wc-visit { font-size: 13px; }
        .wc-fact dt { font-size: 11px; }
        .wc-fact dd { margin-top: 12px; font-size: 12px; }
        .wc-awards { font-size: 10px; }

        .wc-tail::before { display: none; }
        .wc-sec-heading { font-size: clamp(26px, 4.6vw, 44px); }
        .wc-sec-body { font-size: 14px; }
        .wc-sec-body--lead { font-size: 16px; }
        .wc-stat dd { font-size: clamp(34px, 8.4vw, 80px); }
        .wc-credit { flex-basis: 100%; }
        .wc-credit p, .wc-team { font-size: 12px; margin-top: 14px; }
        .wc-team { grid-template-columns: repeat(2, minmax(0, 1fr)); max-width: none; }
      }

      @media (max-width: 720px) {
        .wc-root { --wc-gutter: 5vw; padding-bottom: 8vh; }
        .wc-root--flush { padding-bottom: 0; }
        .wc-crumb { padding: 96px 0 32px; font-size: 12px; flex-wrap: wrap; row-gap: 8px; }
        .wc-title { font-size: clamp(32px, 11vw, 56px); padding-bottom: 28px; }
        .wc-facts { column-gap: 12px; }
        .wc-hero { aspect-ratio: 4 / 5; }

        /* One column: label above the heading, no vertical rule. */
        .wc-body::before { display: none; }
        .wc-sec-text,
        .wc-credits { grid-template-columns: minmax(0, 1fr); }
        .wc-sec-text { padding: 28px 0 36px; }
        .wc-sec-rail { padding: 0 0 18px; }
        .wc-sec-main { padding-left: 0; }
        .wc-sec-heading { display: block; font-size: clamp(26px, 7.4vw, 36px); max-width: none; }
        .wc-sec-heading .wc-wave-line { display: inline; }

        .wc-stats { grid-template-columns: minmax(0, 1fr); row-gap: 26px; margin-top: 32px; }
        .wc-stat dd { font-size: clamp(48px, 17vw, 84px); }

        .wc-grid--split,
        .wc-grid--stack { grid-template-columns: minmax(0, 1fr); }
        .wc-grid .wc-tile,
        .wc-grid--split .wc-tile:nth-child(2),
        .wc-grid--stack .wc-tile:nth-child(1),
        .wc-grid--stack .wc-tile:nth-child(2),
        .wc-grid--stack .wc-tile:nth-child(3) {
          grid-column: 1;
          grid-row: auto;
          aspect-ratio: 4 / 3;
        }

        .wc-credits { row-gap: 28px; padding: 28px 0 40px; }
        .wc-credits-rail { flex-direction: row; }
        .wc-credit { flex-basis: 50%; }
        .wc-credits-main { padding: 0; }
        .wc-team { grid-template-columns: minmax(0, 1fr); }
      }
    `}</style>
  );
}