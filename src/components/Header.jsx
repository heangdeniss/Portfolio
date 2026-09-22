import { useState, useEffect } from 'react';

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });

    const sections = navLinks.map(({ href }) =>
      document.getElementById(href.slice(1))
    ).filter(Boolean);

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

  return (
    <header className={`header${scrolled ? ' header--scrolled' : ''}`}>
      <div className="header__inner">
        <a href="#hero" className="header__logo" aria-label="Denis - Home">
          <span className="header__logo-text">Denis</span>
          <span className="header__logo-dot">.</span>
        </a>
        <nav className="header__nav">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`header__link${activeSection === link.href.slice(1) ? ' header__link--active' : ''}`}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <a href="#contact" className="header__cta-btn">
          <span>Let's Talk</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M7 17L17 7M7 7h10v10" />
          </svg>
        </a>
        <button
          className="header__hamburger"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span className={`header__line${mobileOpen ? ' open' : ''}`} />
          <span className={`header__line${mobileOpen ? ' open' : ''}`} />
          <span className={`header__line${mobileOpen ? ' open' : ''}`} />
        </button>
      </div>
      {mobileOpen && (
        <nav className="header__mobile">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="header__mobile-link"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
