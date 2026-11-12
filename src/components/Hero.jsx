import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from '../lib/animations';
import { useExperience } from '../context/ExperienceContext';
import usePointerTilt from '../hooks/usePointerTilt';
import usePortraitTether from '../hooks/usePortraitTether';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import useSplitReveal from '../hooks/useSplitReveal';
import HeroHud from './HeroHud';
import HeroLatentManifold from './HeroLatentManifold';
import MagneticButton from './MagneticButton';
import { site } from '../data/site';
import denisPhoto from '../images/HEANG Denis good image.jpg';

const TAGLINE_PLAIN = site.taglineLines.join(' ').replace(/<[^>]+>/g, '');

export default function Hero() {
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const { introComplete } = useExperience();
  const sectionRef = useRef(null);
  const contentRef = useRef(null);
  const visualRef = useRef(null);
  const orbitsRef = useRef(null);
  const portraitStackRef = useRef(null);
  const portraitDropRef = useRef(null);
  const portraitWireRef = useRef(null);
  const cloneRefs = useRef([]);
  const glowTopRef = useRef(null);
  const glowRightRef = useRef(null);
  const scrollHintRef = useRef(null);
  const tiltRef = usePointerTilt(4.5);

  usePortraitTether({
    active: introComplete && !prefersReducedMotion,
    delay: 1.9,
    dropRef: portraitDropRef,
    wireRef: portraitWireRef,
  });

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

  /* Pointer depth parallax for orbits, portrait stack & chromatic split */
  useEffect(() => {
    if (prefersReducedMotion || !introComplete) return undefined;
    if (window.matchMedia('(pointer: coarse)').matches) return undefined;

    const section = sectionRef.current;
    const orbits = orbitsRef.current;
    const portraitStack = portraitStackRef.current;
    const visual = visualRef.current;
    const [redClone, cyanClone] = cloneRefs.current;
    if (!section || !visual) return undefined;

    let inView = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
      },
      { threshold: 0.05 },
    );
    observer.observe(section);

    if (orbits) {
      gsap.set(orbits, { transformPerspective: 1100, transformStyle: 'preserve-3d' });
    }

    const orbitX = orbits
      ? gsap.quickTo(orbits, 'x', { duration: 0.65, ease: 'power3.out' })
      : null;
    const orbitY = orbits
      ? gsap.quickTo(orbits, 'y', { duration: 0.65, ease: 'power3.out' })
      : null;
    const orbitRotX = orbits
      ? gsap.quickTo(orbits, 'rotateX', { duration: 0.72, ease: 'power3.out' })
      : null;
    const orbitRotY = orbits
      ? gsap.quickTo(orbits, 'rotateY', { duration: 0.72, ease: 'power3.out' })
      : null;
    const orbitRotZ = orbits
      ? gsap.quickTo(orbits, 'rotateZ', { duration: 0.85, ease: 'power3.out' })
      : null;
    const portraitX = portraitStack
      ? gsap.quickTo(portraitStack, 'x', { duration: 0.55, ease: 'power3.out' })
      : null;
    const portraitY = portraitStack
      ? gsap.quickTo(portraitStack, 'y', { duration: 0.55, ease: 'power3.out' })
      : null;

    const redX = redClone
      ? gsap.quickTo(redClone, 'x', { duration: 0.38, ease: 'power3.out' })
      : null;
    const redOpacity = redClone
      ? gsap.quickTo(redClone, 'opacity', { duration: 0.38, ease: 'power3.out' })
      : null;
    const cyanX = cyanClone
      ? gsap.quickTo(cyanClone, 'x', { duration: 0.38, ease: 'power3.out' })
      : null;
    const cyanOpacity = cyanClone
      ? gsap.quickTo(cyanClone, 'opacity', { duration: 0.38, ease: 'power3.out' })
      : null;

    let pointerRafId = 0;
    let pendingPointer = null;
    let pendingVisualPointer = null;

    const flushPointer = () => {
      pointerRafId = 0;
      if (!inView || document.hidden) return;

      const event = pendingPointer;
      pendingPointer = null;
      if (event) {
        const nx = event.clientX / Math.max(window.innerWidth, 1) - 0.5;
        const ny = event.clientY / Math.max(window.innerHeight, 1) - 0.5;

        orbitX?.(-nx * 10);
        orbitY?.(-ny * 8);
        orbitRotX?.(-ny * 10);
        orbitRotY?.(nx * 12);
        orbitRotZ?.(nx * -3 + ny * 2);
        portraitX?.(-nx * 9);
        portraitY?.(-ny * 7);
      }

      const visualEvent = pendingVisualPointer;
      pendingVisualPointer = null;
      if (visualEvent) {
        const rect = visual.getBoundingClientRect();
        if (rect.width) {
          const dx = (visualEvent.clientX - rect.left) / rect.width - 0.5;
          const intensity = Math.min(
            1,
            Math.hypot(
              dx,
              (visualEvent.clientY - rect.top) / rect.height - 0.5,
            ) * 1.6,
          );
          redX?.(dx * -9);
          cyanX?.(dx * 9);
          redOpacity?.(0.06 + intensity * 0.09);
          cyanOpacity?.(0.06 + intensity * 0.09);
        }
      }
    };

    const schedulePointer = () => {
      if (!pointerRafId) {
        pointerRafId = requestAnimationFrame(flushPointer);
      }
    };

    const onPointerMove = (event) => {
      pendingPointer = { clientX: event.clientX, clientY: event.clientY };
      schedulePointer();
    };

    const onVisualMove = (event) => {
      pendingVisualPointer = { clientX: event.clientX, clientY: event.clientY };
      schedulePointer();
    };

    const onVisualLeave = () => {
      pendingVisualPointer = null;
      redX?.(0);
      cyanX?.(0);
      redOpacity?.(0);
      cyanOpacity?.(0);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    visual.addEventListener('pointermove', onVisualMove, { passive: true });
    visual.addEventListener('pointerleave', onVisualLeave);

    return () => {
      observer.disconnect();
      if (pointerRafId) cancelAnimationFrame(pointerRafId);
      window.removeEventListener('pointermove', onPointerMove);
      visual.removeEventListener('pointermove', onVisualMove);
      visual.removeEventListener('pointerleave', onVisualLeave);
    };
  }, [introComplete, prefersReducedMotion]);

  const currentRole = site.roles[roleIndex] ?? site.roles[0] ?? '';
  const rolePrefix = (prefersReducedMotion ? site.roles[0] : currentRole).startsWith('ML')
    ? 'I build as an'
    : 'I build as a';
  const visibleRoleText = prefersReducedMotion ? site.roles[0] ?? '' : displayedText;

  useEffect(() => {
    if (prefersReducedMotion) return undefined;

    let timer;

    if (!isDeleting && displayedText === currentRole) {
      timer = setTimeout(() => setIsDeleting(true), 2200);
    } else if (isDeleting && displayedText === '') {
      timer = setTimeout(() => {
        setIsDeleting(false);
        setRoleIndex((prev) => (prev + 1) % site.roles.length);
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
      <HeroLatentManifold />
      <HeroHud />
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
              <span className="hero__status-text">{site.availability}</span>
            </div>

            <div className="hero__role-wrapper hero__reveal">
              <span className="sr-only">
                I work across {site.roles.join(', ')}.
              </span>
              <span className="hero__role-prefix" aria-hidden="true">{rolePrefix}</span>
              <span className="hero__role-text" aria-hidden="true">
                {visibleRoleText}
                <span className="hero__cursor">|</span>
              </span>
            </div>

            <h1 className="hero__name" aria-label={site.name} ref={nameRef}>
              <span className="hero__name-line" aria-hidden="true">
                <span className="hero__name-inner" data-split-line>{site.firstName}</span>
              </span>
              <span className="hero__name-line hero__name-line--accent" aria-hidden="true">
                <span className="hero__name-inner" data-split-line>{site.lastName}</span>
              </span>
            </h1>

            <p
              className="hero__tagline"
              aria-label={TAGLINE_PLAIN}
              ref={taglineRef}
            >
              {site.taglineLines.map((line, index) => (
                <span className="hero__tagline-line" aria-hidden="true" key={index}>
                  <span
                    className="hero__tagline-inner"
                    data-split-line
                    dangerouslySetInnerHTML={{ __html: line }}
                  />
                </span>
              ))}
            </p>

            <ul
              className="hero__spec-pills hero__reveal"
              aria-label="Core engineering specializations"
            >
              {site.specializations.map((specialization, index) => (
                <li
                  className="hero__spec-pill"
                  key={specialization.label}
                  style={{ '--pill-index': index }}
                >
                  <span className="hero__spec-pill-dot" aria-hidden="true" />
                  <span className="hero__spec-pill-label">{specialization.label}</span>
                </li>
              ))}
            </ul>

            <div
              className="hero__bio hero__reveal"
              dangerouslySetInnerHTML={{ __html: site.bio }}
            />

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
          </div>

          <div className="hero__visual" ref={visualRef}>
            <div className="hero__orbits" ref={orbitsRef} aria-hidden="true">
              <span className="hero__orbit hero__orbit--outer" />
            </div>

            <div className="hero__card-tilt" ref={tiltRef}>
              <svg
                className="hero__portrait-wire"
                ref={portraitWireRef}
                aria-hidden="true"
                focusable="false"
              >
                <path className="hero__portrait-wire-halo" />
                <path className="hero__portrait-wire-core" />
                <g className="hero__portrait-wire-anchor">
                  <circle className="hero__portrait-wire-anchor-halo" r="8" />
                  <circle className="hero__portrait-wire-anchor-core" r="2.4" />
                </g>
                <g className="hero__portrait-wire-clamp">
                  <rect x="-10" y="-2" width="20" height="4" rx="2" />
                </g>
              </svg>

              <div className="hero__portrait-drop" ref={portraitDropRef}>
                <div className="hero__glass-card">
                  <div className="hero__glass-card-glow" />

                  <div className="hero__portrait-status">
                    <span className="hero__status-indicator">
                      <span className="hero__status-ping" />
                      <span className="hero__status-core" />
                    </span>
                    <span className="hero__portrait-status-text">PORTRAIT_FEED // LIVE</span>
                  </div>

                  <div className="hero__image-container">
                    <div className="hero__portrait-stack" ref={portraitStackRef}>
                      <img
                        src={denisPhoto}
                        alt={`Portrait of ${site.name}, Data Science and Machine Learning Engineer`}
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
                        loading="eager"
                        decoding="async"
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
                        loading="eager"
                        decoding="async"
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
      </div>

      <a
        href="#about"
        className="hero__scroll-hint"
        aria-label="Scroll to About section"
        ref={scrollHintRef}
        data-cursor="Scroll"
      >
        <span className="hero__scroll-mouse" aria-hidden="true">
          <span className="hero__scroll-wheel" />
        </span>
        <span className="hero__scroll-hint-text">Scroll</span>
        <svg className="hero__scroll-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </a>
    </section>
  );
}
