import useReveal from '../hooks/useReveal';
import chromadbIcon from '../images/skills/chromadb.svg';
import powerbiIcon from '../images/skills/powerbi.svg';
import scipyIcon from '../images/skills/scipy.svg';

const deviconBase = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons';
const devicon = (name, variant = 'original') =>
  `${deviconBase}/${name}/${name}-${variant}.svg`;
const simpleIcon = (slug, color = 'ffffff') =>
  `https://cdn.simpleicons.org/${slug}/${color}`;

const SKILL_GROUPS = [
  {
    id: 'ml-ai',
    title: 'ML & AI',
    subtitle: 'Deep learning, neural architectures, vector retrieval & LLM agent pipelines',
    accent: '#8b5cf6',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
        <polygon points="12 6 16 14 8 14" />
      </svg>
    ),
    skills: [
      { name: 'Scikit-learn', icon: devicon('scikitlearn'), color: '#F7931E' },
      { name: 'TensorFlow', icon: devicon('tensorflow'), color: '#FF6F00' },
      { name: 'LangChain', icon: simpleIcon('langchain', 'ffffff'), color: '#1C64F2' },
      { name: 'Llama', icon: simpleIcon('meta', 'ffffff'), color: '#0081FB' },
      { name: 'ChromaDB', icon: chromadbIcon, color: '#FF6446' },
      { name: 'Hugging Face', icon: simpleIcon('huggingface', '111111'), color: '#FFCC4D' },
    ],
  },
  {
    id: 'data-analytics',
    title: 'Data & Analytics',
    subtitle: 'High-throughput data transformations, statistical modeling & analytics dashboards',
    accent: '#06b6d4',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
    skills: [
      { name: 'Pandas', icon: devicon('pandas'), color: '#150458' },
      { name: 'NumPy', icon: devicon('numpy'), color: '#013243' },
      { name: 'SciPy', icon: scipyIcon, color: '#8CAAE6' },
      { name: 'Power BI', icon: powerbiIcon, color: '#F2C811' },
      { name: 'SQL', icon: devicon('mysql'), color: '#00758F' },
      { name: 'PostgreSQL', icon: devicon('postgresql'), color: '#336791' },
      { name: 'DuckDB', icon: devicon('duckdb'), color: '#FFF000' },
    ],
  },
  {
    id: 'web-backend',
    title: 'Web & Backend',
    subtitle: 'High-performance REST APIs, full-stack microservices & reactive user interfaces',
    accent: '#10b981',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M3 9h18" />
        <path d="M9 21V9" />
      </svg>
    ),
    skills: [
      { name: 'Python', icon: devicon('python'), color: '#3776AB' },
      { name: 'FastAPI', icon: devicon('fastapi'), color: '#009688' },
      { name: 'Django', icon: devicon('django', 'plain'), color: '#092E20' },
      { name: 'React', icon: devicon('react'), color: '#61DAFB' },
      { name: 'Node.js', icon: devicon('nodejs'), color: '#339933' },
      { name: 'Express.js', icon: devicon('express'), color: '#444444' },
      { name: 'Flask', icon: devicon('flask'), color: '#111827' },
    ],
  },
  {
    id: 'programming-languages',
    title: 'Programming Languages',
    subtitle: 'Core programming languages for statistical computing, data analysis & systems',
    accent: '#f59e0b',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    skills: [
      { name: 'Python', icon: devicon('python'), color: '#3776AB' },
      { name: 'R', icon: devicon('r'), color: '#276DC3' },
      { name: 'JavaScript', icon: devicon('javascript'), color: '#F7DF1E' },
      { name: 'SQL', icon: devicon('mysql'), color: '#00758F' },
    ],
  },
  {
    id: 'tools-environment',
    title: 'Tools & Environment',
    subtitle: 'Developer environments, version control, cloud computing & reproducible research',
    accent: '#6366f1',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    skills: [
      { name: 'Git', icon: devicon('git'), color: '#F05032' },
      { name: 'VS Code', icon: devicon('vscode'), color: '#007ACC' },
      { name: 'Jupyter', icon: devicon('jupyter'), color: '#F37626' },
      { name: 'Google Cloud', icon: devicon('googlecloud'), color: '#4285F4' },
    ],
  },
];

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

export default function Skills() {
  const [ref, visible] = useReveal();

  const handleIconError = (event) => {
    const chip = event.currentTarget.closest('.skill-bento-chip');
    if (chip) chip.classList.add('skill-bento-chip--fallback');
  };

  return (
    <section id="skills" className="section">
      <div className="container" ref={ref}>
        <div className="section-header">
          <p className="section-label">Skills & Tech Stack</p>
          <h2 className="section-title">Technical Expertise</h2>
          <p className="section-subtitle">
            Curated toolkit organized across machine learning engineering, statistical computing, web architecture, and cloud tooling.
          </p>
        </div>

        {/* 5 Distinct Bento Cards */}
        <div className={`skills-bento-grid stagger${visible ? ' visible' : ''}`}>
          {SKILL_GROUPS.map((group) => (
            <div
              key={group.id}
              className={`skill-bento-card skill-bento-card--${group.id}`}
              style={{ '--group-accent': group.accent }}
            >
              <div className="skill-bento-card__glow" />
              
              <div className="skill-bento-card__header">
                <div className="skill-bento-card__icon-box">
                  {group.icon}
                </div>
                <div className="skill-bento-card__titles">
                  <h3 className="skill-bento-card__title">{group.title}</h3>
                  <p className="skill-bento-card__subtitle">{group.subtitle}</p>
                </div>
                <span className="skill-bento-card__count">{group.skills.length} Tech</span>
              </div>

              <div className="skill-bento-card__items">
                {group.skills.map((skill) => (
                  <div
                    key={skill.name}
                    className="skill-bento-chip"
                    style={{ '--skill-color': skill.color }}
                  >
                    <div className="skill-bento-chip__icon-wrap">
                      <img
                        src={skill.icon}
                        alt={skill.name}
                        className="skill-bento-chip__icon"
                        loading="lazy"
                        onError={handleIconError}
                      />
                    </div>
                    <span className="skill-bento-chip__name">{skill.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Methods & Techniques Section */}
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

      </div>
    </section>
  );
}
