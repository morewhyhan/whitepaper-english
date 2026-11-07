import { expect, test } from '@playwright/test'

test('[AC-AUTH-001] [AC-AUTH-002] [AC-AUTH-003] [AC-ACCOUNT-004] [AC-PRODUCT-004] [AC-TRUST-006] 词汇白纸提供登录入口并能退出', async ({
  page,
}) => {
  const email = `e2e-${Date.now()}@example.com`

  await page.goto('/dashboard')
  await expect(page).toHaveURL('/')

  await page.goto('/')
  const noHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
  )
  expect(noHorizontalOverflow, 'desktop page must not overflow horizontally').toBe(true)
  await expect(page.getByRole('button', { name: '登录' })).toBeVisible()

  await page.getByRole('button', { name: '登录' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()

  await dialog.getByRole('button', { name: '注册' }).click()
  await dialog.getByLabel('用户名').fill('E2E')
  await dialog.getByLabel('邮箱').fill(email)
  await dialog.getByLabel('密码', { exact: true }).fill('password12345')
  await dialog.getByLabel('确认密码').fill('password12345')
  await dialog.getByRole('button', { name: '创建账户' }).click()

  await expect(page).toHaveURL(/\/vocabulary/)
  await expect(page.getByRole('button', { name: '退出' })).toBeVisible()

  await page.getByRole('button', { name: '退出' }).click()
  await expect(page.getByRole('button', { name: '登录' })).toBeVisible()

  await page.getByRole('button', { name: '登录' }).click()
  const loginDialog = page.getByRole('dialog')
  await loginDialog.getByLabel('邮箱').fill(email)
  await loginDialog.getByLabel('密码', { exact: true }).fill('password12345')
  await loginDialog.getByRole('button', { name: '登录' }).last().click()

  await expect(page).toHaveURL(/\/vocabulary/)
  await expect(page.getByRole('button', { name: '退出' })).toBeVisible()
})
