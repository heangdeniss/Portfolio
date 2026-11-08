import { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AmbientBackground from './components/AmbientBackground';
import CursorAura from './components/CursorAura';
import IntroCurtain from './components/IntroCurtain';
import Marquee from './components/Marquee';
import SceneRail from './components/SceneRail';
import useSpotlight from './hooks/useSpotlight';
import useMagnetic from './hooks/useMagnetic';
import usePrefersReducedMotion from './hooks/usePrefersReducedMotion';
import './App.css';
import './animations.css';
import './act-two.css';

const RING_RADIUS = 21;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function App() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const lastScrollY = useRef(0);
  const velocityTimer = useRef(0);

  useSpotlight(!prefersReducedMotion);
  useMagnetic(!prefersReducedMotion);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0;
      setScrollProgress(progress);
      setShowBackToTop(scrollTop > 500);

      const delta = scrollTop - lastScrollY.current;
      lastScrollY.current = scrollTop;
      const velocity = Math.max(-1, Math.min(1, delta / 55));
      document.documentElement.style.setProperty('--scroll-velocity', velocity.toFixed(3));

      window.clearTimeout(velocityTimer.current);
      velocityTimer.current = window.setTimeout(() => {
        document.documentElement.style.setProperty('--scroll-velocity', '0');
      }, 90);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.clearTimeout(velocityTimer.current);
    };
  }, []);

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <IntroCurtain />
      <AmbientBackground />
      <CursorAura />
      <div className="progress-bar" style={{ width: `${scrollProgress}%` }} aria-hidden="true" />
      <Header />
      <SceneRail progress={scrollProgress} />
      <main id="main-content" tabIndex={-1}>
        <Hero />
        <Marquee />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Contact />
      </main>
      <Footer />
      <button
        className={`back-to-top${showBackToTop ? ' visible' : ''}`}
        onClick={() => window.scrollTo({
          top: 0,
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
        })}
        aria-label="Back to top"
      >
        <svg className="back-to-top__ring" viewBox="0 0 48 48" aria-hidden="true">
          <circle className="back-to-top__ring-track" cx="24" cy="24" r={RING_RADIUS} />
          <circle
            className="back-to-top__ring-progress"
            cx="24"
            cy="24"
            r={RING_RADIUS}
            style={{
              strokeDasharray: RING_CIRCUMFERENCE,
              strokeDashoffset: RING_CIRCUMFERENCE * (1 - scrollProgress / 100),
            }}
          />
        </svg>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 15l-6-6-6 6" />
        </svg>
      </button>
    </>
  );
}
