import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { readSources, validateTranslationBatch } from './association-translations.mjs'

function readOption(name, fallback) {
  const index = process.argv.indexOf(name)
  return index < 0 ? fallback : process.argv[index + 1]
}

const start = Number(readOption('--start', '0'))
const limit = Number(readOption('--limit', '100'))
const output = readOption('--out', '')
if (!Number.isInteger(start) || start < 0 || !Number.isInteger(limit) || limit < 1) {
  throw new Error('用法：--start 非负整数 --limit 正整数 [--out 文件路径]')
}

const { linksById } = readSources()
const pending = [...linksById.values()].filter(({ id, target, targetZh, word, sentence, link }) => {
  const task = { id, target, targetZh, word, sentence }
  const hasBothFields = Boolean(link.wordZh?.trim() && link.sentenceZh?.trim())
  if (!hasBothFields) return true
  return (
    validateTranslationBatch(
      [task],
      [
        {
          id,
          wordZh: link.wordZh,
          sentenceZh: link.sentenceZh,
        },
      ],
    ).length > 0
  )
})
if (start >= pending.length) throw new Error(`起始位置超过待处理例句总数 ${pending.length}`)

const records = pending
  .slice(start, start + limit)
  .map(({ id, target, targetZh, word, sentence }) => ({
    id,
    target,
    targetZh,
    word,
    sentence,
  }))
const batch = {
  batchId: `associations-pending-${String(start).padStart(5, '0')}-${String(start + records.length - 1).padStart(5, '0')}`,
  sourceRange: { start, count: records.length, pendingTotal: pending.length },
  translationRequirements: [
    'Translate every English sentence into faithful, natural Simplified Chinese; preserve tense, negation, number, tone, and all key information.',
    'wordZh is the peripheral word meaning in this sentence and must appear as an exact contiguous substring in sentenceZh.',
    'sentenceZh must contain an exact Chinese term from targetZh so the center word can be highlighted using the vocabulary gloss.',
    'Return the same batchId and one record per input id, in the same order, with only id, wordZh, and sentenceZh.',
    'Do not change, remove, deduplicate, or add source records. Do not include parentheses, pinyin, or explanations.',
  ],
  records,
}
const serialized = `${JSON.stringify(batch, null, 2)}\n`

if (output) {
  const destination = resolve(output)
  mkdirSync(dirname(destination), { recursive: true })
  writeFileSync(destination, serialized, 'utf8')
  console.log(`已导出 ${records.length} 条任务：${destination}`)
} else {
  process.stdout.write(serialized)
}
