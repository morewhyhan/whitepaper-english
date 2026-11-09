import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.route('https://huggingface.co/**', (route) => route.abort())
  await page.addInitScript(() => {
    const target = window as unknown as { __spoken: string[] }
    target.__spoken = []
    const original = window.speechSynthesis.speak.bind(window.speechSynthesis)
    window.speechSynthesis.speak = (utterance: SpeechSynthesisUtterance) => {
      target.__spoken.push(utterance.text)
      original(utterance)
    }
  })
})

test('[AC-ACCOUNT-015] 关联辅助按批预取，连续换词不再请求', async ({ page }) => {
  const requests: string[] = []
  page.on('request', (request) => {
    if (request.url().includes('/api/vocabulary/associations')) requests.push(request.url())
  })

  await page.goto('/vocabulary')
  await page.waitForFunction(() => Boolean(localStorage.getItem('whitepaper-vocabulary-v2')))
  await page.getByRole('button', { name: '关联辅助', exact: true }).click()
  await expect(page.locator('button[class*=assocNode]')).toHaveCount(8)

  const loaded = requests.length
  expect(loaded).toBeGreaterThan(0)

  for (let index = 0; index < 5; index += 1) {
    const before = await page.locator('[class*=targetEn]').innerText()
    await page.getByRole('button', { name: '下一个词', exact: true }).click()
    await page.waitForFunction(
      (previous) => document.querySelector('[class*=targetEn]')?.textContent !== previous,
      before,
    )
  }

  expect(requests.length).toBe(loaded)
  await expect(page.locator('button[class*=assocNode]')).toHaveCount(8)
})

test('[AC-ACCOUNT-016] 点击关联句节点播放静态音频', async ({ page }) => {
  await page.addInitScript(() => {
    const target = window as unknown as { __played: string[] }
    target.__played = []
    const original = HTMLMediaElement.prototype.play
    HTMLMediaElement.prototype.play = function play() {
      target.__played.push(this.src)
      return Promise.resolve()
    }
    void original
  })
  await page.goto('/vocabulary')
  await page.waitForFunction(() => Boolean(localStorage.getItem('whitepaper-vocabulary-v2')))
  await page.getByRole('button', { name: '关联辅助', exact: true }).click()
  const node = page.locator('button[class*=assocNode]').first()
  await expect(node).toBeVisible()
  const sentence = await node.locator('[class*=assocSentence]').innerText()

  await node.click()
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { __played: string[] }).__played.at(-1)))
    .toContain('/audio/')
  expect(await page.evaluate(() => (window as unknown as { __spoken: string[] }).__spoken.length)).toBe(0)
  void sentence
})

test('[AC-ACCOUNT-017] 静态音频不可用时系统语音兜底且无手动音色选择', async ({ page }) => {
  await page.route('**/audio/**', (route) => route.abort())
  await page.goto('/vocabulary')
  await page.waitForFunction(() => Boolean(localStorage.getItem('whitepaper-vocabulary-v2')))
  const word = page.locator('button[class*=word]').first()
  const label = await word.getAttribute('aria-label')
  const text = (label ?? '').split(',')[0] ?? ''
  await word.evaluate((element) => (element as HTMLElement).click())
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { __spoken: string[] }).__spoken.at(-1)))
    .toBe(text)

  await page.getByRole('button', { name: '设置', exact: true }).click()
  await page.getByRole('button', { name: /发音与声音/ }).click()
  await expect(page.getByText(/不提供手动音色选择|只提供总开关/)).toBeVisible()
  await expect(page.getByRole('combobox', { name: /音色|声音/ })).toHaveCount(0)
})

test('[AC-ACCOUNT-018] 重置今天在面板内确认并回到第一页', async ({ page }) => {
  await page.goto('/vocabulary')
  await page.waitForFunction(() => Boolean(localStorage.getItem('whitepaper-vocabulary-v2')))
  await page.getByRole('button', { name: '下一页', exact: true }).click()
  await expect(page.getByText('本页 37—72 / 3867')).toBeVisible()

  await page.getByRole('button', { name: '设置', exact: true }).click()
  await page.getByRole('button', { name: /词书与数据/ }).click()
  await page.getByRole('button', { name: '重置今天这本书', exact: true }).click()
  await page.getByRole('button', { name: '确认重置', exact: true }).click()

  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByText('本页 1—36 / 3867')).toBeVisible()
  await expect(page.getByText('今日进度已清零')).toBeVisible()
})


test('[AC-VOCABULARY-003] Enter 只翻页，不触发当前焦点词块', async ({ page }) => {
  await page.goto('/vocabulary')
  await page.evaluate(() => localStorage.removeItem('whitepaper-vocabulary-v2'))
  await page.reload()
  await page.waitForFunction(() => Boolean(localStorage.getItem('whitepaper-vocabulary-v2')))
  await page.locator('button[class*=word]').first().focus()
  await page.keyboard.press('Enter')
  await expect(page.getByText('本页 37—72 / 3867')).toBeVisible()
  const marks = await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem('whitepaper-vocabulary-v2') as string)
    return Object.keys(state.sessions[Object.keys(state.sessions)[0]]?.marks ?? {}).length
  })
  expect(marks).toBe(0)
})

test('[AC-VOCABULARY-012] 本页清空只重置当前页', async ({ page }) => {
  await page.goto('/vocabulary')
  await page.evaluate(() => localStorage.removeItem('whitepaper-vocabulary-v2'))
  await page.reload()
  await page.waitForFunction(() => Boolean(localStorage.getItem('whitepaper-vocabulary-v2')))
  await page.locator('button[class*=word]').first().click()
  await page.waitForTimeout(250)
  const before = await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem('whitepaper-vocabulary-v2') as string)
    const session = state.sessions[Object.keys(state.sessions)[0]]
    return { cursor: session.cursor, marks: Object.keys(session.marks).length }
  })
  expect(before.marks).toBe(1)
  await page.getByRole('button', { name: '本页清空', exact: true }).click()
  const after = await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem('whitepaper-vocabulary-v2') as string)
    const session = state.sessions[Object.keys(state.sessions)[0]]
    return { cursor: session.cursor, marks: Object.keys(session.marks).length }
  })
  expect(after.marks).toBe(0)
  expect(after.cursor).toBe(before.cursor)
  await expect(page.getByText('本页 1—36 / 3867')).toBeVisible()
})
