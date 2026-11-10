import { noteByPath } from '../lib/vault';

const DEFAULTS = {
  intensity: 'cinematic',
  scrollLerp: 0.135,
  velocityNormalizer: 80,
  marqueeSpeed: 52,
  cursor: true,
  ambient: true,
  vaultGraph: true,
  grain: true,
};

const note = noteByPath('motion.md');
const data = note?.data ?? {};

const numberOr = (value, fallback, min, max) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
};

const booleanOr = (value, fallback) =>
  typeof value === 'boolean' ? value : fallback;

const intensity = ['cinematic', 'balanced', 'calm', 'off'].includes(data.intensity)
  ? data.intensity
  : DEFAULTS.intensity;

const isOff = intensity === 'off';

export const motion = {
  intensity,
  scrollLerp: numberOr(data.scrollLerp, DEFAULTS.scrollLerp, 0.03, 0.2),
  velocityNormalizer: numberOr(
    data.velocityNormalizer,
    DEFAULTS.velocityNormalizer,
    20,
    300,
  ),
  marqueeSpeed: numberOr(data.marqueeSpeed, DEFAULTS.marqueeSpeed, 0, 200),
  cursor: isOff ? false : booleanOr(data.cursor, DEFAULTS.cursor),
  ambient: isOff ? false : booleanOr(data.ambient, DEFAULTS.ambient),
  vaultGraph: isOff ? false : booleanOr(data.vaultGraph, DEFAULTS.vaultGraph),
  grain: isOff ? false : booleanOr(data.grain, DEFAULTS.grain),
  motionNote: note,
};
