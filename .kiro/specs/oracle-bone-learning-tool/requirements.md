# Requirements — ChineseOracleRoots

**App name:** ChineseOracleRoots — *Learn Chinese characters through their oracle bone origins.*

**Working paper title:** *Do Pictographic Origins Aid Character Learning? A
Dual-Coding Study Using Oracle Bone Script.*

## Introduction

This project is a cognitive science study delivered as a small web application. It
pairs an **exploratory tool** (look up a Chinese character and see its oracle bone
script origin) with an **embedded learning experiment** that tests a specific
cognitive hypothesis: that studying a character together with its pictographic origin
improves memory for the character's meaning.

The project falls under the *Computational Model/Tool* track and is explicitly
grounded in cognitive science: it operationalizes **dual coding theory** (Paivio) and
**depth-of-processing / elaborative encoding** (Craik & Lockhart), and it illustrates
the CRUM theme of the shift from **analog/imagistic representation** (pictographs) to
**abstract symbolic representation** (modern glyphs).

The application must run entirely in a web browser, require no backend server, and
produce data that can be aggregated and analyzed to evaluate the hypothesis.

### Definitions

- **Oracle bone script (甲骨文)**: the earliest attested Chinese writing, largely
  pictographic.
- **Curated character**: a character included in the study set, with an authored
  etymology and a mapped oracle bone image.
- **Study condition**: the between-subjects manipulation — `origin` (pictographic
  origin + oracle bone image shown) vs. `gloss` (meaning shown without origin).
- **Participant / session**: one person completing the learning study once.
- **Result record**: the structured data produced by one completed session.

## Requirements

### Requirement 1 — Character exploration tool

**User Story:** As a curious learner, I want to look up a character and see its oracle
bone origin and meaning, so that I can understand how the modern glyph derives from a
picture.

#### Acceptance Criteria

1. WHEN the user enters a single character that is in the curated set THEN the system
   SHALL display the modern glyph, the oracle bone image, the pinyin reading, the
   English gloss, and the pictographic-origin text.
2. WHEN the user enters a string of more than one character THEN the system SHALL
   resolve the lookup using the first character.
3. WHEN the user enters a character that is not in the curated set THEN the system
   SHALL show a clear "not found" message and offer the curated characters as
   selectable suggestions.
4. WHEN no oracle bone image is available for a curated character THEN the system
   SHALL display a visible placeholder rather than a broken image.
5. WHEN the tool first loads THEN the system SHALL present the curated characters as
   selectable suggestions so the user can start without typing.

### Requirement 2 — Curated character dataset

**User Story:** As the researcher, I want a well-documented set of study characters
with accurate etymologies, so that both the tool and the experiment rest on reliable
content.

#### Acceptance Criteria

1. The dataset SHALL store, for each character: the modern glyph, pinyin, English
   gloss, formation type, pictographic-origin text, and the oracle bone image
   filename.
2. Each pictographic-origin text SHALL describe the visual motivation of the oracle
   bone form (what it depicted) rather than only restating the meaning.
3. The dataset SHALL be structured so that a character can be looked up in constant
   time by its glyph.
4. The initial curated set SHALL contain 50–100 well-attested characters, and the
   schema SHALL support expansion to 100–500 without code changes to the views.
5. English glosses SHALL be attributable to CC-CEDICT, and etymologies SHALL be
   traceable to a documented reference.

### Requirement 3 — Oracle bone image sourcing

**User Story:** As the researcher, I want authentic oracle bone images for each
curated character, sourced legally and reproducibly, so that the tool is credible and
the pipeline can be re-run.

#### Acceptance Criteria

1. The system SHALL source oracle bone images from the HUST-OBC dataset.
2. The extraction process SHALL map each curated character to its dataset ID and copy
   one representative image per character into the app's public assets.
3. WHEN a curated character cannot be matched in the dataset THEN the extraction
   process SHALL report it by name and continue processing the rest.
4. The large raw dataset SHALL NOT be committed to the repository; only the small set
   of extracted per-character images SHALL be included.
5. The application SHALL attribute HUST-OBC (CC BY 4.0) and CC-CEDICT (CC BY-SA 3.0)
   visibly in the UI and in the documentation.

