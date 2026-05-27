import useReveal from '../hooks/useReveal';

const skillsData = [
  {
    title: 'Programming Languages',
    items: ['Python', 'R', 'PostgreSQL', 'SQL', 'JavaScript'],
  },
  {
    title: 'ML / Data Science',
    items: ['Scikit-learn', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'TensorFlow', 'SciPy', 'LangChain', 'LLM'],
  },
  {
    title: 'Frameworks',
    items: ['FastAPI', 'Django', 'React', 'Node.js', 'Flask', 'Express.js'],
  },
  {
    title: 'Tools & Platforms',
    items: ['Git', 'Hugging Face', 'VS Code', 'Power BI', 'Excel', 'Jupyter', 'ChromaDB', 'Google Cloud'],
  },
];

const methods = [
  'EDA', 'Classification', 'Regression',
  'Feature Engineering', 'Neural Networks', 'RAG',
  'NLP', 'Clustering', 'Time Series',
];

const skillIcons = {
  Python: 'PY',
  R: 'R',
  PostgreSQL: 'PG',
  SQL: 'SQL',
  JavaScript: 'JS',
  'Scikit-learn': 'SK',
  Pandas: 'PD',
  NumPy: 'NP',
  Matplotlib: 'MP',
  Seaborn: 'SB',
  TensorFlow: 'TF',
  SciPy: 'SP',
  LangChain: 'LC',
  LLM: 'LLM',
  FastAPI: 'FA',
  Django: 'DJ',
  React: 'RE',
  'Node.js': 'ND',
  Flask: 'FL',
  'Express.js': 'EX',
  Git: 'GIT',
  'Hugging Face': 'HF',
  'VS Code': 'VS',
  'Power BI': 'BI',
  Excel: 'XL',
  Jupyter: 'JP',
  ChromaDB: 'CH',
  'Google Cloud': 'GC',
};

const skillTones = ['blue', 'indigo', 'teal', 'green', 'orange', 'red', 'yellow', 'purple', 'cyan'];

const toneFor = (label) => {
  const score = label.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return skillTones[score % skillTones.length];
};

const iconFor = (label) =>
  skillIcons[label] || label.replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase();

export default function Skills() {
  const [ref, visible] = useReveal();

  return (
    <section id="skills" className="section">
      <div className="container" ref={ref}>
        <div className={`reveal reveal-up${visible ? ' visible' : ''}`}>
          <p className="section-label">Skill</p>
          <h2 className="section-title">Technical Skills</h2>
          <p className="section-subtitle">Tools and technologies I work with</p>
        </div>

        <div className={`skills__categories stagger${visible ? ' visible' : ''}`}>
          {skillsData.map((cat) => (
            <div key={cat.title} className="skills__category">
              <h3 className="skills__cat-title">{cat.title}</h3>
              <div className="skills__items">
                {cat.items.map((item) => (
                  <span key={item} className={`skills__item skill-chip skill-chip--${toneFor(item)}`}>
                    <span className="skill-chip__icon" aria-hidden="true">{iconFor(item)}</span>
                    <span className="skill-chip__label">{item}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className={`skills__methods reveal reveal-up${visible ? ' visible' : ''}`}>
          <h3 className="skills__cat-title">Methods & Techniques</h3>
          <div className="skills__method-grid">
            {methods.map((m) => (
              <span key={m} className={`skills__method skill-chip skill-chip--${toneFor(m)}`}>
                <span className="skill-chip__icon" aria-hidden="true">{iconFor(m)}</span>
                <span className="skill-chip__label">{m}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
