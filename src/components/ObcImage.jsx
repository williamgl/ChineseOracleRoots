import { useState } from 'react'

// Renders the oracle bone image for a character, with a graceful fallback when the
// image has not yet been extracted from the HUST-OBC dataset (see extract_obc.py).
export default function ObcImage({ entry, size = 84 }) {
  const [failed, setFailed] = useState(false)
  const src = entry.obcImage ? `${import.meta.env.BASE_URL}obc/${entry.obcImage}` : null

  if (!src || failed) {
    return (
      <div
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px dashed var(--border)',
          borderRadius: 10,
          color: 'var(--muted)',
          fontSize: '0.7rem',
          textAlign: 'center',
          padding: 4,
        }}
        title="Oracle bone image not yet extracted"
      >
        image pending
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={`Oracle bone form of ${entry.char}`}
      width={size}
      height={size}
      onError={() => setFailed(true)}
    />
  )
}
