import { Fragment } from 'react';
import useSplitReveal from '../hooks/useSplitReveal';

/**
 * Word-by-word masked heading reveal powered by GSAP ScrollTrigger.
 * Each word rises out of its own overflow mask with a short stagger.
 */
export default function SectionTitle({ children }) {
  const ref = useSplitReveal({
    scroll: true,
    stagger: 0.045,
    duration: 1.05,
    start: 'top 88%',
  });
  const words = String(children).split(' ');

  return (
    <h2 className="section-title section-title--kinetic" ref={ref}>
      {words.map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          <span className="kinetic-word-mask">
            <span
              className="kinetic-word"
              style={{ '--word-index': index }}
              data-split-line
            >
              {word}
            </span>
          </span>
          {index < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </h2>
  );
}
