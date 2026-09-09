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

  function clearSelection() {
    setResult(null)
    setNotFound(false)
    setQuery('')
  }

  // The full character picker — always visible so the user can switch at any time.
  const picker = (
    <div className="card" style={{ marginTop: 16 }}>
      <p className="hint">
        {result ? 'Pick another character:' : 'Or pick a character:'}
      </p>
      <div className="suggestions">
        {CHARACTERS.map((c) => (
          <button
            key={c.char}
            onClick={() => lookup(c.char)}
            className={result && result.char === c.char ? 'picked' : ''}
            title={c.gloss}
          >
            {c.char}
          </button>
        ))}
      </div>
    </div>
  )

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

      {notFound && (
        <div className="card">
          <p className="hint">
            "{query}" is not in the curated set yet. Pick one below.
          </p>
        </div>
      )}

      {result && (
        <div className="card">
          <div style={{ marginBottom: 8 }}>
            <button className="link-back" onClick={clearSelection}>
              ← Back to all characters
            </button>
          </div>

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

      {/* Always available, whether or not something is selected. */}
      {picker}
    </div>
  )
}