### Requirement 4 — Learning experiment: assignment and study phase

**User Story:** As a participant, I want to be guided through a short, fair learning
task, so that my performance reflects the study format I was given.

#### Acceptance Criteria

1. WHEN a participant starts the study THEN the system SHALL randomly assign them to
   the `origin` or `gloss` condition with approximately equal probability.
2. WHEN the study phase begins THEN the system SHALL present the curated characters
   one at a time in a randomized order.
3. WHEN the condition is `origin` THEN each study screen SHALL show the character, its
   oracle bone image, its meaning, and its pictographic-origin text.
4. WHEN the condition is `gloss` THEN each study screen SHALL show the character and
   its meaning only, with no oracle bone image or origin text.
5. The study phase SHALL be self-paced, advancing only on the participant's action,
   and SHALL indicate progress (current item number and total).
6. The set of characters studied SHALL be identical across conditions, so that only
   the presence of the pictographic origin differs.

### Requirement 5 — Learning experiment: test phase and scoring

**User Story:** As a participant, I want a clear quiz that measures what I remember,
so that my result is a meaningful data point.

#### Acceptance Criteria

1. WHEN the study phase ends THEN the system SHALL present a test covering every
   studied character.
2. For each character the test SHALL present the glyph and four meaning options: the
   correct gloss plus three distractors drawn from other curated characters.
3. The position of the correct option SHALL be randomized per item.
4. The system SHALL record the participant's chosen option for each item and mark it
   correct or incorrect.
5. The system SHALL NOT allow the participant to finish the test until every item has
   an answer.
6. WHEN the test is complete THEN the system SHALL compute a total score and an
   accuracy proportion.

### Requirement 6 — Result capture and export

**User Story:** As the researcher, I want each session's data in a structured file, so
that I can aggregate sessions and test the hypothesis.

#### Acceptance Criteria

1. WHEN a session starts THEN the system SHALL generate a random, anonymous
   participant ID for that session, entirely in the browser, without any login or
   personal information.
2. WHEN a session completes THEN the system SHALL make available a result record
   containing: the anonymous participant ID, the condition, start and finish
   timestamps, the number of items, the total score, the accuracy, and per-item
   detail (character, correct gloss, chosen gloss, correctness).
3. WHEN the participant chooses to export THEN the system SHALL download the result
   record as a JSON file with a filename that encodes the condition and a timestamp.
4. The result record SHALL contain no personally identifying information; the
   participant ID SHALL be an opaque random value that cannot identify a person.
5. The exported format SHALL be consistent across sessions so that multiple files can
   be aggregated programmatically.

### Requirement 7 — Delivery and operation

**User Story:** As the researcher, I want the app to be easy to run and deploy, so
that I can pilot it locally and share it with participants.

#### Acceptance Criteria

1. The application SHALL run as a static site with no backend or database.
2. The application SHALL build to static assets deployable to any static host.
3. The application SHALL use relative asset paths so it works when served from a
   subpath.
4. The project SHALL document how to install, run in development, build, and populate
   the oracle bone images.
5. The application SHALL be usable on both desktop and mobile-width screens.

## Out of scope (for this version)

- Server-side storage, a database, or automatic central aggregation of participant
  results. Results are exported per participant as JSON and aggregated offline. (The
  app stays a static site.)
- User accounts, login, authentication, or tracking a person across sessions. The
  only identifier is a per-session anonymous random ID (see Requirement 6), which does
  not persist or link sessions.
- A delayed-recall (multi-day) test; the study is single-session.
- Coverage of characters that lack an attested oracle bone form (e.g. many characters
  coined in later periods).
- Automated statistical analysis inside the app (analysis is done offline on the
  exported files).

## Cognitive science success criteria

Beyond functional correctness, the project succeeds as a cognitive science artifact if:

1. The manipulation is clean — conditions differ only in the presence of the
   pictographic origin, holding studied items, order, and test constant.
2. The exported data is sufficient to compute per-condition accuracy and run a simple
   between-groups comparison.
3. The write-up connects the design and any results back to dual coding theory,
   depth-of-processing, and the CRUM representation-shift theme.
