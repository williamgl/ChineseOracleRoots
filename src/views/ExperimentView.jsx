import { useState, useMemo } from 'react'
import { CHARACTERS } from '../data/characters.js'
import ObcImage from '../components/ObcImage.jsx'

// ---------------------------------------------------------------------------
// Experiment design (between-subjects, single session):
//
//   Independent variable: study condition
//     - "origin"    : study screen shows the oracle bone image + pictographic origin
//     - "gloss"     : study screen shows only the character + English gloss
//   Dependent variable: test accuracy (proportion of meanings correctly recalled)
//
//   Hypothesis (dual coding + elaborative encoding): the "origin" group scores
//   higher than the "gloss" group.
//
//   Flow: intro -> study (each item, self-paced) -> distractor -> test
//         (multiple choice: pick the correct gloss for each character) -> results.
//
//   Results are shown on screen and can be downloaded as JSON for later analysis.
// ---------------------------------------------------------------------------

const STUDY_SECONDS = 8 // suggested per-item study time (not enforced, shown as hint)

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildTest(items) {
  const allGlosses = items.map((c) => c.gloss)
  return items.map((item) => {
    const distractors = shuffle(allGlosses.filter((g) => g !== item.gloss)).slice(0, 3)
    const options = shuffle([item.gloss, ...distractors])
    return { char: item.char, correct: item.gloss, options }
  })
}

export default function ExperimentView() {
  const [phase, setPhase] = useState('intro') // intro|study|test|done
  const [condition, setCondition] = useState(null) // origin|gloss
  const [studyIndex, setStudyIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [startedAt, setStartedAt] = useState(null)

  // Fixed randomized study order per session.
  const studyItems = useMemo(() => shuffle(CHARACTERS), [])
  const testItems = useMemo(() => buildTest(studyItems), [studyItems])

  function begin() {
    const cond = Math.random() < 0.5 ? 'origin' : 'gloss'
    setCondition(cond)
    setStartedAt(new Date().toISOString())
    setStudyIndex(0)
    setPhase('study')
  }

  function nextStudy() {
    if (studyIndex + 1 < studyItems.length) {
      setStudyIndex(studyIndex + 1)
    } else {
      setPhase('test')
    }
  }

  function answer(charKey, choice) {
    setAnswers((prev) => ({ ...prev, [charKey]: choice }))
  }

  const score = testItems.reduce(
    (n, t) => n + (answers[t.char] === t.correct ? 1 : 0),
    0,
  )

  function results() {
    return {
      condition,
      startedAt,
      finishedAt: new Date().toISOString(),
      n_items: testItems.length,
      score,
      accuracy: +(score / testItems.length).toFixed(3),
      responses: testItems.map((t) => ({
        char: t.char,
        correct: t.correct,
        chosen: answers[t.char] ?? null,
        isCorrect: answers[t.char] === t.correct,
      })),
    }
  }

  function download() {
    const blob = new Blob([JSON.stringify(results(), null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `obc_result_${condition}_${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ---- INTRO ----
  if (phase === 'intro') {
    return (
      <div className="card">
        <h2 style={{ color: 'var(--accent)', marginTop: 0 }}>Learning Study</h2>
        <p>
          This short study tests whether seeing a character's <em>pictographic
          origin</em> helps you remember its meaning. You'll study {CHARACTERS.length}{' '}
          characters, then take a quick quiz. It takes about 3–4 minutes.
        </p>
        <p className="hint">
          You'll be randomly assigned to one of two study formats. Try to learn each
          character's meaning as well as you can.
        </p>
        <button className="tabs-cta" onClick={begin}>
          Start
        </button>
      </div>
    )
  }

  // ---- STUDY ----
  if (phase === 'study') {
    const item = studyItems[studyIndex]
    return (
      <div className="card">
        <p className="hint">
          Studying {studyIndex + 1} / {studyItems.length} · aim for ~{STUDY_SECONDS}s
          each
        </p>
        <div className="glyph-modern">{item.char}</div>

        {condition === 'origin' && (
          <div className="evolution">
            <div className="stage">
              <ObcImage entry={item} />
              <div className="glyph-label">oracle bone</div>
            </div>
            <div className="arrow">→</div>
            <div className="stage">
              <div className="glyph-modern" style={{ fontSize: '3rem' }}>
                {item.char}
              </div>
            </div>
          </div>
        )}

        <div className="meaning">
          <h2 style={{ textAlign: 'center' }}>{item.gloss}</h2>
          {condition === 'origin' && (
            <div className="origin">
              <strong>Origin:</strong> {item.origin}
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button onClick={nextStudy}>
            {studyIndex + 1 < studyItems.length ? 'Next' : 'Go to quiz'}
          </button>
        </div>
      </div>
    )
  }

  // ---- TEST ----
  if (phase === 'test') {
    const allAnswered = testItems.every((t) => answers[t.char] != null)
    return (
      <div className="card">
        <h2 style={{ color: 'var(--accent)', marginTop: 0 }}>Quiz</h2>
        <p className="hint">Pick the correct meaning for each character.</p>
        {testItems.map((t) => (
          <div key={t.char} style={{ margin: '18px 0' }}>
            <div style={{ fontSize: '2.4rem', textAlign: 'center' }}>{t.char}</div>
            <div
              style={{
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
                justifyContent: 'center',
                marginTop: 8,
              }}
            >
              {t.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => answer(t.char, opt)}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: '6px 12px',
                    cursor: 'pointer',
                    background:
                      answers[t.char] === opt ? 'var(--accent)' : '#fff',
                    color: answers[t.char] === opt ? '#fff' : 'var(--ink)',
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button disabled={!allAnswered} onClick={() => setPhase('done')}>
            {allAnswered ? 'See results' : 'Answer all to finish'}
          </button>
        </div>
      </div>
    )
  }

  // ---- DONE ----
  return (
    <div className="card">
      <h2 style={{ color: 'var(--accent)', marginTop: 0 }}>Results</h2>
      <p>
        You scored <strong>{score}</strong> / {testItems.length} (
        {Math.round((score / testItems.length) * 100)}%).
      </p>
      <p className="hint">
        Your study format was: <strong>{condition === 'origin' ? 'with pictographic origin' : 'gloss only'}</strong>.
        Download your result to contribute it to the dataset.
      </p>
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <button onClick={download}>Download my result (JSON)</button>
      </div>
    </div>
  )
}
