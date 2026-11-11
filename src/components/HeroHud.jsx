/**
 * Game-like dashboard chrome around the Hero: bioluminescent nebula wash,
 * fine grid lines, HUD corner brackets, an animated signal waveform on the
 * right edge and bottom coordinate readouts. Everything is CSS-animated with
 * transform/opacity only and is purely decorative (aria-hidden).
 */

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
