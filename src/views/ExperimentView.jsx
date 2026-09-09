import { useState, useMemo } from 'react'
import { UNIQUE_CHARACTERS as CHARACTERS } from '../data/characters.js'
import ObcImage from '../components/ObcImage.jsx'
import {
  STUDY_SET_SIZE,
  newParticipantId,
  assignCondition,
  selectStudyItems,
  buildTest,
  scoreAnswers,
  makeResult,
  resultFilename,
} from '../lib/experiment.js'

// ---------------------------------------------------------------------------
// Experiment design (between-subjects, single session):
//
//   Independent variable: study condition
//     - "origin" : study screen shows the oracle bone image + pictographic origin
//     - "gloss"  : study screen shows only the character + English gloss
//   Dependent variable: test accuracy (proportion of meanings correctly recalled)
//
//   Hypothesis (dual coding + elaborative encoding): the "origin" group scores
//   higher than the "gloss" group.
//
//   Flow: intro -> study (self-paced) -> test (4-option MC) -> results (export JSON).
//
//   All non-UI logic lives in ../lib/experiment.js so it can be unit tested.
// ---------------------------------------------------------------------------

const STUDY_SECONDS = 8 // suggested per-item study time (hint only, not enforced)

export default function ExperimentView() {
  const [phase, setPhase] = useState('intro') // intro|study|test|done
  const [participantId] = useState(newParticipantId)
  const [condition, setCondition] = useState(null) // origin|gloss
  const [studyIndex, setStudyIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [startedAt, setStartedAt] = useState(null)

  // Fixed randomized sample + test for this session.
  const studyItems = useMemo(
    () => selectStudyItems(CHARACTERS, STUDY_SET_SIZE),
    [],
  )
  const testItems = useMemo(() => buildTest(studyItems), [studyItems])

  function begin() {
    setCondition(assignCondition())
    setStartedAt(new Date().toISOString())
    setStudyIndex(0)
    setPhase('study')
  }

  function nextStudy() {
    if (studyIndex + 1 < studyItems.length) setStudyIndex(studyIndex + 1)
    else setPhase('test')
  }

  function answer(charKey, choice) {
    setAnswers((prev) => ({ ...prev, [charKey]: choice }))
  }

  const { score } = scoreAnswers(testItems, answers)

  function download() {
    const result = makeResult({
      participantId,
      condition,
      startedAt,
      finishedAt: new Date().toISOString(),
      testItems,
      answers,
    })
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = resultFilename(condition)
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
          origin</em> helps you remember its meaning. You'll study{' '}
          {studyItems.length} characters, then take a quick quiz. It takes about 3–5
          minutes.
        </p>
        <p className="hint">
          You'll be randomly assigned to one of two study formats. Try to learn each
          character's meaning as well as you can. No personal information is collected.
        </p>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button onClick={begin}>Start</button>
        </div>
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
                    background: answers[t.char] === opt ? 'var(--accent)' : '#fff',
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
        Your study format was:{' '}
        <strong>
          {condition === 'origin' ? 'with pictographic origin' : 'gloss only'}
        </strong>
        . Download your result to contribute it to the dataset.
      </p>
      <p className="hint">Participant ID: {participantId}</p>
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <button onClick={download}>Download my result (JSON)</button>
      </div>
    </div>
  )
}
