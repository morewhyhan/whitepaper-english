import { expect, test } from '@playwright/test'

test('[AC-ACCOUNT-013] 关联接口返回 8 条真实句子', async ({ page }) => {
  const response = await page.request.get('/api/vocabulary/association?word=lesson')
  expect(response.ok()).toBe(true)

  const body = (await response.json()) as {
    data: { network: { target: string; links: { word: string; sentence: string }[] } | null }
  }

  expect(body.data.network?.target).toBe('lesson')
  expect(body.data.network?.links).toHaveLength(8)

  for (const link of body.data.network?.links ?? []) {
    expect(link.sentence.toLowerCase()).toContain('lesson')
    expect(link.word.length).toBeGreaterThan(0)
  }
})
