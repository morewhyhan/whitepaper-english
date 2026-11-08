import { expect, test } from '@playwright/test'

test('[AC-ACCOUNT-012] 点击词条播放美式发音', async ({ page }) => {
  await page.addInitScript(() => {
    const spoken: { text: string; lang: string }[] = []
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        cancel: () => {},
        speak: (utterance: SpeechSynthesisUtterance) => {
          spoken.push({ text: utterance.text, lang: utterance.lang })
        },
      },
    })
    ;(window as unknown as { __spoken: typeof spoken }).__spoken = spoken
  })

  await page.goto('/vocabulary')
  await page.getByRole('heading', { name: '第 1 轮' }).waitFor()

  const firstWord = page.locator('button[title*="普通点击"]').nth(10)
  await firstWord.click()

  const spoken = await page.evaluate(
    () => (window as unknown as { __spoken: { text: string; lang: string }[] }).__spoken,
  )
  expect(spoken.length).toBeGreaterThan(0)
  expect(spoken[0]?.lang).toBe('en-US')
  expect(spoken[0]?.text.length).toBeGreaterThan(0)
})
