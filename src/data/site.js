import {
  extractListItems,
  getSections,
  noteByPath,
  parsePairs,
  parseSignals,
  plainText,
  renderInline,
  renderMarkdown,
} from '../lib/vault';

const DEFAULT_PROFILE = {
  name: 'Heang Denis',
  firstName: 'Heang',
  lastName: 'Denis',
  location: 'Phnom Penh, Cambodia',
  email: 'heangdenis011468@gmail.com',
  availability: 'Available for Projects & Full-Time Roles',
  roles: [
    'Data Science Engineer',
    'Data Analyst',
    'ML & RAG Developer',
    'Full-Stack Developer',
  ],
  specializations: [
    'Predictive Modeling',
    'RAG Architectures',
    'Probabilistic Models (HMM)',
    'FastAPI & React',
  ],
  taglineLines: ['Bridging *mathematical rigor*', 'with full-stack execution.'],
  aboutHeadline: ['Driven by Mathematics,', 'Crafted in Code.'],
  bio:
    'Data Science student at the **Institute of Technology of Cambodia** (Expected Graduation: 2027). Focused on engineering end-to-end machine learning pipelines, probabilistic computing, and high-performance web systems.',
  about: [
    "Data Science Engineering student at ITC ('27) combining statistical rigor with scalable software engineering to solve complex real-world problems. Focused on ML pipelines, probabilistic modeling, and full-stack architectures grounded in mathematical precision.",
  ],
  focus: [
    '**Predictive Modeling:** Credit risk scoring, Basel-aligned models, and gradient-boosted ensembles.',
    '**Statistical Computing:** Custom Hidden Markov Models (HMM) & log-space Viterbi algorithms built from first principles.',
    '**Modern Full-Stack:** FastAPI backends integrated with modern React interfaces.',
  ],
  signals: [
    { value: 96.05, suffix: '%', decimals: 2, label: 'HMM POS accuracy' },
    { value: 232, suffix: 'k+', decimals: 0, label: 'Tokens processed' },
    { value: 30, suffix: 'k+', decimals: 0, label: 'Records modeled' },
  ],
  degree: {
    title: 'Engineering Degree in Data Science',
    institution: 'Institute of Technology of Cambodia (ITC)',
    year: 'Expected Graduation: 2027',
    description:
      'Core coursework: DSA, Machine Learning, Database Systems, Linear Algebra, & Applied Statistics.',
  },
  languages: [
    { name: 'Khmer', level: 'Native' },
    { name: 'English', level: 'Professional (B2+) • ACE' },
    { name: 'French', level: 'Elementary (A2)' },
  ],
  socials: {
    github: 'https://github.com/heangdeniss',
    linkedin: 'https://www.linkedin.com/in/heang-denis-1a4b23369/',
    telegram: 'https://t.me/heang_deniss',
    telegramHandle: '@heang_deniss',
  },
  footerTagline:
    'Data Science student & Full-Stack Developer at the Institute of Technology of Cambodia. Engineering intelligent, robust, and impactful AI software.',
  educationChip: 'ITC • Expected Graduation: 2027',
};

const asString = (value, fallback) =>
  typeof value === 'string' && value.trim() ? value.trim() : fallback;

const asArray = (value, fallback) =>
  Array.isArray(value) && value.length
    ? value.map((item) => String(item).trim()).filter(Boolean)
    : fallback;

const asObject = (value) =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {};

const profileNote = noteByPath('profile.md');
const data = profileNote?.data ?? {};
const sections = profileNote ? getSections(profileNote.body) : {};

const name = asString(data.name, DEFAULT_PROFILE.name);
const nameParts = name.split(/\s+/);
const firstName = asString(data.firstName, nameParts[0] ?? DEFAULT_PROFILE.firstName);
const lastName = asString(
  data.lastName,
  nameParts.slice(1).join(' ') || DEFAULT_PROFILE.lastName,
);

const aboutSection = sections.about || '';
const aboutParagraphs = aboutSection
  ? aboutSection
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
      .map(renderMarkdown)
  : DEFAULT_PROFILE.about.map(renderMarkdown);

const focusSection = sections.focus || '';
const focusItems = extractListItems(focusSection);
const focus = (focusItems.length ? focusItems : DEFAULT_PROFILE.focus).map(renderInline);

const bio = sections.bio ? renderMarkdown(sections.bio) : renderMarkdown(DEFAULT_PROFILE.bio);
const footerSection = sections.footer || '';

const degree = { ...DEFAULT_PROFILE.degree, ...asObject(data.degree) };
const socials = { ...DEFAULT_PROFILE.socials, ...asObject(data.socials) };

const taglineLines = asArray(data.taglineLines, DEFAULT_PROFILE.taglineLines).map(renderInline);
const specializations = asArray(
  data.specializations,
  DEFAULT_PROFILE.specializations,
).map((label, index) => ({
  label,
  tone: ['amber', 'cyan', 'emerald', 'purple', 'blue', 'teal'][index % 6],
}));

export const site = {
  name,
  firstName,
  lastName,
  location: asString(data.location, DEFAULT_PROFILE.location),
  email: asString(data.email, DEFAULT_PROFILE.email),
  availability: asString(data.availability, DEFAULT_PROFILE.availability),
  roles: asArray(data.roles, DEFAULT_PROFILE.roles),
  specializations,
  taglineLines,
  bio,
  aboutHeadline: asArray(data.aboutHeadline, DEFAULT_PROFILE.aboutHeadline),
  aboutParagraphs,
  focus,
  signals: parseSignals(data.signals, DEFAULT_PROFILE.signals),
  degree: {
    title: asString(degree.title, DEFAULT_PROFILE.degree.title),
    institution: asString(degree.institution, DEFAULT_PROFILE.degree.institution),
    year: asString(degree.year, DEFAULT_PROFILE.degree.year),
    description: asString(degree.description, DEFAULT_PROFILE.degree.description),
  },
  languages: parsePairs(data.languages, DEFAULT_PROFILE.languages),
  socials: {
    github: asString(socials.github, DEFAULT_PROFILE.socials.github),
    linkedin: asString(socials.linkedin, DEFAULT_PROFILE.socials.linkedin),
    telegram: asString(socials.telegram, DEFAULT_PROFILE.socials.telegram),
    telegramHandle: asString(
      socials.telegramHandle,
      DEFAULT_PROFILE.socials.telegramHandle,
    ),
  },
  footerTagline: asString(
    footerSection ? plainText(footerSection) : '',
    asString(data.footerTagline, DEFAULT_PROFILE.footerTagline),
  ),
  educationChip: asString(
    data.educationChip,
    degree.institution
      ? `${degree.institution} • ${degree.year}`
      : DEFAULT_PROFILE.educationChip,
  ),
  mailto: `mailto:${asString(data.email, DEFAULT_PROFILE.email)}`,
  profileNote,
};
