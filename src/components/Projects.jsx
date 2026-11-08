import React, { useState, useEffect, useRef } from 'react';
import useReveal from '../hooks/useReveal';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

import creditRiskPred from '../images/creditrisk_pred.jpg';
import creditRiskRag from '../images/creditrisk_rag.jpg';
import llcAuC from '../images/LLC_AUC.png';
import llcFeature from '../images/LLC_importance_feature.png';
import llcBi1 from '../images/LLC_bi_1_(1).png';
import llcBi2 from '../images/LLC_bi_1_(2).png';
import llcBi3 from '../images/LLC_bi_1_(3).png';
import hmmMethodology from '../images/hmm_methodology.jpg';
import hmmResults from '../images/hmm_results.jpg';

const projects = [
  {
    id: 1,
    title: 'Credit Risk Analysis, Prediction & RAG Assistant',
    metric: '30k+ Loan Records • Basel Grades (A–F)',
    desc: 'Trained gradient-boosted CatBoost and Neural Network classifiers on 30,000+ financial records to forecast probability of default (PD) categorized into Basel-compliant risk ratings. Integrated a conversational Llama 3.2 RAG agent backed by LangChain and ChromaDB with Whisper speech-to-text, deployed via a high-throughput FastAPI and React platform.',
    tags: ['FastAPI', 'React', 'Llama 3.2', 'ChromaDB', 'LangChain', 'CatBoost', 'Scikit-learn'],
    githubUrl: 'https://github.com/heangdeniss/creditAnalysisAsistantChatbot',
    demoUrl: 'https://github.com/heangdeniss/creditAnalysisAsistantChatbot',
    images: [creditRiskPred, creditRiskRag],
    architecture: {
      flow: [
        '30k+ Financial Records',
        'Imputation & Outlier Winsorization',
        'CatBoost & Neural Net (PD)',
        'Basel Risk Mapping (A–F)',
        'Whisper STT + ChromaDB Retrieval',
        'Llama 3.2 + FastAPI Serving'
      ],
      formulaLabel: 'Logistic Probability of Default (PD) & Basel Expected Loss',
      formula: 'PD = σ(w^T x + b) = 1 / (1 + e^{-(w^T x + b)})  |  EL = PD × LGD × EAD',
      details: 'Calculated loan risk grades aligned with Basel II/III regulatory standards. The RAG module embeds financial documents with semantic chunking, queried via cosine similarity top-k search in ChromaDB.'
    }
  },
  {
    id: 2,
    title: 'LendingClub Big Data Pipeline & Default Prediction',
    metric: 'Columnar Parquet • ROC-AUC Optimization',
    desc: 'Converted massive multi-CSV loan datasets into high-performance columnar Parquet using DuckDB, drastically reducing memory overhead for exploratory analysis and feature engineering. Benchmarked hyperparameter-tuned XGBoost, Random Forest, and TensorFlow ANN architectures with RandomizedSearchCV, optimizing for maximum ROC-AUC discrimination.',
    tags: ['DuckDB', 'Python', 'XGBoost', 'TensorFlow', 'Pandas', 'NumPy', 'hvPlot'],
    githubUrl: 'https://github.com/heangdeniss/LendingLoanClubDataAnalysis',
    demoUrl: 'https://github.com/heangdeniss/LendingLoanClubDataAnalysis',
    images: [llcAuC, llcFeature, llcBi1, llcBi2, llcBi3],
    architecture: {
      flow: [
        'Multi-CSV Raw Datasets',
        'DuckDB Ingestion Engine',
        'Columnar Parquet Compression',
        'Vectorized Feature Engineering',
        'RandomizedSearchCV Tuning',
        'XGBoost & TensorFlow ANN',
        'ROC-AUC Evaluation'
      ],
      formulaLabel: 'DuckDB Columnar Query & ROC-AUC Discrimination',
      formula: 'ROC-AUC = ∫₀¹ TPR(FPR⁻¹(t)) dt  |  Memory Reduction: > 70%',
      details: 'Transformed tabular schemas into partitioned Parquet format, accelerating filtering and aggregations across millions of data points while preventing out-of-memory crashes on exploratory notebooks.'
    }
  },
  {
    id: 3,
    title: 'HMM Part-of-Speech Tagger & Text Segmentation (PGM)',
    metric: '96.05% Accuracy • 232k+ Tokens Processed',
    desc: 'Formulated a first-principles Hidden Markov Model (HMM) with log-space Viterbi dynamic programming to overcome numerical underflow on sequence labeling across 232,000+ Brown Corpus tokens. Engineered Laplace smoothing with grid-search cross-validation (α = 10⁻⁹), achieving 96.05% test accuracy across 12 Universal POS categories.',
    tags: ['Python', 'Probabilistic Graphical Models', 'HMM', 'Viterbi Algorithm', 'NLP', 'NLTK'],
    githubUrl: 'https://github.com/heangdeniss/HMM-Text_Segmentation',
    demoUrl: 'https://github.com/heangdeniss/HMM-Text_Segmentation',
    images: [hmmMethodology, hmmResults],
    architecture: {
      flow: [
        'Brown Corpus (232k Tokens)',
        'Bi-Gram Transition Matrix A',
        'Emission Likelihood Matrix B',
        'Laplace Smoothing (α = 10⁻⁹)',
        'Log-Space Viterbi Trellis',
        'Backtracking Optimal Path',
        '96.05% Evaluation'
      ],
      formulaLabel: 'Log-Space Viterbi Recursion & Laplace Smoother',
      formula: 'v_t(j) = max_i [ v_{t-1}(i) + ln A_{ij} ] + ln B_j(o_t)  |  P(w|t) = (C(t, w) + α) / (C(t) + α|V|)',
      details: 'Formulating dynamic programming in logarithmic space converts probability multiplications into additions, eliminating underflow on long sentences exceeding 50+ tokens with O(T · |S|²) computational complexity.'
    }
  },
];

