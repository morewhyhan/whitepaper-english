import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { siteConfig } from '@/config/site'

const root = process.cwd()
const read = (file: string) => readFileSync(join(root, file), 'utf8')

describe('产品目标契约', () => {
  it('[AC-ADOPTION-001] 产品身份使用白纸英语而不是模板名', () => {
    expect(siteConfig.name).toContain('白纸')
    expect(siteConfig.name.toLowerCase()).not.toContain('ignite')
  })

  it('[AC-ADOPTION-002] 保留 Next、Hono、Prisma 与 Better Auth 底座', () => {
    const pkg = JSON.parse(read('package.json')) as {
      dependencies: Record<string, string>
    }
    for (const name of ['next', 'hono', '@prisma/client', 'better-auth']) {
      expect(pkg.dependencies[name] ?? '').not.toBe('')
    }
  })

  it('[AC-WHITEPAPER-001] 词表状态可以导出并重新解析', () => {
    const source = read('src/modules/vocabulary/lib/vocabulary.ts')
    expect(source).toContain('export function exportJson')
    expect(source).toContain('export function parseImport')
  })

  it('[AC-WHITEPAPER-002] 词格有文字、焦点和状态语义', () => {
    const css = read('src/modules/vocabulary/components/vocabulary-screen.module.css')
    expect(css).toContain(':focus-visible')
    const screen = read('src/modules/vocabulary/components/vocabulary-screen.tsx')
    expect(screen).toContain('aria-label')
    expect(screen).toContain('aria-pressed')
  })

  it('[AC-WHITEPAPER-003] 页面不宣称付费、外部模型或已完成 AI 结果', () => {
    const files = ['src/app/page.tsx', 'src/config/site.ts', 'README.md']
    const body = files.map(read).join('\n')
    expect(body).not.toMatch(/订阅|付费墙|自动生成答案|已完成 AI/)
  })

  it('[AC-WHITEPAPER-004] 未登录访客直接进入词汇白纸', () => {
    const page = read('src/app/page.tsx')
    expect(page).toContain('<VocabularyScreen />')
  })

  it('[AC-WHITEPAPER-005] 第一动作是词汇纸，不把写作/语法标成可用', () => {
    const nav = read('src/config/navigation.ts')
    expect(nav).toContain('/vocabulary')
    const screen = read('src/modules/vocabulary/components/vocabulary-screen.tsx')
    expect(screen).toContain('暂未开放')
  })

  it('[AC-ACCOUNT-002] 词状态查询按当前用户隔离', () => {
    const store = read('src/server/vocabulary/store.ts')
    expect(store).toContain('userId')
    expect(store).toMatch(/where:\s*\{[^}]*userId/s)
  })
})
