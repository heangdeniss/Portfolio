import { useEffect, useRef, useState } from 'react';
import { gsap } from '../lib/animations';
import { useExperience } from '../context/ExperienceContext';
import MagneticButton from './MagneticButton';

const ROUTES = [
  { id: 'hero', index: '01', label: 'Home' },
  { id: 'about', index: '02', label: 'About' },
  { id: 'skills', index: '03', label: 'Stack' },
  { id: 'background', index: '04', label: 'Trajectory' },
  { id: 'projects', index: '05', label: 'Work' },
  { id: 'notes', index: '06', label: 'Notes' },
  { id: 'contact', index: '07', label: 'Contact' },
];

/**
 * Floating utility HUD: numbered routes, WebGL quality and contrast controls.
 * Collapsed by default so it never competes with the editorial layout.
 */
export default function UtilityHUD() {
  const { quality, setQuality, contrast, setContrast } = useExperience();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('hero');
  const rootRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    const sections = ROUTES.map((route) => document.getElementById(route.id)).filter(Boolean);
    if (!sections.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-38% 0px -56% 0px', threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return undefined;

    const tween = gsap.to(panel, {
      autoAlpha: open ? 1 : 0,
      y: open ? 0 : 10,
      duration: open ? 0.42 : 0.24,
      ease: open ? 'power3.out' : 'power2.in',
      overwrite: true,
    });

    return () => tween.kill();
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`utility${open ? ' is-open' : ''}`}>
      <MagneticButton
        as="button"
        className="utility__trigger"
        strength={0.22}
        aria-expanded={open}
        aria-controls="utility-panel"
        onClick={() => setOpen((value) => !value)}
        data-cursor={open ? 'Close' : 'Menu'}
      >
        <span className="utility__trigger-icon" aria-hidden="true">
          <span />
          <span />
        </span>
        <span className="utility__trigger-label">Index</span>
        <span className="utility__trigger-count">{String(ROUTES.length).padStart(2, '0')}</span>
      </MagneticButton>

      <div
        ref={panelRef}
        id="utility-panel"
        className="utility__panel"
        inert={!open}
        aria-hidden={!open}
      >
        <div className="utility__panel-inner">
          <div className="utility__head">
            <span>Utility / 2026</span>
            <span className="utility__head-dot" aria-hidden="true" />
          </div>

          <nav className="utility__routes" aria-label="Utility navigation">
            {ROUTES.map((route) => (
              <a
                key={route.id}
                href={`#${route.id}`}
                className={`utility__route${active === route.id ? ' is-active' : ''}`}
                aria-current={active === route.id ? 'location' : undefined}
                onClick={() => setOpen(false)}
              >
                <span className="utility__route-index">{route.index}</span>
                <span className="utility__route-label">{route.label}</span>
                <span className="utility__route-arrow" aria-hidden="true">↗</span>
              </a>
            ))}
          </nav>

          <div className="utility__settings">
            <div className="utility__setting">
              <span className="utility__setting-label">WebGL</span>
              <div className="utility__segmented" role="group" aria-label="WebGL quality">
                <button
                  type="button"
                  className={quality === 'high' ? 'is-active' : ''}
                  aria-pressed={quality === 'high'}
                  onClick={() => setQuality('high')}
                >
                  High
                </button>
                <button
                  type="button"
                  className={quality === 'low' ? 'is-active' : ''}
                  aria-pressed={quality === 'low'}
                  onClick={() => setQuality('low')}
                >
                  Low
                </button>
              </div>
            </div>

            <div className="utility__setting">
              <span className="utility__setting-label">Theme</span>
              <div className="utility__segmented" role="group" aria-label="Theme contrast">
                <button
                  type="button"
                  className={!contrast ? 'is-active' : ''}
                  aria-pressed={!contrast}
                  onClick={() => setContrast(false)}
                >
                  Dark
                </button>
                <button
                  type="button"
                  className={contrast ? 'is-active' : ''}
                  aria-pressed={contrast}
                  onClick={() => setContrast(true)}
                >
                  Contrast
                </button>
              </div>
            </div>
          </div>

          <p className="utility__note">
            {quality === 'high'
              ? 'Full shader detail · 60fps target'
              : 'Reduced render scale · 30fps target'}
          </p>
        </div>
      </div>
    </div>
  );
}
