import { useState } from 'react';
import useReveal from '../hooks/useReveal';
import seabornIcon from '../images/skills/seaborn.svg';
import chromadbIcon from '../images/skills/chromadb.svg';
import powerbiIcon from '../images/skills/powerbi.svg';
import excelIcon from '../images/skills/excel.svg';
import llmIcon from '../images/skills/llm.svg';

const deviconBase = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons';
const devicon = (name, variant = 'original') =>
  `${deviconBase}/${name}/${name}-${variant}.svg`;
const simpleIcon = (slug, color = 'ffffff') =>
  `https://cdn.simpleicons.org/${slug}/${color}`;

const skillMeta = {
  Python: { icon: devicon('python'), color: '#3776AB', cat: 'Languages' },
  R: { icon: devicon('r'), color: '#276DC3', cat: 'Languages' },
  PostgreSQL: { icon: devicon('postgresql'), color: '#336791', cat: 'Languages' },
  SQL: { icon: devicon('mysql'), color: '#00758F', cat: 'Languages' },
  JavaScript: { icon: devicon('javascript'), color: '#F7DF1E', cat: 'Languages' },

  'Scikit-learn': { icon: devicon('scikitlearn'), color: '#F7931E', cat: 'AI & Data Science' },
  Pandas: { icon: devicon('pandas'), color: '#150458', cat: 'AI & Data Science' },
  NumPy: { icon: devicon('numpy'), color: '#013243', cat: 'AI & Data Science' },
  Matplotlib: { icon: devicon('matplotlib'), color: '#11557C', cat: 'AI & Data Science' },
  Seaborn: { icon: seabornIcon, color: '#4C72B0', cat: 'AI & Data Science' },
  TensorFlow: { icon: devicon('tensorflow'), color: '#FF6F00', cat: 'AI & Data Science' },
  SciPy: { icon: devicon('scipy'), color: '#8CAAE6', cat: 'AI & Data Science' },
  LangChain: { icon: simpleIcon('langchain', 'ffffff'), color: '#1C64F2', cat: 'AI & Data Science' },
  LLM: { icon: llmIcon, color: '#8B5CF6', cat: 'AI & Data Science' },

  FastAPI: { icon: devicon('fastapi'), color: '#009688', cat: 'Frameworks' },
  Django: { icon: devicon('django', 'plain'), color: '#092E20', cat: 'Frameworks' },
  React: { icon: devicon('react'), color: '#61DAFB', cat: 'Frameworks' },
  'Node.js': { icon: devicon('nodejs'), color: '#339933', cat: 'Frameworks' },
  Flask: { icon: devicon('flask'), color: '#111827', cat: 'Frameworks' },
  'Express.js': { icon: devicon('express'), color: '#444444', cat: 'Frameworks' },

  Git: { icon: devicon('git'), color: '#F05032', cat: 'Tools & Platforms' },
  'Hugging Face': { icon: simpleIcon('huggingface', '111111'), color: '#FFCC4D', cat: 'Tools & Platforms' },
  'VS Code': { icon: devicon('vscode'), color: '#007ACC', cat: 'Tools & Platforms' },
  Antigravity: { icon: simpleIcon('googlegemini', 'ffffff'), color: '#4E82EE', cat: 'Tools & Platforms' },
  'Power BI': { icon: powerbiIcon, color: '#F2C811', cat: 'Tools & Platforms' },
  Excel: { icon: excelIcon, color: '#217346', cat: 'Tools & Platforms' },
  Jupyter: { icon: devicon('jupyter'), color: '#F37626', cat: 'Tools & Platforms' },
  ChromaDB: { icon: chromadbIcon, color: '#FF6446', cat: 'Tools & Platforms' },
  'Google Cloud': { icon: devicon('googlecloud'), color: '#4285F4', cat: 'Tools & Platforms' },
};

const allSkillsList = Object.keys(skillMeta).map((key) => ({
  name: key,
  ...skillMeta[key],
}));

const methodsList = [
  'Exploratory Data Analysis (EDA)',
  'Feature Engineering & Selection',
  'Supervised Classification',
  'Supervised Regression',
  'Basel Probability of Default (PD)',
  'Retrieval-Augmented Generation (RAG)',
  'Natural Language Processing (NLP)',
  'Hidden Markov Models (HMM)',
  'Log-Space Viterbi Algorithm',
  'Deep Neural Networks',
  'Unsupervised Clustering',
  'Time Series Forecasting',
];

const TABS = [
  'All',
  'Languages',
  'AI & Data Science',
  'Frameworks',
  'Tools',
  'Methods',
];

const metaFor = (label) => skillMeta[label] || { color: '#1f223f' };
const initialsFor = (label) =>
  label.replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase();

export default function Skills() {
  const [ref, visible] = useReveal();
  const [activeTab, setActiveTab] = useState('All');

  const filteredSkills = allSkillsList.filter((item) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Tools') return item.cat === 'Tools & Platforms' || item.cat === 'Tools';
    return item.cat === activeTab;
  });

  const showMethods = activeTab === 'All' || activeTab === 'Methods';
  const showSkillsGrid = activeTab !== 'Methods';

  const handleIconError = (event) => {
    const chip = event.currentTarget.closest('.skill-card');
    if (chip) chip.classList.add('skill-card--fallback');
  };

  return (
    <section id="skills" className="section">
      <div className="container" ref={ref}>
        <div className="section-header">
          <p className="section-label">Skills & Stack</p>
          <h2 className="section-title">Technical Expertise</h2>
          <p className="section-subtitle">
            Curated toolkit across machine learning engineering, statistical computing, and web architecture.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="skills-tabs">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`skills-tab-btn${activeTab === tab ? ' skills-tab-btn--active' : ''}`}
            >
              <span>{tab}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Filterable Tech Cards Grid */}
        {showSkillsGrid && (
          <div key={activeTab} className={`skills-cards-grid stagger${visible ? ' visible' : ''}`}>
            {filteredSkills.map((item) => {
              const hasIcon = Boolean(item.icon);
              return (
                <div
                  key={item.name}
                  className="skill-card"
                  style={{
                    '--skill-accent': item.color,
                  }}
                >
                  <div className="skill-card__glow" />
                  <div className="skill-card__icon-box">
                    {hasIcon ? (
                      <img
                        src={item.icon}
                        alt=""
                        className="skill-card__icon"
                        loading="lazy"
                        style={{ filter: item.iconFilter || 'none' }}
                        onError={handleIconError}
                      />
                    ) : (
                      <span className="skill-card__fallback">{initialsFor(item.name)}</span>
                    )}
                  </div>
                  <div className="skill-card__info">
                    <span className="skill-card__name">{item.name}</span>
                    <span className="skill-card__category">{item.cat}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Methods & Techniques Section */}
        {showMethods && (
          <div className="skills-methods-panel">
            <div className="skills-methods-panel__header">
              <span className="skills-methods-panel__tag">Analytical Rigor</span>
              <h3 className="skills-methods-panel__title">Methods, Algorithms & Modeling</h3>
            </div>
            <div className="skills-methods-grid">
              {methodsList.map((m) => (
                <div key={m} className="method-pill">
                  <span className="method-pill__dot" />
                  <span className="method-pill__text">{m}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
