import { readFileSync } from 'node:fs'

export const associationsPath = new URL(
  '../src/modules/vocabulary/data/associations.json',
  import.meta.url,
)
export const wordbookPath = new URL(
  '../src/modules/vocabulary/data/parallel-world.json',
  import.meta.url,
)

export function readSources() {
  const associations = JSON.parse(readFileSync(associationsPath, 'utf8'))
  const wordbook = JSON.parse(readFileSync(wordbookPath, 'utf8'))
  const wordsByEnglish = new Map(
    wordbook.entries.map((entry) => [entry.en.toLocaleLowerCase('en-US'), entry]),
  )
  const targets = Object.entries(associations)
  const linksById = new Map()

  for (const [target, network] of targets) {
    network.links.forEach((link, index) => {
      const id = `${target}:${index}`
      linksById.set(id, {
        id,
        target,
        targetZh: wordsByEnglish.get(target.toLocaleLowerCase('en-US'))?.zh ?? '',
        word: link.word,
        sentence: link.sentence,
        link,
      })
    })
  }

  return { associations, targets, linksById, wordbook }
}

export function chineseTerms(value) {
  return value
    // 省略号/英文语法注释不是可高亮中文词项，先当分隔符。
    .replace(/[…]+|\.{3,}/g, ' ')
    // “或”也是词书常见义项分隔，例如“讨厌的人或事”。
    .split(/[；;、，,\s/|或]+/)
    .map((term) => term.trim())
    // “听见hear 的过去式”：去掉后面的英文和语法说明。
    .map((term) => term.replace(/[A-Za-z].*$/, '').trim())
    .map((term) => {
      const suffixes = ['美国州名','印度城市','城市名','国家名','地名','人名','姓氏','汽车品牌','品牌','常用复数','常用单数','的过去式','的过去分词','的现在分词','的复数','的比较级','的最高级']
      for (const suffix of suffixes) {
        if (term.length > suffix.length && term.endsWith(suffix)) {
          return term.slice(0, -suffix.length).trim()
        }
      }
      return term
    })
    .filter((term) => Boolean(term) && !/^的(过去|现在|将来|完成|进行|复数|比较|最高)/.test(term))
}

export function chineseHighlightTerms(value) {
  return [
    ...new Set(
      chineseTerms(value).flatMap((term) => {
        const terms = [term]
        const stem = term.replace(/[的地得]$/, '')
        if (stem.length >= 2 && stem !== term) terms.push(stem)
        return terms
      }),
    ),
  ]
}

export function validateTranslationBatch(tasks, translations) {
  const errors = []
  const taskById = new Map()
  const translationById = new Map()

  for (const task of tasks) {
    if (!task?.id || taskById.has(task.id)) {
      errors.push(`任务 id 缺失或重复：${task?.id ?? '(empty)'}`)
      continue
    }
    taskById.set(task.id, task)
  }

  for (const translation of translations) {
    const keys = Object.keys(translation ?? {}).sort()
    if (keys.join(',') !== 'id,sentenceZh,wordZh') {
      errors.push(`${translation?.id ?? '(unknown id)'}: 翻译只能包含 id、wordZh、sentenceZh`)
    }
    if (!translation?.id || translationById.has(translation.id)) {
      errors.push(`翻译 id 缺失或重复：${translation?.id ?? '(empty)'}`)
      continue
    }
    translationById.set(translation.id, translation)
  }

  for (const id of taskById.keys()) {
    if (!translationById.has(id)) errors.push(`缺少翻译：${id}`)
  }
  for (const id of translationById.keys()) {
    if (!taskById.has(id)) errors.push(`翻译 id 不在任务表中：${id}`)
  }

  const seenSentences = new Map()
  for (const [id, task] of taskById) {
    const translation = translationById.get(id)
    if (!translation) continue

    const wordZh = translation.wordZh?.trim()
    const sentenceZh = translation.sentenceZh?.trim()
    if (!wordZh) errors.push(`${id}: wordZh 为空`)
    if (!sentenceZh) errors.push(`${id}: sentenceZh 为空`)
    if (wordZh && sentenceZh && !sentenceZh.includes(wordZh)) {
      errors.push(`${id}: wordZh 无法在 sentenceZh 中定位（${wordZh}）`)
    }
    if (
      sentenceZh &&
      !chineseHighlightTerms(task.targetZh ?? '').some((term) => sentenceZh.includes(term))
    ) {
      errors.push(`${id}: 目标词词书释义无法在 sentenceZh 中定位`)
    }
    if (sentenceZh) {
      const duplicateId = seenSentences.get(sentenceZh)
      if (duplicateId) errors.push(`${id}: 与 ${duplicateId} 的 sentenceZh 重复`)
      else seenSentences.set(sentenceZh, id)
    }
  }

  return errors
}
