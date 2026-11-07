import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, test } from 'vitest'
import { siteConfig } from '@/config/site'

const project = JSON.parse(readFileSync(resolve(process.cwd(), '.ai/project.json'), 'utf8')) as {
  mode: string
  project_repository: string | null
  source_repository: string
}
const packageJson = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf8')) as {
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
  scripts: Record<string, string>
}
const tooling = { ...packageJson.dependencies, ...packageJson.devDependencies }

test('[AC-ADOPTION-001] 白纸英语项目身份在机器配置与站点配置中一致', () => {
  expect(project.mode).toBe('adopted')
  expect(project.source_repository).toBe('git@github.com:morewhyhan/Ignite.git')
  expect(project.project_repository).toBe('git@github.com:morewhyhan/whitepaper-english.git')
  expect(siteConfig.name).toBe('白纸英语')
  expect(siteConfig.slug).toBe('whitepaper-english')
  expect(siteConfig.repositoryUrl).toBe('https://github.com/morewhyhan/whitepaper-english')
})

test('[AC-ADOPTION-002] 白纸英语保留 Ignite 工程底座和治理入口', () => {
  expect(packageJson.dependencies.next).toBeDefined()
  expect(packageJson.dependencies.react).toBeDefined()
  expect(packageJson.dependencies.hono).toBeDefined()
  expect(tooling.prisma).toBeDefined()
  expect(packageJson.scripts['docs:check']).toBeDefined()
  expect(packageJson.scripts['ignite:check']).toBeDefined()
})

test('[AC-WHITEPAPER-003] 第一阶段不声明付费云服务或外部模型能力', () => {
  expect(packageJson.dependencies.stripe).toBeUndefined()
  expect(packageJson.dependencies.openai).toBeUndefined()
  expect(packageJson.dependencies.resend).toBeUndefined()
})
