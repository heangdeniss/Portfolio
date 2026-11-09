import { useEffect, useRef, useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import TypeRibbon from './components/TypeRibbon';
import About from './components/About';
import Skills from './components/Skills';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AmbientBackground from './components/AmbientBackground';
import Preloader from './components/Preloader';
import CustomCursor from './components/CustomCursor';
import UtilityHUD from './components/UtilityHUD';
import SmoothScrollProvider from './components/SmoothScrollProvider';
import { ExperienceProvider, useExperience } from './context/ExperienceContext';
import useSpotlight from './hooks/useSpotlight';
import useVelocitySurfaces from './hooks/useVelocitySurfaces';
import { gsap } from './lib/animations';
import './App.css';
import './animations.css';
import './act-two.css';
import './act-three.css';
import './act-four.css';
import './experience.css';

const RING_RADIUS = 21;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const RIBBON_ONE = {
  top: ['ANALYZE', 'MODEL', 'BUILD', 'SHIP'],
  bottom: ['DATA SCIENCE', 'MACHINE LEARNING', 'RAG SYSTEMS', 'FULL-STACK'],
};

const RIBBON_TWO = {
  top: ['RESEARCH', 'ENGINEER', 'DEPLOY', 'ITERATE'],
  bottom: ['PIPELINES', 'DASHBOARDS', 'EXPERIMENTS', 'IMPACT'],
};

function BackToTop() {
  const { lenisRef, prefersReducedMotion } = useExperience();
  const [visible, setVisible] = useState(false);
  const ringRef = useRef(null);

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.fromTo(
        ringRef.current,
        { strokeDashoffset: RING_CIRCUMFERENCE },
        {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: { start: 0, end: 'max', scrub: 0.35 },
        },
      );
    });

    return () => context.revert();
  }, []);

  useEffect(() => {
    // Visibility is driven by an off-screen sentinel, not a scroll handler or
    // a ScrollTrigger that runs on every tick.
    const sentinel = document.getElementById('back-to-top-sentinel');
    if (!sentinel) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(sentinel);

    return () => observer.disconnect();
  }, []);

  const scrollTop = () => {
    const lenis = lenisRef.current;

    if (lenis) {
      lenis.scrollTo(0, { duration: 1.35 });
      return;
    }

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <button
      type="button"
      className={`back-to-top${visible ? ' visible' : ''}`}
      onClick={scrollTop}
      aria-label="Back to top"
      data-cursor="Top"
    >
      <svg className="back-to-top__ring" viewBox="0 0 48 48" aria-hidden="true">
        <circle className="back-to-top__ring-track" cx="24" cy="24" r={RING_RADIUS} />
        <circle
          ref={ringRef}
          className="back-to-top__ring-progress"
          cx="24"
          cy="24"
          r={RING_RADIUS}
          style={{
            strokeDasharray: RING_CIRCUMFERENCE,
            strokeDashoffset: RING_CIRCUMFERENCE,
          }}
        />
      </svg>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </button>
  );
}

function Portfolio() {
  const { prefersReducedMotion } = useExperience();
  const progressRef = useRef(null);

  useSpotlight(!prefersReducedMotion);
  useVelocitySurfaces();

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.fromTo(
        progressRef.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: { start: 0, end: 'max', scrub: 0.35 },
        },
      );
    });

    return () => context.revert();
  }, []);

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Preloader />
      <AmbientBackground />
      <CustomCursor />
      <span ref={progressRef} className="scroll-progress" aria-hidden="true" />
      <Header />
      <UtilityHUD />
      <main id="main-content" tabIndex={-1}>
        <span
          id="header-scroll-sentinel"
          className="scroll-sentinel scroll-sentinel--header"
          aria-hidden="true"
        />
        <span
          id="back-to-top-sentinel"
          className="scroll-sentinel scroll-sentinel--top"
          aria-hidden="true"
        />
        <Hero />
        <Marquee />
        <About />
        <TypeRibbon top={RIBBON_ONE.top} bottom={RIBBON_ONE.bottom} />
        <Skills />
        <Experience />
        <TypeRibbon top={RIBBON_TWO.top} bottom={RIBBON_TWO.bottom} />
        <Projects />
        <Contact />
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}

export default function App() {
  return (
    <ExperienceProvider>
      <SmoothScrollProvider>
        <Portfolio />
      </SmoothScrollProvider>
    </ExperienceProvider>
  );
}
