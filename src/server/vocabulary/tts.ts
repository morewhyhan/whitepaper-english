import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'

const VOICE = 'en-US-AriaNeural'
const CACHE_LIMIT = 200
const cache = new Map<string, Buffer>()
let engine: Promise<MsEdgeTTS> | null = null
let queue: Promise<unknown> = Promise.resolve()

async function getEngine() {
  if (!engine) {
    engine = (async () => {
      const tts = new MsEdgeTTS({
        connectionTimeoutMs: 10_000,
        synthesisTimeoutMs: 20_000,
      })
      await tts.setMetadata(VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3)
      return tts
    })().catch((error) => {
      engine = null
      throw error
    })
  }
  return engine
}

async function render(text: string): Promise<Buffer> {
  const cached = cache.get(text)
  if (cached) return cached

  const tts = await getEngine()
  const { audioStream } = await tts.toStream(text)
  const chunks: Buffer[] = []
  for await (const chunk of audioStream) chunks.push(Buffer.from(chunk))
  const audio = Buffer.concat(chunks)
  if (!audio.length) throw new Error('empty audio')

  if (cache.size >= CACHE_LIMIT) {
    const oldest = cache.keys().next().value
    if (oldest) cache.delete(oldest)
  }
  cache.set(text, audio)
  return audio
}

export function synthesizeSpeech(text: string): Promise<Buffer> {
  const result = queue.then(() => render(text))
  queue = result.catch(() => undefined)
  return result
}

export function warmTts() {
  void getEngine().catch(() => undefined)
}
