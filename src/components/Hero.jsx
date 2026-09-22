import { useState, useEffect } from 'react';
import denisPhoto from '../images/HEANG Denis CTC.jpg';

const ROLES = [
  'Data Science Engineer',
  'ML & RAG Developer',
  'Full-Stack Developer',
];

export default function Hero() {
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const currentRole = ROLES[roleIndex];
  const rolePrefix = currentRole.startsWith('ML') ? 'I build as an' : 'I build as a';

  useEffect(() => {
    let timer;

    if (!isDeleting && displayedText === currentRole) {
      // Pause when full role is typed
      timer = setTimeout(() => setIsDeleting(true), 2200);
    } else if (isDeleting && displayedText === '') {
      // Advance to next role
      setIsDeleting(false);
      setRoleIndex((prev) => (prev + 1) % ROLES.length);
    } else {
      // Typing or deleting
      const speed = isDeleting ? 40 : 85;
      timer = setTimeout(() => {
        setDisplayedText((prev) =>
          isDeleting
            ? currentRole.substring(0, prev.length - 1)
            : currentRole.substring(0, prev.length + 1)
        );
      }, speed);
    }

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, roleIndex, currentRole]);

  return (
    <section id="hero" className="hero">
      <div className="hero__glow-top" />
      <div className="hero__glow-right" />

      <div className="container">
        <div className="hero__layout">
          {/* Left Column: Bio & Interactive Controls */}
          <div className="hero__content">
            {/* Active Status Badge */}
            <div className="hero__status-badge">
              <span className="hero__status-indicator">
                <span className="hero__status-ping" />
                <span className="hero__status-core" />
              </span>
              <span className="hero__status-text">Available for Projects & Full-Time Roles</span>
            </div>

            {/* Dynamic Role Switcher */}
            <div className="hero__role-wrapper">
              <span className="hero__role-prefix">{rolePrefix}</span>
              <span className="hero__role-text">
                {displayedText}
                <span className="hero__cursor">|</span>
              </span>
            </div>

            {/* Prominent Name */}
            <h1 className="hero__name">
              <span className="hero__name-first">Heang</span>{' '}
              <span className="hero__name-last">Denis</span>
            </h1>

            {/* Tagline */}
            <p className="hero__tagline">
              Engineering intelligent machine learning pipelines, probabilistic models, 
              and conversational AI into scalable, production-ready software.
            </p>

            {/* Bio Description */}
            <p className="hero__bio">
              Data Science student at the <strong>Institute of Technology of Cambodia</strong> (Expected Graduation: 2027). 
              Passionate about bridging mathematical rigor with high-performance engineering — specializing in 
              predictive modeling, RAG architectures, and full-stack solutions.
            </p>

            {/* High-Converting CTA Buttons */}
            <div className="hero__actions">
              <a href="#projects" className="btn btn-primary hero__btn-primary">
                <span>View Projects</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M7 17L17 7M7 7h10v10" />
                </svg>
              </a>
              <a href="#contact" className="btn btn-outline hero__btn-outline">
                <span>Get In Touch</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </a>
              <a 
                href="https://github.com/heangdeniss" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hero__github-chip"
                aria-label="GitHub Profile"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
                <span>GitHub</span>
              </a>
            </div>
          </div>

          {/* Right Column: Clean Glassmorphic Portrait Container with Top-Right Status */}
          <div className="hero__visual">
            <div className="hero__glass-card">
              <div className="hero__glass-card-glow" />
              
              {/* Single Top-Right Live Status Pill */}
              <div className="hero__portrait-status">
                <span className="hero__status-indicator">
                  <span className="hero__status-ping" />
                  <span className="hero__status-core" />
                </span>
                <span className="hero__portrait-status-text">Open for Opportunities</span>
              </div>

              <div className="hero__image-container">
                <img
                  src={denisPhoto}
                  alt="Heang Denis - Data Science & ML Engineer"
                  className="hero__portrait-img"
                  loading="eager"
                />
                <div className="hero__image-overlay" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
