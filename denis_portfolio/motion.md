---
publish: true
title: Motion System
group: system
graphLabel: Motion System
intensity: cinematic
scrollLerp: 0.135
velocityNormalizer: 80
cursor: true
ambient: true
vaultGraph: true
grain: true
related:
  - Profile
---

## Motion contract

This note is read by `src/data/motion.js`. Change a value, then save and let Vite reload.

| Field | Range | Effect |
| --- | --- | --- |
| `intensity` | `cinematic`, `balanced`, `calm`, `off` | Global motion mood. `off` disables cursor, ambient shader and vault graph motion. |
| `scrollLerp` | `0.03` – `0.2` | Lenis smoothing. Lower values feel floatier and heavier. |
| `velocityNormalizer` | `20` – `300` | How strongly scroll velocity drives the vault graph and hero orbits. Lower = more reactive. |
| `cursor` | `true` / `false` | Custom dual cursor. |
| `ambient` | `true` / `false` | Full-screen WebGL ambient shader. |
| `vaultGraph` | `true` / `false` | Animated knowledge graph in the Notes section. |
| `grain` | `true` / `false` | Film grain overlay. |

`prefers-reduced-motion` always wins over these settings.
