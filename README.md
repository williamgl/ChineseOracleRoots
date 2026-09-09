# ChineseOracleRoots — Cognitive Science Project

*Learn Chinese characters through their oracle bone origins.*

A React web app + embedded learning experiment exploring whether seeing the
**pictographic origin** of a Chinese character helps people **learn and remember** its
meaning.

**Working paper title:** *Do Pictographic Origins Aid Character Learning? A
Dual-Coding Study Using Oracle Bone Script.*

## Cognitive science grounding

- **Representation shift**: oracle bone script (甲骨文) is near-pictorial
  (analog/imagistic representation). Modern glyphs are abstract/symbolic. The tool
  visualizes the perception-to-symbol transition — a core CRUM theme (imagery vs.
  symbolic representation).
- **Dual coding theory (Paivio)**: pairing a verbal gloss with a visual/pictorial
  code should improve memory.
- **Elaborative / depth-of-processing encoding**: an origin "story" gives semantic
  depth that aids recall.

## Research question & hypothesis

**RQ:** Do learners who study a character *with* its pictographic origin + oracle
bone image remember its meaning better than learners who see the character + gloss
only?

**H1:** The "with-origin" group scores higher on the meaning-recall quiz than the
"gloss-only" group.

## Experiment design (built into the app, "Learning Study" tab)

- **Type:** between-subjects, single session (~3–4 min).
- **IV:** study condition — `origin` (oracle bone image + pictographic origin shown)
  vs. `gloss` (character + English gloss only). Assigned randomly on start.
- **DV:** quiz accuracy (4-option multiple choice: pick the correct meaning).
- **Output:** each participant can download a JSON result file; aggregate these for
  analysis (e.g. compare mean accuracy across conditions with a t-test).

## Project structure

```
Cognitive Science/
  index.html
  package.json
  vite.config.js
  src/
    main.jsx, App.jsx, styles.css
    data/characters.js         # curated character set + etymologies (the study items)
    lib/experiment.js          # pure experiment logic (assignment, test, scoring)
    lib/experiment.test.js     # unit tests for the experiment logic (Vitest)
    views/ToolView.jsx         # "Explore" — character lookup + display
    views/ExperimentView.jsx   # "Learning Study" — study + quiz + results
    components/ObcImage.jsx     # oracle bone image with graceful fallback
  scripts/
    extract_obc.py             # pull curated images from the HUST-OBC dataset
  public/
    obc/                       # extracted oracle bone images (generated)
  .kiro/specs/oracle-bone-learning-tool/   # requirements, design, tasks
```

## Setup

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
npm test         # run the experiment-logic unit tests (Vitest)
```

> Note: on Windows PowerShell, if `npm` is blocked by the execution policy, run
> commands via `cmd /c "npm ..."`.

## Getting the oracle bone images

The app references one oracle bone image per character in `public/obc/`. These are
extracted from the **HUST-OBC** dataset (not committed — it is large).

1. Download `HUST-OBC.zip` from the dataset's Figshare/ModelScope links
   (see https://github.com/Pengjie-W/HUST-OBC) and extract it.
2. Run the extractor:
   ```bash
   python scripts/extract_obc.py --dataroot "C:/path/to/HUST-OBC"
   ```
   It maps each curated character to its dataset ID and copies a representative image
   into `public/obc/`. Until then, the app shows "image pending" placeholders.

## Adding more characters

Append entries to `src/data/characters.js` following the documented schema, then add
the `(char, filename)` pair to `CURATED` in `scripts/extract_obc.py` and re-run it.
Target ~50–100 well-attested pictographs for a well-powered study.

## Analyzing results

Each participant downloads one JSON file (see the schema in
`.kiro/specs/oracle-bone-learning-tool/design.md`). To test the hypothesis, collect
the files and compare mean `accuracy` between the `origin` and `gloss` groups — e.g. an
independent-samples t-test (or Mann–Whitney U if assumptions fail). Each file also
contains per-item `responses` for item-level analysis. Analysis is done offline; the
app stores nothing.

## Attribution

- **Oracle bone images:** HUST-OBC dataset — Wang et al., *An open dataset for oracle
  bone character recognition and decipherment*, Scientific Data (2024). CC BY 4.0.
- **English glosses:** adapted from CC-CEDICT. CC BY-SA 3.0.

## Status

- [x] React + Vite scaffold (builds cleanly)
- [x] Requirements / design / tasks spec
- [x] Rebranded to ChineseOracleRoots
- [x] Curated character set (~60 characters with etymologies)
- [x] Pure experiment logic module + unit tests (14 passing)
- [x] Anonymous per-session participant ID
- [x] HUST-OBC extraction script (synced to the full curated set)
- [x] Tool view (lookup + display, with image fallback)
- [x] Experiment flow (randomized conditions, study-set sampling, quiz, export)
- [x] Documentation
- [ ] Download dataset + run extractor to populate images
- [ ] Collect responses + analyze
```
