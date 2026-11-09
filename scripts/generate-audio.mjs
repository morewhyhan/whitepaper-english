import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { spawn } from 'node:child_process'
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'

const root = process.cwd()
const wordsPath = join(root, 'src/modules/vocabulary/data/parallel-world.json')
const assocPath = join(root, 'src/modules/vocabulary/data/associations.json')
const audioDir = join(root, 'public/audio')
mkdirSync(audioDir, { recursive: true })

const wordsData = JSON.parse(readFileSync(wordsPath, 'utf8'))
const assocData = JSON.parse(readFileSync(assocPath, 'utf8'))
const hash = (text) => createHash('sha1').update(text).digest('hex')
const texts = new Map()
for (const word of wordsData.entries) texts.set(word.en, hash(word.en))
for (const network of Object.values(assocData)) {
  for (const link of network.links) texts.set(link.sentence, hash(link.sentence))
}
const limit = Number(process.env.AUDIO_LIMIT || 0)
const list = [...texts.entries()].slice(0, limit || undefined)
const order = process.env.AUDIO_REVERSE ? [...list].reverse() : list

function convert(input, output) {
  return new Promise((resolve, reject) => {
    const child = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-i', input, '-c:a', 'libopus', '-b:a', '16k', '-ar', '24000', '-ac', '1', output])
    child.on('error', reject)
    child.on('close', (code) => (code === 0 ? resolve() : reject(new Error('ffmpeg ' + code))))
  })
}

async function makeEngine() {
  const tts = new MsEdgeTTS({ connectionTimeoutMs: 20_000, synthesisTimeoutMs: 30_000 })
  await tts.setMetadata('en-US-AriaNeural', OUTPUT_FORMAT.WEBM_24KHZ_16BIT_MONO_OPUS)
  return tts
}

async function render(engine, text, output) {
  const temp = output + '.' + process.pid + '.raw.webm'
  const { audioStream } = await engine.toStream(text)
  const chunks = []
  for await (const chunk of audioStream) chunks.push(Buffer.from(chunk))
  writeFileSync(temp, Buffer.concat(chunks))
  await convert(temp, output)
  rmSync(temp, { force: true })
}

let cursor = 0
let done = 0
let failed = 0
const started = Date.now()
const workers = Number(process.env.AUDIO_WORKERS || 8)

async function worker(index) {
  let engine = await makeEngine()
  while (cursor < order.length) {
    const current = cursor++
    const [text, name] = order[current]
    const output = join(audioDir, name + '.webm')
    if (existsSync(output) && statSync(output).size > 0) {
      done += 1
      continue
    }
    let ok = false
    for (let attempt = 0; attempt < 3 && !ok; attempt += 1) {
      try {
        await render(engine, text, output)
        ok = true
      } catch (error) {
        engine = await makeEngine().catch(() => engine)
      }
    }
    if (ok) done += 1
    else failed += 1
    if ((done + failed) % 100 === 0) {
      console.log('progress', done + failed, '/', list.length, 'failed', failed, 'sec', Math.round((Date.now() - started) / 1000))
    }
  }
}

await Promise.all(Array.from({ length: workers }, (_, index) => worker(index)))
console.log('finished', done, 'failed', failed, 'sec', Math.round((Date.now() - started) / 1000))

if (!limit) {
  for (const word of wordsData.entries) word.audio = '/audio/' + hash(word.en) + '.webm'
  for (const network of Object.values(assocData)) {
    for (const link of network.links) link.audio = '/audio/' + hash(link.sentence) + '.webm'
  }
  writeFileSync(wordsPath, JSON.stringify(wordsData, null, 2) + '\n')
  writeFileSync(assocPath, JSON.stringify(assocData, null, 2) + '\n')
}
