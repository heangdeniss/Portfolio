import denisPhoto from '../images/HEANG Denis CTC.jpg';

export default function Hero() {
  return (
    <section id="hero" className="hero">
      <div className="hero__bg" />
      <div className="container">
        <div className="hero__layout">
          <div className="hero__content">
            <p className="hero__label">Data Science Portfolio</p>
            <p className="hero__tagline">
              Turning data into insights<br />through code and curiosity
            </p>
            <div className="hero__name-block">
              <span className="hero__name-first">Heang</span>
              <span className="hero__name-last">Denis</span>
            </div>
            <p className="hero__bio">
              Data Science student at the Institute of Technology of Cambodia.
              Specializing in machine learning, probabilistic graphical models,
              and LLM/RAG pipelines. Experienced in data analytics,
              predictive modeling, and full-stack software development.
            </p>
            <div className="hero__actions">
              <a href="#projects" className="btn btn-primary">View Projects</a>
              <a href="#contact" className="btn btn-outline">Contact Me</a>
            </div>
          </div>
          <div className="hero__image-wrap">
            <img
              src={denisPhoto}
              alt="Heang Denis"
              className="hero__image"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
