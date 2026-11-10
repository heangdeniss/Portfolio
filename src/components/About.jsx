import useReveal from '../hooks/useReveal';
import useSplitReveal from '../hooks/useSplitReveal';
import MagneticButton from './MagneticButton';
import { site } from '../data/site';

export default function About() {
  const [ref, visible] = useReveal();
  const headlineRef = useSplitReveal({
    scroll: true,
    stagger: 0.08,
    duration: 1.15,
    start: 'top 82%',
  });

  return (
    <section id="about" className="section" data-ghost="ABOUT">
      <div className={`container${visible ? ' is-visible' : ''}`} ref={ref}>

        <div className={`about__layout stagger${visible ? ' visible' : ''}`}>

          {/* Left Column: Personal Narrative & Philosophy */}
          <div className="about__intro-card">
            <div>
              <p className="section-label">About Me</p>
              <h2 className="about__headline" ref={headlineRef}>
                {site.aboutHeadline.map((line, index) => (
                  <span className="about__headline-line" key={index}>
                    <span data-split-line>{line}</span>
                  </span>
                ))}
              </h2>

              {site.aboutParagraphs.map((paragraph, index) => (
                <div
                  className="about__text"
                  key={index}
                  dangerouslySetInnerHTML={{ __html: paragraph }}
                />
              ))}
            </div>

            <div>
              <div className="about__meta-chips">
                <span className="about__meta-chip">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {site.location}
                </span>
                <span className="about__meta-chip">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                  {site.educationChip}
                </span>
              </div>

              <div className="about__cta-row">
                <MagneticButton
                  href={site.mailto}
                  className="btn btn-primary"
                  strength={0.22}
                  data-cursor="Email"
                >
                  <span>Start a Conversation</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <path d="M7 17L17 7M7 7h10v10" />
                  </svg>
                </MagneticButton>
              </div>
            </div>
          </div>

          {/* Right Column: Focus Cards */}
          <div className="about__cards-column">

            {/* Card 1: Academic Background */}
            <div className="about__card">
              <div className="about__card-header">
                <div className="about__card-icon about__card-icon--indigo">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                </div>
                <span className="about__card-tag">Academic Foundation</span>
              </div>
              <h3 className="about__card-title">{site.degree.title}</h3>
              <p className="about__card-institution">
                {site.degree.institution}
                <span className="about__card-year"> • {site.degree.year}</span>
              </p>
              <p className="about__card-text">{site.degree.description}</p>
            </div>

            {/* Card 2: Technical Focus */}
            <div className="about__card">
              <div className="about__card-header">
                <div className="about__card-icon about__card-icon--amber">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                </div>
                <span className="about__card-tag">Engineering Focus</span>
              </div>
              <h3 className="about__card-title">What I Specialize In</h3>
              <div className="about__interests-list">
                {site.focus.map((item, index) => (
                  <div className="about__interest-item" key={index}>
                    <span className="about__interest-dot" />
                    <span dangerouslySetInnerHTML={{ __html: item }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3: Languages & Communication */}
            <div className="about__card">
              <div className="about__card-header">
                <div className="about__card-icon about__card-icon--cyan">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </div>
                <span className="about__card-tag">Languages &amp; Communication</span>
              </div>
              <div className="about__lang-pills">
                {site.languages.map((language) => (
                  <div className="about__lang-pill" key={language.name}>
                    <span className="about__lang-pill-name">{language.name}</span>
                    <span className="about__lang-pill-level">{language.level}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
