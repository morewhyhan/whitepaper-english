import { test } from '@playwright/test'

/**
 * 语法章节的验收规格已写入 docs/GOAL.md 与 docs/features/grammar.md。
 * 页面、课程内容、判题与持久化尚未实现，因此这里先显式标记为待实现，
 * 不用空断言或跳过测试伪造通过。
 */
test.describe('语法章节（待实现）', () => {
  test('[AC-GRAMMAR-001] 课程目录按 G_INDEX order 呈现', async () => { test.skip() })
  test('[AC-GRAMMAR-002] 一次只推进一个机制、一道题', async () => { test.skip() })
  test('[AC-GRAMMAR-003] 判题先判题，再判证据', async () => { test.skip() })
  test('[AC-GRAMMAR-004] 学习状态先落盘再出下一题', async () => { test.skip() })
  test('[AC-GRAMMAR-005] 错题追加并换未见过的新题复验', async () => { test.skip() })
  test('[AC-GRAMMAR-006] 整课总结后才通过 G', async () => { test.skip() })
  test('[AC-GRAMMAR-007] 内容快照有版本、来源和范围边界', async () => { test.skip() })
  test('[AC-GRAMMAR-008] 语法与词汇、写作的掌握互相隔离', async () => { test.skip() })
  test('[AC-GRAMMAR-009] AI 不可用时只读，不伪造判题', async () => { test.skip() })
})
