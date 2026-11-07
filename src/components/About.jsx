import { useEffect, useState } from 'react';
import useReveal from '../hooks/useReveal';

function useCountUp(target, duration = 1200, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(target);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

export default function About() {
  const [ref, visible] = useReveal();
  const projectCount = useCountUp(5, 1000, visible);
  const studentCount = useCountUp(3700, 1400, visible);
  const accuracyCount = useCountUp(96, 900, visible);

  return (
    <section id="about" className="section">
      <div className="container" ref={ref}>

        {/* Animated Stat Strip */}
        <div className={`about__stats-strip stagger${visible ? ' visible' : ''}`}>
          <div className="about__stat">
            <span className="about__stat-value">{projectCount}+</span>
            <span className="about__stat-label">ML Projects</span>
          </div>
          <div className="about__stat-divider" />
          <div className="about__stat">
            <span className="about__stat-value">{studentCount.toLocaleString()}+</span>
            <span className="about__stat-label">Data Points Surveyed</span>
          </div>
          <div className="about__stat-divider" />
          <div className="about__stat">
            <span className="about__stat-value">{accuracyCount}%</span>
            <span className="about__stat-label">HMM POS Accuracy</span>
          </div>
          <div className="about__stat-divider" />
          <div className="about__stat">
            <span className="about__stat-value">3</span>
            <span className="about__stat-label">Languages Spoken</span>
          </div>
        </div>

        <div className={`about__layout stagger${visible ? ' visible' : ''}`}>

          {/* Left Column: Personal Narrative & Philosophy */}
          <div className="about__intro-card">
            <div>
              <p className="section-label">About Me</p>
              <h2 className="about__headline">
                Driven by Mathematics,<br />
                Crafted in Code.
              </h2>

              <p className="about__text">
                I&apos;m a Data Science student at the <strong>Institute of Technology of Cambodia</strong>,
                pursuing my Engineering Degree (Expected Graduation: 2027). I focus on bridging statistical
                rigor with high-performance software engineering to solve real-world problems.
              </p>

              <p className="about__text">
                Whether formulating probabilistic graphical models, training machine learning
                pipelines on complex datasets, or architecting full-stack web platforms, I value
                clean structure, mathematical grounding, and practical impact.
              </p>
            </div>

            <div>
              <div className="about__meta-chips">
                <span className="about__meta-chip">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Phnom Penh, Cambodia
                </span>
                <span className="about__meta-chip">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                  ITC • Expected Graduation: 2027
                </span>
              </div>

              <div className="about__cta-row">
                <a href="mailto:heangdenis011468@gmail.com" className="btn btn-primary">
                  <span>Start a Conversation</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M7 17L17 7M7 7h10v10" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Focus Cards */}
          <div className="about__cards-column">

            {/* Card 1: Academic Background */}
            <div className="about__card">
              <div className="about__card-header">
                <div className="about__card-icon about__card-icon--indigo">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                </div>
                <span className="about__card-tag">Academic Foundation</span>
              </div>
              <h3 className="about__card-title">Engineering Degree in Data Science</h3>
              <p className="about__card-institution">
                Institute of Technology of Cambodia (ITC)
                <span className="about__card-year"> • Expected Graduation: 2027</span>
              </p>
              <p className="about__card-text">
                Rigorous curriculum covering Data Structures &amp; Algorithms, Machine Learning, Database Systems, Linear Algebra, and Probability &amp; Statistics.
              </p>
            </div>

            {/* Card 2: Technical Focus */}
            <div className="about__card">
              <div className="about__card-header">
                <div className="about__card-icon about__card-icon--amber">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                </div>
                <span className="about__card-tag">Engineering Focus</span>
              </div>
              <h3 className="about__card-title">What I Specialize In</h3>
              <div className="about__interests-list">
                <div className="about__interest-item">
                  <span className="about__interest-dot" />
                  <span><strong>Predictive Modeling:</strong> Credit default risk prediction, Basel-aligned ratings, and gradient-boosted ensembles</span>
                </div>
                <div className="about__interest-item">
                  <span className="about__interest-dot" />
                  <span><strong>Statistical Computing:</strong> Hidden Markov Models (HMM) and log-space Viterbi algorithm from mathematical first principles</span>
                </div>
                <div className="about__interest-item">
                  <span className="about__interest-dot" />
                  <span><strong>Modern Full-Stack:</strong> Python FastAPI backends paired with clean React interfaces for data applications</span>
                </div>
              </div>
            </div>

            {/* Card 3: Languages & Communication */}
            <div className="about__card">
              <div className="about__card-header">
                <div className="about__card-icon about__card-icon--cyan">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </div>
                <span className="about__card-tag">Languages &amp; Communication</span>
              </div>
              <div className="about__lang-pills">
                <div className="about__lang-pill">
                  <span className="about__lang-pill-name">Khmer</span>
                  <span className="about__lang-pill-level">Native</span>
                </div>
                <div className="about__lang-pill">
                  <span className="about__lang-pill-name">English</span>
                  <span className="about__lang-pill-level">Professional (B2) • ACE</span>
                </div>
                <div className="about__lang-pill">
                  <span className="about__lang-pill-name">French</span>
                  <span className="about__lang-pill-level">Elementary (A2)</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
