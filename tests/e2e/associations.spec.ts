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

test('[AC-ACCOUNT-014] 九宫格与关联辅助共用同一游标', async ({ page }) => {
  await page.goto('/vocabulary')
  await page.waitForFunction(() => Boolean(localStorage.getItem('whitepaper-vocabulary-v2')))

  await expect(page.getByText('本页 1—36 / 3867')).toBeVisible()
  await page.getByRole('button', { name: '下一页', exact: true }).click()
  await expect(page.getByText('本页 37—72 / 3867')).toBeVisible()
  await page.getByRole('button', { name: '下一页', exact: true }).click()
  await expect(page.getByText('本页 73—108 / 3867')).toBeVisible()

  await page.getByRole('button', { name: '关联辅助', exact: true }).click()
  await expect(page.getByText('第 73 / 3867 词')).toBeVisible()

  const current = await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem('whitepaper-vocabulary-v2') ?? '{}')
    const session = Object.values(state.sessions ?? {})[0] as { cursor: number; ids: string[] }
    const word = state.words.find((item: { id: string }) => item.id === session.ids[session.cursor])
    return {
      expected: word?.en as string,
      chip: document.querySelector('[class*=centerChip]')?.textContent ?? '',
    }
  })
  expect(current.chip).toContain(current.expected)

  await page.getByRole('button', { name: '下一个词', exact: true }).click()
  await expect(page.getByText('第 74 / 3867 词')).toBeVisible()

  await page.getByRole('button', { name: '九宫格扫词', exact: true }).click()
  await expect(page.getByText('本页 74—109 / 3867')).toBeVisible()
})
