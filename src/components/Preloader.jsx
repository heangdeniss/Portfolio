import { useEffect, useRef, useState } from 'react';
import { gsap } from '../lib/animations';
import { useExperience } from '../context/ExperienceContext';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import { projects } from '../data/projects';
import { site } from '../data/site';
import denisPhoto from '../images/HEANG Denis good image.jpg';

const PRELOAD_ASSETS = [denisPhoto, ...projects.map((project) => project.images[0])];
const CURTAIN_COLUMNS = 5;
const LEAD_SIGNAL = site.signals[0];
const LEAD_SIGNAL_LABEL = LEAD_SIGNAL
  ? `${LEAD_SIGNAL.value.toFixed(LEAD_SIGNAL.decimals)}${LEAD_SIGNAL.suffix} ${LEAD_SIGNAL.label}`
  : '';

const preloadImage = (src) =>
  new Promise((resolve) => {
    const image = new Image();
    image.onload = resolve;
    image.onerror = resolve;
    image.src = src;
  });

const wait = (duration) => new Promise((resolve) => window.setTimeout(resolve, duration));

/**
 * "Experience is Loading" — full-screen preloader with a giant kinetic counter,
 * a hairline progress bar and a staggered five-column curtain lift.
 */
export default function Preloader() {
  const { introComplete, setIntroComplete } = useExperience();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [phase, setPhase] = useState(() =>
    prefersReducedMotion || introComplete ? 'done' : 'loading',
  );

  const rootRef = useRef(null);
  const contentRef = useRef(null);
  const countRef = useRef(null);
  const barRef = useRef(null);
  const columnRefs = useRef([]);
  const introTweenRef = useRef(null);
  const finishTweenRef = useRef(null);
  const exitTweenRef = useRef(null);
  const exitingRef = useRef(false);
  const finishedRef = useRef(false);

  useEffect(() => {
    if (prefersReducedMotion || introComplete) {
      return undefined;
    }

    const root = document.documentElement;
    root.classList.add('intro-active');

    const progress = { value: 0 };

    const renderProgress = () => {
      const rounded = Math.round(progress.value);
      if (countRef.current) {
        countRef.current.textContent = String(rounded).padStart(2, '0');
      }
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${(progress.value / 100).toFixed(4)})`;
      }
    };

    const beginExit = () => {
      if (exitingRef.current) return;
      exitingRef.current = true;

      root.classList.remove('intro-active');
      setIntroComplete(true);
      setPhase('leaving');

      const columns = columnRefs.current.filter(Boolean);

      exitTweenRef.current = gsap
        .timeline({ onComplete: () => setPhase('done') })
        .to(
          contentRef.current,
          { autoAlpha: 0, y: -28, duration: 0.5, ease: 'power2.in' },
          0,
        )
        .to(
          columns,
          {
            yPercent: -101,
            duration: 1.4,
            ease: 'expo.inOut',
            stagger: { amount: 0.24 },
          },
          0.1,
        )
        .set(rootRef.current, { pointerEvents: 'none' }, 1.2);
    };

    const finish = () => {
      if (finishedRef.current) return;
      finishedRef.current = true;

      introTweenRef.current?.kill();
      finishTweenRef.current = gsap.to(progress, {
        value: 100,
        duration: 0.38,
        ease: 'power2.inOut',
        onUpdate: renderProgress,
        onComplete: beginExit,
      });
    };

    renderProgress();
    introTweenRef.current = gsap.to(progress, {
      value: 92,
      duration: 1.55,
      ease: 'power2.out',
      onUpdate: renderProgress,
    });

    const assets = Promise.all(PRELOAD_ASSETS.map(preloadImage));
    const fonts = document.fonts?.ready ?? Promise.resolve();

    Promise.race([
      Promise.all([assets, fonts, wait(1500)]),
      wait(3400),
    ]).then(finish);

    return () => {
      root.classList.remove('intro-active');
      introTweenRef.current?.kill();
      finishTweenRef.current?.kill();
      exitTweenRef.current?.kill();
    };
  }, [introComplete, prefersReducedMotion, setIntroComplete]);

  const skip = () => {
    if (exitingRef.current) return;
    finishedRef.current = true;
    introTweenRef.current?.kill();
    if (countRef.current) countRef.current.textContent = '100';
    if (barRef.current) barRef.current.style.transform = 'scaleX(1)';

    if (exitTweenRef.current) return;
    exitingRef.current = true;
    document.documentElement.classList.remove('intro-active');
    setIntroComplete(true);
    setPhase('leaving');

    const columns = columnRefs.current.filter(Boolean);
    exitTweenRef.current = gsap
      .timeline({ onComplete: () => setPhase('done') })
      .to(contentRef.current, { autoAlpha: 0, y: -28, duration: 0.4, ease: 'power2.in' }, 0)
      .to(
        columns,
        { yPercent: -101, duration: 1.4, ease: 'expo.inOut', stagger: { amount: 0.24 } },
        0.08,
      )
      .set(rootRef.current, { pointerEvents: 'none' }, 1.2);
  };

  if (prefersReducedMotion) return null;
  if (phase === 'done') return null;

  return (
    <div
      ref={rootRef}
      className={`preloader${phase === 'leaving' ? ' preloader--leaving' : ''}`}
      aria-label="Loading portfolio experience"
    >
      <div className="preloader__curtains" aria-hidden="true">
        {Array.from({ length: CURTAIN_COLUMNS }).map((_, index) => (
          <span
            key={index}
            className="preloader__curtain"
            ref={(node) => {
              columnRefs.current[index] = node;
            }}
          />
        ))}
      </div>

      <div ref={contentRef} className="preloader__content">
        <div className="preloader__top">
          <span className="preloader__meta">{site.name} — Portfolio</span>
          <span className="preloader__meta preloader__meta--right">{site.location.split(',')[0]} / 2026</span>
          <button type="button" className="preloader__skip" onClick={skip}>
            Skip intro
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>

        <div className="preloader__center">
          <p className="preloader__eyebrow">
            <span className="preloader__pulse" aria-hidden="true" />
            Experience is Loading
          </p>
          <p className="preloader__wordmark" aria-hidden="true">
            {site.firstName.toUpperCase()}<span>{site.lastName.toUpperCase()}</span>
          </p>
          <div className="preloader__status" role="status" aria-live="polite">
            <span>Preparing WebGL · GSAP · Lenis</span>
            <span className="preloader__status-line" aria-hidden="true" />
            <span>Data Science / ML / RAG</span>
          </div>
        </div>

        <div className="preloader__bottom">
          <div className="preloader__footnote">
            <span>01 — {String(projects.length).padStart(2, '0')} Selected Projects</span>
            <span>{LEAD_SIGNAL_LABEL}</span>
          </div>

          <div className="preloader__counter" aria-hidden="true">
            <span ref={countRef} className="preloader__counter-value">
              00
            </span>
            <i>%</i>
          </div>
        </div>

        <div className="preloader__bar" aria-hidden="true">
          <span ref={barRef} className="preloader__bar-fill" />
        </div>
      </div>

      <span className="preloader__grain" aria-hidden="true" />
    </div>
  );
}
