import { expect, test } from '@playwright/test'

const demoStorageKey = 'whitepaper-vocabulary-v2'

async function openFresh(page: import('@playwright/test').Page) {
  await page.goto('/vocabulary')
  await page.evaluate((key) => window.localStorage.removeItem(key), demoStorageKey)
  await page.reload()
}

test('[AC-WORKSPACE-001] [AC-WORKSPACE-006] [AC-WRITING-005] [AC-GRAMMAR-005] 未开放模块可直接查看页面状态', async ({
  page,
}) => {
  await openFresh(page)

  await page.getByRole('tab', { name: '写作' }).click()
  await expect(page.getByRole('region', { name: '写作页面' })).toContainText('暂未开放')
  await expect(page.getByPlaceholder('写作功能将在第二阶段开放')).toBeDisabled()

  await page.getByRole('tab', { name: '学语法' }).click()
  await expect(page.getByRole('region', { name: '语法页面' })).toContainText('暂未开放')
  await expect(page.getByText('低级语法')).toBeVisible()
  await expect(page.getByText('中级语法')).toBeVisible()
  await expect(page.getByText('高级语法')).toBeVisible()
})
