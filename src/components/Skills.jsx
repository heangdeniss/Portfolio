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

const deviconBase = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons';
const devicon = (name, variant = 'original') =>
  `${deviconBase}/${name}/${name}-${variant}.svg`;
const simpleIcon = (slug, color = 'ffffff') =>
  `https://cdn.simpleicons.org/${slug}/${color}`;

const skillMeta = {
  Python: { icon: devicon('python'), color: '#3776AB' },
  R: { icon: devicon('r'), color: '#276DC3' },
  PostgreSQL: { icon: devicon('postgresql'), color: '#336791' },
  SQL: { icon: devicon('mysql'), color: '#00758F' },
  JavaScript: { icon: devicon('javascript'), color: '#F7DF1E', textColor: '#1a1a1a', iconFilter: 'brightness(0)' },
  'Scikit-learn': { icon: devicon('scikitlearn'), color: '#F7931E' },
  Pandas: { icon: devicon('pandas'), color: '#150458' },
  NumPy: { icon: devicon('numpy'), color: '#013243' },
  Matplotlib: { icon: devicon('matplotlib'), color: '#11557C' },
  Seaborn: { icon: simpleIcon('seaborn', 'ffffff'), color: '#4C72B0', iconFilter: 'none' },
  TensorFlow: { icon: devicon('tensorflow'), color: '#FF6F00' },
  SciPy: { icon: devicon('scipy'), color: '#8CAAE6', textColor: '#1a1a1a', iconFilter: 'brightness(0)' },
  LangChain: { icon: simpleIcon('langchain', 'ffffff'), color: '#1C64F2', iconFilter: 'none' },
  LLM: { icon: simpleIcon('openai', 'ffffff'), color: '#6B21A8', iconFilter: 'none' },
  FastAPI: { icon: devicon('fastapi'), color: '#009688' },
  Django: { icon: devicon('django', 'plain'), color: '#092E20' },
  React: { icon: devicon('react'), color: '#61DAFB', textColor: '#0b0c1e', iconFilter: 'brightness(0)' },
  'Node.js': { icon: devicon('nodejs'), color: '#339933' },
  Flask: { icon: devicon('flask'), color: '#111827' },
  'Express.js': { icon: devicon('express'), color: '#444444' },
  Git: { icon: devicon('git'), color: '#F05032' },
  'Hugging Face': { icon: simpleIcon('huggingface', '111111'), color: '#FFCC4D', textColor: '#1a1a1a', iconFilter: 'none' },
  'VS Code': { icon: devicon('vscode'), color: '#007ACC' },
  'Power BI': { icon: simpleIcon('powerbi', '111111'), color: '#F2C811', textColor: '#1a1a1a', iconFilter: 'none' },
  Excel: { icon: simpleIcon('microsoftexcel', 'ffffff'), color: '#217346', iconFilter: 'none' },
  Jupyter: { icon: devicon('jupyter'), color: '#F37626' },
  ChromaDB: { icon: simpleIcon('chromadb', 'ffffff'), color: '#6D28D9', iconFilter: 'none' },
  'Google Cloud': { icon: devicon('googlecloud'), color: '#4285F4' },
};

const metaFor = (label) => skillMeta[label] || { color: '#1f223f' };
const initialsFor = (label) =>
  label.replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase();

export default function Skills() {
  const [ref, visible] = useReveal();
  const handleIconError = (event) => {
    const chip = event.currentTarget.closest('.skill-chip');
    if (chip) chip.classList.add('skill-chip--fallback');
  };

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
                {cat.items.map((item) => {
                  const meta = metaFor(item);
                  const hasIcon = Boolean(meta.icon);
                  const chipStyle = {
                    '--chip-bg': meta.color,
                    '--chip-fg': meta.textColor || '#ffffff',
                    '--chip-border': meta.color,
                    '--chip-icon-filter': meta.iconFilter || 'brightness(0) invert(1)',
                  };

                  return (
                    <span
                      key={item}
                      className={`skills__item skill-chip${hasIcon ? '' : ' skill-chip--fallback'}`}
                      style={chipStyle}
                    >
                      <span className="skill-chip__icon" aria-hidden="true">
                        {hasIcon && (
                          <img
                            src={meta.icon}
                            alt=""
                            className="skill-chip__icon-img"
                            loading="lazy"
                            onError={handleIconError}
                          />
                        )}
                        <span className="skill-chip__fallback">{initialsFor(item)}</span>
                      </span>
                      <span className="skill-chip__label">{item}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className={`skills__methods reveal reveal-up${visible ? ' visible' : ''}`}>
          <h3 className="skills__cat-title">Methods & Techniques</h3>
          <div className="skills__method-grid">
            {methods.map((m) => (
              <span key={m} className="skills__method skill-chip skill-chip--plain">
                <span className="skill-chip__label">{m}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
