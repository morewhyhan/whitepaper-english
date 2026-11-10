import { describe, expect, test } from 'vitest'
import { normalizeWords, reconcileStoredWords } from '../../src/modules/vocabulary/lib/vocabulary'

describe('内置词书旧数据恢复', () => {
  test('[AC-WHITEPAPER-001] 清理旧词头并保留每个词条的学习记录 ID', () => {
    const saved = normalizeWords([{ en: 'meet (v.1)', zh: '暂无释义' }, { en: 'meet (v.2)', zh: '旧释义' }])
    const index = saved.findIndex((word) => word.en === 'meet (v.1)')
    expect(index).toBeGreaterThanOrEqual(0)
    saved[index].zh = '暂无释义'
    const restored = reconcileStoredWords(saved)
    expect(restored).toHaveLength(saved.length)
    expect(restored[index]).toMatchObject({ id: saved[index].id, en: 'meet' })
    expect(restored[index].zh).not.toBe('暂无释义')
    expect(restored[index].audio).toMatch(/^\/audio\/.+\.webm$/)
    expect(restored.map((word) => word.en)).toEqual(['meet', 'meet'])
    expect(restored.every((word) => word.zh && word.zh !== '暂无释义' && word.audio)).toBe(true)
    expect(new Set(restored.map((word) => word.id)).size).toBe(saved.length)
    expect(reconcileStoredWords(restored)).toEqual(restored)
  })

  test('[AC-WHITEPAPER-001] 无法匹配当前词书的用户词条不丢失', () => {
    const saved = [{ id: 'my-word', en: 'my custom entry', zh: '我自己的释义' }]
    expect(reconcileStoredWords(saved)).toMatchObject(saved)
  })
})
