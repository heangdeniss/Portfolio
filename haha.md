You are a senior front-end motion engineer working on a React 19 + Vite 8 portfolio.
please read@denis_portfolio

## Objective

Improve the portfolio's motion graphics, refine the Lenis smooth-scroll experience, and eliminate the Vite chunk-size warning without hiding it with a larger warning limit.

## Current repo facts

- Build stack: React 19, Vite 8 (Rolldown), GSAP + ScrollTrigger, Lenis, Three.js.
- Current entry chunk: `dist/assets/index-*.js` ≈ 1.01 MB minified. Vite reports:
  "(!) Some chunks are larger than 500 kB after minification."
- `three` is currently imported eagerly in:
  - `src/components/AmbientBackground.jsx` (`import * as THREE from 'three'`)
  - `src/components/WebGLProjectShowcase.jsx` (`import * as THREE from 'three'`)
- `AmbientBackground` is rendered immediately from `App.jsx`; `WebGLProjectShowcase` is statically imported and rendered by `Projects.jsx`.
- Smooth scrolling lives in `src/components/SmoothScrollProvider.jsx`: Lenis is driven by the GSAP ticker, velocity/progress are mirrored into refs, and anchor clicks use a hardcoded `-92` offset.
- Motion settings are vault-driven: `denis_portfolio/motion.md` → `src/data/motion.js`. Existing keys: `intensity`, `scrollLerp`, `velocityNormalizer`, `marqueeSpeed`, `cursor`, `ambient`, `vaultGraph`, `grain`.
- `prefers-reduced-motion` must continue to disable smooth scrolling and heavy effects.
- Relevant files: `src/App.jsx`, `src/components/SmoothScrollProvider.jsx`, `src/components/AmbientBackground.jsx`, `src/components/WebGLProjectShowcase.jsx`, `src/components/Projects.jsx`, `src/components/Hero.jsx`, `src/components/Marquee.jsx`, `src/components/TypeRibbon.jsx`, `src/components/VaultGraph.jsx`, `src/hooks/useVelocitySurfaces.js`, `src/lib/animations.js`, `vite.config.js`.

## Workstream 1 — Bundle optimization (required)

Target: no chunk larger than 500 kB minified, and a substantially smaller initial entry chunk. Do not simply raise `build.chunkSizeWarningLimit` to silence the warning.

1. Keep `three` out of the initial entry chunk.
   - Preferred: rewrite the full-screen ambient shader as a small dependency-free WebGL fullscreen quad, since it only needs a plane and one shader.
   - Alternatively, lazy-load Three and convert every `THREE.*` usage to named imports so Three can be tree-shaken. Do not use `import * as THREE`.
2. Defer heavy components:
   - Lazy-load the ambient canvas so it mounts after the intro/idle and only when ambient motion is enabled.
   - Lazy-load `WebGLProjectShowcase` only when the projects section approaches the viewport (IntersectionObserver with a root margin), not at initial app mount.
   - Keep the existing static/CSS fallback visible while the lazy chunk loads. Reserve space so there is no layout shift.
3. If additional splitting is needed, configure Rolldown/Vite code splitting correctly for the installed version (verify the exact `build.rolldownOptions` / chunking syntax). Isolate only genuinely heavy vendors; do not split tiny modules into request waterfalls.
4. Ensure Three is emitted once as a shared lazy chunk, not duplicated across chunks. Remove any dead imports that pull Three into the main graph.
5. Measure before and after with `npm run build`. Report entry size, largest chunk, gzip sizes, and which chunks are lazy-loaded.

## Workstream 2 — Smooth scroll refinement

Keep the architecture of one GSAP ticker driving Lenis. Do not add another rAF loop or document-wide scroll listener.

- Tune Lenis so wheel, trackpad, keyboard and touch feel weighted but responsive. Avoid excessive smoothing/lag, especially on touch devices.
- Replace the hardcoded anchor offset with the measured header height, updated on resize. Anchor navigation should land with consistent breathing room below the header.
- Move keyboard focus to the target section after anchor navigation; preserve normal browser behavior for modified clicks.
- Handle deep links on initial load (for example `/#notes`) after the intro completes and after lazy content has settled.
- Ensure `ScrollTrigger.refresh()` runs after fonts, images, lazy chunks and vault-driven content change layout.
- Verify modal scroll-locking (`data-lenis-prevent`), back-to-top, dossier open/close, tab visibility, and cleanup on unmount.
- Ensure velocity decays to zero when scrolling stops so velocity-driven effects settle.
- `prefers-reduced-motion` must use native scrolling with no Lenis instance and no heavy effects.

## Workstream 3 — Motion graphics upgrade

Make a focused, high-impact pass rather than animating everything. Preserve the current premium editorial identity (near-black, amber/cyan accents, cinematic but restrained).

Prioritize 2–3 of these:

- Hero: sharper name/tagline reveal, portrait depth/parallax, orbit or glow reaction to pointer and scroll velocity.
- Scroll narrative: restrained parallax on ghost section headings, velocity-reactive marquee/type ribbons with edge fades.
- Projects: card depth/tilt, image parallax, magnetic CTA states, polished transitions into the dossier.
- Vault graph: animated edge draw on entry, clearer hover focus/dimming, smoother packet motion.
- Section transitions: coordinated reveal timing and subtle depth, without making the page feel busy.

Motion rules:

- Animate only `transform` and `opacity`; avoid layout-triggering properties in animation loops.
- Use `gsap.quickTo`, IntersectionObserver, and offscreen pausing. Avoid large blur/filter effects and excessive `will-change`.
- Respect `motion.md` settings. If you add a new tuning token, update `denis_portfolio/motion.md`, `src/data/motion.js`, and the README table.
- Keep mobile/coarse-pointer fallbacks and reduced-motion behavior fully functional.

## Constraints

- Do not add new heavy dependencies or replace the existing design system.
- Do not change vault content or the build-time Obsidian pipeline unless required for a motion token.
- Do not rewrite unrelated sections.
- Keep all changes consistent with the existing CSS/component conventions.
- Preserve accessibility: focus states, skip link, keyboard navigation, contrast, and semantic structure.

## Acceptance criteria

1. `npm run lint` passes.
2. `npm run build` passes with no chunk-size warning; if a large lazy chunk is unavoidable, document why and keep it out of the initial load.
3. Initial JS is materially smaller than the current ~1.01 MB entry chunk.
4. No layout shift when lazy chunks resolve; visible fallback before WebGL mounts.
5. Zero console errors.
6. Test at 390px, 768px, 1024px and 1440px:
   - wheel, trackpad, touch, keyboard scrolling
   - header anchors, back-to-top, `/#notes` deep link
   - project dossier open/close and scroll lock
   - reduced-motion mode
7. Motion remains smooth and does not introduce scroll jank, duplicate RAF loops, or ScrollTrigger drift.

## Final report

Provide:

- Before/after bundle table (entry, largest chunk, gzip, lazy chunks).
- What changed in smooth scroll and why.
- Which motion moments were upgraded.
- Test results and any remaining trade-offs.
  The key optimization is to remove Three from the initial load: the entry chunk is currently about 1.01 MB minified, and Three is pulled in twice through eager imports. Lazy-loading the project showcase plus either dropping Three from the ambient shader or tree-shaking it with named imports should resolve the warning without masking it.
