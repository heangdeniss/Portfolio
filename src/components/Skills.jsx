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
                  <span key={item} className="skills__item">{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className={`skills__methods reveal reveal-up${visible ? ' visible' : ''}`}>
          <h3 className="skills__cat-title">Methods & Techniques</h3>
          <div className="skills__method-grid">
            {methods.map((m) => (
              <span key={m} className="skills__method">{m}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
