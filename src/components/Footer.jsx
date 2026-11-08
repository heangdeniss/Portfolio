export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <span className="footer__watermark" aria-hidden="true">Denis</span>
      <div className="container">
        <div className="footer__layout">
          {/* Brand & Mission */}
          <div className="footer__brand-col">
            <a href="#hero" className="footer__logo">
              <span className="footer__logo-text">Denis</span>
              <span className="footer__logo-dot">.</span>
            </a>
            <p className="footer__tagline">
              Data Science student &amp; Full-Stack Developer at the Institute of Technology of Cambodia. 
              Engineering intelligent, robust, and impactful AI software.
            </p>
          </div>

          {/* Quick Anchor Links */}
          <div className="footer__links-col">
            <span className="footer__col-heading">Navigation</span>
            <div className="footer__links-grid">
              <a href="#hero">Home</a>
              <a href="#about">About Me</a>
              <a href="#skills">Skills</a>
              <a href="#background">Experience</a>
              <a href="#projects">Projects</a>
              <a href="#contact">Contact</a>
            </div>
          </div>

          {/* Connect Links */}
          <div className="footer__connect-col">
            <span className="footer__col-heading">Connect</span>
            <div className="footer__social-links">
              <a href="https://github.com/heangdeniss" target="_blank" rel="noopener noreferrer" className="footer__social-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
                <span>GitHub</span>
              </a>
              <a href="https://www.linkedin.com/in/heang-denis-1a4b23369/" target="_blank" rel="noopener noreferrer" className="footer__social-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                <span>LinkedIn</span>
              </a>
              <a href="https://t.me/heang_deniss" target="_blank" rel="noopener noreferrer" className="footer__social-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 8.16l-1.97 9.28c-.15.65-.53.81-1.08.51l-3-2.21-1.45 1.39c-.16.16-.3.3-.61.3l.21-3.05 5.56-5.02c.24-.22-.05-.34-.38-.13l-6.87 4.33-2.96-.92c-.64-.2-.66-.64.13-.95l11.57-4.46c.54-.2 1.01.13.85.92z" />
                </svg>
                <span>Telegram</span>
              </a>
              <a href="mailto:heangdenis011468@gmail.com" className="footer__social-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <span>Email</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer__bottom-bar">
          <p className="footer__copy">
            &copy; {currentYear} <strong>Heang Denis</strong>. Crafted with clean architecture &amp; modern web design.
          </p>
          <div className="footer__badge">
            <span className="footer__badge-dot" />
            <span>Phnom Penh, Cambodia</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
