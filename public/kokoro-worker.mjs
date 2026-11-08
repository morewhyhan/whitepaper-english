const HF_PREFIX = 'https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main/'
const nativeFetch = self.fetch.bind(self)
self.fetch = (input, init) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
  if (url.startsWith(HF_PREFIX)) {
    return nativeFetch(self.location.origin + '/kokoro/' + url.slice(HF_PREFIX.length).split('?')[0], init)
  }
  return nativeFetch(input, init)
}

let tts = null
let loading = null
let busy = false
const queue = []

function post(message, transfer) {
  self.postMessage(message, transfer)
}

async function ensureModel() {
  if (tts) return tts
  if (!loading) {
    loading = (async () => {
      const { KokoroTTS, env } = await import('https://cdn.jsdelivr.net/npm/kokoro-js@1.2.1/+esm')
      env.wasmPaths = self.location.origin + '/ort/'
      const threads = Math.max(1, Math.min(4, navigator.hardwareConcurrency || 2))
      if (env.backends?.onnx?.wasm) env.backends.onnx.wasm.numThreads = threads
      let device = 'wasm'
      try {
        const adapter = navigator.gpu ? await navigator.gpu.requestAdapter() : null
        if (adapter) device = 'webgpu'
      } catch {
        device = 'wasm'
      }
      try {
        tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', {
          dtype: 'q8',
          device,
        })
      } catch {
        tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', {
          dtype: 'q8',
          device: 'wasm',
        })
      }
      post({ type: 'ready' })
      return tts
    })().catch((error) => {
      post({ type: 'fatal', message: String(error) })
      throw error
    })
  }
  return loading
}

async function pump() {
  if (busy) return
  busy = true
  while (queue.length) {
    const job = queue.shift()
    try {
      const model = await ensureModel()
      const audio = await model.generate(job.text, { voice: 'af_heart', speed: 0.94 })
      console.info('[kokoro-worker] generated', job.text.slice(0, 30))
      const wav = audio.toWav()
      const buffer = wav instanceof ArrayBuffer ? wav : wav.buffer.slice(wav.byteOffset, wav.byteOffset + wav.byteLength)
      post({ type: 'audio', id: job.id, wav: buffer }, [buffer])
    } catch (error) {
      console.error('[kokoro-worker] failed', error)
      post({ type: 'error', id: job.id, message: String(error) })
    }
  }
  busy = false
}

self.onmessage = (event) => {
  const data = event.data || {}
  if (data.type === 'load') {
    ensureModel().catch(() => {})
    return
  }
  if (data.type === 'speak') {
    if (data.priority) queue.unshift({ id: data.id, text: data.text })
    else queue.push({ id: data.id, text: data.text })
    pump()
  }
}
