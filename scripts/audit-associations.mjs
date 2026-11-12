import { readFileSync } from 'node:fs'
import {
  chineseHighlightTerms,
  readSources,
  validateTranslationBatch,
} from './association-translations.mjs'

const batchFlag = process.argv.indexOf('--batch')
if (batchFlag >= 0) {
  const tasksPath = process.argv[batchFlag + 1]
  const translationsPath = process.argv[batchFlag + 2]
  if (!tasksPath || !translationsPath) {
    throw new Error(
      '用法：node scripts/audit-associations.mjs --batch <tasks.json> <translations.json>',
    )
  }
  const tasks = JSON.parse(readFileSync(tasksPath, 'utf8'))
  const translations = JSON.parse(readFileSync(translationsPath, 'utf8'))
  if (tasks.batchId !== translations.batchId) throw new Error('任务与翻译的 batchId 不一致')
  const errors = validateTranslationBatch(tasks.records ?? [], translations.records ?? [])
  console.log(
    JSON.stringify(
      { batchId: tasks.batchId, taskCount: tasks.records?.length ?? 0, errors },
      null,
      2,
    ),
  )
  if (errors.length) process.exitCode = 1
} else {
  const { targets, wordbook } = readSources()
  const seenSentences = new Set()
  const seenTranslations = new Set()
  const links = targets.flatMap(([, network]) => network.links)

  let missingSentenceZh = 0
  let missingWordZh = 0
  let missingTargets = 0
  let duplicateSentences = 0
  let duplicateTranslations = 0
  let unhighlightableTargetTranslations = 0
  let unhighlightablePeripheralTranslations = 0
  let linksPerTargetErrors = 0

  const wordsByEnglish = new Map(
    wordbook?.entries?.map((entry) => [entry.en.toLocaleLowerCase('en-US'), entry]) ?? [],
  )

  for (const [target, network] of targets) {
    if (network.links.length !== 8) linksPerTargetErrors += 1
    const targetWord = wordsByEnglish.get(target.toLocaleLowerCase('en-US'))
    if (!targetWord) missingTargets += 1

    for (const link of network.links) {
      if (!link.sentenceZh?.trim()) missingSentenceZh += 1
      if (!link.wordZh?.trim()) missingWordZh += 1
      if (seenSentences.has(link.sentence.trim())) duplicateSentences += 1
      else seenSentences.add(link.sentence.trim())

      if (link.sentenceZh?.trim()) {
        const sentenceZh = link.sentenceZh.trim()
        if (seenTranslations.has(sentenceZh)) duplicateTranslations += 1
        else seenTranslations.add(sentenceZh)
        const targetTerms = chineseHighlightTerms(targetWord?.zh ?? '')
        if (!targetTerms.some((term) => sentenceZh.includes(term))) {
          unhighlightableTargetTranslations += 1
        }
        if (link.wordZh && !sentenceZh.includes(link.wordZh.trim())) {
          unhighlightablePeripheralTranslations += 1
        }
      }
    }
  }

  const report = {
    totalTargetWords: targets.length,
    totalLinks: links.length,
    expectedLinks: 30936,
    missingSentenceZh,
    missingWordZh,
    missingTargetWords: missingTargets,
    targetsWithoutEightLinks: linksPerTargetErrors,
    duplicateSentences,
    duplicateTranslations,
    unhighlightableTargetTranslations,
    unhighlightablePeripheralTranslations,
  }
  console.log(JSON.stringify(report, null, 2))

  if (
    links.length !== 30936 ||
    missingSentenceZh ||
    missingWordZh ||
    missingTargets ||
    linksPerTargetErrors ||
    unhighlightableTargetTranslations ||
    unhighlightablePeripheralTranslations
  ) {
    process.exitCode = 1
  }
}
