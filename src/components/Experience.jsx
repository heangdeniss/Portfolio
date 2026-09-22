import { useState } from 'react';
import useReveal from '../hooks/useReveal';

const timelineData = [
  {
    type: 'Experience',
    title: 'Data Analyst & Web Developer Intern',
    institution: 'Ministry of Post and Telecommunications (MPTC)',
    year: 'July – October 2026',
    metrics: '3,700 Students & 369 Teachers Surveyed • Bac II 2026 Data Entry',
    tech: 'Python, Pandas, RegEx, React, Recharts, Power BI, Excel, Google Forms',
    desc: 'Conducted end-to-end data cleaning and transformation on Google Forms survey data collected from 369 teachers and 3,700 students across Community Tech Centers (CTCs) using Python and RegEx. Developed an interactive bilingual web analytics platform (React, Recharts) and Power BI dashboards to track key performance indicators for leadership review. Additionally performed data entry to compile, audit, and organize all 2026 Bac II national examination results for students under Community Tech Centers (CTCs).',
    url: 'https://ctc-teacher-student-analyst-web.vercel.app/',
    linkText: 'Explore Live Analytics Platform',
  },
  {
    type: 'Experience',
    title: 'Project Lead — AI Educational Chatbot',
    institution: 'Scientific Day Phnom Penh',
    year: '7 July 2025',
    metrics: '4-Person Team Led • RAG Retrieval Architecture',
    tech: 'Python, Node.js, Express.js, Flask, PostgreSQL, LangChain, ChromaDB',
    desc: 'Served as Team Lead for a 4-member engineering team. Architected an AI-driven educational platform integrating Node.js, Express.js, Flask, and PostgreSQL. Engineered a semantic Retrieval-Augmented Generation (RAG) pipeline utilizing LangChain and ChromaDB for Khmer curriculum querying, backed by optimized relational schemas with triggers and stored procedures.',
    url: 'https://github.com/heangdeniss/AiEducationChatbot',
    linkText: 'View Project Repository',
  },
  {
    type: 'Education',
    title: 'Engineering Degree in Data Science',
    institution: 'Institute of Technology of Cambodia (ITC)',
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
    year: '2025',
    metrics: 'Full-Stack Architecture & API Design',
    tech: 'React, Node.js, REST APIs, PostgreSQL, Modern Web Systems',
    desc: 'Comprehensive training in full-stack software development, RESTful API architecture, modern frontend frameworks, and relational database management.',
    url: null,
  },
  {
    type: 'Education',
    title: 'Data Visualization Hackathon',
    institution: 'Above and Beyond School',
    year: '2025',
    metrics: 'Competitive EDA & Visual Analytics Under Tight Deadlines',
    tech: 'Python, Matplotlib, Seaborn, Feature Engineering',
    desc: 'Executed end-to-end data cleaning, preprocessing, exploratory data analysis (EDA), and data visualization using Python under competitive hackathon timelines.',
    url: null,
  },
];

export default function Experience() {
  const [ref, visible] = useReveal();
  const [filter, setFilter] = useState('All');

  const filteredItems = timelineData.filter((item) => {
    if (filter === 'All') return true;
    return item.type === filter;
  });

  return (
    <section id="background" className="section">
      <div className="container" ref={ref}>
        <div className="section-header">
          <p className="section-label">Trajectory</p>
          <h2 className="section-title">Experience & Education</h2>
          <p className="section-subtitle">
            A chronological timeline of hands-on industry roles, leadership projects, and academic achievements.
          </p>
        </div>

        {/* Filter Toggle Controls */}
        <div className="timeline-filter">
          {['All', 'Experience', 'Education'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`timeline-filter-btn${filter === type ? ' timeline-filter-btn--active' : ''}`}
            >
              {type === 'All' ? 'All Milestones' : type}
            </button>
          ))}
        </div>

        {/* Illuminated Vertical Timeline */}
        <div className={`timeline-track-wrap${visible ? ' visible' : ''}`}>
          <div className="timeline-spine" />

          <div className="timeline-items">
            {filteredItems.map((item, index) => (
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

                  <h3 className="timeline-card__title">{item.title}</h3>
                  <p className="timeline-card__institution">{item.institution}</p>

                  {item.tech && (
                    <div className="timeline-card__tech">
                      <span>Stack:</span> {item.tech}
                    </div>
                  )}

                  <p className="timeline-card__desc">{item.desc}</p>

                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="timeline-card__link"
                    >
                      <span>{item.linkText}</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M7 17L17 7M7 7h10v10" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
