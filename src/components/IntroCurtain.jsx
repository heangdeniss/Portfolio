import { useEffect, useState } from 'react';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

const SESSION_KEY = 'hd-intro-seen';

/**
 * Cinematic first-load intro. The overlay lifts away and hands the stage to
 * the hero entrance. Skipped for reduced-motion users and repeat visits.
 */
export default function IntroCurtain() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [seen] = useState(() => {
    try {
      return window.sessionStorage.getItem(SESSION_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('loading');
  const shouldSkip = prefersReducedMotion || seen;

  useEffect(() => {
    if (shouldSkip) return undefined;

    const root = document.documentElement;
    root.classList.add('intro-active');

    let rafId = 0;
    let leaveTimer = 0;
    let doneTimer = 0;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = Math.min((now - startTime) / 950, 1);
      setProgress(Math.round(elapsed * 100));
      if (elapsed < 1) rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    leaveTimer = window.setTimeout(() => {
      setPhase('leaving');
      root.classList.remove('intro-active');
      try {
        window.sessionStorage.setItem(SESSION_KEY, '1');
      } catch {
        // Storage can be unavailable in private contexts; the intro still works.
      }
    }, 1050);

    doneTimer = window.setTimeout(() => setPhase('done'), 2000);

    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(leaveTimer);
      window.clearTimeout(doneTimer);
      root.classList.remove('intro-active');
    };
  }, [shouldSkip]);

  if (shouldSkip || phase === 'done') return null;

  return (
    <div
      className={`intro${phase === 'leaving' ? ' intro--leaving' : ''}`}
      aria-hidden="true"
    >
      <div className="intro__grid" />
      <div className="intro__inner">
        <div className="intro__top">
          <span>Portfolio — 2026</span>
          <span>Phnom Penh, KH</span>
        </div>

        <div className="intro__center">
          <p className="intro__eyebrow">
            <span className="intro__pulse" />
            Data Science / ML / RAG
          </p>
          <h2 className="intro__title">
            <span className="intro__line"><span>Heang</span></span>
            <span className="intro__line intro__line--outline"><span>Denis</span></span>
          </h2>
        </div>

        <div className="intro__bottom">
          <span className="intro__status">
            <span className="intro__status-dot" />
            Loading experience
          </span>
          <span className="intro__counter">
            {String(progress).padStart(3, '0')}<i>%</i>
          </span>
        </div>
      </div>
      <div className="intro__progress">
        <span style={{ transform: `scaleX(${progress / 100})` }} />
      </div>
    </div>
  );
}
