// Pure experiment logic for ChineseOracleRoots.
//
// This module contains NO React and NO DOM access, so every function here is
// deterministically testable. The validity of the study depends on these functions
// (random assignment, study-set sampling, test construction, scoring, result shaping),
// which is why they live apart from the view.

export const CONDITIONS = ['origin', 'gloss']

// How many characters a single participant studies + is tested on. Kept fixed and
// independent of the curated set size so sessions stay ~3-5 minutes and the test
// length (and guessing baseline) is constant across participants as the dataset grows.
export const STUDY_SET_SIZE = 24

export const N_OPTIONS = 4 // one correct + three distractors

// Fisher-Yates shuffle returning a new array (does not mutate input).
export function shuffle(arr, rng = Math.random) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Anonymous, opaque, per-session participant identifier. No PII; not persisted; does
// not link sessions. Uses crypto.randomUUID when available, else a random fallback.
export function newParticipantId() {
  const uuid =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(16).slice(2) + Date.now().toString(16)
  return 'p-' + uuid.replace(/-/g, '').slice(0, 12)
}

// Random between-subjects assignment, p ~= 0.5 per condition.
export function assignCondition(rng = Math.random) {
  return rng() < 0.5 ? 'origin' : 'gloss'
}

// Pick the sample of characters this participant will study. If the curated set is
// smaller than `size`, the whole set is used. Both study and test use this sample.
export function selectStudyItems(all, size = STUDY_SET_SIZE, rng = Math.random) {
  if (!Array.isArray(all) || all.length === 0) return []
  return shuffle(all, rng).slice(0, Math.min(size, all.length))
}

// Build the multiple-choice test from the studied items. One question per item, with
// N_OPTIONS options: the correct gloss plus distractors drawn from OTHER studied
// items' glosses. Option order is randomized per item.
export function buildTest(items, rng = Math.random) {
  const glosses = items.map((c) => c.gloss)
  return items.map((item) => {
    const others = glosses.filter((g) => g !== item.gloss)
    const distractors = shuffle(others, rng).slice(0, N_OPTIONS - 1)
    const options = shuffle([item.gloss, ...distractors], rng)
    return { char: item.char, correct: item.gloss, options }
  })
}

// Score a set of answers. `answers` is a map { char: chosenGloss }.
export function scoreAnswers(testItems, answers) {
  const score = testItems.reduce(
    (n, t) => n + (answers[t.char] === t.correct ? 1 : 0),
    0,
  )
  const accuracy = testItems.length
    ? +(score / testItems.length).toFixed(3)
    : 0
  return { score, accuracy }
}

// Assemble the exportable result record. Contains no PII; participantId is opaque.
export function makeResult({
  participantId,
  condition,
  startedAt,
  finishedAt,
  testItems,
  answers,
}) {
  const { score, accuracy } = scoreAnswers(testItems, answers)
  return {
    app: 'ChineseOracleRoots',
    version: 1,
    participantId,
    condition,
    startedAt,
    finishedAt,
    nItems: testItems.length,
    score,
    accuracy,
    responses: testItems.map((t) => ({
      char: t.char,
      correct: t.correct,
      chosen: answers[t.char] ?? null,
      isCorrect: answers[t.char] === t.correct,
    })),
  }
}

// Deterministic export filename.
export function resultFilename(condition, when = Date.now()) {
  return `chineseoracleroots_${condition}_${when}.json`
}
