import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '../lib/animations';
import useReveal from '../hooks/useReveal';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import { timelineData } from '../data/timeline';
import SectionTitle from './SectionTitle';
import MagneticButton from './MagneticButton';

const pad = (value) => String(value).padStart(2, '0');

export default function Experience() {
  const [ref, visible] = useReveal();
  const [filter, setFilter] = useState('All');
  const trackRef = useRef(null);
  const spineRef = useRef(null);
  const counterRef = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const filteredItems = timelineData.filter((item) => {
    if (filter === 'All') return true;
    return item.type === filter;
  });

  useEffect(() => {
    if (!counterRef.current || prefersReducedMotion) return undefined;

    const tween = gsap.fromTo(
      counterRef.current,
      { yPercent: 110, autoAlpha: 0 },
      {
        yPercent: 0,
        autoAlpha: 1,
        duration: 0.55,
        ease: 'power3.out',
        overwrite: true,
      },
    );

    return () => tween.kill();
  }, [filter, prefersReducedMotion]);

  useEffect(() => {
    if (!visible || prefersReducedMotion) return undefined;

    const track = trackRef.current;
    if (!track) return undefined;

    const items = gsap.utils.toArray(track.querySelectorAll('.timeline-item'));

    const context = gsap.context(() => {
      gsap.fromTo(
        spineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          transformOrigin: 'top center',
          ease: 'none',
          scrollTrigger: {
            trigger: track,
            start: 'top 75%',
            end: 'bottom 70%',
            scrub: 0.6,
          },
        },
      );

      items.forEach((item) => {
        gsap.fromTo(
          item,
          { y: 36, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 90%',
              once: true,
            },
          },
        );

        ScrollTrigger.create({
          trigger: item,
          start: 'top 58%',
          end: 'bottom 42%',
          toggleClass: { targets: item, className: 'is-current' },
        });
      });
    }, track);

    ScrollTrigger.refresh();

    return () => context.revert();
  }, [filter, visible, prefersReducedMotion]);

  return (
    <section id="background" className="section" data-ghost="JOURNEY">
      <div className={`container${visible ? ' is-visible' : ''}`} ref={ref}>
        <div className="section-header">
          <p className="section-label">Trajectory</p>
          <SectionTitle>Experience &amp; Education</SectionTitle>
          <p className="section-subtitle">
            A chronological timeline of hands-on industry roles, leadership projects, and academic achievements.
          </p>
        </div>

        <div className="timeline-filter-row">
          <div className="timeline-filter" role="group" aria-label="Filter milestones by type">
            {['All', 'Experience', 'Education'].map((type) => {
              const count = type === 'All'
                ? timelineData.length
                : timelineData.filter((d) => d.type === type).length;

              return (
                <MagneticButton
                  key={type}
                  as="button"
                  strength={0.18}
                  onClick={() => setFilter(type)}
                  className={`timeline-filter-btn${filter === type ? ' timeline-filter-btn--active' : ''}`}
                  aria-pressed={filter === type}
                  data-cursor="Filter"
                >
                  {type === 'All' ? 'All Milestones' : type}
                  <span className="timeline-filter-btn__count">{count}</span>
                </MagneticButton>
              );
            })}
          </div>

          <p className="timeline-live" aria-hidden="true">
            <span className="timeline-live__dot" />
            <span>Showing</span>
            <span className="timeline-live__number-mask">
              <span ref={counterRef} className="timeline-live__number">
                {pad(filteredItems.length)}
              </span>
            </span>
            <span>{filteredItems.length === 1 ? 'milestone' : 'milestones'}</span>
          </p>
        </div>

        <div className={`timeline-track-wrap${visible ? ' visible' : ''}`} ref={trackRef}>
          <div className="timeline-spine" ref={spineRef} />
          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {`Showing ${filteredItems.length} ${filter === 'All' ? 'total' : filter.toLowerCase()} ${filteredItems.length === 1 ? 'milestone' : 'milestones'}`}
          </div>

          <div className="timeline-items" key={filter}>
            {filteredItems.length === 0 ? (
              <div className="timeline-empty">
                <p>No milestones found for this filter.</p>
              </div>
            ) : (
              filteredItems.map((item, index) => (
                <div
                  key={item.title + index}
                  className="timeline-item"
                >
                  <div className="timeline-node">
                    <span className="timeline-node__pulse" />
                    <span className="timeline-node__core" />
                  </div>

                  <div className="timeline-card">
                    <div className="timeline-card__top">
                      <div className="timeline-card__badge-row">
                        <span className="timeline-card__year">{item.year}</span>
                        <span className={`timeline-card__type timeline-card__type--${item.type.toLowerCase()}`}>
                          {item.type}
                        </span>
                      </div>

                      {item.metrics && (
                        <div className="timeline-card__metrics">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                            <polyline points="16 7 22 7 22 13" />
                          </svg>
                          <span>{item.metrics}</span>
                        </div>
                      )}
                    </div>

                    <div className="timeline-card__header-main">
                      {item.logo && (
                        <div
                          className="timeline-card__logo-wrap"
                          style={{ background: item.logoBg || 'rgba(255, 255, 255, 0.05)' }}
                        >
                          <img
                            src={item.logo}
                            alt={`${item.institution} logo`}
                            className="timeline-card__logo"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                      )}
                      <div className="timeline-card__title-group">
                        <h3 className="timeline-card__title">{item.title}</h3>
                        <p className="timeline-card__institution">{item.institution}</p>
                      </div>
                    </div>

                    {item.tech && (
                      <div className="timeline-card__tech">
                        <span>Stack:</span> {item.tech}
                      </div>
                    )}

                    <p className="timeline-card__desc">{item.desc}</p>

                    <div className="timeline-card__btn-row">
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`timeline-card__btn ${item.url.includes('github') ? 'timeline-card__btn--github' : 'timeline-card__btn--live'}`}
                          title={item.linkText}
                          data-cursor={item.url.includes('github') ? 'GitHub' : 'Live'}
                        >
                          {!item.url.includes('github') && (
                            <span className="timeline-btn__beacon">
                              <span className="timeline-btn__beacon-ping" />
                              <span className="timeline-btn__beacon-core" />
                            </span>
                          )}
                          {item.url.includes('github') && (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                            </svg>
                          )}
                          <span>{item.linkText}</span>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="timeline-btn__arrow" aria-hidden="true">
                            <path d="M7 17L17 7M7 7h10v10" />
                          </svg>
                        </a>
                      )}

                      {item.certUrl && (
                        <a
                          href={item.certUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="timeline-card__btn timeline-card__btn--cert"
                          title={item.certLabel}
                          data-cursor="PDF"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <path d="M9 15l2 2 4-4" />
                          </svg>
                          <span>{item.certLabel}</span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="timeline-btn__arrow" aria-hidden="true">
                            <path d="M7 17L17 7M7 7h10v10" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
