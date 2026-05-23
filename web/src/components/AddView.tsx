import { useCallback, useRef, useState } from 'react'
import { uploadImage } from '../lib/cloudinary'
import { moderateImage } from '../lib/moderate'
import { useAuth } from '../hooks/useAuth'
import type { Face } from '../lib/types'

interface AddViewProps {
  onSubmit: (data: { imageId: string; locationName: string }) => Promise<Face>
  onDone: () => void
}

async function getLocationName(): Promise<string> {
  try {
    const pos = await new Promise<GeolocationPosition>((ok, fail) =>
      navigator.geolocation.getCurrentPosition(ok, fail, { timeout: 5000 }),
    )
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json&addressdetails=1`,
      { headers: { 'User-Agent': 'Faces/1.0 (https://faces.freeappstore.online)' } },
    )
    if (!res.ok) return ''
    const data = await res.json() as { address?: { city?: string; town?: string; village?: string; country?: string } }
    const a = data.address
    if (!a) return ''
    const city = a.city || a.town || a.village || ''
    return [city, a.country].filter(Boolean).join(', ')
  } catch {
    return ''
  }
}

type CheckState = 'idle' | 'checking' | 'pass' | 'fail'

export function AddView({ onSubmit, onDone }: AddViewProps) {
  const { user, signIn, signInWithGoogle } = useAuth()
  const fileRef = useRef<HTMLInputElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [checkState, setCheckState] = useState<CheckState>('idle')
  const [checkMessage, setCheckMessage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setCheckState('idle')
    setCheckMessage('')
    setError(null)
  }, [])

  const handleImageLoad = useCallback(async () => {
    if (!imgRef.current) return
    setCheckState('checking')
    setCheckMessage('Checking your photo...')
    try {
      const result = await moderateImage(imgRef.current)
      if (result.ok) {
        setCheckState('pass')
        setCheckMessage(result.age ? `Looks good! (age ~${result.age})` : 'Looks good!')
      } else {
        setCheckState('fail')
        setCheckMessage(result.reason || 'Photo rejected.')
      }
    } catch {
      setCheckState('pass')
      setCheckMessage('Check unavailable — proceed with caution.')
    }
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!file || checkState !== 'pass') return
    setUploading(true)
    setError(null)
    try {
      const [{ publicId }, locationName] = await Promise.all([
        uploadImage(file),
        getLocationName(),
      ])
      await onSubmit({ imageId: publicId, locationName })
      setFile(null)
      setPreview(null)
      setCheckState('idle')
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [file, checkState, onSubmit, onDone])

  const reset = useCallback(() => {
    setFile(null)
    setPreview(null)
    setCheckState('idle')
    setCheckMessage('')
    setError(null)
  }, [])

  if (!user) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 p-8 text-center">
        <div className="text-6xl">🫠</div>
        <p className="display-font text-2xl text-[var(--ink)]">Show your face</p>
        <p className="text-sm text-[var(--muted)]">Sign in to add yours to the wall.</p>
        <div className="flex flex-col gap-3">
          <button
            onClick={signInWithGoogle}
            className="flex w-56 items-center justify-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-gray-800"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Google
          </button>
          <button
            onClick={signIn}
            className="flex w-56 items-center justify-center gap-2 rounded-full border border-[var(--line-strong)] bg-[var(--glass)] px-6 py-2.5 text-sm font-semibold text-[var(--ink)]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
            GitHub
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      {!preview ? (
        <>
          <div className="flex h-48 w-48 items-center justify-center rounded-full border-2 border-dashed border-[var(--muted)]/30">
            <span className="text-5xl">📸</span>
          </div>
          <p className="text-sm text-[var(--muted)]">Take a selfie or pick a photo</p>
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded-full bg-[var(--accent)] px-8 py-3 text-sm font-bold text-black shadow-lg shadow-[var(--accent)]/20"
          >
            Choose Photo
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="user"
            onChange={handleFile}
            className="hidden"
          />
        </>
      ) : (
        <>
          <div className="h-56 w-56 overflow-hidden rounded-full">
            <img
              ref={imgRef}
              src={preview}
              alt="Preview"
              className="h-full w-full object-cover"
              crossOrigin="anonymous"
              onLoad={handleImageLoad}
            />
          </div>

          <div className="flex items-center gap-2 text-sm">
            {checkState === 'checking' && (
              <span className="text-[var(--muted)] animate-pulse">{checkMessage}</span>
            )}
            {checkState === 'pass' && (
              <span className="text-[var(--success)]">{checkMessage}</span>
            )}
            {checkState === 'fail' && (
              <span className="text-[var(--error)]">{checkMessage}</span>
            )}
          </div>

          {error && <p className="text-sm text-[var(--error)]">{error}</p>}

          <div className="flex gap-3">
            <button
              onClick={reset}
              className="rounded-full border border-[var(--line-strong)] px-6 py-2.5 text-sm font-semibold text-[var(--muted)]"
            >
              Retake
            </button>
            <button
              onClick={handleSubmit}
              disabled={uploading || checkState !== 'pass'}
              className="rounded-full bg-[var(--accent)] px-8 py-2.5 text-sm font-bold text-black disabled:opacity-30"
            >
              {uploading ? 'Adding...' : 'Add to wall'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
