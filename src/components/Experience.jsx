import useReveal from '../hooks/useReveal';

const experience = [
  {
    type: 'Education',
    items: [
      {
        title: 'Engineering Degree in Data Science',
        institution: 'Institute of Technology of Cambodia',
        year: 'Expected Graduation: 2027',
        note: '',
        desc: 'Core Coursework: Data Structures & Algorithms, Machine Learning, Database Management Systems, Linear Algebra, Probability & Statistics, and Deep Learning.',
      },
      {
        title: 'English Language Program',
        institution: 'Australian Centre for Education (ACE)',
        year: 'September 2026 – Present',
        note: '',
        desc: 'Advanced English language coursework focusing on technical documentation, professional communication, academic research, and executive presentations.',
      },
      {
        title: 'Full Stack Development Bootcamp',
        institution: 'Udemy',
        year: '2025',
        note: '',
        desc: 'Comprehensive training in full-stack software development, RESTful API architecture, modern frontend frameworks, and relational database management.',
      },
      {
        title: 'Data Visualization Hackathon',
        institution: 'Above and Beyond School',
        year: '2025',
        note: '',
        desc: 'Executed end-to-end data cleaning, preprocessing, exploratory data analysis (EDA), and data visualization using Python under competitive hackathon timelines.',
      },
    ],
  },
  {
    type: 'Experience',
    items: [
      {
        title: 'Data Analyst & Web Developer Intern',
        institution: 'Ministry of Post and Telecommunications (MPTC)',
        year: 'July – October 2026',
        note: 'Python, Pandas, RegEx, React, Recharts, Power BI, Excel',
        desc: 'Conducted end-to-end data cleaning and transformation on structured and unstructured survey data from Community Tech Centers (CTCs) using Python and RegEx. Developed an interactive bilingual web analytics platform (React, Recharts) and Power BI dashboards to track key performance indicators for leadership review. Compiled and audited 2026 Bac II national exam results for CTC students.',
        url: 'https://ctc-teacher-student-analyst-web.vercel.app/',
        linkText: 'View Live Web Platform',
      },
      {
        title: 'Project Showcase — AI Educational Chatbot',
        institution: 'Scientific Day Phnom Penh',
        year: '7 July 2025',
        note: 'Python, Node.js, Express.js, Flask, PostgreSQL, LangChain, ChromaDB',
        desc: 'Served as Team Lead for a 4-member engineering team. Architected an AI-driven educational platform integrating Node.js, Express.js, Flask, and PostgreSQL. Engineered a semantic Retrieval-Augmented Generation (RAG) pipeline utilizing LangChain and ChromaDB for Khmer curriculum querying, backed by optimized relational schemas with triggers and stored procedures.',
        url: 'https://github.com/heangdeniss/AiEducationChatbot',
        linkText: 'View Project Repository',
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
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="exp__link"
                      >
                        {item.linkText || 'View Website'}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M7 17L17 7" />
                          <path d="M7 7h10v10" />
                        </svg>
                      </a>
                    )}
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
