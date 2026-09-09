import { useState } from 'react'

// Renders the oracle bone image for a character, with a graceful fallback when the
// image is missing or has not yet been extracted from the HUST-OBC dataset.
export default function ObcImage({ entry, size = 84 }) {
  const src = entry.obcImage ? `${import.meta.env.BASE_URL}obc/${entry.obcImage}` : null

  // Track which src failed to load. We store the failed src (not a boolean) so the
  // fallback only applies to that specific image. When the parent switches to a
  // different character, `src` changes and the stale failure no longer matches,
  // so the new (valid) image is attempted instead of staying stuck on "pending".
  const [failedSrc, setFailedSrc] = useState(null)

  const showFallback = !src || failedSrc === src

  if (showFallback) {
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
        title="Oracle bone image not available"
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
      onError={() => setFailedSrc(src)}
    />
  )
}
