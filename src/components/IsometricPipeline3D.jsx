import { useState } from 'react';

const PIPELINE_LAYERS_BY_SLUG = {
  'credit-risk-rag': [
    {
      step: '01',
      label: '1. 30k+ Loan Ingestion',
      sub: 'Imputation • Outlier Winsorization • Feature Scaling',
      tag: 'DATA LAYER',
      color: '#38bdf8',
    },
    {
      step: '02',
      label: '2. CatBoost & NN PD Scoring',
      sub: 'Probability of Default σ(wᵀx+b) • Basel Grades (A–F)',
      tag: 'ML ENGINE',
      color: '#f59e0b',
    },
    {
      step: '03',
      label: '3. ChromaDB + Llama 3.2 RAG',
      sub: 'Semantic Vector Retrieval • LangChain • Whisper STT',
      tag: 'RAG MEMORY',
      color: '#a855f7',
    },
    {
      step: '04',
      label: '4. FastAPI + React UI',
      sub: 'High-Throughput Async Serving • Interactive Risk Cockpit',
      tag: 'SERVING UI',
      color: '#10b981',
    },
  ],
  'lendingclub-pipeline': [
    {
      step: '01',
      label: '1. Multi-CSV Raw Ingestion',
      sub: 'DuckDB In-Process SQL • High-Volume Loan Records',
      tag: 'INGESTION',
      color: '#38bdf8',
    },
    {
      step: '02',
      label: '2. Columnar Parquet Store',
      sub: 'Partitioned Compression • >70% Memory Overhead Reduction',
      tag: 'STORAGE',
      color: '#10b981',
    },
    {
      step: '03',
      label: '3. Vectorized Feature Eng.',
      sub: 'RandomizedSearchCV • Debt-to-Income & Utilization Signals',
      tag: 'FEATURES',
      color: '#f59e0b',
    },
    {
      step: '04',
      label: '4. XGBoost & TensorFlow ANN',
      sub: 'Ensemble Default Classifiers • ROC-AUC Discrimination',
      tag: 'INFERENCE',
      color: '#a855f7',
    },
  ],
  'hmm-pos-tagger': [
    {
      step: '01',
      label: '1. Brown Corpus (232k Tokens)',
      sub: 'Sequence Tokenization • 12 Universal POS Categories',
      tag: 'CORPUS',
      color: '#38bdf8',
    },
    {
      step: '02',
      label: '2. Transition & Emission (A, B)',
      sub: 'Bi-Gram Markov Priors • Laplace Smoothing (α = 10⁻⁹)',
      tag: 'PROBABILISTIC',
      color: '#a855f7',
    },
    {
      step: '03',
      label: '3. Log-Space Viterbi Trellis',
      sub: 'v_t(j) = max_i [v_{t-1}(i) + ln A_{ij}] + ln B_j(o_t)',
      tag: 'TRELLIS DP',
      color: '#f59e0b',
    },
    {
      step: '04',
      label: '4. Backtracking Optimal Path',
      sub: 'Zero Numerical Underflow • 96.05% Test Set Accuracy',
      tag: 'DECODER',
      color: '#10b981',
    },
  ],
};

function buildLayersForProject(project) {
  if (project?.slug && PIPELINE_LAYERS_BY_SLUG[project.slug]) {
    return PIPELINE_LAYERS_BY_SLUG[project.slug];
  }

  const flow = project?.architecture?.flow ?? [];
  const palette = ['#38bdf8', '#f59e0b', '#a855f7', '#10b981'];
  return flow.slice(0, 4).map((item, idx) => ({
    step: String(idx + 1).padStart(2, '0'),
    label: `${idx + 1}. ${item}`,
    sub: project?.role ?? 'System Pipeline Stage',
    tag: `STAGE 0${idx + 1}`,
    color: palette[idx % palette.length],
  }));
}

