/**
 * Lightweight 60fps SVG mathematical micro-visualizations for the
 * "What I Specialize In" engineering focus card in the About section:
 *   0 -> Predictive Modeling: Animated ROC / Probability Density curve pulse
 *   1 -> Statistical Computing: 3-step Markov / Viterbi state-transition trellis
 *   2 -> Modern Full-Stack: Client-to-API latency packet wave
 *
 * Animations are pure CSS/SVG transforms & opacities gated by the parent
 * section's `.is-visible` IntersectionObserver state so they pause offscreen.
 */
export default function SpecialtyMicroVisual({ index = 0 }) {
  if (index === 0) {
    return (
      <div className="specialty-viz specialty-viz--roc" aria-hidden="true">
        <div className="specialty-viz__head">
          <span className="specialty-viz__tag">ROC / PDF</span>
          <span className="specialty-viz__metric">AUC 0.96</span>
        </div>
        <svg
          className="specialty-viz__svg"
          viewBox="0 0 96 42"
          fill="none"
          focusable="false"
        >
          <defs>
            <linearGradient id="rocAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.34" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="pdfBellGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.15" />
            </linearGradient>
          </defs>

          {/* Subtle axes & diagonal baseline */}
          <line x1="6" y1="36" x2="90" y2="36" className="specialty-viz__axis" />
          <line x1="6" y1="6" x2="6" y2="36" className="specialty-viz__axis" />
          <line
            x1="6"
            y1="36"
            x2="90"
            y2="6"
            className="specialty-viz__baseline"
            strokeDasharray="2.5 2.5"
          />

          {/* Secondary Gaussian probability density bell wave */}
          <path
            d="M6 36 C 20 36, 26 16, 38 16 C 50 16, 56 36, 90 36"
            stroke="url(#pdfBellGrad)"
            strokeWidth="1.25"
            className="specialty-viz__pdf-curve"
          />

          {/* Area under ROC curve */}
          <path
            d="M6 36 C 12 11, 34 7, 90 6 L 90 36 Z"
            fill="url(#rocAreaGrad)"
            className="specialty-viz__roc-area"
          />

          {/* Primary ROC curve with animated pulse */}
          <path
            d="M6 36 C 12 11, 34 7, 90 6"
            className="specialty-viz__roc-curve"
          />

          {/* Scanning threshold marker */}
          <g className="specialty-viz__roc-scanner">
            <line x1="28" y1="7" x2="28" y2="36" className="specialty-viz__scan-line" />
            <circle cx="28" cy="12.5" r="3" className="specialty-viz__node-core" />
            <circle cx="28" cy="12.5" r="6" className="specialty-viz__node-halo" />
          </g>
        </svg>
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="specialty-viz specialty-viz--viterbi" aria-hidden="true">
        <div className="specialty-viz__head">
          <span className="specialty-viz__tag">VITERBI</span>
          <span className="specialty-viz__metric">argmax P(Y|X)</span>
        </div>
        <svg
          className="specialty-viz__svg"
          viewBox="0 0 96 42"
          fill="none"
          focusable="false"
        >
          {/* Background Markov lattice edges (3 steps x 2 states) */}
          <g className="specialty-viz__lattice">
            <line x1="16" y1="12" x2="48" y2="12" />
            <line x1="16" y1="12" x2="48" y2="31" />
            <line x1="16" y1="31" x2="48" y2="12" />
            <line x1="16" y1="31" x2="48" y2="31" />
            <line x1="48" y1="12" x2="80" y2="12" />
            <line x1="48" y1="12" x2="80" y2="31" />
            <line x1="48" y1="31" x2="80" y2="12" />
            <line x1="48" y1="31" x2="80" y2="31" />
          </g>

          {/* Optimal Viterbi path: (t1, s1) -> (t2, s2) -> (t3, s1) */}
          <path
            d="M16 12 L48 31 L80 12"
            className="specialty-viz__viterbi-path"
          />

          {/* Non-optimal state nodes */}
          <circle cx="16" cy="31" r="2.6" className="specialty-viz__state-idle" />
          <circle cx="48" cy="12" r="2.6" className="specialty-viz__state-idle" />
          <circle cx="80" cy="31" r="2.6" className="specialty-viz__state-idle" />

          {/* Optimal path firing nodes */}
          <g className="specialty-viz__viterbi-node specialty-viz__viterbi-node--1">
            <circle cx="16" cy="12" r="6" className="specialty-viz__viterbi-ping" />
            <circle cx="16" cy="12" r="3.2" className="specialty-viz__viterbi-core" />
          </g>
          <g className="specialty-viz__viterbi-node specialty-viz__viterbi-node--2">
            <circle cx="48" cy="31" r="6" className="specialty-viz__viterbi-ping" />
            <circle cx="48" cy="31" r="3.2" className="specialty-viz__viterbi-core" />
          </g>
          <g className="specialty-viz__viterbi-node specialty-viz__viterbi-node--3">
            <circle cx="80" cy="12" r="6" className="specialty-viz__viterbi-ping" />
            <circle cx="80" cy="12" r="3.2" className="specialty-viz__viterbi-core" />
          </g>
        </svg>
      </div>
    );
  }

  return (
    <div className="specialty-viz specialty-viz--latency" aria-hidden="true">
      <div className="specialty-viz__head">
        <span className="specialty-viz__tag">CLIENT ⇄ API</span>
        <span className="specialty-viz__metric">~12ms RTT</span>
      </div>
      <svg
        className="specialty-viz__svg"
        viewBox="0 0 96 42"
        fill="none"
        focusable="false"
      >
        {/* Carrier wave channels */}
        <path
          d="M14 21 Q 31 10, 48 21 T 82 21"
          className="specialty-viz__wave specialty-viz__wave--req"
        />
        <path
          d="M14 21 Q 31 32, 48 21 T 82 21"
          className="specialty-viz__wave specialty-viz__wave--res"
        />

        {/* Direct baseline spine */}
        <line x1="14" y1="21" x2="82" y2="21" className="specialty-viz__spine" />

        {/* Travelling latency packets (GPU-composited translate3d) */}
        <circle cx="14" cy="21" r="2.8" className="specialty-viz__packet specialty-viz__packet--out" />
        <circle cx="82" cy="21" r="2.5" className="specialty-viz__packet specialty-viz__packet--back" />

        {/* Endpoint nodes: Client UI, FastAPI, Vector/SQL */}
        <g className="specialty-viz__endpoint">
          <rect x="8" y="15" width="12" height="12" rx="3.5" className="specialty-viz__box specialty-viz__box--cyan" />
          <circle cx="14" cy="21" r="2" fill="#38bdf8" />
        </g>
        <g className="specialty-viz__endpoint">
          <rect x="42" y="14" width="12" height="14" rx="3.5" className="specialty-viz__box specialty-viz__box--amber" />
          <circle cx="48" cy="21" r="2.2" fill="#fbbf24" />
        </g>
        <g className="specialty-viz__endpoint">
          <rect x="76" y="15" width="12" height="12" rx="3.5" className="specialty-viz__box specialty-viz__box--emerald" />
          <circle cx="82" cy="21" r="2" fill="#10b981" />
        </g>
      </svg>
    </div>
  );
}
