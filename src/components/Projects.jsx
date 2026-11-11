import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { gsap, ScrollTrigger } from '../lib/animations';
import { projects } from '../data/projects';
import { useExperience } from '../context/ExperienceContext';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import useReveal from '../hooks/useReveal';
import useScrollLock from '../hooks/useScrollLock';
import CountUp from './CountUp';
import SectionTitle from './SectionTitle';
import MagneticButton from './MagneticButton';
import IsometricPipeline3D from './IsometricPipeline3D';

const pad = (value) => String(value).padStart(2, '0');

const ExternalIcon = (props) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M7 17 17 7M9 7h8v8" />
  </svg>
);

const ArrowIcon = (props) => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const GitHubIcon = (props) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
);

function ProjectCard({ project, index, total, onOpenDossier, onOpenImage }) {
  const cover = project.images[0];
  const imageCount = project.images.length;
  const hasLiveDemo = Boolean(project.demoUrl) && project.demoUrl !== project.githubUrl;

  return (
    <article
      className="work-card"
      style={{ '--project-accent': project.accent || '#f59e0b' }}
      data-work-card
    >
      <div className="work-card__media-wrap">
        <button
          type="button"
          className="work-card__media"
          onClick={() =>
            onOpenImage?.({ src: cover, alt: `${project.title} — visual evidence` })
          }
          aria-label={`Open ${project.title} visual in full screen`}
          data-cursor="View"
        >
          <img
            src={cover}
            alt={`${project.title} — project preview`}
            className="work-card__img"
            loading="lazy"
            decoding="async"
          />

          <span className="work-card__shade" aria-hidden="true" />

          <span className="work-card__index">
            {pad(index + 1)}
            <span> / {pad(total)}</span>
          </span>

          {hasLiveDemo && (
            <span className="work-card__live">
              <span className="work-card__live-dot" aria-hidden="true" />
              Live
            </span>
          )}

          <span className="work-card__view">
            View visual
            <ExternalIcon width="12" height="12" />
          </span>

          {imageCount > 1 && (
            <span className="work-card__count" aria-hidden="true">
              {imageCount} visuals
            </span>
          )}
        </button>
      </div>

      <div className="work-card__body">
        <p className="work-card__role">{project.role}</p>
        <h3 className="work-card__title">{project.shortTitle || project.title}</h3>
        <p className="work-card__desc">{project.desc}</p>

        <div className="work-card__tags">
          {project.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="work-card__tag">
              {tag}
            </span>
          ))}
          {project.tags.length > 4 && (
            <span className="work-card__tag work-card__tag--more">
              +{project.tags.length - 4}
            </span>
          )}
        </div>
      </div>

      <div className="work-card__footer">
        <div className="work-card__footer-links">
          {hasLiveDemo ? (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="work-card__demo"
              data-cursor="Live"
            >
              Live Demo
              <ExternalIcon />
            </a>
          ) : (
            <span className="work-card__demo work-card__demo--disabled">
              No Live Demo
              <ExternalIcon />
            </span>
          )}

          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="work-card__gh"
              aria-label={`${project.title} on GitHub`}
              data-cursor="GitHub"
            >
              <GitHubIcon />
            </a>
          )}
        </div>

        <MagneticButton
          as="button"
          className="work-card__details"
          strength={0.16}
          onClick={() => onOpenDossier?.(project)}
          data-cursor="Open"
        >
          Details
          <ArrowIcon />
        </MagneticButton>
      </div>
    </article>
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

            <IsometricPipeline3D project={project} variant="dossier" />

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
  const [gridRef, gridVisible] = useReveal({ threshold: 0.08 });
  const { prefersReducedMotion } = useExperience();
  const [dossierProject, setDossierProject] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);

  const openDossier = useCallback((project) => setDossierProject(project), []);
  const closeDossier = useCallback(() => setDossierProject(null), []);
  const openImage = useCallback((image) => setLightboxImage(image), []);
  const closeImage = useCallback(() => setLightboxImage(null), []);

  useEffect(() => {
    if (!gridVisible || prefersReducedMotion) return undefined;

    const grid = gridRef.current;
    if (!grid) return undefined;

    const cards = gsap.utils.toArray(grid.querySelectorAll('[data-work-card]'));
    if (!cards.length) return undefined;

    const context = gsap.context(() => {
      gsap.fromTo(
        cards,
        { y: 46, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.09,
          scrollTrigger: {
            trigger: grid,
            start: 'top 84%',
            once: true,
          },
        },
      );
    }, grid);

    ScrollTrigger.refresh();

    return () => context.revert();
  }, [gridVisible, gridRef, prefersReducedMotion]);

  const totalVisuals = projects.reduce((total, project) => total + project.images.length, 0);

  return (
    <section id="projects" className="section showcase-section" data-ghost="WORK">
      <div className="container showcase__header">
        <p className="section-label">Featured Projects</p>
        <SectionTitle>Engineering &amp; Research Highlights</SectionTitle>
        <p className="section-subtitle">
          Selected machine learning architectures, statistical computing pipelines, and data
          systems engineered for real-world impact. Open a case study to inspect its
          architecture, mathematics and visual evidence.
        </p>

        <div className="showcase__header-meta" aria-label="Archive telemetry">
          <div className="showcase__meta-stat">
            <span className="showcase__meta-stat-top">
              <strong className="showcase__meta-stat-num">
                <CountUp end={projects.length} padStart={2} duration={1.45} />
              </strong>
              <span className="showcase__meta-stat-label">Projects</span>
            </span>
            <span className="metric-glow-bar" aria-hidden="true">
              <span
                className="metric-glow-bar__fill"
                style={{ '--bar-target': '0.86', '--bar-delay': '0.06s' }}
              />
            </span>
          </div>

          <div className="showcase__meta-stat">
            <span className="showcase__meta-stat-top">
              <strong className="showcase__meta-stat-num">
                <CountUp end={totalVisuals} padStart={2} duration={1.65} />
              </strong>
              <span className="showcase__meta-stat-label">Visuals</span>
            </span>
            <span className="metric-glow-bar" aria-hidden="true">
              <span
                className="metric-glow-bar__fill"
                style={{ '--bar-target': '0.94', '--bar-delay': '0.18s' }}
              />
            </span>
          </div>

          <div className="showcase__meta-stat">
            <span className="showcase__meta-stat-top">
              <strong className="showcase__meta-stat-num">
                <CountUp end={2} padStart={2} duration={1.35} />
              </strong>
              <span className="showcase__meta-stat-label">Domains</span>
            </span>
            <span className="metric-glow-bar" aria-hidden="true">
              <span
                className="metric-glow-bar__fill"
                style={{ '--bar-target': '0.78', '--bar-delay': '0.3s' }}
              />
            </span>
          </div>
        </div>
      </div>

      <div
        ref={gridRef}
        className={`work-grid${gridVisible ? ' is-visible' : ''}`}
        aria-label="Featured project archive"
      >
        {projects.map((project, index) => (
          <ProjectCard
            key={project.slug}
            project={project}
            index={index}
            total={projects.length}
            onOpenDossier={openDossier}
            onOpenImage={openImage}
          />
        ))}
      </div>

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
