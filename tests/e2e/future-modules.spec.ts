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

test.skip('[AC-WORKSPACE-002] 跨模块引用保留原文来源和版本', () => {})
test.skip('[AC-WORKSPACE-003] 游客本地内容可在刷新后继续使用', () => {})
test.skip('[AC-WORKSPACE-004] 保存或同步失败不静默丢弃当前输入', () => {})
test.skip('[AC-WORKSPACE-005] AI 不可用时基础工作台仍可继续使用', () => {})

test.skip('[AC-WRITING-001] 写作不要求先完成其他模块', () => {})
test.skip('[AC-WRITING-002] 旧版本检查建议不能应用到新正文', () => {})
test.skip('[AC-WRITING-003] 应用忽略撤销建议时保留原文版本', () => {})
test.skip('[AC-WRITING-004] 接受写作建议不产生语法掌握结论', () => {})

test.skip('[AC-GRAMMAR-001] AI 解释不能替代用户独立作答', () => {})
test.skip('[AC-GRAMMAR-002] 有提示无提示和新情境证据分别记录', () => {})
test.skip('[AC-GRAMMAR-003] 未确认的语法总结不能覆盖用户原话', () => {})
test.skip('[AC-GRAMMAR-004] 语法总结保留被引用的写作原句来源', () => {})
