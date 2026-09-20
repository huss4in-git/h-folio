import { useNavigate } from "react-router-dom";

const ITEMS = [
  { label: "Home", path: "/" },
  { label: "Work", path: "/work" },
  { label: "About", path: "/about" },
];

export default function Nav({ items = ITEMS }) {
  const navigate = useNavigate();

  return (
    <nav className="nv-root">
      <ul className="nv-pill">
        {items.map((item) => (
          <li key={item.label}>
            <button
              type="button"
              className="nv-item"
              onClick={() => navigate(item.path)}
            >
              <span className="nv-dot" aria-hidden="true" />
              {item.label}
            </button>
          </li>
        ))}
      </ul>

      <style>{`
        .nv-root {
          position: fixed;
          top: 34px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 100;
          font-family: 'f2', 'Segoe UI', sans-serif;
        }

        .nv-root *, .nv-root *::before, .nv-root *::after { box-sizing: border-box; }

        .nv-pill {
          display: flex;
          align-items: center;
          gap: 4px;
          list-style: none;
          margin: 0;
          padding: 3px;
          border-radius: 999px;
          background: rgba(232, 232, 230, 0.55);
          backdrop-filter: blur(16px) saturate(1.4);
          -webkit-backdrop-filter: blur(16px) saturate(1.4);
          border: 1px solid rgba(255, 255, 255, 0.28);
        }

        .nv-item {
          display: inline-flex;
          align-items: center;
          border: 0;
          cursor: pointer;
          background: transparent;
          border-radius: 999px;
          padding: 8px 18px;
          font-family: inherit;
          font-size: 18px;
          line-height: 1;
          letter-spacing: normal;
          color: #4a4a4a;
          white-space: nowrap;
          transition: background 0.22s ease, color 0.22s ease, box-shadow 0.22s ease;
        }

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

        .nv-item:hover {
          background: #fff;
          color: #111;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }

        .nv-item:hover .nv-dot {
          width: 6px;
          margin-right: 7px;
          opacity: 1;
        }

        /* Touch devices have no hover — keep the bar plain rather than
           leaving an item stuck in the hovered state after a tap. */
        @media (hover: none) {
          .nv-item:hover {
            background: transparent;
            color: #4a4a4a;
            box-shadow: none;
          }
          .nv-item:hover .nv-dot { width: 0; margin-right: 0; opacity: 0; }
        }
      `}</style>
    </nav>
  );
}