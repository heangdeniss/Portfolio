import mptcLogo from '../images/mptc-logo-opt.png';
import scientificLogo from '../images/scientific-logo-opt.png';
import itcLogo from '../images/itc-logo-opt.png';
import aceLogo from '../images/ACE-logo-opt.png';
import udemyLogo from '../images/udemy-logo-opt.png';
import anbLogo from '../images/anb-logo-opt.png';
import mptcCert from '../certificate/2-Mr. Heang Denis.pdf';
import scientificCert from '../certificate/Heang Denis Scientific day Certificate.pdf';
import anbCert from '../certificate/Certificate of Completion_Heang DENIS_ANBPTMD12024014.pdf';
import udemyCert from '../certificate/Udemy Heang Denis Certificate.pdf';
import { notesIn, plainText, resolveAsset } from '../lib/vault';

/**
 * Fallback timeline data. The live source of truth is /denis_portfolio/timeline.
 */
const baseTimeline = [
  {
    type: 'Experience',
    title: 'Data Analyst & Web Developer Intern',
    institution: 'Ministry of Post and Telecommunications (MPTC)',
    logo: mptcLogo,
    logoBg: 'rgba(255, 255, 255, 0.05)',
    year: 'July – October 2026',
    metrics: '3,700 Students & 369 Teachers Surveyed • Bac II 2026 Data Entry',
    tech: 'Python, Pandas, RegEx, React, Recharts, Power BI, Excel, Google Forms',
    desc: 'Conducted end-to-end data cleaning and transformation on Google Forms survey data collected from 369 teachers and 3,700 students across Community Tech Centers (CTCs) using Python and RegEx. Developed an interactive bilingual web analytics platform (React, Recharts) and Power BI dashboards to track key performance indicators for leadership review. Additionally performed data entry to compile, audit, and organize all 2026 Bac II national examination results for students under Community Tech Centers (CTCs).',
    url: 'https://ctc-teacher-student-analyst-web.vercel.app/',
    linkText: 'Explore Live Analytics Platform',
    certUrl: mptcCert,
    certLabel: 'View MPTC Certificate',
  },
  {
    type: 'Experience',
    title: 'Project Showcase — AI Educational Chatbot',
    institution: 'Scientific Day Phnom Penh',
    logo: scientificLogo,
    logoBg: '#ffffff',
    year: '5–6 June 2025',
    metrics: '4-Person Team Led • RAG Retrieval Architecture',
    tech: 'Python, Node.js, Express.js, Flask, PostgreSQL, LangChain, ChromaDB',
    desc: 'Served as Team Lead for a 4-member engineering team. Architected an AI-driven educational platform integrating Node.js, Express.js, Flask, and PostgreSQL. Engineered a semantic Retrieval-Augmented Generation (RAG) pipeline utilizing LangChain and ChromaDB for Khmer curriculum querying, backed by optimized relational schemas with triggers and stored procedures.',
    url: 'https://github.com/heangdeniss/AiEducationChatbot',
    linkText: 'View Project Repository',
    certUrl: scientificCert,
    certLabel: 'View Certificate',
  },
  {
    type: 'Education',
    title: 'Engineering Degree in Data Science',
    institution: 'Institute of Technology of Cambodia (ITC)',
    logo: itcLogo,
    logoBg: '#ffffff',
    year: 'Expected Graduation: 2027',
    metrics: '5-Year Engineering Track • Data Structures & AI Specialization',
    tech: 'Algorithms, ML, PGM, Probability & Statistics, Linear Algebra',
    desc: 'Rigorous engineering coursework: Data Structures & Algorithms, Advanced Machine Learning, Database Management Systems, Linear Algebra, Probability & Statistics, and Deep Learning.',
    url: null,
  },
  {
    type: 'Education',
    title: 'Advanced English Language Program',
    institution: 'Australian Centre for Education (ACE)',
    logo: aceLogo,
    logoBg: '#ffffff',
    year: 'September 2026 – Present',
    metrics: 'Professional Working Proficiency (B2+)',
    tech: 'Academic Writing, Technical Documentation, Executive Presentation',
    desc: 'Advanced English language coursework focusing on technical documentation, professional communication, academic research, and stakeholder presentations.',
    url: null,
  },
  {
    type: 'Education',
    title: 'Full Stack Web Development Bootcamp',
    institution: 'Udemy',
    logo: udemyLogo,
    logoBg: '#ffffff',
    year: '2025',
    metrics: 'Full-Stack Architecture & API Design',
    tech: 'React, Node.js, REST APIs, PostgreSQL, Modern Web Systems',
    desc: 'Comprehensive training in full-stack software development, RESTful API architecture, modern frontend frameworks, and relational database management.',
    url: null,
    certUrl: udemyCert,
    certLabel: 'View Udemy Certificate',
  },
  {
    type: 'Education',
    title: 'Data Visualization Hackathon',
    institution: 'Above and Beyond School',
    logo: anbLogo,
    logoBg: '#ffffff',
    year: '2025',
    metrics: 'Competitive EDA & Visual Analytics Under Tight Deadlines',
    tech: 'Python, Matplotlib, Seaborn, Feature Engineering',
    desc: 'Executed end-to-end data cleaning, preprocessing, exploratory data analysis (EDA), and data visualization using Python under competitive hackathon timelines.',
    url: null,
    certUrl: anbCert,
    certLabel: 'View Certificate of Completion',
  },
];

const baseByTitle = new Map(baseTimeline.map((item) => [item.title, item]));

function timelineFromNote(note) {
  const base =
    baseByTitle.get(note.data.title) ||
    baseTimeline[Number(note.data.order) - 1] ||
    {};
  const cert = resolveAsset(note.data.cert || note.data.certUrl);

  return {
    ...base,
    ...note.data,
    type: note.data.type || base.type || 'Experience',
    title: note.data.title || base.title || note.title,
    institution: note.data.institution || base.institution || '',
    logo: resolveAsset(note.data.logo) || base.logo || null,
    logoBg: note.data.logoBg || base.logoBg || 'rgba(255, 255, 255, 0.05)',
    year: note.data.year || base.year || '',
    metrics: note.data.metrics || base.metrics || '',
    tech: note.data.tech || base.tech || '',
    desc: plainText(note.body) || base.desc || '',
    url: note.data.url || base.url || null,
    linkText: note.data.linkText || base.linkText || '',
    certUrl: cert || base.certUrl || null,
    certLabel: note.data.certLabel || base.certLabel || '',
  };
}

const vaultTimeline = notesIn('timeline');

export const timelineData = vaultTimeline.length
  ? vaultTimeline.map(timelineFromNote)
  : baseTimeline;
