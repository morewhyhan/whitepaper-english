'use client'

import type { KokoroTTS } from 'kokoro-js'

const MODEL_ID = 'onnx-community/Kokoro-82M-v1.0-ONNX'
const VOICE = 'af_heart'
const CACHE_LIMIT = 60

let kokoro: KokoroTTS | null = null
let loading: Promise<KokoroTTS | null> | null = null
let currentAudio: HTMLAudioElement | null = null
const audioCache = new Map<string, string>()
const pending = new Map<string, Promise<string | null>>()
const HF_PREFIX =
  'https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main/'
let localFetchInstalled = false

function installLocalModelFetch() {
  if (localFetchInstalled) return
  localFetchInstalled = true
  const original = window.fetch.bind(window)
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    if (url.startsWith(HF_PREFIX)) {
      const local = '/kokoro/' + url.slice(HF_PREFIX.length).split('?')[0]
      if (process.env.NODE_ENV !== 'production') console.info('[speech] local model', local)
      return original(local, init)
    }
    return original(input, init)
  }
}

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
  void audio.play().catch(() => {
    // Autoplay can be blocked after an await; the next gesture will retry.
  })
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
  const voices = window.speechSynthesis.getVoices()
  const english = voices.filter((voice) => voice.lang.toLowerCase().startsWith('en'))
  if (!english.length) return null

  const preferred = [
    /natural/i,
    /neural/i,
    /online/i,
    /aria/i,
    /jenny/i,
    /guy/i,
    /samantha/i,
    /google us english/i,
    /zira/i,
    /ava/i,
  ]
  const avoid = /david|mark|espeak|compact|robot/i

  return (
    english
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

export function warmSpeech() {
  if (typeof window === 'undefined' || kokoro || loading) return
  installLocalModelFetch()

  // Loaded at runtime so the 50MB browser TTS graph never enters the app bundle.
  const loadKokoro = new Function(
    'return import("https://cdn.jsdelivr.net/npm/kokoro-js@1.2.1/+esm")',
  ) as () => Promise<{
    KokoroTTS: typeof import('kokoro-js').KokoroTTS
    env: { wasmPaths: string }
  }>

  const load = loadKokoro().then(({ KokoroTTS, env }) => {
    if (process.env.NODE_ENV !== 'production') console.info('[speech] module loaded')
    env.wasmPaths = window.location.origin + '/ort/'
    return KokoroTTS.from_pretrained(MODEL_ID, {
      dtype: 'q8',
      device: 'wasm',
      progress_callback: (progress) => {
        if (progress.status === 'done' && process.env.NODE_ENV !== 'production') {
          console.info('[speech] model file ready', progress.file)
        }
      },
    })
  })

  loading = Promise.race([
    load,
    new Promise<null>((resolve) => window.setTimeout(() => resolve(null), 120_000)),
  ])
    .then((instance) => {
      if (instance) kokoro = instance
      return instance
    })
    .catch((error) => {
      if (process.env.NODE_ENV !== 'production') console.warn('[speech] Kokoro load failed', error)
      return null
    })
    .finally(() => {
      loading = null
    })
}

async function renderKokoro(text: string): Promise<string | null> {
  if (!kokoro) return null
  const cached = audioCache.get(text)
  if (cached) return cached
  const existing = pending.get(text)
  if (existing) return existing
  const job = kokoro
    .generate(text, { voice: VOICE, speed: 0.94 })
    .then((audio) => {
      const url = URL.createObjectURL(audio.toBlob())
      remember(text, url)
      return url
    })
    .catch((error) => {
      if (process.env.NODE_ENV !== 'production')
        console.warn('[speech] Kokoro generate failed', error)
      return null
    })
    .finally(() => pending.delete(text))
  pending.set(text, job)
  return job
}

export function prefetchSpeech(texts: string[]) {
  if (!kokoro) return
  for (const raw of new Set(texts.map((text) => text.trim()).filter(Boolean))) {
    if (audioCache.has(raw) || pending.has(raw)) continue
    void renderKokoro(raw)
  }
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

  if (kokoro) {
    const url = await renderKokoro(clean)
    if (url) {
      playUrl(url)
      return
    }
  }

  speakSystem(clean)
  warmSpeech()
}

if (typeof window !== 'undefined') {
  ;(
    window as unknown as { __whiteSpeech: () => { ready: boolean; loading: boolean } }
  ).__whiteSpeech = () => ({
    ready: Boolean(kokoro),
    loading: Boolean(loading),
    cached: audioCache.size,
  })
}
