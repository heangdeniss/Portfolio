import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

const ExperienceContext = createContext(null);

const readStorage = (key, fallback) => {
  try {
    const value = window.localStorage.getItem(key);
    return value ?? fallback;
  } catch {
    return fallback;
  }
};

const writeStorage = (key, value) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Private contexts can block storage; the session still works.
  }
};

const getDefaultQuality = () => {
  if (typeof window === 'undefined') return 'high';
  const stored = readStorage('hd-webgl-quality', null);
  if (stored === 'high' || stored === 'low') return stored;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  return coarse || window.innerWidth < 900 ? 'low' : 'high';
};

const getDefaultContrast = () => {
  if (typeof window === 'undefined') return false;
  return readStorage('hd-contrast', 'dark') === 'contrast';
};

const isSearchCrawler = () => {
  if (typeof navigator === 'undefined') return true;
  const ua = navigator.userAgent || '';
  return (
    /bot|googlebot|crawler|spider|robot|crawling|bingbot|slurp|duckduckbot|baiduspider|yandexbot|facebot|ia_archiver|twitterbot|linkedinbot|applebot|lighthouse|chrome-lighthouse|headlesschrome|prerender/i.test(
      ua,
    ) || Boolean(navigator.webdriver)
  );
};

export function ExperienceProvider({ children }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const skipIntroForBot = useMemo(() => isSearchCrawler(), []);
  const [quality, setQuality] = useState(getDefaultQuality);
  const [contrast, setContrast] = useState(getDefaultContrast);
  const [introComplete, setIntroComplete] = useState(
    () => prefersReducedMotion || isSearchCrawler(),
  );

  const lenisRef = useRef(null);
  const velocityRef = useRef(0);
  const progressRef = useRef(0);
  const scrollYRef = useRef(0);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.quality = quality;
    writeStorage('hd-webgl-quality', quality);
  }, [quality]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.contrast = contrast ? 'high' : 'normal';
    writeStorage('hd-contrast', contrast ? 'contrast' : 'dark');
  }, [contrast]);

  const value = useMemo(
    () => ({
      quality,
      setQuality,
      contrast,
      setContrast,
      introComplete: introComplete || prefersReducedMotion || skipIntroForBot,
      setIntroComplete,
      lenisRef,
      velocityRef,
      progressRef,
      scrollYRef,
      prefersReducedMotion,
    }),
    [quality, contrast, introComplete, prefersReducedMotion, skipIntroForBot],
  );

  return <ExperienceContext.Provider value={value}>{children}</ExperienceContext.Provider>;
}

// The hook lives beside its provider so consumers only import one module.
// eslint-disable-next-line react-refresh/only-export-components
export function useExperience() {
  const context = useContext(ExperienceContext);
  if (!context) {
    throw new Error('useExperience must be used inside ExperienceProvider');
  }
  return context;
}
