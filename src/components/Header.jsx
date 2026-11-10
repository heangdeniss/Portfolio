import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from '../lib/animations';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import RollText from './RollText';
import MagneticButton from './MagneticButton';
import { site } from '../data/site';

const navLinks = [
  { index: '01', label: 'Home', href: '#hero', aliases: ['hero', 'home'] },
  { index: '02', label: 'About', href: '#about', aliases: ['about'] },
  { index: '03', label: 'Stack', href: '#skills', aliases: ['skills', 'stack'] },
  { index: '04', label: 'Trajectory', href: '#background', aliases: ['background', 'trajectory'] },
  { index: '05', label: 'Work', href: '#projects', aliases: ['projects', 'work'] },
  { index: '06', label: 'Notes', href: '#notes', aliases: ['notes'] },
  { index: '07', label: 'Contact', href: '#contact', aliases: ['contact'] },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const headerRef = useRef(null);
  const pillRef = useRef(null);
  const linkRefs = useRef({});
  const hasPlacedPillRef = useRef(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  const syncActivePill = useCallback(
    (immediate = false) => {
      const pill = pillRef.current;
      const activeEl = linkRefs.current[activeSection];
      if (!pill || !activeEl) return;

      const x = activeEl.offsetLeft;
      const width = activeEl.offsetWidth;
      if (!width) return;

      if (immediate || prefersReducedMotion || !hasPlacedPillRef.current) {
        hasPlacedPillRef.current = true;
        gsap.set(pill, { x, width, opacity: 1 });
        return;
      }

      gsap.to(pill, {
        x,
        width,
        opacity: 1,
        duration: 0.62,
        ease: 'elastic.out(1, 0.74)',
        overwrite: 'auto',
      });
    },
    [activeSection, prefersReducedMotion],
  );

  useLayoutEffect(() => {
    syncActivePill(false);
  }, [syncActivePill]);

  useEffect(() => {
    const onResize = () => syncActivePill(true);
    window.addEventListener('resize', onResize, { passive: true });
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => syncActivePill(true)).catch(() => {});
    }
    return () => window.removeEventListener('resize', onResize);
  }, [syncActivePill]);

  useEffect(() => {
    // A 56px sentinel replaces the old scroll listener: it leaves the viewport
    // exactly when the header should switch to its compact/scrolled treatment.
    const sentinel = document.getElementById('header-scroll-sentinel');
    const scrollObserver = sentinel
      ? new IntersectionObserver(
          ([entry]) => setScrolled(!entry.isIntersecting),
          { threshold: 0 },
        )
      : null;

    if (sentinel && scrollObserver) {
      scrollObserver.observe(sentinel);
    }

    const sectionElements = [];
    const elementToCanonicalId = new Map();

    navLinks.forEach((link) => {
      const canonicalId = link.href.slice(1);
      for (const candidateId of link.aliases) {
        const el = document.getElementById(candidateId);
        if (el) {
          sectionElements.push(el);
          elementToCanonicalId.set(el, canonicalId);
          break;
        }
      }
    });

    const intersectingMap = new Map();

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const canonicalId = elementToCanonicalId.get(entry.target);
          if (!canonicalId) return;

          if (entry.isIntersecting) {
            intersectingMap.set(canonicalId, {
              ratio: entry.intersectionRatio,
              top: entry.boundingClientRect.top,
            });
          } else {
            intersectingMap.delete(canonicalId);
          }
        });

        if (intersectingMap.size === 0) return;

        // Pick the section whose top is closest to the upper reading zone (28% viewport height).
        const readingLine = window.innerHeight * 0.28;
        let bestId = null;
        let bestScore = Infinity;

        intersectingMap.forEach((metrics, id) => {
          const distance = Math.abs(metrics.top - readingLine);
          if (distance < bestScore) {
            bestScore = distance;
            bestId = id;
          }
        });

        if (bestId) {
          setActiveSection(bestId);
        }
      },
      {
        rootMargin: '-18% 0px -46% 0px',
        threshold: [0, 0.08, 0.2, 0.4, 0.65],
      },
    );

    sectionElements.forEach((el) => sectionObserver.observe(el));

    return () => {
      scrollObserver?.disconnect();
      sectionObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!mobileOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };
    const onPointerDown = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setMobileOpen(false);
      }
    };
    const onResize = () => {
      if (window.innerWidth > 968) setMobileOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('resize', onResize);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('resize', onResize);
    };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header
      ref={headerRef}
      className={`header${scrolled ? ' header--scrolled' : ''}${mobileOpen ? ' header--menu-open' : ''}`}
    >
      {/* Progressive top blur/gradient shield so scrolling content dissolves before the top gap */}
      <div className="header__top-shield" aria-hidden="true" />

      <div className="header__inner">
        <a
          href="#hero"
          className="header__logo"
          aria-label={`${site.name} — back to top`}
          data-cursor="Top"
          onClick={() => setActiveSection('hero')}
        >
          <span className="header__logo-text">{site.lastName}</span>
          <span className="header__logo-dot">.</span>
        </a>

        <MagneticButton
          as="nav"
          className="header__nav"
          strength={0.07}
          maxOffset={4}
          aria-label="Primary"
        >
          <span ref={pillRef} className="header__active-pill" aria-hidden="true" />
          {navLinks.map((link) => {
            const sectionId = link.href.slice(1);
            const isActive = activeSection === sectionId;
            return (
              <a
                key={link.href}
                ref={(node) => {
                  if (node) linkRefs.current[sectionId] = node;
                }}
                href={link.href}
                className={`header__link${isActive ? ' header__link--active' : ''}`}
                aria-current={isActive ? 'location' : undefined}
                onClick={() => setActiveSection(sectionId)}
              >
                <span className="header__link-index" aria-hidden="true">{link.index}</span>
                <RollText>{link.label}</RollText>
              </a>
            );
          })}
        </MagneticButton>

        <MagneticButton
          href="#contact"
          className="header__cta-btn"
          strength={0.26}
          maxOffset={6}
          data-cursor="Talk"
          onClick={() => setActiveSection('contact')}
        >
          <RollText>Let&apos;s Talk</RollText>
          <span className="header__cta-arrow" aria-hidden="true">↗</span>
        </MagneticButton>

        <button
          className="header__hamburger"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
        >
          <span className={`header__line${mobileOpen ? ' open' : ''}`} />
          <span className={`header__line${mobileOpen ? ' open' : ''}`} />
          <span className={`header__line${mobileOpen ? ' open' : ''}`} />
        </button>
      </div>

      {mobileOpen && (
        <>
          <div className="header__mobile-backdrop" onClick={closeMobile} aria-hidden="true" />
          <nav id="mobile-navigation" className="header__mobile" aria-label="Mobile">
            {navLinks.map((link) => {
              const sectionId = link.href.slice(1);
              const isActive = activeSection === sectionId;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`header__mobile-link${isActive ? ' header__mobile-link--active' : ''}`}
                  onClick={() => {
                    setActiveSection(sectionId);
                    closeMobile();
                  }}
                  aria-current={isActive ? 'location' : undefined}
                >
                  <span className="header__mobile-index" aria-hidden="true">{link.index}</span>
                  {link.label}
                </a>
              );
            })}
            <a
              href="#contact"
              className="header__mobile-cta"
              onClick={() => {
                setActiveSection('contact');
                closeMobile();
              }}
            >
              <span>Let&apos;s Talk</span>
              <span aria-hidden="true">↗</span>
            </a>
          </nav>
        </>
      )}
    </header>
  );
}
