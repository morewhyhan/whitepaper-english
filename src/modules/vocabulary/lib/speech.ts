'use client'

const CACHE_LIMIT = 100
const cache = new Map<string, HTMLAudioElement>()
let current: HTMLAudioElement | null = null

function urlFor(text: string, audio?: string) {
  return audio || '/api/vocabulary/tts?text=' + encodeURIComponent(text)
}

function audioFor(text: string, audioUrl?: string) {
  const key = audioUrl || text
  const cached = cache.get(key)
  if (cached) return cached
  const audio = new Audio(urlFor(text, audioUrl))
  audio.preload = 'auto'
  audio.load()
  if (cache.size >= CACHE_LIMIT) {
    const oldest = cache.keys().next().value
    if (oldest) {
      const old = cache.get(oldest)
      if (old) {
        old.pause()
        old.removeAttribute('src')
        old.load()
      }
      cache.delete(oldest)
    }
  }
  cache.set(key, audio)
  return audio
}

export function stopSpeech() {
  if (current) {
    current.pause()
    current.currentTime = 0
    current = null
  }
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

export function warmSpeech() {}
export function prefetchSpeech(items: Array<{ text: string; audio?: string }>) {
  const seen = new Set<string>()
  for (const item of items) {
    const text = item.text.trim()
    if (!text || !item.audio || seen.has(text)) continue
    seen.add(text)
    audioFor(text, item.audio)
  }
}

export async function speakText(text: string, audioUrl?: string) {
  if (typeof window === 'undefined') return
  const clean = text.trim()
  if (!clean) return
  stopSpeech()
  const audio = audioFor(clean, audioUrl)
  current = audio
  audio.currentTime = 0
  try {
    await audio.play()
  } catch {
    if (current === audio) current = null
    speakSystem(clean)
  }
}
