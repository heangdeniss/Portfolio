import { useState, useEffect, useRef } from 'react';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import usePointerTilt from '../hooks/usePointerTilt';
import CountUp from './CountUp';
import denisPhoto from '../images/HEANG Denis good image.jpg';

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
  const prefersReducedMotion = usePrefersReducedMotion();
  const sectionRef = useRef(null);
  const tiltRef = usePointerTilt(4.5);

  useEffect(() => {
    if (prefersReducedMotion) return undefined;

    let rafId = 0;

    const update = () => {
      rafId = 0;
      if (sectionRef.current) {
        const scroll = Math.min(window.scrollY, 900);
        const style = sectionRef.current.style;
        style.setProperty('--hero-parallax-slow', `${(scroll * 0.05).toFixed(1)}px`);
        style.setProperty('--hero-parallax-glow-x', `${(scroll * 0.12).toFixed(1)}px`);
        style.setProperty('--hero-parallax-glow-y', `${(scroll * 0.2).toFixed(1)}px`);
        style.setProperty('--hero-parallax-glow-x-reverse', `${(scroll * -0.09).toFixed(1)}px`);
        style.setProperty('--hero-parallax-glow-y-reverse', `${(scroll * 0.1).toFixed(1)}px`);
      }
    };

    const onScroll = () => {
      if (!rafId) rafId = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
    };
  }, [prefersReducedMotion]);


  const currentRole = ROLES[roleIndex];
  const rolePrefix = (prefersReducedMotion ? ROLES[0] : currentRole).startsWith('ML')
    ? 'I build as an'
    : 'I build as a';
  const visibleRoleText = prefersReducedMotion ? ROLES[0] : displayedText;

  useEffect(() => {
    if (prefersReducedMotion) return undefined;

    let timer;

    if (!isDeleting && displayedText === currentRole) {
      // Pause when full role is typed
      timer = setTimeout(() => setIsDeleting(true), 2200);
    } else if (isDeleting && displayedText === '') {
      // Brief pause, then advance to the next role
      timer = setTimeout(() => {
        setIsDeleting(false);
        setRoleIndex((prev) => (prev + 1) % ROLES.length);
      }, 180);
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
  }, [displayedText, isDeleting, roleIndex, currentRole, prefersReducedMotion]);

  return (
    <section id="hero" className="hero" ref={sectionRef}>
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
              <span className="sr-only">
                I work as a Data Science Engineer, Data Analyst, ML and RAG Developer, and Full-Stack Developer.
              </span>
              <span className="hero__role-prefix" aria-hidden="true">{rolePrefix}</span>
              <span className="hero__role-text" aria-hidden="true">
                {visibleRoleText}
                <span className="hero__cursor">|</span>
              </span>
            </div>

            {/* Prominent Name */}
            <h1 className="hero__name">
              <span className="hero__name-first">Heang</span>{' '}
              <span className="hero__name-last">
                Denis
                <svg className="hero__name-underline" viewBox="0 0 240 16" fill="none" aria-hidden="true">
                  <path
                    d="M4 11.5C58 4.5 164 2.5 236 8.5"
                    stroke="url(#heroNameUnderline)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    pathLength="1"
                  />
                  <defs>
                    <linearGradient id="heroNameUnderline" x1="0" y1="0" x2="240" y2="0" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#f59e0b" stopOpacity="0" />
                      <stop offset="0.2" stopColor="#fbbf24" />
                      <stop offset="0.8" stopColor="#f59e0b" />
                      <stop offset="1" stopColor="#f59e0b" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
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
              <span className="hero__spec-badge hero__spec-badge--emerald">
                <span className="hero__spec-dot" />
                FastAPI & React
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

            {/* Animated proof-of-work signals */}
            <div className="hero__signals" aria-label="Selected results">
              <div className="hero__signal">
                <span className="hero__signal-value">
                  <CountUp end={96.05} decimals={2} suffix="%" />
                </span>
                <span className="hero__signal-label">HMM POS accuracy</span>
              </div>
              <span className="hero__signal-divider" aria-hidden="true" />
              <div className="hero__signal">
                <span className="hero__signal-value">
                  <CountUp end={232} suffix="k+" />
                </span>
                <span className="hero__signal-label">Tokens processed</span>
              </div>
              <span className="hero__signal-divider" aria-hidden="true" />
              <div className="hero__signal">
                <span className="hero__signal-value">
                  <CountUp end={30} suffix="k+" />
                </span>
                <span className="hero__signal-label">Records modeled</span>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Glassmorphic Portrait Container with Top-Right Status */}
          <div className="hero__visual">
            <div className="hero__orbits" aria-hidden="true">
              <span className="hero__orbit hero__orbit--outer" />
              <span className="hero__orbit hero__orbit--inner" />
            </div>

            <span className="hero__float-chip hero__float-chip--one" style={{ '--chip-color': '#3776AB' }} aria-hidden="true">
              Python
            </span>
            <span className="hero__float-chip hero__float-chip--two" style={{ '--chip-color': '#8b5cf6' }} aria-hidden="true">
              RAG
            </span>
            <span className="hero__float-chip hero__float-chip--three" style={{ '--chip-color': '#10b981' }} aria-hidden="true">
              FastAPI
            </span>

            <div className="hero__card-tilt" ref={tiltRef}>
              <div className="hero__glass-card">
                <div className="hero__glass-card-glow" />
                
                {/* Single Top-Right Live Status Pill */}
                <div className="hero__portrait-status">
                  <span className="hero__status-indicator">
                    <span className="hero__status-ping" />
                    <span className="hero__status-core" />
                  </span>
                  <span className="hero__portrait-status-text">Phnom Penh, Cambodia</span>
                </div>

                <div className="hero__image-container">
                  <img
                    src={denisPhoto}
                    alt="Portrait of Heang Denis, Data Science and Machine Learning Engineer"
                    className="hero__portrait-img"
                    width="900"
                    height="1200"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                  <div className="hero__image-overlay" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll-down hint */}
      <a href="#about" className="hero__scroll-hint" aria-label="Scroll to About section">
        <span className="hero__scroll-hint-text">Scroll</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </a>
    </section>
  );
}
