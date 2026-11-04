import { expect, test, type Page } from '@playwright/test'

async function openPaper(page: Page, _id: string) {
  await page.goto('/learn')
}

test('[AC-VOCABULARY-001] 未登录进入白纸词汇工作台', async ({ page }) => {
  await openPaper(page, 'AC-VOCABULARY-001')
  await expect(
    page.getByRole('heading', { name: '词汇白纸' }),
    '[AC-VOCABULARY-001] 访客学习入口',
  ).toBeVisible()
  await page.goto('/')
  await page.getByRole('link', { name: '开始学习', exact: true }).click()
  await expect(page).toHaveURL(/\/learn$/)
  await expect(page.getByLabel('导入词表')).toBeEditable()
  await expect(page.getByTestId('word')).toHaveCount(9)
})

test('[AC-VOCABULARY-002] 手动分页并判断会与不会', async ({ page }) => {
  await openPaper(page, 'AC-VOCABULARY-002')
  await expect(
    page.getByRole('heading', { name: '词汇白纸' }),
    '[AC-VOCABULARY-002] 批量判断入口',
  ).toBeVisible()
  const first = page.getByTestId('word').first()
  await first.click()
  await expect(first).toHaveAttribute('data-judgment', 'known')
  await page
    .getByTestId('word')
    .nth(1)
    .click({ modifiers: ['Shift'] })
  await expect(page.getByTestId('word').nth(1)).toHaveAttribute('data-judgment', 'unknown')
  await expect(page.getByText('第 1 页')).toBeVisible()
  await page.getByRole('button', { name: '下一页', exact: true }).click()
  await expect(page.getByText('第 2 页')).toBeVisible()
  await page.getByRole('button', { name: '上一页', exact: true }).click()
  await expect(page.getByTestId('word').first()).toHaveAttribute('data-judgment', 'known')
})

test('[AC-VOCABULARY-003] 配置点击默认判断并用 Shift 反转', async ({ page }) => {
  await openPaper(page, 'AC-VOCABULARY-003')
  await expect(
    page.getByRole('heading', { name: '词汇白纸' }),
    '[AC-VOCABULARY-003] 判断设置入口',
  ).toBeVisible()
  await page.getByLabel('点击默认判断').selectOption('unknown')
  await page.getByTestId('word').first().click()
  await expect(page.getByTestId('word').first()).toHaveAttribute('data-judgment', 'unknown')
  await page
    .getByTestId('word')
    .nth(1)
    .click({ modifiers: ['Shift'] })
  await expect(page.getByTestId('word').nth(1)).toHaveAttribute('data-judgment', 'known')
})

test('[AC-VOCABULARY-004] 下一轮只保留上一轮不会词', async ({ page }) => {
  await openPaper(page, 'AC-VOCABULARY-004')
  await expect(
    page.getByRole('heading', { name: '词汇白纸' }),
    '[AC-VOCABULARY-004] 多轮学习入口',
  ).toBeVisible()
  await page.getByLabel('导入词表').fill('apple,苹果\nbook,书')
  await page.getByRole('button', { name: '应用词表' }).click()
  await page.getByRole('button', { name: '结束本轮' }).click()
  await expect(page.getByRole('alert')).toContainText('未判断')
  await page.getByTestId('word').first().click()
  await page
    .getByTestId('word')
    .nth(1)
    .click({ modifiers: ['Shift'] })
  await page.getByRole('button', { name: '结束本轮' }).click()
  await expect(page.getByTestId('word')).toHaveCount(1)
  await expect(page.getByTestId('word')).toContainText('book')
  await expect(page.getByText('第 2 轮')).toBeVisible()
  await page.getByTestId('word').click()
  await page.getByRole('button', { name: '结束本轮' }).click()
  await expect(page.getByText('本次自评已清零')).toBeVisible()
})

test('[AC-VOCABULARY-005] 关联辅助共享原任务与错词池', async ({ page }) => {
  await openPaper(page, 'AC-VOCABULARY-005')
  await expect(
    page.getByRole('heading', { name: '词汇白纸' }),
    '[AC-VOCABULARY-005] 关联辅助入口',
  ).toBeVisible()
  await page
    .getByTestId('word')
    .first()
    .click({ modifiers: ['Shift'] })
  await page.getByRole('button', { name: '关联辅助', exact: true }).click()
  await expect(page.getByRole('heading', { name: '关联辅助' })).toBeVisible()
  for (let index = 1; index <= 8; index++) {
    await page.getByLabel(`关联词 ${index}`, { exact: true }).fill(`word${index}`)
    await page.getByLabel(`关联句 ${index}`, { exact: true }).fill(`This is sentence ${index}.`)
  }
  await page.getByRole('button', { name: '标记为会', exact: true }).click()
  await page.getByRole('button', { name: '快速扫词', exact: true }).click()
  await expect(page.getByTestId('word').first()).toHaveAttribute('data-judgment', 'known')
  await page.getByRole('button', { name: '关联辅助', exact: true }).click()
  await expect(page.getByLabel('关联句 8', { exact: true })).toHaveValue('This is sentence 8.')
  await page.reload()
  await expect(page.getByLabel('关联句 8', { exact: true })).toHaveValue('This is sentence 8.')
})

