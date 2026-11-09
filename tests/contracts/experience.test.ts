import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const read = (file: string) => readFileSync(join(root, file), 'utf8')

describe('体验领域契约', () => {
  it('[AC-EXPERIENCE-001] 优先本地神经语音，只有失败才系统兜底', () => {
    const speech = read('src/modules/vocabulary/lib/speech.ts')
    const server = read('src/server/vocabulary/tts.ts')
    expect(server).toContain('en-US-AriaNeural')
    expect(speech).toContain("'/api/vocabulary/tts'")
    expect(speech).toContain('speakSystem')
    expect(speech).toMatch(/speakSystem\(clean\)/)
  })

  it('[AC-EXPERIENCE-002] 关联句与纸面同底，没有白色块', () => {
    const css = read('src/modules/vocabulary/components/vocabulary-screen.module.css')
    expect(css).toMatch(/\.assocSentence\s*\{[^}]*background:\s*transparent/s)
    expect(css).not.toMatch(/\.assocSentence\s*\{[^}]*background:\s*white/s)
    expect(css).toContain('.assocNode:hover .assocSentence')
  })

  it('[AC-EXPERIENCE-003] 换词动效短，减少动态时关闭', () => {
    const css = read('src/modules/vocabulary/components/vocabulary-screen.module.css')
    expect(css).toContain('assocIn 150ms')
    expect(css).toMatch(/prefers-reduced-motion[\s\S]*?\.assocNode/)
  })
})
