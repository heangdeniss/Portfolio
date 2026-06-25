import React, { useState, useEffect } from 'react';
import useReveal from '../hooks/useReveal';

import creditRiskPred from '../images/creditrisk_pred.png';
import creditRiskRag from '../images/creditrisk_rag.png';
import llcAuC from '../images/LLC_AUC.png';
import llcFeature from '../images/LLC_importance_feature.png';
import khmerCourse from '../images/khmer_course.png';
import khmerRag from '../images/khmer_rag.png';

const projects = [
  {
    id: 1,
    title: 'Credit Risk Analysis, Prediction & RAG Assistant',
    desc: 'Processed 30,000+ loan records for credit risk modeling. Trained Logistic Regression, Neural Network, and CatBoost models to predict probability of default with Basel-aligned risk grades (A–F). Built a RAG chatbot using Llama 3.2, LangChain, and ChromaDB. Integrated Whisper for speech-to-text. Full-stack with FastAPI + React.',
    tags: ['Python', 'Scikit-learn', 'FastAPI', 'React', 'Llama', 'LangChain'],
    url: 'https://github.com/heangdeniss/creditAnalysisAsistantChatbot',
    images: [creditRiskPred, creditRiskRag],
  },
  {
    id: 2,
    title: 'LendingClub Data Analysis',
    desc: 'Converted multi-CSV LendingClub data into Parquet with DuckDB for fast, reproducible analysis. Performed EDA and feature engineering with pandas and hvPlot, including missing values, outliers, date and ZIP extraction, and one-hot encoding. Compared XGBoost, Random Forest, and TensorFlow ANN models with RandomizedSearchCV and ROC-AUC evaluation.',
    tags: ['Python', 'pandas', 'NumPy', 'XGBoost', 'TensorFlow', 'DuckDB'],
    url: 'https://github.com/heangdeniss/LendingLoanClubDataAnalysis',
    images: [llcAuC, llcFeature],
  },
  {
    id: 3,
    title: 'AI Educational Chatbot',
    desc: 'Built an AI chatbot platform using Node.js, Express.js, Flask, and PostgreSQL for querying curriculum content. Implemented a RAG pipeline with LangChain and ChromaDB for Khmer literature retrieval. Designed PostgreSQL database with schemas, triggers, and functions for chat history and user session management. Team lead of 4 members.',
    tags: ['Node.js', 'Flask', 'PostgreSQL', 'LangChain', 'ChromaDB', 'Google Cloud'],
    url: 'https://github.com/heangdeniss/AiEducationChatbot',
    images: [khmerCourse, khmerRag],
  },
];

const ImageSlider = ({ images, onImageClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images]);

  if (!images || images.length === 0) return null;

  return (
    <div className="project-card__image-slider" style={{ width: '100%', height: '350px', overflow: 'hidden', position: 'relative', borderRadius: '8px', marginBottom: '20px', backgroundColor: '#0f172a' }}>
      {images.map((img, index) => (
        <img
          key={index}
          src={img}
          alt={`Slide ${index}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onImageClick(img);
          }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            position: 'absolute',
            top: 0,
            left: 0,
            opacity: index === currentIndex ? 1 : 0,
            transition: 'opacity 0.5s ease-in-out',
            cursor: 'zoom-in'
          }}
        />
      ))}
    </div>
  );
};

export default function Projects() {
  const [ref, visible] = useReveal();
  const [fullScreenImage, setFullScreenImage] = useState(null);

  return (
    <section id="projects" className="section">
      <div className="container" ref={ref}>
        <div className={`reveal reveal-up${visible ? ' visible' : ''}`}>
          <p className="section-label">Projects</p>
          <h2 className="section-title">Notable Projects</h2>
          <p className="section-subtitle">
            A collection of data science projects showcasing my skills
          </p>
        </div>

        <div className={`projects__list stagger${visible ? ' visible' : ''}`}>
          {projects.map((p) => (
            <a
              key={p.id}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="project-card"
            >
              <span className="project-card__num">
                {String(p.id).padStart(2, '0')}
              </span>
              <div className="project-card__body">
                <ImageSlider images={p.images} onImageClick={setFullScreenImage} />
                <h3 className="project-card__title">{p.title}</h3>
                <p className="project-card__desc">{p.desc}</p>
                <div className="project-card__tags">
                  {p.tags.map((tag) => (
                    <span key={tag} className="project-card__tag">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="project-card__arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17L17 7" />
                  <path d="M7 7h10v10" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </div>

      {fullScreenImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'zoom-out'
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setFullScreenImage(null);
          }}
        >
          <img
            src={fullScreenImage}
            alt="Full Screen"
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain',
              borderRadius: '8px',
            }}
          />
          <button
            style={{
              position: 'absolute',
              top: '20px',
              right: '30px',
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '2.5rem',
              cursor: 'pointer',
              padding: '10px'
            }}
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
