import { describe, it, expect } from 'vitest'
import {
  N_OPTIONS,
  shuffle,
  newParticipantId,
  assignCondition,
  selectStudyItems,
  buildTest,
  scoreAnswers,
  makeResult,
  resultFilename,
} from './experiment.js'

const SAMPLE = [
  { char: '日', gloss: 'sun; day' },
  { char: '月', gloss: 'moon; month' },
  { char: '山', gloss: 'mountain' },
  { char: '水', gloss: 'water' },
  { char: '火', gloss: 'fire' },
  { char: '木', gloss: 'tree; wood' },
]

// Deterministic RNG for reproducible tests.
function seeded(seq) {
  let i = 0
  return () => seq[i++ % seq.length]
}

describe('shuffle', () => {
  it('returns a permutation without mutating the input', () => {
    const input = [1, 2, 3, 4, 5]
    const copy = [...input]
    const out = shuffle(input)
    expect(input).toEqual(copy) // not mutated
    expect(out.slice().sort()).toEqual(input.slice().sort()) // same elements
  })
})

describe('newParticipantId', () => {
  it('is opaque, prefixed, and unique across calls', () => {
    const a = newParticipantId()
    const b = newParticipantId()
    expect(a).toMatch(/^p-[0-9a-f]+$/)
    expect(a).not.toEqual(b)
  })
})

describe('assignCondition', () => {
  it('returns only valid conditions', () => {
    for (let i = 0; i < 50; i++) {
      expect(['origin', 'gloss']).toContain(assignCondition())
    }
  })
  it('is roughly balanced over many draws', () => {
    let origin = 0
    const N = 4000
    for (let i = 0; i < N; i++) if (assignCondition() === 'origin') origin++
    const ratio = origin / N
    expect(ratio).toBeGreaterThan(0.4)
    expect(ratio).toBeLessThan(0.6)
  })
})

describe('selectStudyItems', () => {
  it('caps at the requested size', () => {
    expect(selectStudyItems(SAMPLE, 3)).toHaveLength(3)
  })
  it('returns the whole set when smaller than size', () => {
    expect(selectStudyItems(SAMPLE, 100)).toHaveLength(SAMPLE.length)
  })
  it('handles empty input', () => {
    expect(selectStudyItems([], 5)).toEqual([])
  })
})

describe('buildTest', () => {
  it('creates one question per item with N unique options incl. the correct one', () => {
    const test = buildTest(SAMPLE)
    expect(test).toHaveLength(SAMPLE.length)
    for (const q of test) {
      expect(q.options).toHaveLength(N_OPTIONS)
      expect(new Set(q.options).size).toBe(N_OPTIONS) // unique
      expect(q.options).toContain(q.correct)
    }
  })
  it('randomizes the correct-option position across items (not always index 0)', () => {
    const test = buildTest(SAMPLE, seeded([0.9, 0.1, 0.5, 0.3, 0.7, 0.2]))
    const positions = test.map((q) => q.options.indexOf(q.correct))
    expect(new Set(positions).size).toBeGreaterThan(1)
  })
})

describe('scoreAnswers', () => {
  const test = [
    { char: '日', correct: 'sun; day' },
    { char: '月', correct: 'moon; month' },
    { char: '山', correct: 'mountain' },
    { char: '水', correct: 'water' },
  ]
  it('counts correct answers and computes accuracy', () => {
    const answers = {
      '日': 'sun; day',
      '月': 'moon; month',
      '山': 'water', // wrong
      '水': 'water',
    }
    expect(scoreAnswers(test, answers)).toEqual({ score: 3, accuracy: 0.75 })
  })
  it('handles empty test', () => {
    expect(scoreAnswers([], {})).toEqual({ score: 0, accuracy: 0 })
  })
})

describe('makeResult', () => {
  const testItems = [
    { char: '日', correct: 'sun; day' },
    { char: '月', correct: 'moon; month' },
  ]
  const answers = { '日': 'sun; day', '月': 'water' }
  const result = makeResult({
    participantId: 'p-abc123',
    condition: 'origin',
    startedAt: '2026-01-01T00:00:00.000Z',
    finishedAt: '2026-01-01T00:03:00.000Z',
    testItems,
    answers,
  })

  it('has the documented shape and values', () => {
    expect(result.app).toBe('ChineseOracleRoots')
    expect(result.version).toBe(1)
    expect(result.participantId).toBe('p-abc123')
    expect(result.condition).toBe('origin')
    expect(result.nItems).toBe(2)
    expect(result.score).toBe(1)
    expect(result.accuracy).toBe(0.5)
    expect(result.responses).toHaveLength(2)
    expect(result.responses[0]).toMatchObject({
      char: '日', correct: 'sun; day', chosen: 'sun; day', isCorrect: true,
    })
    expect(result.responses[1].isCorrect).toBe(false)
  })

  it('contains no personally identifying fields', () => {
    const keys = JSON.stringify(result).toLowerCase()
    for (const banned of ['name', 'email', 'ip', 'address', 'phone']) {
      expect(keys).not.toContain(`"${banned}"`)
    }
  })
})

describe('resultFilename', () => {
  it('encodes condition and timestamp as json', () => {
    expect(resultFilename('gloss', 123)).toBe('chineseoracleroots_gloss_123.json')
  })
})