test('[AC-VOCABULARY-006] 刷新恢复本地任务与设置并处理损坏存储', async ({ page }) => {
  await openPaper(page, 'AC-VOCABULARY-006')
  await expect(
    page.getByRole('heading', { name: '词汇白纸' }),
    '[AC-VOCABULARY-006] 本地任务入口',
  ).toBeVisible()
  await page.getByLabel('点击默认判断').selectOption('unknown')
  await page.getByTestId('word').first().click()
  await page.reload()
  await expect(page.getByLabel('点击默认判断')).toHaveValue('unknown')
  await expect(page.getByTestId('word').first()).toHaveAttribute('data-judgment', 'unknown')
  await page.evaluate(() => localStorage.setItem('whitepaper-vocabulary-v1', '{bad'))
  await page.reload()
  await expect(page.getByRole('alert')).toContainText('本地数据')
  expect(await page.evaluate(() => localStorage.getItem('whitepaper-vocabulary-v1'))).toBe('{bad')
  await expect(page.getByTestId('word')).toHaveCount(9)
  await page.evaluate(() => {
    localStorage.removeItem('whitepaper-vocabulary-v1')
    Storage.prototype.setItem = () => {
      throw new DOMException('full', 'QuotaExceededError')
    }
  })
  await page.getByTestId('word').first().click()
  await expect(page.getByRole('alert')).toContainText('导出')
  await expect(page.getByTestId('word').first()).toHaveAttribute('data-judgment', 'known')
})

test('[AC-VOCABULARY-007] 导入 CSV TXT JSON 且拒绝无效输入', async ({ page }) => {
  await openPaper(page, 'AC-VOCABULARY-007')
  await expect(
    page.getByRole('heading', { name: '词汇白纸' }),
    '[AC-VOCABULARY-007] 词表导入入口',
  ).toBeVisible()
  for (const source of [
    'apple,苹果\nbook,书',
    'apple\t苹果\nbook\t书',
    '[{"word":"apple","meaning":"苹果"},{"word":"book","meaning":"书"}]',
  ]) {
    await page.getByLabel('导入词表').fill(source)
    await page.getByRole('button', { name: '应用词表' }).click()
    await expect(page.getByTestId('word')).toHaveCount(2)
  }
  await page.getByLabel('导入词表').fill('[{}]')
  await page.getByRole('button', { name: '应用词表' }).click()
  await expect(page.getByRole('alert')).toBeVisible()
  await expect(page.getByTestId('word')).toHaveCount(2)
  await page.getByLabel('导入词表').fill('word,meaning\n"apple","苹果,水果"\nAPPLE,重复\nbook,书')
  await page.getByRole('button', { name: '应用词表' }).click()
  await expect(page.getByTestId('word')).toHaveCount(2)
  await page
    .getByTestId('word')
    .first()
    .click({ modifiers: ['Shift'] })
  await expect(page.getByTestId('word').first()).toContainText('苹果,水果')
})

test('[AC-VOCABULARY-008] 导出 JSON Markdown 并可重导入 JSON', async ({ page }) => {
  await openPaper(page, 'AC-VOCABULARY-008')
  await expect(
    page.getByRole('heading', { name: '词汇白纸' }),
    '[AC-VOCABULARY-008] 词表导出入口',
  ).toBeVisible()
  await page
    .getByTestId('word')
    .first()
    .click({ modifiers: ['Shift'] })
  await page.getByRole('button', { name: '导出 JSON' }).click()
  const json = await page.getByLabel('导出内容').inputValue()
  expect(JSON.parse(json)).toHaveProperty('words')
  await page.getByLabel('导入词表').fill(json)
  await page.getByRole('button', { name: '应用词表' }).click()
  await expect(page.getByTestId('word')).toHaveCount(9)
  await expect(page.getByTestId('word').first()).toHaveAttribute('data-judgment', 'unknown')
  await page.getByRole('button', { name: '导出 Markdown' }).click()
  expect(await page.getByLabel('导出内容').inputValue()).toContain('白纸英语')
  expect(await page.getByLabel('导出内容').inputValue()).toContain('不会')
})

test('[AC-ADOPTION-001] 产品身份与认证保留', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: '白纸英语', exact: true }),
    '[AC-ADOPTION-001] 产品身份',
  ).toBeVisible()
  await page.getByRole('button', { name: '登录', exact: true }).click()
  await expect(page.getByLabel('邮箱', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: '注册', exact: true }).click()
  await page.getByPlaceholder('你的用户名').fill('Paper learner')
  const email = `paper-${Date.now()}@example.com`
  await page.getByLabel('邮箱', { exact: true }).fill(email)
  await page.locator('input[type="password"]').nth(0).fill('Paper!123456')
  await page.locator('input[type="password"]').nth(1).fill('Paper!123456')
  await page.getByRole('button', { name: '创建账户', exact: true }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
  await page.goto('/dashboard/settings')
  await page.getByRole('button', { name: '退出登录', exact: true }).click()
  await page.goto('/dashboard')
  await expect(page).toHaveURL('/')
  await page.getByRole('button', { name: '登录', exact: true }).click()
  await page.getByLabel('邮箱', { exact: true }).fill(email)
  await page.locator('input[type="password"]').fill('Paper!123456')
  await page.locator('form').getByRole('button', { name: '登录', exact: true }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
})
