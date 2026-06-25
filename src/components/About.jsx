import useReveal from '../hooks/useReveal';

export default function About() {
  const [ref, visible] = useReveal();

  return (
    <section id="about" className="section">
      <div className="container" ref={ref}>
        <div className="about__layout">
          <div className={`about__left reveal reveal-left${visible ? ' visible' : ''}`}>
            <p className="section-label">About Me</p>
            <h2 className="section-title">
              Hello,<br />I'm Denis!
            </h2>
          </div>
          <div className={`about__right reveal reveal-right${visible ? ' visible' : ''}`}>
            <p>
              I'm a Data Science student at the Institute of Technology of Cambodia,
              expected to graduate in 2027. My coursework covers Data Structures,
              Algorithms, Database Systems, Machine Learning, Linear Algebra,
              and Probability & Statistics.
            </p>
            <p>
              I specialize in building end-to-end machine learning pipelines —
              from data cleaning and feature engineering to model training,
              deployment, and building interactive interfaces. My projects span
              credit risk analysis, and AI chatbots with RAG pipelines.
            </p>
            <p>
              I speak Khmer (native), English (B2), and French (A2).
              I'm always eager to learn new technologies and take on
              challenging problems.
            </p>
            <a href="mailto:heangdenis011468@gmail.com" className="btn btn-primary" style={{ marginTop: 16 }}>
              Let's Talk
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
