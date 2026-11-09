import { useEffect, useRef, useState } from 'react';
import RollText from './RollText';
import MagneticButton from './MagneticButton';

const navLinks = [
  { index: '01', label: 'Home', href: '#hero' },
  { index: '02', label: 'About', href: '#about' },
  { index: '03', label: 'Stack', href: '#skills' },
  { index: '04', label: 'Trajectory', href: '#background' },
  { index: '05', label: 'Work', href: '#projects' },
  { index: '06', label: 'Contact', href: '#contact' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const headerRef = useRef(null);

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
      // IntersectionObserver always emits an initial entry, so reloads that
      // restore a non-zero scroll position are handled without a scroll read.
      scrollObserver.observe(sentinel);
    }

    const sections = navLinks
      .map(({ href }) => document.getElementById(href.slice(1)))
      .filter(Boolean);

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );

    sections.forEach((el) => sectionObserver.observe(el));

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
      <div className="header__inner">
        <a href="#hero" className="header__logo" aria-label="Denis — back to top" data-cursor="Top">
          <span className="header__logo-text">Denis</span>
          <span className="header__logo-dot">.</span>
        </a>

        <MagneticButton
          as="nav"
          className="header__nav"
          strength={0.07}
          aria-label="Primary"
        >
          {navLinks.map((link) => {
            const isActive = activeSection === link.href.slice(1);
            return (
              <a
                key={link.href}
                href={link.href}
                className={`header__link${isActive ? ' header__link--active' : ''}`}
                aria-current={isActive ? 'location' : undefined}
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
          strength={0.2}
          data-cursor="Talk"
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
              const isActive = activeSection === link.href.slice(1);
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`header__mobile-link${isActive ? ' header__mobile-link--active' : ''}`}
                  onClick={closeMobile}
                  aria-current={isActive ? 'location' : undefined}
                >
                  <span className="header__mobile-index" aria-hidden="true">{link.index}</span>
                  {link.label}
                </a>
              );
            })}
            <a href="#contact" className="header__mobile-cta" onClick={closeMobile}>
              <span>Let&apos;s Talk</span>
              <span aria-hidden="true">↗</span>
            </a>
          </nav>
        </>
      )}
    </header>
  );
}
