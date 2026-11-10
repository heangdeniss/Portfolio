import useVelocityMarquee from '../hooks/useVelocityMarquee';
import { motion } from '../data/motion';

const SEPARATOR = '\u2726';

function RibbonGroup({ words }) {
  return (
    <div className="ribbon__group">
      {words.map((word, index) => (
        <span className="ribbon__word" key={`${word}-${index}`}>
          {word}
          <span className="ribbon__spark" aria-hidden="true">
            {SEPARATOR}
          </span>
        </span>
      ))}
    </div>
  );
}

/**
 * Oversized diagonal type band used as an act break between sections.
 * Two counter-scrolling rows driven by scroll velocity.
 */
export default function TypeRibbon({ top = [], bottom = [] }) {
  const topTrackRef = useVelocityMarquee({
    baseSpeed: Math.max(18, motion.marqueeSpeed * 0.88),
    factor: 620,
    direction: -1,
  });
  const bottomTrackRef = useVelocityMarquee({
    baseSpeed: Math.max(14, motion.marqueeSpeed * 0.72),
    factor: 540,
    direction: 1,
  });

  return (
    <div className="ribbon" aria-hidden="true">
      <div className="ribbon__band">
        <div className="ribbon__row ribbon__row--solid">
          <div className="ribbon__track" ref={topTrackRef}>
            <RibbonGroup words={top} />
            <RibbonGroup words={top} />
          </div>
        </div>
        <div className="ribbon__row ribbon__row--outline">
          <div className="ribbon__track ribbon__track--reverse" ref={bottomTrackRef}>
            <RibbonGroup words={bottom} />
            <RibbonGroup words={bottom} />
          </div>
        </div>
      </div>
    </div>
  );
}
