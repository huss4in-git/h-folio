/**
 * BottomBlur
 * ----------
 * Fixed progressive blur along the bottom edge of the viewport. A single
 * backdrop-filter blurs uniformly, so instead this stacks layers of
 * increasing blur, each masked to start lower than the one before — the
 * overlap reads as a smooth ramp rather than visible bands.
 *
 * Sits above page content but below the nav, and ignores pointer events
 * so it never blocks clicks.
 */

const LAYERS = [
    { blur: 0.5, from: 0 },
    { blur: 1, from: 20 },
    { blur: 2, from: 35 },
    { blur: 4, from: 50 },
    { blur: 8, from: 65 },
    { blur: 16, from: 80 },
  ];
  
  export default function BottomBlur({ height = "9vh" }) {
    return (
      <div className="bb-root" aria-hidden="true">
        {LAYERS.map((layer, i) => (
          <div
            key={i}
            className="bb-layer"
            style={{
              backdropFilter: `blur(${layer.blur}px)`,
              WebkitBackdropFilter: `blur(${layer.blur}px)`,
              maskImage: `linear-gradient(to bottom, transparent ${layer.from}%, #000 ${Math.min(
                layer.from + 25,
                100
              )}%)`,
              WebkitMaskImage: `linear-gradient(to bottom, transparent ${layer.from}%, #000 ${Math.min(
                layer.from + 25,
                100
              )}%)`,
            }}
          />
        ))}
  
        <style>{`
          .bb-root {
            position: fixed;
            left: 0;
            right: 0;
            bottom: 0;
            height: ${height};
            z-index: 50;        /* under the nav (100), over the content */
            pointer-events: none;
          }
  
          .bb-layer {
            position: absolute;
            inset: 0;
          }
  
          @media (max-width: 720px) {
            .bb-root { height: 6vh; }
          }
        `}</style>
      </div>
    );
  }