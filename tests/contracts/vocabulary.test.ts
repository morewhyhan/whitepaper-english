import { describe, expect, it } from 'vitest'
import parallelWorld from '@/modules/vocabulary/data/parallel-world.json'
import {
  advanceSession,
  createInitialState,
  createSession,
  exportJson,
  exportMarkdown,
  normalizeWords,
  parseImport,
  toggleMark,
  type VocabularyWord,
} from '@/modules/vocabulary/lib/vocabulary'

const words: VocabularyWord[] = normalizeWords([
  { en: 'apple', zh: '苹果' },
  { en: 'tree', zh: '树' },
])

describe('vocabulary learning state', () => {
  it('[AC-VOCABULARY-007] parses CSV, TSV, and JSON word lists', () => {
    expect(parseImport('English,中文\napple,苹果').words.map((word) => word.en)).toEqual(['apple'])
    expect(parseImport('apple\t苹果', 'words.tsv').words[0]).toMatchObject({
      en: 'apple',
      zh: '苹果',
    })
    expect(
      parseImport(JSON.stringify({ words: [{ en: 'apple', zh: '苹果' }] }), 'words.json').words,
    ).toHaveLength(1)
    expect(parseImport('lesson\nlisten to the tape', 'words.txt').words).toMatchObject([
      { en: 'lesson', zh: '' },
      { en: 'listen to the tape', zh: '' },
    ])
    expect(parseImport(JSON.stringify(['lesson']), 'words.json').words[0]).toMatchObject({
      en: 'lesson',
      zh: '',
    })
  })

  it('uses the imported parallel-world wordbook as the initial list', () => {
    const initial = createInitialState()

    expect(parallelWorld.entries).toHaveLength(3976)
    expect(parallelWorld.nonEmptyEntryCount).toBe(3975)
    expect(parallelWorld.entries[3475]).toEqual({ en: '', zh: '' })
    expect(initial.words.length).toBe(3975)
    expect(initial.words[0]).toMatchObject({ en: 'lesson', zh: '' })
    expect(initial.words.at(-1)).toMatchObject({ en: 'desire', zh: '' })
    expect(initial.words.filter((word) => word.en === 'do')).toHaveLength(2)
  })

  it('[AC-VOCABULARY-004] keeps only unknown words for the next round', () => {
    const session = createSession(words, { mode: 'unknown', groups: 4 })
    const first = toggleMark(session, words[0].id, 'unknown')
    const completed = advanceSession(first, words)

    expect(completed.round).toBe(2)
    expect(completed.ids).toEqual([words[0].id])
    expect(completed.history).toEqual([{ round: 1, total: 2, missed: 1 }])
  })

  it('completes the day when every word is known', () => {
    const session = createSession(words, { mode: 'unknown', groups: 4 })
    const completed = advanceSession(session, words)

    expect(completed.complete).toBe(true)
    expect(completed.history[0]).toEqual({ round: 1, total: 2, missed: 0 })
  })

  it('advances one Zen batch by the number of visible paper slots', () => {
    const batchWords = normalizeWords(
      Array.from({ length: 108 }, (_, index) => ({ en: `word-${index}`, zh: '' })),
    )
    const session = createSession(batchWords, { mode: 'unknown', groups: 4 })

    const advanced = advanceSession(session, batchWords, { pageSize: 72 })

    expect(advanced.cursor).toBe(72)
    expect(advanced.complete).toBe(false)
    expect(advanced.history).toEqual([])
  })

  it('exports a re-importable JSON vocabulary and a readable Markdown table', () => {
    const state = {
      words,
      networks: [],
      settings: { mode: 'unknown' as const, groups: 4 as const },
      sessions: {},
    }

    expect(parseImport(exportJson(state), 'words.json').words).toEqual(words)
    expect(exportMarkdown(state)).toContain('| apple | 苹果 |')
  })
})
