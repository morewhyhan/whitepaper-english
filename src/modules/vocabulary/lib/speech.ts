'use client'

const CACHE_LIMIT = 60

let worker: Worker | null = null
let workerReady = false
let workerFailed = false
let requestId = 0
const pending = new Map<number, { resolve: (url: string | null) => void }>()
const pendingText = new Map<string, Promise<string | null>>()
const prefetchQueue = new Set<string>()
const audioCache = new Map<string, string>()
let currentAudio: HTMLAudioElement | null = null

function remember(text: string, url: string) {
  if (audioCache.size >= CACHE_LIMIT) {
    const oldest = audioCache.keys().next().value
    if (oldest) {
      const oldUrl = audioCache.get(oldest)
      if (oldUrl) URL.revokeObjectURL(oldUrl)
      audioCache.delete(oldest)
    }
  }
  audioCache.set(text, url)
}

function playUrl(url: string) {
  currentAudio?.pause()
  const audio = new Audio(url)
  currentAudio = audio
  void audio.play().catch(() => {})
}

export function stopSpeech() {
  currentAudio?.pause()
  currentAudio = null
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}

function pickSystemVoice(): SpeechSynthesisVoice | null {
  if (!('speechSynthesis' in window)) return null
  const voices = window.speechSynthesis
    .getVoices()
    .filter((voice) => voice.lang.toLowerCase().startsWith('en'))
  if (!voices.length) return null
  const preferred = [/natural/i, /neural/i, /online/i, /aria/i, /jenny/i, /guy/i, /samantha/i, /google us english/i, /zira/i, /ava/i]
  const avoid = /david|mark|espeak|compact|robot/i
  return (
    voices
      .map((voice) => {
        let score = 0
        if (voice.lang.toLowerCase() === 'en-us') score += 6
        else if (voice.lang.toLowerCase() === 'en-gb') score += 3
        if (voice.localService) score += 1
        if (voice.default) score += 1
        preferred.forEach((pattern, index) => {
          if (pattern.test(voice.name)) score += 12 - index
        })
        if (avoid.test(voice.name)) score -= 20
        return { voice, score }
      })
      .sort((a, b) => b.score - a.score)[0]?.voice ?? null
  )
}

function speakSystem(text: string) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  utterance.rate = 0.94
  utterance.pitch = 1
  const voice = pickSystemVoice()
  if (voice) utterance.voice = voice
  window.speechSynthesis.speak(utterance)
}

function ensureWorker() {
  if (typeof window === 'undefined' || worker || workerFailed) return
  try {
    worker = new Worker('/kokoro-worker.mjs', { type: 'module' })
  } catch {
    workerFailed = true
    return
  }
  worker.onmessage = (event) => {
    const data = event.data || {}
    if (data.type === 'ready') {
      workerReady = true
      for (const text of [...prefetchQueue].slice(0, 2)) {
        prefetchQueue.delete(text)
        void renderKokoro(text, false)
      }
      return
    }
    if (data.type === 'fatal') {
      workerFailed = true
      workerReady = false
      return
    }
    if (data.type === 'audio') {
      const waiter = pending.get(data.id)
      pending.delete(data.id)
      const url = URL.createObjectURL(new Blob([data.wav], { type: 'audio/wav' }))
      waiter?.resolve(url)
      return
    }
    if (data.type === 'error') {
      if (process.env.NODE_ENV !== 'production') console.warn('[speech] worker error', data.message)
      const waiter = pending.get(data.id)
      pending.delete(data.id)
      waiter?.resolve(null)
    }
  }
  worker.onerror = () => {
    workerFailed = true
    workerReady = false
    for (const waiter of pending.values()) waiter.resolve(null)
    pending.clear()
  }
  worker.postMessage({ type: 'load' })
}

export function warmSpeech() {
  ensureWorker()
}

function renderKokoro(text: string, priority: boolean): Promise<string | null> {
  if (!worker || !workerReady) return Promise.resolve(null)
  const cached = audioCache.get(text)
  if (cached) return Promise.resolve(cached)
  const existing = pendingText.get(text)
  if (existing) return existing
  const job = new Promise<string | null>((resolve) => {
    const id = ++requestId
    const timer = window.setTimeout(() => {
      pending.delete(id)
      resolve(null)
    }, 20_000)
    pending.set(id, {
      resolve: (url) => {
        window.clearTimeout(timer)
        if (url) remember(text, url)
        resolve(url)
      },
    })
    worker?.postMessage({ type: 'speak', id, text, priority })
  }).finally(() => pendingText.delete(text))
  pendingText.set(text, job)
  return job
}

export function prefetchSpeech(texts: string[]) {
  for (const text of new Set(texts.map((item) => item.trim()).filter(Boolean))) {
    if (audioCache.has(text) || pendingText.has(text)) continue
    if (workerReady) void renderKokoro(text, false)
    else prefetchQueue.add(text)
  }
}

async function speakKokoro(text: string, priority: boolean) {
  const url = await renderKokoro(text, priority)
  if (!url) return false
  playUrl(url)
  return true
}

export async function speakText(text: string) {
  if (typeof window === 'undefined') return
  const clean = text.trim()
  if (!clean) return
  stopSpeech()
  const cached = audioCache.get(clean)
  if (cached) {
    playUrl(cached)
    return
  }
  if (workerReady && (await speakKokoro(clean, true))) return
  speakSystem(clean)
  warmSpeech()
}

if (typeof window !== 'undefined') {
  ;(
    window as unknown as {
      __whiteSpeech: () => { ready: boolean; loading: boolean; cached: number }
    }
  ).__whiteSpeech = () => ({
    ready: workerReady,
    loading: Boolean(worker && !workerReady && !workerFailed),
    cached: audioCache.size,
  })
}
