import { expect, test } from '@playwright/test'

const STORAGE_KEY = 'whitepaper-vocabulary-v2'

async function fresh(page: import('@playwright/test').Page) {
  await page.goto('/vocabulary')
  await page.evaluate((key) => window.localStorage.removeItem(key), STORAGE_KEY)
  await page.reload()
  await page.waitForFunction(() => Boolean(window.localStorage.getItem('whitepaper-vocabulary-v2')))
}

test('[AC-ACCOUNT-020] 双击归档、共享垃圾桶和放回', async ({ page }) => {
  await fresh(page)

  const first = page.locator('button[class*=word]').first()
  const word = await first.locator('span').last().innerText()
  await first.dblclick()
  await expect(page.getByRole('button', { name: '打开垃圾桶' })).toContainText('1')

  await page.getByRole('button', { name: '打开垃圾桶' }).click()
  const panel = page.getByRole('complementary', { name: '垃圾桶' })
  await expect(panel).toContainText(word)
  await panel.getByRole('button', { name: '放回' }).click()
  await expect(page.getByRole('button', { name: '打开垃圾桶' })).toContainText('0')
})

test('[AC-ACCOUNT-020] 关联辅助只归档中心词，外围句子不归档', async ({ page }) => {
  await fresh(page)
  await page.getByRole('button', { name: '关联辅助', exact: true }).click()
  await page.waitForFunction(() => document.querySelectorAll('button[class*=assocNode]').length === 8)

  await page.locator('button[class*=assocNode]').first().dblclick()
  await expect(page.getByRole('button', { name: '打开垃圾桶' })).toContainText('0')

  await page.locator('button[class*=centerChip]').dblclick()
  await expect(page.getByRole('button', { name: '打开垃圾桶' })).toContainText('1')
})