const ImageSlider = ({ images, title, onImageClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!images || images.length < 2 || paused || prefersReducedMotion) return undefined;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images, paused, prefersReducedMotion]);

  if (!images || images.length === 0) return null;

  const step = (delta) =>
    setCurrentIndex((prevIndex) => (prevIndex + delta + images.length) % images.length);

  return (
    <div
      className="project-card__image-slider"
      data-cursor="View"
      role="group"
      aria-roledescription="carousel"
      aria-label={`${title} image gallery`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty('--glare-x', `${((event.clientX - rect.left) / rect.width) * 100}%`);
        event.currentTarget.style.setProperty('--glare-y', `${((event.clientY - rect.top) / rect.height) * 100}%`);
      }}
    >
      {images.map((img, index) => (
        <img
          key={index}
          src={img}
          alt={`${title} — visual ${index + 1} of ${images.length}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onImageClick({ src: img, alt: `${title} — visual ${index + 1}` });
          }}
          className={`project-card__slider-img${index === currentIndex ? ' active' : ''}`}
          loading="lazy"
          decoding="async"
          aria-hidden={index !== currentIndex}
        />
      ))}

      {images.length > 1 && (
        <>
          <button
            type="button"
            className="project-card__slider-nav project-card__slider-nav--prev"
            onClick={() => step(-1)}
            aria-label="Previous image"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <button
            type="button"
            className="project-card__slider-nav project-card__slider-nav--next"
            onClick={() => step(1)}
            aria-label="Next image"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <span className="project-card__slider-count" aria-hidden="true">
            {currentIndex + 1} / {images.length}
          </span>

          <div className="project-card__slider-dots">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`project-card__slider-dot${i === currentIndex ? ' active' : ''}`}
                onClick={() => setCurrentIndex(i)}
                aria-label={`Show image ${i + 1} of ${images.length}`}
                aria-current={i === currentIndex ? 'true' : undefined}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default function Projects() {
  const [ref, visible] = useReveal();
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [expandedArchId, setExpandedArchId] = useState(null);
  const closeButtonRef = useRef(null);

  // Lock background scroll, support Escape, and move focus into the lightbox.
  useEffect(() => {
    if (!fullScreenImage) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setFullScreenImage(null);
    };
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [fullScreenImage]);

  const closeLightbox = () => setFullScreenImage(null);

  return (
    <section id="projects" className="section" data-ghost="WORK">
      <div className={`container${visible ? ' is-visible' : ''}`} ref={ref}>
        <div className="section-header">
          <p className="section-label">Featured Projects</p>
          <h2 className="section-title">Engineering & Research Highlights</h2>
          <p className="section-subtitle">
            Selected machine learning architectures, statistical computing pipelines, and data systems engineered for real-world impact.
          </p>
        </div>

        <div className={`projects__list stagger${visible ? ' visible' : ''}`}>
          {projects.map((p) => (
            <div key={p.id} className="project-card">
              {/* Header Bar: Number + Impact Metric Badge */}
              <div className="project-card__header-bar">
                <span className="project-card__num">PROJECT {String(p.id).padStart(2, '0')}</span>
                <div className="project-card__metric-badge">
                  <span className="project-card__metric-pulse" />
                  <span className="project-card__metric-text">{p.metric}</span>
                </div>
              </div>

              {/* Interactive Image Showcase */}
              <ImageSlider images={p.images} title={p.title} onImageClick={setFullScreenImage} />

              {/* Content Section */}
              <div className="project-card__content">
                <h3 className="project-card__title">{p.title}</h3>
                <p className="project-card__desc">{p.desc}</p>

                {/* Interactive Tech Stack Chips */}
                <div className="project-card__tags">
                  {p.tags.map((tag) => (
                    <span key={tag} className="project-card__tag">{tag}</span>
                  ))}
                </div>

                {/* Collapsible Architecture & Mathematical Formulation Toggle */}
                <div className="project-card__arch-wrap">
                  <button
                    type="button"
                    onClick={() => setExpandedArchId(expandedArchId === p.id ? null : p.id)}
                    className={`project-card__arch-toggle${expandedArchId === p.id ? ' active' : ''}`}
                    aria-expanded={expandedArchId === p.id}
                    aria-controls={`arch-drawer-${p.id}`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 2 7 12 12 22 7 12 2" />
                      <polyline points="2 17 12 22 22 17" />
                      <polyline points="2 12 12 17 22 12" />
                    </svg>
                    <span>
                      {expandedArchId === p.id
                        ? 'Hide System Architecture & Formulation'
                        : 'System Architecture & Formulation'}
                    </span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className="project-card__arch-chevron"
                      style={{
                        transform: expandedArchId === p.id ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.3s ease',
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {expandedArchId === p.id && (
                    <div className="project-card__arch-drawer" id={`arch-drawer-${p.id}`}>
                      <div className="project-card__arch-flow">
                        <span className="project-card__arch-label">System Data Pipeline</span>
                        <div className="project-card__flow-steps">
                          {p.architecture.flow.map((step, idx) => (
                            <React.Fragment key={idx}>
                              <span className="project-card__flow-node">{step}</span>
                              {idx < p.architecture.flow.length - 1 && (
                                <span className="project-card__flow-arrow">→</span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>

                      <div className="project-card__arch-math">
                        <span className="project-card__arch-label">{p.architecture.formulaLabel}</span>
                        <div className="project-card__formula-block">
                          <code>{p.architecture.formula}</code>
                        </div>
                        <p className="project-card__arch-details">{p.architecture.details}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Dual Call-to-Action Buttons */}
                <div className="project-card__actions">
                  {p.demoUrl && p.demoUrl !== p.githubUrl && (
                    <a
                      href={p.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary project-btn project-btn--demo"
                      title="Open Live Demonstration"
                    >
                      <span>Live Demo</span>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M7 17L17 7M7 7h10v10" />
                      </svg>
                    </a>
                  )}

                  <a
                    href={p.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline project-btn project-btn--github"
                    title="View GitHub Repository"
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                    </svg>
                    <span>GitHub Repo</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {fullScreenImage && (
        <div
          className="project-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Project image preview"
          onClick={closeLightbox}
        >
          <img
            src={fullScreenImage.src}
            alt={fullScreenImage.alt}
            className="project-modal__img"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            ref={closeButtonRef}
            type="button"
            className="project-modal__close"
            onClick={closeLightbox}
            aria-label="Close image preview"
          >
            &times;
          </button>
        </div>
      )}
    </section>
  );
}
