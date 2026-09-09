# Design — ChineseOracleRoots

## Overview

ChineseOracleRoots is a single-page React application, built with Vite and deployed as
static assets. It has two user-facing surfaces sharing one curated dataset:

1. **Explore** — a lookup tool that shows a character's modern glyph, oracle bone
   image, pinyin, English gloss, and pictographic-origin text.
2. **Learning Study** — a between-subjects experiment that measures whether studying a
   character *with* its pictographic origin improves recall of its meaning.

There is no backend. All logic runs in the browser; results leave the app only as a
JSON file the participant downloads. Oracle bone images are prepared offline by a
Python script that pulls a representative image per character from the HUST-OBC
dataset into `public/obc/`.

This design maps directly to the seven requirements and the four confirmed
methodological choices: single-session, between-subjects, four-option multiple
choice, and offline analysis.

## Architecture

```
                       ┌─────────────────────────────────────────┐
                       │            App.jsx (shell)               │
                       │   tab state: 'tool' | 'experiment'       │
                       └───────────────┬─────────────────────────┘
                                       │
                 ┌─────────────────────┴──────────────────────┐
                 │                                             │
        ┌────────▼─────────┐                        ┌──────────▼───────────┐
        │  ToolView.jsx    │                        │  ExperimentView.jsx  │
        │  lookup + display│                        │  phase machine       │
        └────────┬─────────┘                        └──────────┬───────────┘
                 │                                             │
                 │        ┌──────────────────────┐             │
                 └───────►│  ObcImage.jsx        │◄────────────┘
                          │  image + fallback    │
                          └──────────┬───────────┘
                                     │
                          ┌──────────▼───────────┐
                          │ data/characters.js   │  curated set + index
                          └──────────────────────┘
                          ┌──────────────────────┐
                          │ lib/experiment.js    │  pure helpers:
                          │  shuffle, buildTest, │  assignment, scoring,
                          │  makeResult, id gen  │  result shaping
                          └──────────────────────┘

  Offline pipeline (not part of the runtime):
     HUST-OBC.zip ──► scripts/extract_obc.py ──► public/obc/<name>.png
```

Layering rule: **views** hold UI and phase state; **lib** holds pure, testable
functions (no React, no DOM); **data** holds content. This keeps the experiment logic
(assignment, test construction, scoring, result shaping) isolated and verifiable
independent of rendering.

## Technology choices

- **React 18 + Vite 5** — matches the existing scaffold and the user's prior work;
  fast dev server and simple static build.
- **No router** — two tabs via local state is sufficient; avoids a dependency.
- **No state library** — component-local `useState`/`useMemo` covers all needs.
- **No CSS framework** — a single hand-written `styles.css` with CSS variables keeps
  the bundle tiny and the visual style consistent (warm "aged paper" palette).
- **Vite `base: './'`** — relative asset paths so the build works from any subpath
  (satisfies Requirement 7.3, e.g. GitHub Pages project sites).

## Data model

### Character record (`src/data/characters.js`)

```js
{
  char:     '日',            // modern glyph (string, the lookup key)
  pinyin:   'rì',            // Mandarin reading
  gloss:    'sun; day',      // short English meaning (test's correct answer)
  type:     'pictograph',    // 'pictograph' | 'ideograph' | 'compound'
  origin:   'A drawing of…', // pictographic-origin text (the IV content)
  obcImage: 'ri.png',        // filename in public/obc/ (may be absent → fallback)
}
```

- Exported as `CHARACTERS` (array, preserves authoring order) and `CHAR_INDEX`
  (`{ char: record }`) for O(1) lookup (Requirement 2.3).
- The `origin` field is the **independent-variable content**: shown in the `origin`
  condition, withheld in the `gloss` condition. Authoring guideline: describe what the
  oracle bone form *depicted*, not merely restate the meaning (Requirement 2.2).
- Glosses adapted from CC-CEDICT; etymologies from documented references (2.5).

### Result record (produced by `lib/experiment.js`, exported as JSON)

```js
{
  app: 'ChineseOracleRoots',
  version: 1,                       // schema version for aggregation safety
  participantId: 'p-7f3a9c2e',      // anonymous, per-session (Requirement 6.1/6.4)
  condition: 'origin' | 'gloss',
  startedAt: '2026-…T…Z',
  finishedAt: '2026-…T…Z',
  nItems: 24,
  score: 19,
  accuracy: 0.792,
  responses: [
    { char: '日', correct: 'sun; day', chosen: 'sun; day', isCorrect: true },
    …
  ]
}
```

- Contains **no PII**; `participantId` is an opaque random token (6.3/6.4).
- `version` lets the offline aggregation script guard against format drift (6.5).

## Experiment mechanics

State machine in `ExperimentView.jsx`:

```
intro ──begin()──► study ──(last item)──► test ──(all answered)──► done
                     ▲                                               │
                     └──────────── self-paced Next ─────────────────┘
```

Decisions and how they satisfy requirements:

- **Assignment (4.1):** on `begin()`, `assignCondition()` returns `'origin'` or
  `'gloss'` with p≈0.5 via `Math.random()`. Between-subjects: a session sees exactly
  one condition.
- **Study order (4.2):** the study list is a shuffled copy of the study items,
  computed once per session with `useMemo` so it is stable within the session.
- **Identical items across conditions (4.6):** both conditions study the *same* set;
  only the presence of `ObcImage` + `origin` text differs. This is the clean
  manipulation the cognitive-science success criteria demand.
