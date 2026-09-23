import React, { useState, useEffect } from 'react';
import useReveal from '../hooks/useReveal';

import creditRiskPred from '../images/creditrisk_pred.png';
import creditRiskRag from '../images/creditrisk_rag.png';
import llcAuC from '../images/LLC_AUC.png';
import llcFeature from '../images/LLC_importance_feature.png';
import llcBi1 from '../images/LLC_bi_1_(1).png';
import llcBi2 from '../images/LLC_bi_1_(2).png';
import llcBi3 from '../images/LLC_bi_1_(3).png';
import hmmMethodology from '../images/hmm_methodology.png';
import hmmResults from '../images/hmm_results.png';

const projects = [
  {
    id: 1,
    title: 'Credit Risk Analysis, Prediction & RAG Assistant',
    metric: '30k+ Loan Records Processed • Basel Grades (A–F)',
    desc: 'Trained gradient-boosted CatBoost and Neural Network classifiers on 30,000+ financial records to forecast probability of default (PD) categorized into Basel-compliant risk ratings. Integrated a conversational Llama 3.2 RAG agent backed by LangChain and ChromaDB with Whisper speech-to-text, deployed via a high-throughput FastAPI and React platform.',
    tags: ['FastAPI', 'React', 'Llama 3.2', 'ChromaDB', 'LangChain', 'CatBoost', 'Scikit-learn'],
    githubUrl: 'https://github.com/heangdeniss/creditAnalysisAsistantChatbot',
    demoUrl: 'https://github.com/heangdeniss/creditAnalysisAsistantChatbot',
    images: [creditRiskPred, creditRiskRag],
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
  },
];

const ImageSlider = ({ images, onImageClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [images]);

  if (!images || images.length === 0) return null;

  return (
    <div className="project-card__image-slider">
      {images.map((img, index) => (
        <img
          key={index}
          src={img}
          alt={`Project Slide ${index + 1}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onImageClick(img);
          }}
          className={`project-card__slider-img${index === currentIndex ? ' active' : ''}`}
        />
      ))}
      {images.length > 1 && (
        <div className="project-card__slider-dots">
          {images.map((_, i) => (
            <span
              key={i}
              className={`project-card__slider-dot${i === currentIndex ? ' active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(i);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function Projects() {
  const [ref, visible] = useReveal();
  const [fullScreenImage, setFullScreenImage] = useState(null);

  return (
    <section id="projects" className="section">
      <div className="container" ref={ref}>
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
              <ImageSlider images={p.images} onImageClick={setFullScreenImage} />

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

                {/* Dual Call-to-Action Buttons */}
                <div className="project-card__actions">
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
                    <span>View GitHub Repo</span>
                  </a>

                  {p.demoUrl && (
                    <a
                      href={p.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary project-btn project-btn--demo"
                      title="Open Demonstration"
                    >
                      <span>Live Demo</span>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M7 17L17 7M7 7h10v10" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {fullScreenImage && (
        <div
          className="project-modal"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setFullScreenImage(null);
          }}
        >
          <img
            src={fullScreenImage}
            alt="Full Screen Preview"
            className="project-modal__img"
          />
          <button
            className="project-modal__close"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setFullScreenImage(null);
            }}
          >
            &times;
          </button>
        </div>
      )}
    </section>
  );
}
