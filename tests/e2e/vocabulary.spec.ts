import { expect, test } from '@playwright/test'

const demoStorageKey = 'whitepaper-vocabulary-v2'

async function openFresh(page: import('@playwright/test').Page, route = '/vocabulary') {
  await page.goto(route)
  await page.evaluate((key) => window.localStorage.removeItem(key), demoStorageKey)
  await page.reload()
  await expect(page.getByRole('heading', { name: '第 1 轮' })).toBeVisible()
}

async function importText(page: import('@playwright/test').Page, text: string) {
  await page.getByRole('button', { name: '导入 / 导出' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('textbox').fill(text)
  await dialog.getByRole('button', { name: '导入并重置今日进度' }).click()
  await expect(dialog).toBeHidden()
}

test('[AC-VOCABULARY-001] [AC-WHITEPAPER-004] [AC-WHITEPAPER-005] 未登录进入白纸词汇工作台', async ({ page }) => {
  await openFresh(page, '/')

  await expect(page.getByRole('heading', { name: '第 1 轮' })).toBeVisible()
  await expect(page.getByRole('button', { name: '九宫格扫词' })).toBeVisible()
  await expect(page.getByRole('button', { name: '导入 / 导出' })).toBeVisible()
})

test('[AC-VOCABULARY-002] 手动分页并判断会与不会', async ({ page }) => {
  await openFresh(page)

  const firstWord = page.locator('button[title*="普通点击"]')
  await firstWord.first().click()
  await expect(firstWord.first()).toHaveAttribute('aria-label', /unknown/)
  await page.getByRole('button', { name: '下一页' }).click()
  await expect(page.getByText('已扫 36 / 3975')).toBeVisible()
})

test('[AC-VOCABULARY-003] [AC-WHITEPAPER-002] 配置点击默认判断并用 Shift 反转', async ({ page }) => {
  await openFresh(page)

  await page.getByRole('button', { name: '设置' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('radio', { name: /点击 = 会/ }).check()
  await dialog.getByRole('button', { name: '关闭 ×' }).click()

  const words = page.locator('button[title*="普通点击"]')
  await words.nth(0).click()
  await words.nth(1).click({ modifiers: ['Shift'] })
  await expect(words.nth(0)).toHaveAttribute('aria-label', /known/)
  await expect(words.nth(1)).toHaveAttribute('aria-label', /unknown/)
})

test('[AC-VOCABULARY-004] 下一轮只保留上一轮不会词', async ({ page }) => {
  await openFresh(page)
  await importText(page, 'apple,苹果\ntree,树')

  const words = page.locator('button[title*="普通点击"]')
  await words.nth(0).click()
  await words.nth(1).click({ modifiers: ['Shift'] })
  await page.getByRole('button', { name: '下一页' }).click()

  await expect(page.getByRole('heading', { name: '第 2 轮' })).toBeVisible()
  await expect(page.getByText('本轮 1 词')).toBeVisible()
})

test('[AC-VOCABULARY-005] 关联辅助共享原任务与错词池', async ({ page }) => {
  await openFresh(page)
  await importText(page, 'apple,苹果')

  await page.getByRole('button', { name: '关联辅助' }).click()
  await expect(page.getByText('ONE TARGET · EIGHT ASSOCIATIONS')).toBeVisible()
  await page.getByRole('button', { name: /不会 · 显示中文/ }).click()
  await page.getByRole('button', { name: '下一个词' }).click()
  await expect(page.getByRole('heading', { name: '第 2 轮' })).toBeVisible()
})

test('[AC-VOCABULARY-006] 刷新恢复本地任务与设置并处理损坏存储', async ({ page }) => {
  await openFresh(page)
  await importText(page, 'apple,苹果\ntree,树')
  await page.getByRole('button', { name: '设置' }).click()
  await page
    .getByRole('dialog')
    .getByRole('radio', { name: /6 组九宫格/ })
    .check()
  await page.getByRole('dialog').getByRole('button', { name: '关闭 ×' }).click()
  await page.reload()

  await expect(page.getByText('本轮 2 词')).toBeVisible()
  await expect(page.getByRole('button', { name: '设置' })).toBeVisible()
  await page.evaluate((key) => window.localStorage.setItem(key, '{bad json'), demoStorageKey)
  await page.reload()
  await expect(page.getByText('本轮 3975 词')).toBeVisible()
})

test('[AC-VOCABULARY-007] 导入 CSV TXT JSON 且拒绝无效输入', async ({ page }) => {
  await openFresh(page)
  await importText(page, 'English,中文\napple,苹果')
  await expect(page.getByText('本轮 1 词')).toBeVisible()

  await importText(page, JSON.stringify([{ en: 'tree', zh: '树' }]))
  await expect(page.getByText('本轮 1 词')).toBeVisible()

  await page.getByRole('button', { name: '导入 / 导出' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('textbox').fill(',')
  await dialog.getByRole('button', { name: '导入并重置今日进度' }).click()
  await expect(page.getByText(/导入失败/)).toBeVisible()
})

test('[AC-VOCABULARY-008] [AC-WHITEPAPER-001] 导出 JSON Markdown 并可重导入 JSON', async ({ page }) => {
  await openFresh(page)
  await importText(page, 'apple,苹果')
  await page.getByRole('button', { name: '导入 / 导出' }).click()
  const dialog = page.getByRole('dialog')

  const jsonDownload = await Promise.all([
    page.waitForEvent('download'),
    dialog.getByRole('button', { name: '下载 JSON' }).click(),
  ])
  await expect(jsonDownload[0].suggestedFilename()).toBe('whitepaper-vocabulary.json')
  const jsonPath = await jsonDownload[0].path()
  expect(jsonPath).not.toBeNull()

  const markdownDownload = await Promise.all([
    page.waitForEvent('download'),
    dialog.getByRole('button', { name: '下载 Markdown' }).click(),
  ])
  await expect(markdownDownload[0].suggestedFilename()).toBe('whitepaper-vocabulary.md')

  await dialog.getByRole('button', { name: '关闭 ×' }).click()
  page.once('dialog', (browserDialog) => browserDialog.accept())
  await page.locator('input[type="file"]').setInputFiles(jsonPath as string)
  await expect(page.getByText('本轮 1 词')).toBeVisible()
})

test('[AC-VOCABULARY-009] A4 扫词纸在视口内完整可见', async ({ page }) => {
  await openFresh(page)

  const paper = page.getByRole('region', { name: '一张可交互的 A4 记忆纸' })
  const visibility = await paper.evaluate((element) => {
    const paperRect = element.getBoundingClientRect()
    const words = Array.from(element.querySelectorAll('button[title*="普通点击"]'))
    const wordsVisible = words.every((word) => {
      const rect = word.getBoundingClientRect()
      return rect.top >= paperRect.top && rect.bottom <= paperRect.bottom
    })
    return {
      paperVisible: paperRect.top >= 0 && paperRect.bottom <= window.innerHeight,
      wordsVisible,
      scrollFree: element.scrollHeight <= element.clientHeight,
    }
  })

  expect(visibility).toEqual({ paperVisible: true, wordsVisible: true, scrollFree: true })
})

test('[AC-VOCABULARY-010] 多本词书切换保持各自轮次', async ({ page }) => {
  await openFresh(page)

  const shelf = page.getByRole('complementary', { name: '词书纸摞' })
  await page.mouse.move(0, 200)
  await shelf.getByRole('button', { name: /基础词书/ }).click()
  await expect(page.getByText('本轮 135 词')).toBeVisible()

  await page.mouse.move(0, 200)
  await shelf.getByRole('button', { name: /平行世界/ }).click()
  await expect(page.getByText('本轮 3975 词')).toBeVisible()
})

test('[AC-WORKSPACE-009] 词书栏默认收起并在悬停时展开', async ({ page }) => {
  await openFresh(page)

  const shelf = page.getByRole('complementary', { name: '词书纸摞' })
  await expect
    .poll(() => shelf.evaluate((element) => Math.round(element.getBoundingClientRect().left)))
    .toBeLessThan(0)

  await page.mouse.move(500, 200)
  await page.mouse.move(0, 200, { steps: 1 })
  await expect
    .poll(() => shelf.evaluate((element) => Math.round(element.getBoundingClientRect().left)))
    .toBe(0)
  await shelf.getByRole('button', { name: /基础词书/ }).click()
  await page.mouse.move(500, 200, { steps: 1 })
  await expect
    .poll(() => shelf.evaluate((element) => Math.round(element.getBoundingClientRect().right)))
    .toBeLessThanOrEqual(0)
})

test('[AC-WORKSPACE-010] 写作和语法页面保持完整纸张宽度', async ({ page }) => {
  await openFresh(page)
  const viewportWidth = page.viewportSize()?.width ?? 0
  const minimumWidth = Math.min(600, viewportWidth - 20)

  for (const moduleName of ['写作', '学语法']) {
    await page.getByRole('tab', { name: new RegExp(moduleName) }).click()
    const paper = page.getByRole('region', {
      name: moduleName === '写作' ? '写作页面' : '语法页面',
    })
    await expect
      .poll(() => paper.evaluate((element) => element.getBoundingClientRect().width))
      .toBeGreaterThanOrEqual(minimumWidth)
  }
})

test('[AC-VOCABULARY-011] 禅模式隐藏工作台并铺满纸张', async ({ page }) => {
  await page.setViewportSize({ width: 1708, height: 1154 })
  await openFresh(page)

  const defaultWord = page.locator('button[title*="普通点击"]').first()
  await defaultWord.click()
  await defaultWord.hover()
  const defaultUnknownHoverColor = await defaultWord.evaluate((element) => {
    const color = getComputedStyle(element).backgroundColor
    return color
      .match(/\d+(?:\.\d+)?/g)
      ?.slice(0, 3)
      .join(',')
  })

  await page.getByRole('button', { name: '禅模式' }).click()

  await expect(page.locator('header')).toBeHidden()
  await expect(page.getByRole('button', { name: '退出禅模式' })).toBeVisible()
  await expect(page.getByRole('button', { name: '下一页' })).toBeVisible()

  const sheets = page.locator('[role="region"][aria-label^="禅模式第 "]')
  await expect(sheets).not.toHaveCount(0)
  const firstSheet = sheets.first()
  const firstZenWord = firstSheet.locator('button[title*="普通点击"]').first()
  await expect(firstSheet.locator('button[title*="普通点击"]')).toHaveCount(36)
  await expect(firstZenWord).toHaveAttribute('aria-label', /unknown/)
  await firstZenWord.hover()
  await expect
    .poll(() =>
      firstZenWord.evaluate((element) => {
        const color = getComputedStyle(element).backgroundColor
        return color
          .match(/\d+(?:\.\d+)?/g)
          ?.slice(0, 3)
          .join(',')
      }),
    )
    .toBe(defaultUnknownHoverColor)
  await expect(firstSheet.getByRole('group', { name: /九宫格/ })).toHaveCount(4)
  const zenGridGaps = await firstSheet.evaluate((element) => {
    const groups = Array.from(element.querySelectorAll('[role="group"]'))
    const words = (group: Element) =>
      Array.from(group.querySelectorAll('button[title*="普通点击"]')).map((word) =>
        word.getBoundingClientRect(),
      )
    const firstRow = words(groups[0])
    const rightQuadrantRow = words(groups[1])
    const secondRow = words(groups[2])
    const innerHorizontalGap = firstRow[1].left - firstRow[0].right
    const crossQuadrantHorizontalGap = rightQuadrantRow[0].left - firstRow[2].right
    const innerGap = firstRow[3].top - firstRow[0].bottom
    const crossQuadrantGap = secondRow[0].top - firstRow[6].bottom

    return { crossQuadrantGap, crossQuadrantHorizontalGap, innerGap, innerHorizontalGap }
  })
  expect(zenGridGaps.crossQuadrantGap).toBeGreaterThanOrEqual(0)
  expect(Math.abs(zenGridGaps.crossQuadrantGap - zenGridGaps.innerGap)).toBeLessThanOrEqual(1)
  expect(zenGridGaps.crossQuadrantHorizontalGap).toBeGreaterThanOrEqual(0)
  expect(
    Math.abs(zenGridGaps.crossQuadrantHorizontalGap - zenGridGaps.innerHorizontalGap),
  ).toBeLessThanOrEqual(1)
  const firstSheetFits = await firstSheet.evaluate((element) =>
    Array.from(element.querySelectorAll('button[title*="普通点击"]')).every((word) => {
      const textNodes = Array.from(word.querySelectorAll('span'))
      return (
        word.scrollWidth <= word.clientWidth &&
        word.scrollHeight <= word.clientHeight &&
        textNodes.every((textNode) => {
          const style = getComputedStyle(textNode)
          return style.textOverflow !== 'ellipsis' && style.overflow !== 'hidden'
        })
      )
    }),
  )
  expect(firstSheetFits).toBe(true)

  const firstSheetRatio = await firstSheet.evaluate((element) => {
    const rect = element.getBoundingClientRect()
    return rect.width / rect.height
  })
  expect(firstSheetRatio).toBeGreaterThan(0.96)
  expect(firstSheetRatio).toBeLessThan(1.04)

  await page.setViewportSize({ width: 1708, height: 900 })
  await expect(sheets).toHaveCount(2)
  const shortViewportPaper = await sheets.first().evaluate((element) => {
    const rect = element.getBoundingClientRect()
    return {
      top: rect.top,
      bottomSpace: window.innerHeight - rect.bottom,
      ratio: rect.width / rect.height,
    }
  })
  expect(shortViewportPaper.top).toBeLessThan(45)
  expect(shortViewportPaper.bottomSpace).toBeLessThan(45)
  expect(shortViewportPaper.ratio).toBeGreaterThan(0.96)
  expect(shortViewportPaper.ratio).toBeLessThan(1.04)

  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: '禅模式' })).toBeVisible()
})
