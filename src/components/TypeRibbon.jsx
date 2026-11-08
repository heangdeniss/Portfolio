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
 * Two counter-scrolling rows, solid gradient over outlined type.
 */
export default function TypeRibbon({ top = [], bottom = [] }) {
  return (
    <div className="ribbon" aria-hidden="true">
      <div className="ribbon__band">
        <div className="ribbon__row ribbon__row--solid">
          <div className="ribbon__track">
            <RibbonGroup words={top} />
            <RibbonGroup words={top} />
          </div>
        </div>
        <div className="ribbon__row ribbon__row--outline">
          <div className="ribbon__track ribbon__track--reverse">
            <RibbonGroup words={bottom} />
            <RibbonGroup words={bottom} />
          </div>
        </div>
      </div>
    </div>
  );
}
