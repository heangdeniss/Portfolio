export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__layout">
          {/* Brand & Mission */}
          <div className="footer__brand-col">
            <a href="#hero" className="footer__logo">
              <span className="footer__logo-text">Denis</span>
              <span className="footer__logo-dot">.</span>
            </a>
            <p className="footer__tagline">
              Data Science student & Full-Stack Developer at the Institute of Technology of Cambodia. 
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
              <a href="https://github.com/heangdeniss" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
              <a href="https://www.linkedin.com/in/heang-denis-1a4b23369/" target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
              <a href="https://t.me/heang_deniss" target="_blank" rel="noopener noreferrer">
                Telegram
              </a>
              <a href="mailto:heangdenis011468@gmail.com">
                Email
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer__bottom-bar">
          <p className="footer__copy">
            &copy; {currentYear} <strong>Heang Denis</strong>. Crafted with clean architecture & modern web design.
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
