import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { validateTranslationBatch } from './association-translations.mjs'

const [tasksPath, translationsPath, outputDirectory] = process.argv.slice(2)
if (!tasksPath || !translationsPath || !outputDirectory) {
  throw new Error(
    '用法：node scripts/split-association-translation-batch.mjs <tasks.json> <translations.json> <输出目录>',
  )
}

const tasksBatch = JSON.parse(readFileSync(resolve(tasksPath), 'utf8'))
const translationsBatch = JSON.parse(readFileSync(resolve(translationsPath), 'utf8'))
if (tasksBatch.batchId !== translationsBatch.batchId) {
  throw new Error('任务和翻译的 batchId 不一致')
}

const taskById = new Map((tasksBatch.records ?? []).map((task) => [task.id, task]))
const translationById = new Map(
  (translationsBatch.records ?? []).map((translation) => [translation.id, translation]),
)
const seenSentences = new Set()
const acceptedTasks = []
const acceptedTranslations = []
const rejected = []

for (const task of tasksBatch.records ?? []) {
  const translation = translationById.get(task.id)
  const errors = validateTranslationBatch([task], translation ? [translation] : [])
  if (translation?.sentenceZh && seenSentences.has(translation.sentenceZh.trim())) {
    errors.push(`${task.id}: 本批 sentenceZh 重复`)
  }
  if (translation?.sentenceZh) seenSentences.add(translation.sentenceZh.trim())
  if (errors.length) {
    rejected.push({ id: task.id, errors })
  } else {
    acceptedTasks.push(task)
    acceptedTranslations.push(translation)
  }
}

const directory = resolve(outputDirectory)
mkdirSync(directory, { recursive: true })
const suffix = tasksBatch.batchId.replace(/^associations-/, '')
const acceptedBatchId = `${tasksBatch.batchId}-accepted`
const acceptedTasksPath = `${directory}/tasks-${suffix}-accepted.json`
const acceptedTranslationsPath = `${directory}/translations-${suffix}-accepted.json`
const rejectedPath = `${directory}/rejected-${suffix}.json`

writeFileSync(
  acceptedTasksPath,
  `${JSON.stringify({ ...tasksBatch, batchId: acceptedBatchId, records: acceptedTasks }, null, 2)}\n`,
  'utf8',
)
writeFileSync(
  acceptedTranslationsPath,
  `${JSON.stringify({ ...translationsBatch, batchId: acceptedBatchId, records: acceptedTranslations }, null, 2)}\n`,
  'utf8',
)
writeFileSync(rejectedPath, `${JSON.stringify(rejected, null, 2)}\n`, 'utf8')

console.log(
  JSON.stringify(
    {
      sourceBatchId: tasksBatch.batchId,
      accepted: acceptedTasks.length,
      rejected: rejected.length,
      acceptedTasksPath,
      acceptedTranslationsPath,
      rejectedPath,
    },
    null,
    2,
  ),
)
