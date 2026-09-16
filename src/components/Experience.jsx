import useReveal from '../hooks/useReveal';

const experience = [
  {
    type: 'Education',
    items: [
      {
        title: 'Engineering Degree in Data Science',
        institution: 'Institute of Technology of Cambodia',
        year: 'Expected graduate 2027',
        note: '',
        desc: 'Relevant Coursework: Data Structures, Algorithms, Database Systems, Machine Learning, Linear Algebra, Probability & Statistics.',
      },
      {
        title: 'English Language Program',
        institution: 'SPRING Education (Cambodia)',
        year: 'September 2026 – Present',
        note: '',
        desc: 'Enrolled in English language training to strengthen professional communication, technical writing, and presentation skills.',
      },
      {
        title: 'Full Stack Development Bootcamp',
        institution: 'Udemy',
        year: '2025',
        note: '',
        desc: 'Completed comprehensive full-stack development bootcamp covering frontend and backend technologies.',
      },
      {
        title: 'Data Visualization Hackathon',
        institution: 'Above and Beyond School',
        year: '2025',
        note: '',
        desc: 'Performed Data cleaning, Preprocessing and data visualization using Python.',
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
        desc: 'Conducted end-to-end data cleaning on both structured and unstructured survey data from teachers and students across Community Tech Centers (CTCs) using Python and RegEx. Built an interactive bilingual web analytics platform and Power BI reports to visualize key metrics and support leadership decision-making. Additionally, performed data entry in Excel, recording and compiling 2026 Bac II national exam results specifically for students from CTC high schools.',
        url: 'https://ctc-teacher-student-analyst-web.vercel.app/',
        linkText: 'View Live Web Platform',
      },
      {
        title: 'Project Showcase — AI Educational Chatbot',
        institution: 'Scientific Day Phnom Penh',
        year: '7 July 2025',
        note: 'Python, Node.js, Express.js, Flask, PostgreSQL, LangChain, ChromaDB',
        desc: 'Built an AI chatbot platform using Node.js, Express.js, Flask, and PostgreSQL for querying curriculum content. Implemented a RAG pipeline with LangChain and ChromaDB for Khmer literature retrieval. Designed PostgreSQL database with schemas, triggers, and functions for chat history and user session management. Team lead of 4 members.',
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
