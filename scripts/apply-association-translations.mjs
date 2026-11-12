import { copyFileSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  associationsPath,
  readSources,
  validateTranslationBatch,
} from './association-translations.mjs'

const [taskArgument, translationArgument] = process.argv.slice(2)
if (!taskArgument || !translationArgument) {
  throw new Error(
    '用法：node scripts/apply-association-translations.mjs <tasks.json> <translations.json>',
  )
}

const taskBatch = JSON.parse(readFileSync(resolve(taskArgument), 'utf8'))
const translationBatch = JSON.parse(readFileSync(resolve(translationArgument), 'utf8'))
if (taskBatch.batchId !== translationBatch.batchId) {
  throw new Error('任务批次与翻译批次的 batchId 不一致')
}

const tasks = taskBatch.records
const translations = translationBatch.records
if (!Array.isArray(tasks) || !Array.isArray(translations)) {
  throw new Error('任务和翻译文件都必须包含 records 数组')
}

const errors = validateTranslationBatch(tasks, translations)
if (errors.length) {
  console.error(`批次校验失败（${errors.length} 项）：\n${errors.join('\n')}`)
  process.exitCode = 1
} else {
  const { associations, linksById } = readSources()
  const beforeLinkCount = [...linksById.values()].length
  const translationById = new Map(translations.map((translation) => [translation.id, translation]))
  const effectiveTranslationById = new Map()
  const data = associations
  let written = 0
  let skipped = 0

  for (const task of tasks) {
    const source = linksById.get(task.id)
    if (!source) throw new Error(`当前关联数据中找不到 ${task.id}`)
    if (
      source.target !== task.target ||
      source.targetZh !== task.targetZh ||
      source.word !== task.word ||
      source.sentence !== task.sentence
    ) {
      throw new Error(`任务源内容已变化，请重新导出：${task.id}`)
    }
    const hasExistingTranslation = Boolean(
      source.link.wordZh?.trim() || source.link.sentenceZh?.trim(),
    )
    if (hasExistingTranslation) {
      const existing = [
        {
          id: task.id,
          wordZh: source.link.wordZh ?? '',
          sentenceZh: source.link.sentenceZh ?? '',
        },
      ]
      const existingErrors = validateTranslationBatch([task], existing)
      if (!existingErrors.length) {
        effectiveTranslationById.set(task.id, existing[0])
        skipped += 1
        continue
      }
    }
    const translation = translationById.get(task.id)
    source.link.wordZh = translation.wordZh.trim()
    source.link.sentenceZh = translation.sentenceZh.trim()
    effectiveTranslationById.set(task.id, {
      id: task.id,
      wordZh: source.link.wordZh,
      sentenceZh: source.link.sentenceZh,
    })
    written += 1
  }

  const afterLinks = Object.values(data).flatMap((network) => network.links)
  if (afterLinks.length !== 30936 || afterLinks.length !== beforeLinkCount) {
    throw new Error(`写入前链接总数异常：${afterLinks.length}`)
  }

  const backupDirectory = join(tmpdir(), 'whitepaper-english-association-backups')
  mkdirSync(backupDirectory, { recursive: true })
  const backupPath = join(backupDirectory, `associations-${Date.now()}.json`)
  copyFileSync(associationsPath, backupPath)

  const destination = fileURLToPath(associationsPath)
  const temporaryPath = `${destination}.${process.pid}.tmp`
  try {
    writeFileSync(temporaryPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
    renameSync(temporaryPath, destination)

    const written = JSON.parse(readFileSync(destination, 'utf8'))
    const writtenLinks = Object.values(written).flatMap((network) => network.links)
    if (writtenLinks.length !== 30936) throw new Error('写入后链接总数不再是 30,936')
    for (const task of tasks) {
      const [target, rawIndex] = task.id.split(/:(?=[^:]+$)/)
      const index = Number(rawIndex)
      const link = written[target]?.links[index]
      const translation = effectiveTranslationById.get(task.id)
      if (
        !link ||
        link.word !== task.word ||
        link.sentence !== task.sentence ||
        link.audio !== linksById.get(task.id).link.audio ||
        link.wordZh !== translation.wordZh.trim() ||
        link.sentenceZh !== translation.sentenceZh.trim()
      ) {
        throw new Error(`写入后回读校验失败：${task.id}`)
      }
    }
    const writtenTranslations = tasks.map((task) => {
      const [target, rawIndex] = task.id.split(/:(?=[^:]+$)/)
      const link = written[target].links[Number(rawIndex)]
      return { id: task.id, wordZh: link.wordZh, sentenceZh: link.sentenceZh }
    })
    const postWriteErrors = validateTranslationBatch(tasks, writtenTranslations)
    if (postWriteErrors.length) {
      throw new Error(`写入后批次审计失败：${postWriteErrors.join('；')}`)
    }
  } catch (error) {
    copyFileSync(backupPath, associationsPath)
    rmSync(temporaryPath, { force: true })
    throw new Error(`写入失败，已从备份恢复：${error.message}`)
  }

  console.log(
    JSON.stringify(
      {
        batchId: taskBatch.batchId,
        written,
        skipped,
        totalLinks: afterLinks.length,
        backupPath,
        sourceFieldsPreserved: true,
        batchValidation: 'passed',
      },
      null,
      2,
    ),
  )
}
