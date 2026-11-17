/**
 * BackgroundVideo — src/Components/BackgroundVideo.jsx
 * A muted, looping video that fills its parent. Shared by Works (the cards)
 * and WorkCase (the hero).
 *
 * It only plays while it is on screen, so several cards on one page don't
 * all decode at once, and it stays on the poster frame for visitors who ask
 * for reduced motion.
 */
import { useEffect, useRef } from "react";

export default function BackgroundVideo({ src, poster, className = "", onLoadedMetadata }) {
  const ref = useRef(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return undefined;

    // React doesn't reliably write the `muted` attribute, and browsers
    // refuse to autoplay anything that isn't muted.
    video.muted = true;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    if (typeof IntersectionObserver === "undefined") {
      video.play().catch(() => {});
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.1 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [src]);

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      onLoadedMetadata={onLoadedMetadata}
      aria-hidden="true"
      tabIndex={-1}
    />
  );
}