---
publish: false
graph: false
title: Start Here
---

# Start Here

This folder is a working Obsidian vault **and** the content source for the portfolio in the parent folder. Edit notes here — no React changes needed for normal content updates.

## How the sync works

- `src/lib/vault.js` reads every Markdown note in this vault at **build time**.
- A note is only used by the site when its frontmatter contains `publish: true`.
- The animated graph in the Notes section is built from the wikilinks and `related:` fields between published notes.
- Images and PDFs are resolved by filename from `src/images` and `src/certificate`. Only files referenced by a note are bundled.

## Content map

| Note | Controls |
| --- | --- |
| `profile.md` | Hero copy, About copy, metrics, degree, languages, social links |
| `projects/*.md` | Featured project cards and case-study dossiers |
| `timeline/*.md` | Experience & Education timeline |
| `motion.md` | Scroll, cursor, marquee and background motion settings |

## Publishing a note

```yaml
---
publish: true
title: My new project
group: project
order: 4
graphLabel: New project
---
```

Use `order` to control position inside projects or timeline.

## Project note structure

Project notes read these sections from the note body:

```md
## Summary
Short description used on the card.

## Architecture
- Step one
- Step two

## Formula
**Formula label**

```
your formula here
```

## Details
Longer technical explanation.
```

Add image filenames in frontmatter:

```yaml
images: [creditrisk_pred.jpg, creditrisk_rag.jpg]
```

## Timeline note structure

Timeline notes are mostly frontmatter. The note body becomes the card description. Reference a logo or certificate by filename:

```yaml
logo: itc-logo-opt.png
cert: "Certificate of Completion_Heang DENIS_ANBPTMD12024014.pdf"
```

## Motion settings

Open [[Motion System]] to adjust:

- `intensity` — `cinematic`, `balanced`, `calm` or `off`
- `scrollLerp` — Lenis smoothing (lower = floatier)
- `marqueeSpeed` — base speed of the ticker ribbons
- `cursor`, `ambient`, `vaultGraph`, `grain` — decorative toggles

## Linking notes

Use standard Obsidian wikilinks anywhere in a note:

```md
See [[Profile]] and [[Motion System]].
```

Or add them without visible text:

```yaml
related:
  - Profile
  - Motion System
```

Published notes are [[Profile]], [[Motion System]], and the notes inside `projects/` and `timeline/`.

> The vault is read at build time. Restart `npm run dev` if a brand-new file does not appear immediately.
