# Implementation Plan — ChineseOracleRoots

- [x] 1. Rebrand the app to ChineseOracleRoots
  - Update `package.json` name/description, `index.html` title, `App.jsx` header
    (brand + tagline) and footer attribution wording.
  - Update `README.md` title and any "Explorer" references.
  - _Requirements: 7.4_

- [x] 2. Extract experiment logic into a pure, testable module
  - [x] 2.1 Create `src/lib/experiment.js` with pure functions
    - `newParticipantId()`, `shuffle()`, `assignCondition()`,
      `selectStudyItems(all, size)`, `buildTest(items)`, `scoreAnswers(items, answers)`,
      `makeResult(...)`.
    - No React/DOM imports.
    - _Requirements: 4.1, 4.2, 5.1, 5.2, 5.3, 5.6, 6.1, 6.2_
  - [x] 2.2 Refactor `ExperimentView.jsx` to consume `lib/experiment.js`
    - Replace inline helpers with imports; keep phase-machine UI.
    - _Requirements: 4.3, 4.4, 4.5, 4.6, 5.4, 5.5_

- [x] 3. Add the anonymous participant ID
  - Generate a random opaque ID on session start; include it in the result record and
    the exported JSON; ensure no PII.
  - Update export filename to `chineseoracleroots_<condition>_<timestamp>.json`.
  - _Requirements: 6.1, 6.3, 6.4_

- [x] 4. Add fixed study-set sampling for scalability
  - Introduce `STUDY_SET_SIZE` (default 24). `selectStudyItems` samples that many from
    the curated set (or all, if fewer). Study, test, and scoring use the same sample.
  - _Requirements: 4.2, 4.6, 5.1_

- [x] 5. Expand the curated character dataset to 50–100 characters
  - [x] 5.1 Author records with accurate etymologies
    - ~60 well-attested pictographs/ideographs/compounds with `char`, `pinyin`,
      `gloss`, `type`, `origin`, `obcImage` (pinyin-based ASCII filenames).
    - _Requirements: 2.1, 2.2, 2.4, 2.5_
  - [x] 5.2 Keep the extraction mapping in sync
    - `CURATED` in `scripts/extract_obc.py` updated to match every `obcImage`.
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 6. Add unit tests for the experiment logic
  - Vitest set up; tests for `assignCondition` balance, `buildTest` (4 unique options
    incl. correct + randomized position), `scoreAnswers`, `makeResult` shape/no-PII,
    `shuffle`, `newParticipantId`, `selectStudyItems`, `resultFilename`. 14 passing.
  - _Requirements: 5.2, 5.3, 5.6, 6.4_

- [x] 7. Documentation and verification
  - `README.md` updated (structure, setup incl. `npm test`, analysis note, expanded
    character count, status). `npm run build` passes (36 modules, no errors). Committed
    and pushed.
  - _Requirements: 3.5, 7.1, 7.2, 7.4_
