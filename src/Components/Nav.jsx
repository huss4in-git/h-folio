import { useLocation, useNavigate } from "react-router-dom";

/**
 * Nav — src/Components/Nav.jsx
 * Your original pill nav — rounded ends, the 'f2' face, a white pill and
 * red dot that slide in on hover — now in the dark frosted glass of the
 * landing's "Latest work" card.
 *
 * Kept from the newer version: the same height and top offset as the
 * landing's Get in touch / Latest work boxes, so they line up, and the
 * current page shown in brighter text.
 */

const ITEMS = [
  { label: "Home", path: "/" },
  { label: "Work", path: "/work" },
  { label: "About", path: "/about" },
];

const isCurrent = (path, pathname) =>
  path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(`${path}/`);

export default function Nav({ items = ITEMS }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="nv-root" aria-label="Main">
      <ul className="nv-pill">
        {items.map((item) => {
          const current = isCurrent(item.path, pathname);
          return (
            <li key={item.label}>
              <button
                type="button"
                className={`nv-item${current ? " is-current" : ""}`}
                onClick={() => navigate(item.path)}
                aria-current={current ? "page" : undefined}
              >
                <span className="nv-dot" aria-hidden="true" />
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>

      <style>{`
        .nv-root {
          position: fixed;
          top: clamp(12px, 1.1vw, 22px);
          left: 50%;
          transform: translateX(-50%);
          z-index: 100;
          font-family: 'f2', 'Segoe UI', sans-serif;
        }

        .nv-root *, .nv-root *::before, .nv-root *::after { box-sizing: border-box; }

        /* The old pill shape, in the landing card's dark frosted glass. */
        .nv-pill {
          display: flex;
          align-items: center;
          gap: 4px;
          height: clamp(40px, 3.5vw, 64px);
          list-style: none;
          margin: 0;
          padding: 4px;
          border-radius: 999px;
          background: rgba(8, 8, 8, 0.78);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
        }

        .nv-pill li { height: 100%; }

        .nv-item {
          display: inline-flex;
          align-items: center;
          height: 100%;
          border: 0;
          cursor: pointer;
          background: transparent;
          border-radius: 999px;
          padding: 0 clamp(14px, 1.25vw, 22px);
          font-family: inherit;
          font-size: clamp(15px, 1.15vw, 18px);
          line-height: 1;
          letter-spacing: normal;
          color: #b5b3ae;
          white-space: nowrap;
          transition: background 0.22s ease, color 0.22s ease, box-shadow 0.22s ease;
        }

        .nv-item.is-current { color: #f1efe9; }

        .nv-dot {
          width: 0;
          height: 6px;
          margin-right: 0;
          border-radius: 50%;
          background: #e5352b;
          flex: 0 0 auto;
          opacity: 0;
          transition: width 0.22s ease, margin-right 0.22s ease, opacity 0.18s ease;
        }

        /* Hover: the old white pill with dark text and the red dot. */
        .nv-item:hover {
          background: #f1efe9;
          color: #111;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
        }

        .nv-item:hover .nv-dot {
          width: 6px;
          margin-right: 7px;
          opacity: 1;
        }

        .nv-item:focus-visible {
          outline: 1px solid #e5352b;
          outline-offset: 2px;
        }

        /* Touch devices have no hover — keep the bar plain rather than
           leaving an item stuck in the hovered state after a tap. */
        @media (hover: none) {
          .nv-item:hover { background: transparent; color: #b5b3ae; box-shadow: none; }
          .nv-item.is-current:hover { color: #f1efe9; }
          .nv-item:hover .nv-dot { width: 0; margin-right: 0; opacity: 0; }
        }

        @media (max-width: 720px) {
          .nv-item { padding: 0 14px; font-size: 15px; }
        }
      `}</style>
    </nav>
  );
}