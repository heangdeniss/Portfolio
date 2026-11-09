import useVelocityMarquee from '../hooks/useVelocityMarquee';

const ITEMS = [
  { label: 'Machine Learning', color: '#8b5cf6' },
  { label: 'RAG Architectures', color: '#06b6d4' },
  { label: '96.05% Model Accuracy', color: '#10b981' },
  { label: 'Data Engineering', color: '#6366f1' },
  { label: '232k+ Tokens Modeled', color: '#f59e0b' },
  { label: 'Full-Stack Systems', color: '#ec4899' },
  { label: '30k+ Records Analyzed', color: '#f59e0b' },
  { label: 'Statistical Inference', color: '#38bdf8' },
];

function MarqueeGroup() {
  return (
    <div className="marquee__group">
      {ITEMS.map((item) => (
        <span className="marquee__item" key={item.label}>
          <span className="marquee__spark" style={{ '--spark-color': item.color }} aria-hidden="true">
            &#10022;
          </span>
          {item.label}
        </span>
      ))}
    </div>
  );
}

export default function Marquee() {
  const trackRef = useVelocityMarquee({ baseSpeed: 52, factor: 760, direction: -1 });

  return (
    <div className="marquee" data-cursor="Drag">
      <p className="sr-only">
        Core focus areas: machine learning, RAG architectures, data engineering, full-stack systems,
        statistical inference, and predictive analytics.
      </p>
      <div className="marquee__track" aria-hidden="true" ref={trackRef}>
        <MarqueeGroup />
        <MarqueeGroup />
      </div>
    </div>
  );
}