export default function IsometricPipeline3D({
  project,
  variant = 'dossier',
  onInspectDossier,
}) {
  const [isExploded, setIsExploded] = useState(false);
  const [activeLayer, setActiveLayer] = useState(null);

  const layers = buildLayersForProject(project);
  const isCompact = variant === 'showcase';
  const selectedLayer = activeLayer !== null ? layers[activeLayer] : null;

  return (
    <div
      className={`iso-pipeline iso-pipeline--${variant}${isExploded ? ' is-exploded' : ''}${activeLayer !== null ? ' has-active-layer' : ''}`}
      onPointerEnter={() => setIsExploded(true)}
      onPointerLeave={() => {
        setIsExploded(false);
        setActiveLayer(null);
      }}
    >
      <div className="iso-pipeline__head">
        <div className="iso-pipeline__title-wrap">
          <span className="iso-pipeline__dot" aria-hidden="true" />
          <span className="iso-pipeline__eyebrow">
            3D Isometric Pipeline · {layers.length} Layers
          </span>
        </div>

        <div className="iso-pipeline__controls">
          <button
            type="button"
            className={`iso-pipeline__toggle${isExploded ? ' is-active' : ''}`}
            onClick={(event) => {
              event.stopPropagation();
              setIsExploded((prev) => !prev);
            }}
            aria-pressed={isExploded}
          >
            {isExploded ? 'Compact Z-Stack' : 'Explode Z-Stack'}
          </button>
          {isCompact && onInspectDossier && (
            <button
              type="button"
              className="iso-pipeline__inspect-btn"
              onClick={(event) => {
                event.stopPropagation();
                onInspectDossier(project);
              }}
            >
              Inspect ↗
            </button>
          )}
        </div>
      </div>

      <div className="iso-pipeline__viewport">
        {/* Vertical pulsing data streams connecting the stacked 3D planes */}
        <div className="iso-pipeline__streams" aria-hidden="true">
          <span className="iso-pipeline__stream iso-pipeline__stream--left" />
          <span className="iso-pipeline__stream iso-pipeline__stream--center" />
          <span className="iso-pipeline__stream iso-pipeline__stream--right" />
        </div>

        <div className="iso-pipeline__scene" role="list" aria-label={`${project?.shortTitle || 'Project'} 3D layered architecture`}>
          {layers.map((layer, index) => {
            // Top layer has highest Z index; index 0 is top of pipeline or bottom?
            // Stacking top-to-bottom visually so 1 -> 2 -> 3 -> 4 reads cleanly from top plane to bottom plane
            const reverseIdx = layers.length - 1 - index;
            const isSelected = activeLayer === index;

            return (
              <div
                key={layer.step}
                role="listitem"
                tabIndex={0}
                className={`iso-pipeline__plane${isSelected ? ' is-selected' : ''}`}
                style={{
                  '--plane-index': reverseIdx,
                  '--plane-order': index,
                  '--plane-color': layer.color,
                }}
                onPointerEnter={() => setActiveLayer(index)}
                onFocus={() => {
                  setIsExploded(true);
                  setActiveLayer(index);
                }}
                onBlur={() => setActiveLayer(null)}
                onClick={(event) => {
                  event.stopPropagation();
                  setActiveLayer((prev) => (prev === index ? null : index));
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    event.stopPropagation();
                    setActiveLayer((prev) => (prev === index ? null : index));
                  }
                }}
              >
                <div className="iso-pipeline__plane-glass">
                  <span className="iso-pipeline__plane-step">{layer.step}</span>
                  <div className="iso-pipeline__plane-body">
                    <span className="iso-pipeline__plane-label">{layer.label}</span>
                    {!isCompact && (
                      <span className="iso-pipeline__plane-sub">{layer.sub}</span>
                    )}
                  </div>
                  <span className="iso-pipeline__plane-tag">{layer.tag}</span>
                </div>
                {/* Vertical connector beam to next plane */}
                {index < layers.length - 1 && (
                  <span className="iso-pipeline__plane-beam" aria-hidden="true">
                    <i className="iso-pipeline__plane-pulse" />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="iso-pipeline__foot" aria-live="polite">
        {selectedLayer ? (
          <>
            <strong className="iso-pipeline__foot-active" style={{ color: selectedLayer.color }}>
              {selectedLayer.label}
            </strong>
            <span className="iso-pipeline__foot-sep">·</span>
            <span className="iso-pipeline__foot-sub">{selectedLayer.sub}</span>
          </>
        ) : (
          <span className="iso-pipeline__foot-hint">
            Hover or click any 3D glass plane to expand Z-spacing &amp; trace data flow
          </span>
        )}
      </div>
    </div>
  );
}
