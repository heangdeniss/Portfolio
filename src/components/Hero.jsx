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
              Data Science student at Institute of Technology of Cambodia.
              Passionate about machine learning, AI, and building data-driven
              solutions. Experienced in Python, SQL, Scikit-learn, and full-stack
              development.
            </p>
            <div className="hero__actions">
              <a href="#projects" className="btn btn-primary">View Projects</a>
              <a href="#contact" className="btn btn-outline">Contact Me</a>
            </div>
          </div>
          <div className="hero__image-wrap">
            <img
              src="src/images/Denis Picture.jpg"
              alt="Heang Denis"
              className="hero__image"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
