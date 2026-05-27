import useReveal from '../hooks/useReveal';

const experience = [
  {
    type: 'Education',
    items: [
      {
        title: 'Data Science',
        institution: 'Institute of Technology of Cambodia',
        year: 'Expected graduate 2027',
        note: '',
        desc: 'Relevant Coursework: Data Structures, Algorithms, Database Systems, Machine Learning, Linear Algebra, Probability & Statistics.',
      },
      {
        title: 'Full Stack Development Bootcamp',
        institution: 'Udemy',
        year: '2025',
        note: '',
        desc: 'Completed comprehensive full-stack development bootcamp covering frontend and backend technologies.',
      },
    ],
  },
  {
    type: 'Experience',
    items: [
      {
        title: 'Project Showcase — Rain Prediction',
        institution: 'Scientific Day Phnom Penh',
        year: 'July 2025',
        note: 'Python, Scikit-learn, Django',
        desc: 'Developed a rain prediction model using Scikit-learn based on historical weather data in Cambodia. Performed data cleaning and preprocessing using Pandas. Visualized weather patterns with Matplotlib. Built a Django web interface for user input and predictions.',
      },
    ],
  },
];

export default function Experience() {
  const [ref, visible] = useReveal();

  return (
    <section id="background" className="section">
      <div className="container" ref={ref}>
        <div className={`reveal reveal-up${visible ? ' visible' : ''}`}>
          <p className="section-label">Background</p>
          <h2 className="section-title">Education & Experience</h2>
          <p className="section-subtitle">My journey so far</p>
        </div>

        <div className={`exp__grid${visible ? ' visible' : ''}`}>
          {experience.map((group) => (
            <div key={group.type} className="exp__column reveal reveal-up">
              <h3 className="exp__type">{group.type}</h3>
              <div className="exp__timeline">
                {group.items.map((item, i) => (
                  <div key={i} className="exp__card">
                    <span className="exp__year">{item.year}</span>
                    <h4 className="exp__title">{item.title}</h4>
                    <p className="exp__inst">{item.institution}</p>
                    {item.note && <span className="exp__note">{item.note}</span>}
                    <p className="exp__desc">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