- **Study-set sizing (scalability):** with a large curated set (up to 500), studying
  every character in one session is impractical. Design introduces a
  `STUDY_SET_SIZE` (default 24). `selectStudyItems()` takes a random sample of that
  size from `CHARACTERS`; both conditions and the test use that same sample. For small
  curated sets the sample is simply the whole set. This keeps sessions ~3–5 minutes
  and the test length constant regardless of dataset growth.
- **Test construction (5.1–5.3):** `buildTest(items)` creates one question per studied
  item: the correct gloss plus **three distractors** sampled from *other studied
  items’* glosses, with option order shuffled per item and the correct position
  randomized.
- **Completion gate (5.5):** the "see results" action is disabled until every item has
  a recorded answer.
- **Scoring (5.6):** `scoreAnswers(testItems, answers)` returns total and accuracy.
- **Result + export (6):** `makeResult(...)` assembles the record; `download()`
  serializes it and triggers a client-side download named
  `chineseoracleroots_<condition>_<timestamp>.json`.

### Distractor quality note

Distractors are drawn from other curated glosses rather than random English words, so
the multiple-choice test measures *character→meaning discrimination* rather than
English vocabulary. With a small studied set the same glosses recur as distractors;
with larger sets distractors are more varied. This is acceptable for a proof-of-concept
and is documented as a limitation for the write-up.

## Component responsibilities

- **App.jsx** — renders header (ChineseOracleRoots brand + tagline), tab nav, active
  view, and the attribution footer. Owns only `tab` state.
- **ToolView.jsx** — search input, first-character resolution (1.2), lookup against
  `CHAR_INDEX`, not-found handling with suggestions (1.3), initial suggestions (1.5),
  and the result card (modern glyph, oracle bone via `ObcImage`, pinyin, gloss,
  origin).
- **ExperimentView.jsx** — the phase machine, per-phase UI, and calls into
  `lib/experiment.js` for all non-UI logic.
- **ObcImage.jsx** — renders `public/obc/<file>` with `onError` fallback to a visible
  "image pending" placeholder (1.4, 3 partial).
- **lib/experiment.js** — pure functions: `newParticipantId()`, `shuffle()`,
  `assignCondition()`, `selectStudyItems()`, `buildTest()`, `scoreAnswers()`,
  `makeResult()`. No React imports; individually unit-testable.

## Offline image pipeline (`scripts/extract_obc.py`)

- Reads `deciphered/chinese_to_ID.json` from the extracted HUST-OBC folder, maps each
  curated character to a dataset ID, and copies one representative image per character
  into `public/obc/` using the filename declared in `characters.js` (3.1, 3.2).
- Unmatched characters are reported by name and skipped; processing continues (3.3).
- The large raw dataset is git-ignored; only the ~50–100 small extracted images are
  committed (3.4).
- A single source of truth for the `(char → filename)` mapping: the script derives it
  from `characters.js` where feasible, or a `CURATED` list kept in sync. Design keeps
  the filename convention deterministic (pinyin-based, ASCII) to avoid encoding issues.

## Styling & responsiveness

- Centered single-column layout, max width ~860px, generous padding; scales down to
  mobile widths (7.5). Cards, pill tabs, and an evolution strip (oracle bone → modern)
  communicate the representation shift visually.
- Large glyph typography; system CJK fonts to render characters without shipping a
  font.

## Error and edge handling

- Empty/whitespace lookup: ignored (no state change).
- Multi-character input: resolves on the first character (1.2).
- Missing image: placeholder, never a broken `<img>` (1.4).
- Small curated set (< STUDY_SET_SIZE): study the whole set; test length adapts.
- Reload mid-session: state resets to `intro` (acceptable; sessions are short and
  single-use). No persistence by design (no tracking across sessions).

## Testing strategy

- **Unit tests (pure lib):** `assignCondition` distribution is ~balanced;
  `buildTest` yields 4 unique options containing the correct gloss with randomized
  position; `scoreAnswers` computes correct totals/accuracy; `makeResult` shape
  matches the schema and contains no PII fields. (Vitest; tests only added because
  they verify the experiment's correctness — the DV depends on them.)
- **Build verification:** `npm run build` must succeed with no errors before commits.
- **Manual smoke:** run both conditions end-to-end; confirm export file opens and
  parses.

## Requirements traceability

| Requirement | Where satisfied |
|-------------|-----------------|
| 1 Explore tool | ToolView.jsx + CHAR_INDEX + ObcImage |
| 2 Curated dataset | data/characters.js (schema, index, 50–100 set) |
| 3 Image sourcing | scripts/extract_obc.py + public/obc + footer attribution |
| 4 Assignment/study | ExperimentView phases + lib assignCondition/selectStudyItems |
| 5 Test/scoring | lib buildTest/scoreAnswers + test-phase UI + completion gate |
| 6 Result/export | lib newParticipantId/makeResult + download() |
| 7 Delivery | Vite static build, base './', README, responsive CSS |

## Design decisions & rationale

1. **Pure-logic module separated from views.** The experiment's validity depends on
   assignment, test construction, and scoring being correct. Isolating them in
   `lib/experiment.js` makes them testable and keeps the DV trustworthy.
2. **Fixed study-set sample size.** Decouples session length from dataset size so the
   study stays ~3–5 minutes as the curated set grows to 500 — protecting completion
   rates and keeping the test length (and guessing baseline) constant across
   participants.
3. **Anonymous per-session ID instead of accounts.** Satisfies the "lightweight"
   identification need without login, storage, or PII — consistent with the static-site
   constraint and cleaner for research ethics.
4. **Offline aggregation.** No backend keeps deployment trivial and avoids handling
   participant data on a server; JSON exports are aggregated with a small script for
   analysis.
5. **Distractors from curated glosses.** Keeps the test about character meaning rather
   than English proficiency; documented as a limitation.
```
