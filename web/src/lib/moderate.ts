/**
 * Client-side image moderation using face-api.js + nsfwjs.
 * All models run in the browser — nothing leaves the device until approved.
 *
 * Checks:
 * 1. Exactly one face detected (selfie, not group photo or no-face)
 * 2. Estimated age >= 18
 * 3. No nudity/porn (nsfwjs)
 */

declare global {
  interface Window { faceapi: any }
}

export interface ModerationResult {
  ok: boolean
  reason?: string
  age?: number
}

let faceApiLoaded = false
let nsfwModel: any = null

async function ensureFaceApi(): Promise<any> {
  if (window.faceapi && faceApiLoaded) return window.faceapi

  if (!window.faceapi) {
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement('script')
      s.src = '/vendor/face-api.min.js'
      s.onload = () => resolve()
      s.onerror = () => reject(new Error('Failed to load face-api.js'))
      document.head.appendChild(s)
    })
  }

  const f = window.faceapi
  await f.nets.tinyFaceDetector.loadFromUri('/models')
  await f.nets.ageGenderNet.loadFromUri('/models')
  faceApiLoaded = true
  return f
}

async function ensureNsfwModel(): Promise<any> {
  if (nsfwModel) return nsfwModel
  const nsfwjs = await import('nsfwjs')
  nsfwModel = await nsfwjs.load()
  return nsfwModel
}

function imageToCanvas(img: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  canvas.getContext('2d')!.drawImage(img, 0, 0)
  return canvas
}

export async function moderateImage(img: HTMLImageElement): Promise<ModerationResult> {
  // Load models in parallel
  const [faceapi, nsfw] = await Promise.all([ensureFaceApi(), ensureNsfwModel()])

  // Face detection + age
  const opts = new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 })
  const detections = await faceapi.detectAllFaces(img, opts).withAgeAndGender()

  if (detections.length === 0) {
    return { ok: false, reason: 'No face detected. Please use a clear selfie.' }
  }
  if (detections.length > 1) {
    return { ok: false, reason: 'Multiple faces detected. Please use a solo selfie.' }
  }

  const age = Math.round(detections[0].age)
  if (age < 18) {
    return { ok: false, reason: `You must be 18+ to post. Estimated age: ${age}.`, age }
  }

  // NSFW check
  const canvas = imageToCanvas(img)
  const predictions = await nsfw.classify(canvas)
  const scores: Record<string, number> = {}
  for (const p of predictions) scores[p.className] = p.probability

  const pornScore = (scores['Porn'] || 0) + (scores['Hentai'] || 0)
  const sexyScore = scores['Sexy'] || 0
  if (pornScore > 0.3 || sexyScore > 0.5) {
    return { ok: false, reason: 'Image flagged as inappropriate. Please use a different photo.' }
  }

  return { ok: true, age }
}
