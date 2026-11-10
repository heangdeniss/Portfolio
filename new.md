I want to elevate my Vite + React portfolio to an Awwwards-level frontend experience with purposeful, mathematical 3D graphics, WebGL/Canvas shaders, and spring-physics motion that reflect my identity as a Data Science, ML & RAG Engineer—while keeping 60fps performance, mobile responsiveness, and SEO intact.

Please inspect my current codebase and implement the following 3D & motion architecture upgrades:

### 1. Interactive 3D Latent-Space / Markov Manifold in the Hero

- Behind the Hero section (and framing the right-column portrait assembly), create a lightweight, GPU-accelerated 3D canvas (using Three.js / `@react-three/fiber` if appropriate, or a custom 3D projection HTML5 Canvas with zero heavy bundle bloat).
- Render a 3D mathematical point-cloud / state-transition manifold (~60–90 nodes in 3D space with perspective projection, depth-based opacity, and subtle Z-axis rotation).
- **Cursor Physics**: Project the user's cursor into 3D space to gently attract/repel nearby nodes and dynamically illuminate k-nearest-neighbor edges in warm amber (`#f59e0b`) and subtle cyan (`#38bdf8`), visually representing vector embeddings and probabilistic graph transitions.
- Add a 3D multi-axis gyroscope tilt to the orbital rings around my portrait (`rotateX`, `rotateY`, `rotateZ` with smooth lerp interpolation) that responds to mouse movement.

### 2. 3D Interactive Obsidian Knowledge Graph ("Living Knowledge Base" Section)

- Upgrade the Obsidian vault graph (`11 NOTES / 11 LINKS`) into an interactive **3D Force-Directed / Orbital Knowledge Constellation**:
  - Give every note node (`Heang Denis`, `Credit Risk RAG`, `LendingClub Pipeline`, `HMM POS Tagger`, `MPTC Internship`, etc.) true `(x, y, z)` coordinates with perspective scaling and depth-of-field alpha fading.
  - Allow users to drag-rotate the 3D graph in any direction, with smooth auto-rotation when idle.
  - Animate glowing data packets (amber/emerald particles) traveling along the edges from the central profile node to project and timeline nodes.
  - When a user hovers or clicks a 3D node, smoothly camera-focus/zoom toward that node in 3D space and highlight its connected subgraph.

### 3. 3D Perspective Card Physics & Specular Shader Borders

- Create a reusable 3D tilt & spotlight wrapper (or custom hook) for the cards in **About Me**, **Technical Expertise (Stack)**, and **Featured Projects**:
  - Calculate cursor position relative to each card's bounding box and apply smooth spring-interpolated 3D perspective transforms (`perspective(1000px) rotateX(...) rotateY(...) translateZ(...)`).
  - Add a dynamic radial specular glare and glowing border spotlight (`radial-gradient` tracking `--mouse-x` and `--mouse-y`) so the dark obsidian cards look like machined glass under directional studio lighting.
  - Elevate inner card badges and icons on the Z-axis (`transform: translateZ(24px)`) using `transform-style: preserve-3d` for real depth parallax.

### 4. Isometric 3D Layered Pipeline View for Featured Projects

- In the **Featured Projects** showcase and the `[ SYSTEM ARCHITECTURE ↗ ]` modal/drawer, add an interactive **3D Isometric Exploded Pipeline View**:
  - Visualize each project's architecture (e.g., for Credit Risk RAG: `1. 30k+ Loan Ingestion` → `2. CatBoost & NN PD Scoring` → `3. ChromaDB + Llama 3.2 RAG` → `4. FastAPI + React UI`) as stacked 3D glassmorphic planes in isometric perspective (`rotateX(55deg) rotateZ(-35deg)`).
  - Animate pulsing data streams flowing vertically between the 3D planes, and expand the Z-spacing when hovered or inspected so recruiters can visually trace the end-to-end engineering pipeline.

### 5. Performance & Accessibility Guardrails

- Pause off-screen 3D canvas `requestAnimationFrame` loops using `IntersectionObserver` so only the currently visible section renders at 60fps.
- Respect `prefers-reduced-motion: reduce` and automatically reduce particle counts on mobile viewports.
- Ensure `npm run build` succeeds cleanly with zero TypeScript or bundle errors.
