import { useState, useEffect } from 'react';
import denisPhoto from '../images/HEANG Denis CTC.jpg';

const ROLES = [
  'Data Science Engineer',
  'Data Analyst',
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

            {/* Editorial Lead Tagline */}
            <p className="hero__tagline">
              Bridging mathematical rigor with full-stack execution.
            </p>

            {/* Specialized Engineering Capabilities */}
            <div className="hero__specializations">
              <span className="hero__spec-badge hero__spec-badge--amber">
                <span className="hero__spec-dot" />
                Predictive Modeling
              </span>
              <span className="hero__spec-badge hero__spec-badge--cyan">
                <span className="hero__spec-dot" />
                RAG Architectures
              </span>
              <span className="hero__spec-badge hero__spec-badge--purple">
                <span className="hero__spec-dot" />
                Probabilistic Models (HMM)
              </span>
              <span className="hero__spec-badge hero__spec-badge--blue">
                <span className="hero__spec-dot" />
                Data Analyst
              </span>
              <span className="hero__spec-badge hero__spec-badge--teal">
                <span className="hero__spec-dot" />
                Data Cleaning
              </span>
              <span className="hero__spec-badge hero__spec-badge--emerald">
                <span className="hero__spec-dot" />
                FastAPI & React
              </span>
            </div>

            {/* Bio Description */}
            <p className="hero__bio">
              Data Science student at the <strong className="hero__bio-highlight">Institute of Technology of Cambodia</strong> (Expected Graduation: 2027). Focused on engineering end-to-end machine learning pipelines, probabilistic computing, and high-performance web systems.
            </p>

            {/* High-Converting CTA Buttons */}
            <div className="hero__actions">
              <a href="#projects" className="btn btn-primary hero__btn-primary">
                <span>View Featured Projects</span>
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
                href="/Heang_Denis_CV.pdf" 
                download="Heang_Denis_CV.pdf"
                className="btn btn-secondary hero__btn-cv"
                title="Download CV (PDF)"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Download CV (PDF)</span>
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
