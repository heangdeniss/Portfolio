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
              expected to graduate in 2027 (Engineering Degree). My core curriculum encompasses
              Data Structures & Algorithms, Machine Learning, Database Management Systems,
              Linear Algebra, Probability & Statistics, and Deep Learning.
            </p>
            <p>
              I specialize in developing end-to-end machine learning and data pipelines —
              from data preprocessing and feature engineering to statistical modeling,
              evaluation, and interactive full-stack deployment. My work spans
              credit risk forecasting, big-data tabular analytics, probabilistic graphical
              models (HMMs), and intelligent RAG-powered chatbot systems.
            </p>
            <p>
              I communicate in Khmer (Native), English (Professional Working / B2), and French (Elementary / A2).
              I am always eager to master new technologies, tackle complex data challenges,
              and build impactful software.
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
