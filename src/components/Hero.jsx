import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from '../lib/animations';
import { useExperience } from '../context/ExperienceContext';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import usePointerTilt from '../hooks/usePointerTilt';
import useSplitReveal from '../hooks/useSplitReveal';
import CountUp from './CountUp';
import MagneticButton from './MagneticButton';
import denisPhoto from '../images/HEANG Denis good image.jpg';

const ROLES = [
  'Data Science Engineer',
  'Data Analyst',
  'ML & RAG Developer',
  'Full-Stack Developer',
];

const ORBIT_TEXT = 'DATA SCIENCE • MACHINE LEARNING • RAG SYSTEMS • ANALYTICS • PROBABILISTIC MODELS • FULL-STACK • ';

export default function Hero() {
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const { introComplete } = useExperience();
  const sectionRef = useRef(null);
  const contentRef = useRef(null);
  const visualRef = useRef(null);
  const portraitStackRef = useRef(null);
  const cloneRefs = useRef([]);
  const glowTopRef = useRef(null);
  const glowRightRef = useRef(null);
  const scrollHintRef = useRef(null);
  const tiltRef = usePointerTilt(4.5);

  const nameRef = useSplitReveal({
    play: introComplete,
    stagger: 0.06,
    duration: 1.2,
    delay: 0.4,
  });

  const taglineRef = useSplitReveal({
    play: introComplete,
    stagger: 0.07,
    duration: 1.15,
    delay: 0.58,
  });

  useLayoutEffect(() => {
    if (prefersReducedMotion) return undefined;

    const context = gsap.context(() => {
      const reveals = gsap.utils.toArray('.hero__reveal');
      const clones = cloneRefs.current.filter(Boolean);

      if (!introComplete) {
        gsap.set(portraitStackRef.current, { scale: 1.25 });
        gsap.set(clones, {
          opacity: 0.55,
          x: (index) => (index === 0 ? -12 : 12),
        });
        gsap.set(reveals, { autoAlpha: 0, y: 26 });
        return;
      }

      gsap.fromTo(
        portraitStackRef.current,
        { scale: 1.25 },
        { scale: 1, duration: 1.7, ease: 'expo.out', delay: 0.34 },
      );

      gsap.fromTo(
        clones,
        {
          opacity: 0.55,
          x: (index) => (index === 0 ? -12 : 12),
        },
        {
          opacity: 0,
          x: 0,
          duration: 1.5,
          ease: 'expo.out',
          delay: 0.34,
        },
      );

      gsap.fromTo(
        reveals,
        { autoAlpha: 0, y: 26 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.075,
          delay: 0.52,
        },
      );

      gsap.to(contentRef.current, {
        yPercent: -7,
        autoAlpha: 0.5,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      gsap.to(visualRef.current, {
        y: 80,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      gsap.to([glowTopRef.current, glowRightRef.current], {
        y: 140,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      gsap.to(scrollHintRef.current, {
        autoAlpha: 0,
        y: 30,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '30% top',
          scrub: true,
        },
      });
    }, sectionRef);

    return () => context.revert();
  }, [introComplete, prefersReducedMotion]);

  const currentRole = ROLES[roleIndex];
  const rolePrefix = (prefersReducedMotion ? ROLES[0] : currentRole).startsWith('ML')
    ? 'I build as an'
    : 'I build as a';
  const visibleRoleText = prefersReducedMotion ? ROLES[0] : displayedText;

  useEffect(() => {
    if (prefersReducedMotion) return undefined;

    let timer;

    if (!isDeleting && displayedText === currentRole) {
      timer = setTimeout(() => setIsDeleting(true), 2200);
    } else if (isDeleting && displayedText === '') {
      timer = setTimeout(() => {
        setIsDeleting(false);
        setRoleIndex((prev) => (prev + 1) % ROLES.length);
      }, 180);
    } else {
      const speed = isDeleting ? 40 : 85;
      timer = setTimeout(() => {
        setDisplayedText((prev) =>
          isDeleting
            ? currentRole.substring(0, prev.length - 1)
            : currentRole.substring(0, prev.length + 1),
        );
      }, speed);
    }

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, roleIndex, currentRole, prefersReducedMotion]);

  return (
    <section id="hero" className="hero" ref={sectionRef}>
      <div className="hero__glow-top" ref={glowTopRef} />
      <div className="hero__glow-right" ref={glowRightRef} />

      <div className="container">
        <div className="hero__layout">
          <div className="hero__content" ref={contentRef}>
            <div className="hero__status-badge hero__reveal">
              <span className="hero__status-indicator">
                <span className="hero__status-ping" />
                <span className="hero__status-core" />
              </span>
              <span className="hero__status-text">Available for Projects &amp; Full-Time Roles</span>
            </div>

            <div className="hero__role-wrapper hero__reveal">
              <span className="sr-only">
                I work as a Data Science Engineer, Data Analyst, ML and RAG Developer, and Full-Stack Developer.
              </span>
              <span className="hero__role-prefix" aria-hidden="true">{rolePrefix}</span>
              <span className="hero__role-text" aria-hidden="true">
                {visibleRoleText}
                <span className="hero__cursor">|</span>
              </span>
            </div>

            <h1 className="hero__name" aria-label="Heang Denis" ref={nameRef}>
              <span className="hero__name-line" aria-hidden="true">
                <span className="hero__name-inner" data-split-line>Heang</span>
              </span>
              <span className="hero__name-line hero__name-line--accent" aria-hidden="true">
                <span className="hero__name-inner" data-split-line>Denis</span>
              </span>
            </h1>

            <p
              className="hero__tagline"
              aria-label="Bridging mathematical rigor with full-stack execution."
              ref={taglineRef}
            >
              <span className="hero__tagline-line" aria-hidden="true">
                <span className="hero__tagline-inner" data-split-line>
                  Bridging <em>mathematical rigor</em>
                </span>
              </span>
              <span className="hero__tagline-line" aria-hidden="true">
                <span className="hero__tagline-inner" data-split-line>with full-stack execution.</span>
              </span>
            </p>

            <div className="hero__specializations hero__reveal">
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
                FastAPI &amp; React
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

            <p className="hero__bio hero__reveal">
              Data Science student at the <strong className="hero__bio-highlight">Institute of Technology of Cambodia</strong> (Expected Graduation: 2027). Focused on engineering end-to-end machine learning pipelines, probabilistic computing, and high-performance web systems.
            </p>

            <div className="hero__actions hero__reveal">
              <MagneticButton
                href="#projects"
                className="btn btn-primary hero__btn-primary"
                strength={0.24}
                data-cursor="View"
              >
                <span>View Featured Projects</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M7 17L17 7M7 7h10v10" />
                </svg>
              </MagneticButton>

              <MagneticButton
                href="#contact"
                className="btn btn-outline hero__btn-outline"
                strength={0.22}
                data-cursor="Talk"
              >
                <span>Let&apos;s Talk</span>
                <span className="hero__btn-arrow" aria-hidden="true">↗</span>
              </MagneticButton>

              <MagneticButton
                href="/Heang_Denis_CV.pdf"
                download="Heang_Denis_CV.pdf"
                className="btn btn-secondary hero__btn-cv"
                strength={0.2}
                title="Download CV (PDF)"
                data-cursor="PDF"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Download CV (PDF)</span>
              </MagneticButton>
            </div>

            <div className="hero__signals hero__reveal" aria-label="Selected results">
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

          <div className="hero__visual" ref={visualRef}>
            <div className="hero__orbits" aria-hidden="true">
              <span className="hero__orbit hero__orbit--outer" />
              <span className="hero__orbit hero__orbit--inner" />
              <svg className="hero__orbit-text" viewBox="0 0 520 520" focusable="false">
                <defs>
                  <path
                    id="heroOrbitTextPath"
                    d="M260,260 m-236,0 a236,236 0 1,1 472,0 a236,236 0 1,1 -472,0"
                    fill="none"
                  />
                </defs>
                <text>
                  <textPath href="#heroOrbitTextPath" startOffset="0">
                    {`${ORBIT_TEXT}${ORBIT_TEXT}`}
                  </textPath>
                </text>
              </svg>
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

                <div className="hero__portrait-status">
                  <span className="hero__status-indicator">
                    <span className="hero__status-ping" />
                    <span className="hero__status-core" />
                  </span>
                  <span className="hero__portrait-status-text">Phnom Penh, Cambodia</span>
                </div>

                <div className="hero__image-container">
                  <div className="hero__portrait-stack" ref={portraitStackRef}>
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
                    <img
                      src={denisPhoto}
                      alt=""
                      aria-hidden="true"
                      draggable="false"
                      className="hero__portrait-clone hero__portrait-clone--red"
                      ref={(node) => {
                        cloneRefs.current[0] = node;
                      }}
                    />
                    <img
                      src={denisPhoto}
                      alt=""
                      aria-hidden="true"
                      draggable="false"
                      className="hero__portrait-clone hero__portrait-clone--cyan"
                      ref={(node) => {
                        cloneRefs.current[1] = node;
                      }}
                    />
                  </div>
                  <div className="hero__image-overlay" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <a
        href="#about"
        className="hero__scroll-hint"
        aria-label="Scroll to About section"
        ref={scrollHintRef}
        data-cursor="Scroll"
      >
        <span className="hero__scroll-hint-text">Scroll</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </a>
    </section>
  );
}
