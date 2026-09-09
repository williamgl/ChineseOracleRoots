import { useState } from 'react'
import { CHARACTERS, CHAR_INDEX } from '../data/characters.js'
import ObcImage from '../components/ObcImage.jsx'

export default function ToolView() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState(null)
  const [notFound, setNotFound] = useState(false)

  function lookup(raw) {
    const ch = (raw ?? query).trim()
    if (!ch) return
    // Use the first character only, so pasting a word still resolves.
    const first = [...ch][0]
    const entry = CHAR_INDEX[first]
    if (entry) {
      setResult(entry)
      setNotFound(false)
      setQuery(first)
    } else {
      setResult(null)
      setNotFound(true)
    }
  }

  return (
    <div>
      <div className="search-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && lookup()}
          placeholder="Enter a character, e.g. 日"
          aria-label="Character to look up"
        />
        <button onClick={() => lookup()}>Look up</button>
      </div>

      {!result && !notFound && (
        <div className="card">
          <p className="hint">
            Type a Chinese character or Japanese kanji above, or pick one:
          </p>
          <div className="suggestions">
            {CHARACTERS.map((c) => (
              <button key={c.char} onClick={() => lookup(c.char)}>
                {c.char}
              </button>
            ))}
          </div>
        </div>
      )}

      {notFound && (
        <div className="card">
          <p className="hint">
            "{query}" is not in the curated set yet. Try one of these:
          </p>
          <div className="suggestions">
            {CHARACTERS.map((c) => (
              <button key={c.char} onClick={() => lookup(c.char)}>
                {c.char}
              </button>
            ))}
          </div>
        </div>
      )}

      {result && (
        <div className="card">
          <div className="glyph-modern">{result.char}</div>
          <div className="glyph-label">modern form</div>

          <div className="evolution">
            <div className="stage">
              <ObcImage entry={result} />
              <div className="glyph-label">oracle bone (甲骨文)</div>
            </div>
            <div className="arrow">→</div>
            <div className="stage">
              <div className="glyph-modern" style={{ fontSize: '3.5rem' }}>
                {result.char}
              </div>
              <div className="glyph-label">today</div>
            </div>
          </div>

          <div className="meaning">
            <h2>
              {result.gloss} <span className="pinyin">({result.pinyin})</span>
            </h2>
            <div className="origin">
              <strong>Pictographic origin:</strong> {result.origin}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
