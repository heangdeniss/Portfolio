import { useEffect, useRef, useState } from 'react';
import useReveal from '../hooks/useReveal';
import SectionTitle from './SectionTitle';
import mptcLogo from '../images/mptc-logo-opt.png';
import scientificLogo from '../images/scientific-logo-opt.png';
import itcLogo from '../images/itc-logo-opt.png';
import aceLogo from '../images/ACE-logo-opt.png';
import udemyLogo from '../images/udemy-logo-opt.png';
import anbLogo from '../images/anb-logo-opt.png';
import mptcCert from '../certificate/2-Mr. Heang Denis.pdf';
import scientificCert from '../certificate/Heang Denis Scientific day Certificate.pdf';
import anbCert from '../certificate/Certificate of Completion_Heang DENIS_ANBPTMD12024014.pdf';
import udemyCert from '../certificate/Udemy Heang Denis Certificate.pdf';

const timelineData = [
  {
    type: 'Experience',
    title: 'Data Analyst & Web Developer Intern',
    institution: 'Ministry of Post and Telecommunications (MPTC)',
    logo: mptcLogo,
    logoBg: 'rgba(255, 255, 255, 0.05)',
    year: 'July – October 2026',
    metrics: '3,700 Students & 369 Teachers Surveyed • Bac II 2026 Data Entry',
    tech: 'Python, Pandas, RegEx, React, Recharts, Power BI, Excel, Google Forms',
    desc: 'Conducted end-to-end data cleaning and transformation on Google Forms survey data collected from 369 teachers and 3,700 students across Community Tech Centers (CTCs) using Python and RegEx. Developed an interactive bilingual web analytics platform (React, Recharts) and Power BI dashboards to track key performance indicators for leadership review. Additionally performed data entry to compile, audit, and organize all 2026 Bac II national examination results for students under Community Tech Centers (CTCs).',
    url: 'https://ctc-teacher-student-analyst-web.vercel.app/',
    linkText: 'Explore Live Analytics Platform',
    certUrl: mptcCert,
    certLabel: 'View MPTC Certificate',
  },
  {
    type: 'Experience',
    title: 'Project Showcase — AI Educational Chatbot',
    institution: 'Scientific Day Phnom Penh',
    logo: scientificLogo,
    logoBg: '#ffffff',
    year: '5–6 June 2025',
    metrics: '4-Person Team Led • RAG Retrieval Architecture',
    tech: 'Python, Node.js, Express.js, Flask, PostgreSQL, LangChain, ChromaDB',
    desc: 'Served as Team Lead for a 4-member engineering team. Architected an AI-driven educational platform integrating Node.js, Express.js, Flask, and PostgreSQL. Engineered a semantic Retrieval-Augmented Generation (RAG) pipeline utilizing LangChain and ChromaDB for Khmer curriculum querying, backed by optimized relational schemas with triggers and stored procedures.',
    url: 'https://github.com/heangdeniss/AiEducationChatbot',
    linkText: 'View Project Repository',
    certUrl: scientificCert,
    certLabel: 'View Certificate',
  },
  {
    type: 'Education',
    title: 'Engineering Degree in Data Science',
    institution: 'Institute of Technology of Cambodia (ITC)',
    logo: itcLogo,
    logoBg: '#ffffff',
    year: 'Expected Graduation: 2027',
    metrics: '5-Year Engineering Track • Data Structures & AI Specialization',
    tech: 'Algorithms, ML, PGM, Probability & Statistics, Linear Algebra',
    desc: 'Rigorous engineering coursework: Data Structures & Algorithms, Advanced Machine Learning, Database Management Systems, Linear Algebra, Probability & Statistics, and Deep Learning.',
    url: null,
  },
  {
    type: 'Education',
    title: 'Advanced English Language Program',
    institution: 'Australian Centre for Education (ACE)',
    logo: aceLogo,
    logoBg: '#ffffff',
    year: 'September 2026 – Present',
    metrics: 'Professional Working Proficiency (B2+)',
    tech: 'Academic Writing, Technical Documentation, Executive Presentation',
    desc: 'Advanced English language coursework focusing on technical documentation, professional communication, academic research, and stakeholder presentations.',
    url: null,
  },
  {
    type: 'Education',
    title: 'Full Stack Web Development Bootcamp',
    institution: 'Udemy',
    logo: udemyLogo,
    logoBg: '#ffffff',
    year: '2025',
    metrics: 'Full-Stack Architecture & API Design',
    tech: 'React, Node.js, REST APIs, PostgreSQL, Modern Web Systems',
    desc: 'Comprehensive training in full-stack software development, RESTful API architecture, modern frontend frameworks, and relational database management.',
    url: null,
    certUrl: udemyCert,
    certLabel: 'View Udemy Certificate',
  },
  {
    type: 'Education',
    title: 'Data Visualization Hackathon',
    institution: 'Above and Beyond School',
    logo: anbLogo,
    logoBg: '#ffffff',
    year: '2025',
    metrics: 'Competitive EDA & Visual Analytics Under Tight Deadlines',
    tech: 'Python, Matplotlib, Seaborn, Feature Engineering',
    desc: 'Executed end-to-end data cleaning, preprocessing, exploratory data analysis (EDA), and data visualization using Python under competitive hackathon timelines.',
    url: null,
    certUrl: anbCert,
    certLabel: 'View Certificate of Completion',
  },
];

