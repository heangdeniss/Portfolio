import creditRiskPred from '../images/creditrisk_pred.jpg';
import creditRiskRag from '../images/creditrisk_rag.jpg';
import llcAuC from '../images/LLC_AUC.png';
import llcFeature from '../images/LLC_importance_feature.png';
import llcBi1 from '../images/LLC_bi_1_(1).png';
import llcBi2 from '../images/LLC_bi_1_(2).png';
import llcBi3 from '../images/LLC_bi_1_(3).png';
import hmmMethodology from '../images/hmm_methodology.jpg';
import hmmResults from '../images/hmm_results.jpg';

/**
 * Single source of truth for the three featured projects.
 * Shared by the WebGL showcase, the dossier overlay and the preloader.
 */
export const projects = [
  {
    id: 1,
    slug: 'credit-risk-rag',
    title: 'Credit Risk Analysis, Prediction & RAG Assistant',
    shortTitle: 'Credit Risk RAG',
    metric: '30k+ Loan Records • Basel Grades (A–F)',
    role: 'Predictive Modeling • RAG • FastAPI',
    accent: '#f59e0b',
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
        'Llama 3.2 + FastAPI Serving',
      ],
      formulaLabel: 'Logistic Probability of Default (PD) & Basel Expected Loss',
      formula: 'PD = σ(w^T x + b) = 1 / (1 + e^{-(w^T x + b)})  |  EL = PD × LGD × EAD',
      details:
        'Calculated loan risk grades aligned with Basel II/III regulatory standards. The RAG module embeds financial documents with semantic chunking, queried via cosine similarity top-k search in ChromaDB.',
    },
  },
  {
    id: 2,
    slug: 'lendingclub-pipeline',
    title: 'LendingClub Big Data Pipeline & Default Prediction',
    shortTitle: 'LendingClub Pipeline',
    metric: 'Columnar Parquet • ROC-AUC Optimization',
    role: 'Big Data • DuckDB • XGBoost',
    accent: '#10b981',
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
        'ROC-AUC Evaluation',
      ],
      formulaLabel: 'DuckDB Columnar Query & ROC-AUC Discrimination',
      formula: 'ROC-AUC = ∫₀¹ TPR(FPR⁻¹(t)) dt  |  Memory Reduction: > 70%',
      details:
        'Transformed tabular schemas into partitioned Parquet format, accelerating filtering and aggregations across millions of data points while preventing out-of-memory crashes on exploratory notebooks.',
    },
  },
  {
    id: 3,
    slug: 'hmm-pos-tagger',
    title: 'HMM Part-of-Speech Tagger & Text Segmentation (PGM)',
    shortTitle: 'HMM POS Tagger',
    metric: '96.05% Accuracy • 232k+ Tokens Processed',
    role: 'Probabilistic Models • NLP • HMM',
    accent: '#8b5cf6',
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
        '96.05% Evaluation',
      ],
      formulaLabel: 'Log-Space Viterbi Recursion & Laplace Smoother',
      formula:
        'v_t(j) = max_i [ v_{t-1}(i) + ln A_{ij} ] + ln B_j(o_t)  |  P(w|t) = (C(t, w) + α) / (C(t) + α|V|)',
      details:
        'Formulating dynamic programming in logarithmic space converts probability multiplications into additions, eliminating underflow on long sentences exceeding 50+ tokens with O(T · |S|²) computational complexity.',
    },
  },
];

export const projectPreloadAssets = [
  ...projects.flatMap((project) => project.images),
];
