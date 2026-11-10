import { Fragment, Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from '../lib/animations';
import { projects } from '../data/projects';
import { useExperience } from '../context/ExperienceContext';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import useScrollLock from '../hooks/useScrollLock';
import SectionTitle from './SectionTitle';
import MagneticButton from './MagneticButton';

const WebGLProjectShowcase = lazy(() => import('./WebGLProjectShowcase'));

const pad = (value) => String(value).padStart(2, '0');

function ProjectShowcaseFallback({
  items,
  onOpenDossier,
  onOpenImage,
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);

  const total = items.length;
  const activeProject = items[activeIndex] ?? items[0];
  const activeImage = activeProject.images[imageIndex] ?? activeProject.images[0];
  const progress = total > 1 ? activeIndex / (total - 1) : 0;

  const goTo = (nextIndex) => {
    const clamped = Math.max(0, Math.min(total - 1, nextIndex));
    setActiveIndex(clamped);
    setImageIndex(0);
  };

  return (
    <div
      className="showcase__pin showcase__pin--fallback"
      style={{ '--showcase-count': total }}
    >
      <div className="showcase__stage">
        <div className="showcase__stage-grid">
          <div className="showcase__media-col">
            <div
              className="showcase__media"
              data-cursor="View"
              onClick={() =>
                onOpenImage?.({ src: activeImage, alt: activeProject.title })
              }
              role="button"
              tabIndex={0}
              aria-label={`Open ${activeProject.title} visual in full screen`}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onOpenImage?.({ src: activeImage, alt: activeProject.title });
                }
              }}
            >
              <img
                key={`${activeProject.id}-${imageIndex}`}
                src={activeImage}
                alt={`${activeProject.title} — visual ${imageIndex + 1}`}
                className="showcase__fallback-img"
                loading="eager"
                decoding="async"
              />

              <span className="showcase__media-vignette" aria-hidden="true" />
              <span className="showcase__media-grain" aria-hidden="true" />

              <div className="showcase__counter" aria-live="polite">
                <span className="showcase__counter-label">Showing Project</span>
                <span className="showcase__counter-value" key={activeIndex}>
                  {pad(activeIndex + 1)}
                </span>
                <span className="showcase__counter-total">/ {pad(total)}</span>
              </div>

              <span className="showcase__media-index" aria-hidden="true">
                {pad(activeIndex + 1)} — {pad(total)}
              </span>

              <div className="showcase__media-nav">
                <button
                  type="button"
                  className="showcase__media-arrow"
                  onClick={(event) => {
                    event.stopPropagation();
                    goTo(activeIndex - 1);
                  }}
                  disabled={activeIndex === 0}
                  aria-label="Previous project"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M19 12H5M11 18l-6-6 6-6" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="showcase__media-arrow"
                  onClick={(event) => {
                    event.stopPropagation();
                    goTo(activeIndex + 1);
                  }}
                  disabled={activeIndex === total - 1}
                  aria-label="Next project"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
              </div>

              <div className="showcase__rail" aria-hidden="true">
                <span
                  className="showcase__rail-fill"
                  style={{ transform: `scaleX(${progress.toFixed(4)})` }}
                />
              </div>
            </div>
          </div>

          <div className="showcase__meta-col">
            <div className="showcase__meta">
              <div className="showcase__meta-top" data-meta>
                <span className="showcase__meta-index">
                  {pad(activeIndex + 1)} — {pad(total)}
                </span>
                <span className="showcase__meta-metric">{activeProject.metric}</span>
              </div>

              <h3 className="showcase__title" data-meta>
                {activeProject.title}
              </h3>

              <p className="showcase__role" data-meta>
                {activeProject.role}
              </p>

              <p className="showcase__desc" data-meta>
                {activeProject.desc}
              </p>

              <div className="showcase__tags" data-meta>
                {activeProject.tags.map((tag) => (
                  <span key={tag} className="showcase__tag">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="showcase__actions" data-meta>
                <MagneticButton
                  as="button"
                  className="showcase__link"
                  strength={0.2}
                  onClick={() => onOpenDossier?.(activeProject)}
                  data-cursor="Open"
                >
                  <span>[ System Architecture ]</span>
                  <span className="showcase__link-arrow" aria-hidden="true">↗</span>
                </MagneticButton>

                <MagneticButton
                  as="a"
                  className="showcase__link"
                  strength={0.2}
                  href={activeProject.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="GitHub"
                >
                  <span>[ GitHub Repo ]</span>
                  <span className="showcase__link-arrow" aria-hidden="true">↗</span>
                </MagneticButton>
              </div>

              <div className="showcase__thumbs" data-meta>
                {activeProject.images.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    className={`showcase__thumb${index === imageIndex ? ' is-active' : ''}`}
                    onClick={() => setImageIndex(index)}
                    aria-label={`Show visual ${index + 1} of ${activeProject.images.length}`}
                    aria-pressed={index === imageIndex}
                  >
                    <img src={image} alt="" loading="lazy" decoding="async" />
                    <span className="showcase__thumb-index">{pad(index + 1)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="showcase__dots" role="tablist" aria-label="Featured projects">
              {items.map((project, index) => (
                <button
                  key={project.id}
                  type="button"
                  role="tab"
                  aria-selected={index === activeIndex}
                  className={`showcase__dot${index === activeIndex ? ' is-active' : ''}`}
                  onClick={() => goTo(index)}
                >
                  <span className="showcase__dot-index">{pad(index + 1)}</span>
                  <span className="showcase__dot-line" aria-hidden="true" />
                  <span className="showcase__dot-label">{project.shortTitle}</span>
                </button>
              ))}
            </div>

            <p className="showcase__scroll-note" aria-hidden="true">
              <span className="showcase__scroll-note-dot" />
              Scroll to move through the archive · drag the image to switch
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectDossier({ project, onClose, onOpenImage }) {
  const { lenisRef } = useExperience();
  const prefersReducedMotion = usePrefersReducedMotion();
  const panelRef = useRef(null);
  const backdropRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);
  const closingRef = useRef(false);

  useScrollLock(true, lenisRef);

  const close = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;

    if (prefersReducedMotion) {
      onClose();
      return;
    }

    gsap.to(panelRef.current, {
      xPercent: 100,
      duration: 0.45,
      ease: 'expo.in',
    });
    gsap.to(backdropRef.current, {
      autoAlpha: 0,
      duration: 0.35,
      ease: 'power2.in',
      onComplete: onClose,
    });
  }, [onClose, prefersReducedMotion]);

  useEffect(() => {
    previousFocusRef.current = document.activeElement;
    closeButtonRef.current?.focus();

    return () => {
      previousFocusRef.current?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') close();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [close]);

  useEffect(() => {
    if (prefersReducedMotion) return undefined;

    const panel = panelRef.current;
    const context = gsap.context(() => {
      gsap.fromTo(
        panel,
        { xPercent: 100 },
        { xPercent: 0, duration: 0.78, ease: 'expo.out' },
      );
      gsap.fromTo(
        backdropRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.4, ease: 'power2.out' },
      );

      const items = panel?.querySelectorAll('[data-dossier-reveal]');
      if (items?.length) {
        gsap.fromTo(
          items,
          { autoAlpha: 0, y: 18 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.56,
            ease: 'power3.out',
            stagger: 0.045,
            delay: 0.12,
          },
        );
      }
    }, panel);

    return () => context.revert();
  }, [prefersReducedMotion]);

  return (
    <div className="project-dossier" role="presentation">
      <div ref={backdropRef} className="project-dossier__backdrop" onClick={close} />

      <aside
        ref={panelRef}
        className="project-dossier__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-dossier-title"
      >
        <div className="project-dossier__top">
          <span className="project-dossier__top-label">
            Project {pad(project.id)} / {pad(projects.length)}
          </span>
          <button
            ref={closeButtonRef}
            type="button"
            className="project-dossier__close"
            onClick={close}
            aria-label="Close project dossier"
            data-cursor="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="project-dossier__scroll" data-lenis-prevent>
          <p className="project-dossier__eyebrow" data-dossier-reveal>
            Case Study / System Dossier
          </p>
          <h2 id="project-dossier-title" className="project-dossier__title" data-dossier-reveal>
            {project.title}
          </h2>

          <div className="project-dossier__meta" data-dossier-reveal>
            <span>{project.metric}</span>
            <span>{project.role}</span>
          </div>

          <div className="project-dossier__tags" data-dossier-reveal>
            {project.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>

          <p className="project-dossier__desc" data-dossier-reveal>
            {project.desc}
          </p>

          <section
            className="project-dossier__section"
            aria-labelledby="dossier-architecture"
            data-dossier-reveal
          >
            <div className="project-dossier__section-head">
              <span className="project-dossier__section-index">01</span>
              <h3 id="dossier-architecture">System Architecture &amp; Formulation</h3>
            </div>

            <div className="project-dossier__flow">
              {project.architecture.flow.map((step, index) => (
                <Fragment key={step}>
                  <span className="project-dossier__flow-node">{step}</span>
                  {index < project.architecture.flow.length - 1 && (
                    <span className="project-dossier__flow-arrow" aria-hidden="true">→</span>
                  )}
                </Fragment>
              ))}
            </div>

            <p className="project-dossier__formula-label">{project.architecture.formulaLabel}</p>
            <pre className="project-dossier__formula">
              <code>{project.architecture.formula}</code>
            </pre>
            <p className="project-dossier__details">{project.architecture.details}</p>
          </section>

          <section
            className="project-dossier__section"
            aria-labelledby="dossier-visuals"
            data-dossier-reveal
          >
            <div className="project-dossier__section-head">
              <span className="project-dossier__section-index">02</span>
              <h3 id="dossier-visuals">Visual Evidence</h3>
            </div>

            <div className="project-dossier__gallery">
              {project.images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  className="project-dossier__gallery-item"
                  onClick={() =>
                    onOpenImage({
                      src: image,
                      alt: `${project.title} — visual ${index + 1}`,
                    })
                  }
                  data-cursor="View"
                  aria-label={`Open visual ${index + 1} of ${project.images.length}`}
                >
                  <img
                    src={image}
                    alt={`${project.title} — visual ${index + 1}`}
                    loading="lazy"
                    decoding="async"
                  />
                  <span>{pad(index + 1)}</span>
                </button>
              ))}
            </div>
          </section>

          <div className="project-dossier__actions" data-dossier-reveal>
            <MagneticButton
              as="a"
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary project-dossier__action"
              strength={0.2}
              data-cursor="GitHub"
            >
              <span>GitHub Repository</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
            </MagneticButton>

            {project.demoUrl && project.demoUrl !== project.githubUrl && (
              <MagneticButton
                as="a"
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline project-dossier__action"
                strength={0.2}
              >
                <span>Live Demonstration</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M7 17L17 7M7 7h10v10" />
                </svg>
              </MagneticButton>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}

function ProjectLightbox({ image, onClose }) {
  const { lenisRef } = useExperience();
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);

  useScrollLock(true, lenisRef);

  useEffect(() => {
    previousFocusRef.current = document.activeElement;
    closeButtonRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [onClose]);

  return (
    <div
      className="project-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Project image preview"
      onClick={onClose}
    >
      <img
        src={image.src}
        alt={image.alt}
        className="project-modal__img"
        onClick={(event) => event.stopPropagation()}
      />
      <button
        ref={closeButtonRef}
        type="button"
        className="project-modal__close"
        onClick={onClose}
        aria-label="Close image preview"
        data-cursor="Close"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default function Projects() {
  const sectionRef = useRef(null);
  const [dossierProject, setDossierProject] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [shouldLoadShowcase, setShouldLoadShowcase] = useState(() =>
    typeof window !== 'undefined' &&
    ['#projects', '#notes', '#contact'].includes(window.location.hash),
  );

  const openDossier = useCallback((project) => setDossierProject(project), []);
  const closeDossier = useCallback(() => setDossierProject(null), []);
  const openImage = useCallback((image) => setLightboxImage(image), []);
  const closeImage = useCallback(() => setLightboxImage(null), []);

  useEffect(() => {
    if (shouldLoadShowcase) return undefined;

    const section = sectionRef.current;
    if (!section) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadShowcase(true);
          observer.disconnect();
        }
      },
      { rootMargin: '900px 0px' },
    );

    observer.observe(section);

    const onHashOrAnchor = () => {
      if (['#projects', '#notes', '#contact'].includes(window.location.hash)) {
        setShouldLoadShowcase(true);
        observer.disconnect();
      }
    };

    window.addEventListener('hashchange', onHashOrAnchor);

    return () => {
      observer.disconnect();
      window.removeEventListener('hashchange', onHashOrAnchor);
    };
  }, [shouldLoadShowcase]);

  const fallback = (
    <ProjectShowcaseFallback
      items={projects}
      onOpenDossier={openDossier}
      onOpenImage={openImage}
    />
  );

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="section showcase-section"
      data-ghost="WORK"
    >
      <div className="container showcase__header">
        <p className="section-label">Featured Projects</p>
        <SectionTitle>Engineering &amp; Research Highlights</SectionTitle>
        <p className="section-subtitle">
          Selected machine learning architectures, statistical computing pipelines, and data
          systems engineered for real-world impact. Scroll the archive, then open a case study
          to inspect its architecture, mathematics and visual evidence.
        </p>

        <div className="showcase__header-meta" aria-hidden="true">
          <span>{String(projects.length).padStart(2, '0')} Projects</span>
          <span>{String(projects.reduce((total, project) => total + project.images.length, 0)).padStart(2, '0')} Visuals</span>
          <span>02 Domains</span>
        </div>
      </div>

      {shouldLoadShowcase ? (
        <Suspense fallback={fallback}>
          <WebGLProjectShowcase
            projects={projects}
            onOpenDossier={openDossier}
            onOpenImage={openImage}
          />
        </Suspense>
      ) : (
        fallback
      )}

      {dossierProject &&
        createPortal(
          <ProjectDossier
            project={dossierProject}
            onClose={closeDossier}
            onOpenImage={openImage}
          />,
          document.body,
        )}

      {lightboxImage &&
        createPortal(
          <ProjectLightbox image={lightboxImage} onClose={closeImage} />,
          document.body,
        )}
    </section>
  );
}
