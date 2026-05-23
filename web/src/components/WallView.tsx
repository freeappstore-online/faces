import { useState } from 'react'
import type { Face } from '../lib/types'

interface WallViewProps {
  faces: Face[]
}

export function WallView({ faces }: WallViewProps) {
  const [selected, setSelected] = useState<Face | null>(null)

  if (faces.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-center">
        <div>
          <p className="display-font text-3xl text-[var(--ink)]">No faces yet</p>
          <p className="mt-3 text-sm text-[var(--muted)]">Be the first. Tap Snap.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto px-1 pt-1">
        <div className="flex flex-wrap justify-center gap-1">
          {faces.map((face, i) => {
            const big = i % 7 === 0
            const size = big ? 'h-28 w-28' : 'h-20 w-20'
            return (
              <button
                key={face.id}
                onClick={() => setSelected(face)}
                className={`${size} shrink-0 overflow-hidden rounded-full`}
              >
                <img
                  src={face.thumbUrl}
                  alt="face"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </button>
            )
          })}
        </div>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/90 p-6"
          onClick={() => setSelected(null)}
        >
          <div className="relative max-h-[80vh] max-w-sm" onClick={(e) => e.stopPropagation()}>
            <img
              src={selected.imageUrl}
              alt="face"
              className="max-h-[80vh] w-full rounded-3xl object-cover"
            />
            {selected.locationName && (
              <div className="absolute inset-x-0 bottom-0 rounded-b-3xl bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-8 text-center">
                <span className="text-sm font-medium text-white/90">{selected.locationName}</span>
              </div>
            )}
            <button
              onClick={() => setSelected(null)}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white/80 backdrop-blur"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </>
  )
}
