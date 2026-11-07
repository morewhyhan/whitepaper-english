import { expect, test } from '@playwright/test'

test('[AC-ACCOUNT-007] 撤销上一页清空该页判定', async ({ page }) => {
  const email = `undo-${Date.now()}@example.com`

  await page.goto('/')
  await page.getByRole('button', { name: '登录' }).click()
  const authDialog = page.getByRole('dialog')
  await authDialog.getByRole('button', { name: '注册' }).click()
  await authDialog.getByLabel('用户名').fill('Undo')
  await authDialog.getByLabel('邮箱').fill(email)
  await authDialog.getByLabel('密码', { exact: true }).fill('password12345')
  await authDialog.getByLabel('确认密码').fill('password12345')
  await authDialog.getByRole('button', { name: '创建账户' }).click()

  await expect(page).toHaveURL(/\/vocabulary/)
  await expect(page.getByRole('heading', { name: '第 1 轮' })).toBeVisible()

  const saved = page.waitForResponse(
    (response) =>
      response.url().includes('/api/vocabulary/judgements') &&
      response.request().method() === 'POST',
  )
  await page.getByRole('button', { name: '下一页' }).click()
  expect((await saved).status()).toBe(200)

  const cleared = page.waitForResponse(
    (response) =>
      response.url().includes('/api/vocabulary/judgements') &&
      response.request().method() === 'DELETE',
  )
  await page.getByRole('button', { name: '撤销上一页' }).click()
  expect((await cleared).status()).toBe(200)

  const state = await page.request.get('/api/vocabulary/state')
  const body = (await state.json()) as { data: { wordStates: unknown[] } }

  expect(body.data.wordStates.length, 'the previous page must be cleared').toBe(0)
  await expect(page.getByRole('heading', { name: '第 1 轮' })).toBeVisible()
})
