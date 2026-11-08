import { Fragment } from 'react';

/**
 * Word-by-word masked heading reveal. Each word rises out of its own mask with
 * a short stagger, triggered by the section's existing `.is-visible` state.
 */
export default function SectionTitle({ children }) {
  const words = String(children).split(' ');

  return (
    <h2 className="section-title section-title--kinetic">
      {words.map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          <span className="kinetic-word-mask">
            <span className="kinetic-word" style={{ '--word-index': index }}>
              {word}
            </span>
          </span>
          {index < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </h2>
  );
}
