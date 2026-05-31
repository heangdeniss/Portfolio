import useReveal from '../hooks/useReveal';

const projects = [
  {
    id: 1,
    title: 'Credit Risk Analysis, Prediction & RAG Assistant',
    desc: 'Processed 30,000+ loan records for credit risk modeling. Trained Logistic Regression, Neural Network, and CatBoost models to predict probability of default with Basel-aligned risk grades (A–F). Built a RAG chatbot using Llama 3.2, LangChain, and ChromaDB. Integrated Whisper for speech-to-text. Full-stack with FastAPI + React.',
    tags: ['Python', 'Scikit-learn', 'FastAPI', 'React', 'Llama', 'LangChain'],
    url: 'https://github.com/heangdeniss/creditAnalysisAsistantChatbot',
  },
  {
    id: 2,
    title: 'LendingClub Data Analysis',
    desc: 'Converted multi-CSV LendingClub data into Parquet with DuckDB for fast, reproducible analysis. Performed EDA and feature engineering with pandas and hvPlot, including missing values, outliers, date and ZIP extraction, and one-hot encoding. Compared XGBoost, Random Forest, and TensorFlow ANN models with RandomizedSearchCV and ROC-AUC evaluation.',
    tags: ['Python', 'pandas', 'NumPy', 'XGBoost', 'TensorFlow', 'DuckDB'],
    url: 'https://github.com/heangdeniss/LendingLoanClubDataAnalysis',
  },
  {
    id: 3,
    title: 'House Price Prediction Web App',
    desc: 'Collected 8,100+ Florida property listings from Redfin using BeautifulSoup. Built a PyTorch neural network with full ML pipeline including IQR-based outlier removal. Deployed a Streamlit web app for property price prediction. Interactive data visualizations using Matplotlib.',
    tags: ['Python', 'PyTorch', 'Streamlit', 'BeautifulSoup', 'Pandas'],
    url: 'https://github.com/heangdeniss/housePridePredFloridaIn2025',
  },
  {
    id: 4,
    title: 'AI Educational Chatbot',
    desc: 'Built an AI chatbot platform using Node.js, Express.js, Flask, and PostgreSQL for querying curriculum content. Implemented a RAG pipeline with LangChain and ChromaDB for Khmer literature retrieval. Designed PostgreSQL database with schemas, triggers, and functions for chat history and user session management. Team lead of 4 members.',
    tags: ['Node.js', 'Flask', 'PostgreSQL', 'LangChain', 'ChromaDB', 'Google Cloud'],
    url: 'https://github.com/heangdeniss/AiEducationChatbot',
  },
];


export default function Projects() {
  const [ref, visible] = useReveal();

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
    </section>
  );
}
