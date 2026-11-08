import { useEffect, useRef, useState } from 'react';
import RollText from './RollText';

const navLinks = [
  { label: 'Home', href: '#hero' },
  { label: 'About Me', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Background', href: '#background' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const headerRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });

    const sections = navLinks
      .map(({ href }) => document.getElementById(href.slice(1)))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );

    sections.forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, []);

  // Close the mobile menu on Escape, outside click, or when returning to desktop.
  useEffect(() => {
    if (!mobileOpen) return;

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
        <a href="#hero" className="header__logo" aria-label="Denis — back to top">
          <span className="header__logo-text">Denis</span>
          <span className="header__logo-dot">.</span>
        </a>

        <nav className="header__nav" aria-label="Primary">
          {navLinks.map((link) => {
            const isActive = activeSection === link.href.slice(1);
            return (
              <a
                key={link.href}
                href={link.href}
                className={`header__link${isActive ? ' header__link--active' : ''}`}
                aria-current={isActive ? 'location' : undefined}
              >
                <RollText>{link.label}</RollText>
              </a>
            );
          })}
        </nav>

        <a href="#contact" className="header__cta-btn">
          <RollText>Let&apos;s Talk</RollText>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M7 17L17 7M7 7h10v10" />
          </svg>
        </a>

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
                  {link.label}
                </a>
              );
            })}
            <a href="#contact" className="header__mobile-cta" onClick={closeMobile}>
              <span>Let&apos;s Talk</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M7 17L17 7M7 7h10v10" />
              </svg>
            </a>
          </nav>
        </>
      )}
    </header>
  );
}
