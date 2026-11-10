/**
 * Game-like dashboard chrome around the Hero: bioluminescent nebula wash,
 * fine grid lines, HUD corner brackets, a scrolling telemetry code stream on
 * the left edge, an animated signal waveform on the right edge and bottom
 * coordinate readouts. Everything is CSS-animated with transform/opacity only
 * and is purely decorative (aria-hidden).
 */

const TELEMETRY = [
  'viterbi[t=42] → NOUN  p=0.981',
  'λ_laplace = 1.0e-02',
  'auc_roc  = 0.962',
  'loss[ep=128] = 0.0841',
  'retriever.top_k = 8',
  'chroma.cosine ≥ 0.78',
  'catboost.depth = 6',
  'P(default | x) = 0.137',
  'grade → B  (basel)',
  'tokens  = 232,113',
  'duckdb.parquet  ✓',
  'GET /api/predict 200 11ms',
  'π₀ · A · B → argmax',
  'xgb.n_estimators = 600',
  'whisper.asr → ok',
  'llama-3.2 ctx 8192',
];

const WAVE_BARS = 26;

export default function HeroHud() {
  return (
    <div className="hero-hud" aria-hidden="true">
      <div className="hero-hud__nebula" />
      <div className="hero-hud__grid" />
      <div className="hero-hud__scanline" />

      <span className="hero-hud__corner hero-hud__corner--tl" />
      <span className="hero-hud__corner hero-hud__corner--tr" />
      <span className="hero-hud__corner hero-hud__corner--bl" />
      <span className="hero-hud__corner hero-hud__corner--br" />

      <div className="hero-hud__stream">
        <span className="hero-hud__stream-title">SYS.TELEMETRY</span>
        <div className="hero-hud__stream-window">
          <ul className="hero-hud__stream-list">
            {[...TELEMETRY, ...TELEMETRY].map((line, index) => (
              <li key={index}>
                <span className="hero-hud__stream-addr">
                  0x{(0x3f20 + index * 16).toString(16).toUpperCase()}
                </span>
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="hero-hud__wave">
        <span className="hero-hud__wave-title">SIGNAL</span>
        <div className="hero-hud__wave-bars">
          {Array.from({ length: WAVE_BARS }, (_, index) => (
            <span key={index} style={{ '--i': index }} />
          ))}
        </div>
        <span className="hero-hud__wave-db">-12.4 dB</span>
      </div>

      <div className="hero-hud__readout hero-hud__readout--left">
        <span className="hero-hud__dot" />
        LAT 11.5564°N · LON 104.9282°E
      </div>
      <div className="hero-hud__readout hero-hud__readout--right">
        BUILD 2026.11 · ALL SYSTEMS NOMINAL
        <span className="hero-hud__dot hero-hud__dot--green" />
      </div>
    </div>
  );
}