export default function Experience() {
  const [ref, visible] = useReveal();
  const [filter, setFilter] = useState('All');
  const trackRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let rafId = 0;

    const update = () => {
      rafId = 0;
      if (prefersReduced) {
        track.style.setProperty('--timeline-progress', '100%');
        track.querySelectorAll('.timeline-item.is-current').forEach((item) => {
          item.classList.remove('is-current');
        });
        return;
      }

      const rect = track.getBoundingClientRect();
      const anchor = window.innerHeight * 0.55;
      const progress = Math.min(Math.max((anchor - rect.top) / Math.max(rect.height, 1), 0), 1);
      track.style.setProperty('--timeline-progress', `${(progress * 100).toFixed(1)}%`);

      const items = track.querySelectorAll('.timeline-item');
      let current = null;
      let closestDistance = Infinity;

      items.forEach((item) => {
        const itemRect = item.getBoundingClientRect();
        const distance = Math.abs(itemRect.top + itemRect.height / 2 - anchor);
        if (distance < closestDistance) {
          closestDistance = distance;
          current = item;
        }
      });

      items.forEach((item) => {
        item.classList.toggle('is-current', item === current);
      });
    };

    const onScroll = () => {
      if (!rafId) rafId = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [filter, visible]);

  const filteredItems = timelineData.filter((item) => {
    if (filter === 'All') return true;
    return item.type === filter;
  });

  return (
    <section id="background" className="section" data-ghost="JOURNEY">
      <div className={`container${visible ? ' is-visible' : ''}`} ref={ref}>
        <div className="section-header">
          <p className="section-label">Trajectory</p>
          <SectionTitle>Experience & Education</SectionTitle>
          <p className="section-subtitle">
            A chronological timeline of hands-on industry roles, leadership projects, and academic achievements.
          </p>
        </div>

        {/* Filter Toggle Controls */}
        <div className="timeline-filter" role="group" aria-label="Filter milestones by type">
          {['All', 'Experience', 'Education'].map((type) => {
            const count = type === 'All'
              ? timelineData.length
              : timelineData.filter((d) => d.type === type).length;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setFilter(type)}
                className={`timeline-filter-btn${filter === type ? ' timeline-filter-btn--active' : ''}`}
                aria-pressed={filter === type}
              >
                {type === 'All' ? 'All Milestones' : type}
                <span className="timeline-filter-btn__count">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Illuminated Vertical Timeline */}
        <div className={`timeline-track-wrap${visible ? ' visible' : ''}`} ref={trackRef}>
          <div className="timeline-spine" />
          <div aria-live="polite" aria-atomic="true" className="sr-only">
            Showing {filteredItems.length} {filter === 'All' ? 'total' : filter.toLowerCase()} milestone{filteredItems.length !== 1 ? 's' : ''}
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
                {/* Glowing Node on Spine */}
                <div className="timeline-node">
                  <span className="timeline-node__pulse" />
                  <span className="timeline-node__core" />
                </div>

                {/* Content Card */}
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
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
                    >
                      {!item.url.includes('github') && (
                        <span className="timeline-btn__beacon">
                          <span className="timeline-btn__beacon-ping" />
                          <span className="timeline-btn__beacon-core" />
                        </span>
                      )}
                      {item.url.includes('github') && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                        </svg>
                      )}
                      <span>{item.linkText}</span>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="timeline-btn__arrow">
                        <path d="M7 17L17 7M7 7h10v10" />
                      </svg>
                    </a>
                  )}

                  {/* Certificate Button */}
                  {item.certUrl && (
                    <a
                      href={item.certUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="timeline-card__btn timeline-card__btn--cert"
                      title={item.certLabel}
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
