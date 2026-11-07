<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-2026110402",
  "release": "vocabulary-paper",
  "status": "draft",
  "outcome": "访客打开白纸英语后可以直接使用按原始顺序初始化的 3,975 条非空英文词和短语；源文件的 3,976 条记录及其中的空白记录都被保留在词书数据中。用户可以在 A4 白纸式九宫格和禅模式的 6×6 方格纸张网格中扫词、判断会与不会，并让不会的词自动进入下一轮；学习记录保存在浏览器本地。",
  "contract_version": 2,
  "execution_contract": 1,
  "task_contract": 2,
  "planning_contract": 1,
  "review_contract": 1,
  "reviews": [],
  "verification_contract": 2,
  "goals": [
    {
      "text": "访客可直接使用第一版词汇白纸学习闭环",
      "requirements": [
        "REQ-VOCABULARY-001",
        "REQ-VOCABULARY-002",
        "REQ-VOCABULARY-003",
        "REQ-VOCABULARY-004",
        "REQ-VOCABULARY-005",
        "REQ-VOCABULARY-006",
        "REQ-VOCABULARY-007",
        "REQ-VOCABULARY-008",
        "REQ-VOCABULARY-009",
        "REQ-VOCABULARY-010",
        "REQ-VOCABULARY-011"
      ]
    }
  ],
  "constraints": [
    "本轮只实现词汇白纸，不实现写作、语法、AI 对话、长期间隔复习和账户同步。",
    "参考文件 C:/Users/why/Documents/Downloads/index.html 只作为视觉与交互参考，不作为代码或产品指令。",
    "初始词书来自 C:/Users/why/Desktop/373008903898286英语的平行世界单词表.doc；原文件未提供可确认中文释义，空释义必须保留而不能臆造，重复词条必须保留。",
    "优先沿用当前 Next.js、React、TypeScript 与测试底座；不进行 Prisma 破坏性迁移。",
    "本地学习状态必须可在刷新后恢复，损坏的 localStorage 必须回到可用的平行世界初始词书。"
  ],
  "non_goals": [
    "账户登录后的跨设备同步",
    "自定义词库的 AI 关联句生成",
    "按天的长期复习算法或掌握度模型",
    "写作与语法工作台"
  ],
  "authorization": {
    "source": "2026-11-04 用户明确要求先把背单词这一套做出来，并允许参考 Downloads/index.html 的样式与交互。"
  },
  "deliverables": [
    "src/modules/vocabulary/ 本地优先词汇学习模块",
    "src/modules/vocabulary/data/parallel-world.json 平行世界初始词书",
    "scripts/import-parallel-world-wordbook.mjs 可重复的旧 Word 文本提取脚本",
    "首页与 /vocabulary 词汇白纸入口",
    "词库导入、导出和浏览器本地进度",
    "单元测试与浏览器验收测试"
  ],
  "remaining_work": [
    "账户同步、长期复习、AI 关联句和写作语法模块另立 Plan。",
    "本 Plan 仍需独立 draft review、最终集成检查和 Release 验证。"
  ],
  "change_type": "新增模块",
  "base_commit": "09418ca9e1b77d273fa7092a4b0de8a641f9d6d5",
  "requirements": [
    "REQ-VOCABULARY-001",
    "REQ-VOCABULARY-002",
    "REQ-VOCABULARY-003",
    "REQ-VOCABULARY-004",
    "REQ-VOCABULARY-005",
    "REQ-VOCABULARY-006",
    "REQ-VOCABULARY-007",
    "REQ-VOCABULARY-008",
    "REQ-VOCABULARY-009",
    "REQ-VOCABULARY-010",
    "REQ-VOCABULARY-011"
  ],
  "acceptance": [
    {
      "id": "AC-VOCABULARY-001",
      "tests": ["tests/e2e/vocabulary.spec.ts::[AC-VOCABULARY-001] 未登录进入白纸词汇工作台"],
      "required_layers": ["browser"],
      "checks": [
        {
          "test": "tests/e2e/vocabulary.spec.ts::[AC-VOCABULARY-001] 未登录进入白纸词汇工作台",
          "layer": "browser"
        }
      ]
    },
    {
      "id": "AC-VOCABULARY-002",
      "tests": ["tests/e2e/vocabulary.spec.ts::[AC-VOCABULARY-002] 手动分页并判断会与不会"],
      "required_layers": ["browser"],
      "checks": [
        {
          "test": "tests/e2e/vocabulary.spec.ts::[AC-VOCABULARY-002] 手动分页并判断会与不会",
          "layer": "browser"
        }
      ]
    },
    {
      "id": "AC-VOCABULARY-003",
      "tests": [
        "tests/e2e/vocabulary.spec.ts::[AC-VOCABULARY-003] 配置点击默认判断并用 Shift 反转"
      ],
      "required_layers": ["browser"],
      "checks": [
        {
          "test": "tests/e2e/vocabulary.spec.ts::[AC-VOCABULARY-003] 配置点击默认判断并用 Shift 反转",
          "layer": "browser"
        }
      ]
    },
    {
      "id": "AC-VOCABULARY-004",
      "tests": ["tests/e2e/vocabulary.spec.ts::[AC-VOCABULARY-004] 下一轮只保留上一轮不会词"],
      "required_layers": ["browser"],
      "checks": [
        {
          "test": "tests/e2e/vocabulary.spec.ts::[AC-VOCABULARY-004] 下一轮只保留上一轮不会词",
          "layer": "browser"
        }
      ]
    },
    {
      "id": "AC-VOCABULARY-005",
      "tests": ["tests/e2e/vocabulary.spec.ts::[AC-VOCABULARY-005] 关联辅助共享原任务与错词池"],
      "required_layers": ["browser"],
      "checks": [
        {
          "test": "tests/e2e/vocabulary.spec.ts::[AC-VOCABULARY-005] 关联辅助共享原任务与错词池",
          "layer": "browser"
        }
      ]
    },
    {
      "id": "AC-VOCABULARY-006",
      "tests": [
        "tests/e2e/vocabulary.spec.ts::[AC-VOCABULARY-006] 刷新恢复本地任务与设置并处理损坏存储"
      ],
      "required_layers": ["browser"],
      "checks": [
        {
          "test": "tests/e2e/vocabulary.spec.ts::[AC-VOCABULARY-006] 刷新恢复本地任务与设置并处理损坏存储",
          "layer": "browser"
        }
      ]
    },
    {
      "id": "AC-VOCABULARY-007",
      "tests": [
        "tests/e2e/vocabulary.spec.ts::[AC-VOCABULARY-007] 导入 CSV TXT JSON 且拒绝无效输入"
      ],
      "required_layers": ["browser"],
      "checks": [
        {
          "test": "tests/e2e/vocabulary.spec.ts::[AC-VOCABULARY-007] 导入 CSV TXT JSON 且拒绝无效输入",
          "layer": "browser"
        }
      ]
    },
    {
      "id": "AC-VOCABULARY-008",
      "tests": [
        "tests/e2e/vocabulary.spec.ts::[AC-VOCABULARY-008] 导出 JSON Markdown 并可重导入 JSON"
      ],
      "required_layers": ["browser"],
      "checks": [
        {
          "test": "tests/e2e/vocabulary.spec.ts::[AC-VOCABULARY-008] 导出 JSON Markdown 并可重导入 JSON",
          "layer": "browser"
        }
      ]
    },
    {
      "id": "AC-VOCABULARY-009",
      "tests": [
        "tests/e2e/vocabulary.spec.ts::[AC-VOCABULARY-009] A4 扫词纸在视口内完整可见"
      ],
      "required_layers": ["browser"],
      "checks": [
        {
          "test": "tests/e2e/vocabulary.spec.ts::[AC-VOCABULARY-009] A4 扫词纸在视口内完整可见",
          "layer": "browser"
        }
      ]
    },
    {
      "id": "AC-VOCABULARY-010",
      "tests": [
        "tests/e2e/vocabulary.spec.ts::[AC-VOCABULARY-010] 多本词书切换保持各自轮次"
      ],
      "required_layers": ["browser"],
      "checks": [
        {
          "test": "tests/e2e/vocabulary.spec.ts::[AC-VOCABULARY-010] 多本词书切换保持各自轮次",
          "layer": "browser"
        }
      ]
    },
    {
      "id": "AC-VOCABULARY-011",
      "tests": [
        "tests/e2e/vocabulary.spec.ts::[AC-VOCABULARY-011] 禅模式隐藏工作台并铺满纸张"
      ],
      "required_layers": ["browser"],
      "checks": [
        {
          "test": "tests/e2e/vocabulary.spec.ts::[AC-VOCABULARY-011] 禅模式隐藏工作台并铺满纸张",
          "layer": "browser"
        }
      ]
    }
  ],
  "verification_requirements": ["unit", "browser"],
  "tasks": [
    {
      "id": "T1",
      "title": "锁定参考交互、Feature 映射与真实验收用例",
      "phase": "prepare",
      "status": "todo",
      "result": "词汇 Feature、参考 HTML 审计、单元测试与 8 条浏览器验收用例已写入，待独立审查后推进状态。",
      "scope": [
        "docs/features/vocabulary.md",
        "docs/plans/20261104-vocabulary-paper.md",
        "tests/unit/vocabulary.test.ts",
        "tests/e2e/vocabulary.spec.ts"
      ],
      "depends_on": [],
      "owner": "codex"
    },
    {
      "id": "T2",
      "title": "完成实现、单元、浏览器与响应式验证",
      "phase": "verify",
      "acceptance": [
        "AC-VOCABULARY-001",
        "AC-VOCABULARY-002",
        "AC-VOCABULARY-003",
        "AC-VOCABULARY-004",
        "AC-VOCABULARY-005",
        "AC-VOCABULARY-006",
        "AC-VOCABULARY-007",
        "AC-VOCABULARY-008"
      ],
      "status": "todo",
      "result": "实现已在工作树中完成；初始词书已导入 3,976 条源记录和 3,975 条非空词条，并保留重复项，单元测试与桌面 Chromium 8 条验收已通过，移动端、集成和 Release 级验证待完成。",
      "scope": [
        "scripts/import-parallel-world-wordbook.mjs",
        "src/modules/vocabulary/",
        "src/app/page.tsx",
        "src/app/vocabulary/",
        "src/config/site.ts",
        "src/config/navigation.ts",
        "tests/unit/vocabulary.test.ts",
        "tests/e2e/vocabulary.spec.ts",
        "docs/designs/"
      ],
      "depends_on": ["T1"],
      "owner": "codex"
    }
  ],
  "depends_on": [],
  "dependency_contracts": [],
  "shared_files": [],
  "handoff": {
    "interfaces": [],
    "migrations": [],
    "tests": ["tests/unit/vocabulary.test.ts", "tests/e2e/vocabulary.spec.ts"],
    "remaining": ["账户同步与长期复习另立 Plan"]
  },
  "owner": "codex",
  "risk": "feature",
  "data_contract": {
    "access_scope": "not-applicable",
    "access_rationale": "本轮只写浏览器 localStorage，不写服务端业务数据。",
    "migration_impact": "none",
    "rollback": "移除词汇入口和 vocabulary 模块即可恢复模板入口；localStorage key 可被浏览器自然弃用。",
    "destructive_authorization": null
  },
  "write_scope": [
    "src/modules/vocabulary/",
    "src/app/page.tsx",
    "src/app/vocabulary/",
    "src/config/site.ts",
    "src/config/navigation.ts",
    "scripts/import-parallel-world-wordbook.mjs",
    "vitest.config.ts",
    "tests/unit/vocabulary.test.ts",
    "tests/e2e/vocabulary.spec.ts",
    "docs/features/vocabulary.md",
    "docs/others/test-cases/vocabulary.md",
    "docs/designs/",
    "docs/plans/20261104-vocabulary-paper.md",
    "docs/plans/releases/vocabulary-paper.json"
  ],
  "tdd_evidence": [],
  "required_evidence": ["check-integration"],
  "evidence": [],
  "blocker": null,
  "open_questions": [
    "是否在下一轮为登录用户增加云端同步；是否把关联句从演示数据扩展为可验证的数据管线。"
  ],
  "integrated_commit": null,
  "updated_at": "2026-11-05"
}
-->

# Ignite 实施计划：词汇白纸第一版

## 目标

本轮把参考 HTML 中已经明确的词汇学习闭环落到仓库：访客打开首页即可开始；从用户提供的旧 Word 词书按原始顺序初始化的 3,975 条非空英文词和短语或用户自己的词库都能在 A4 白纸式九宫格里学习，禅模式中的每张纸固定为 36 个词位、四个 3×3 九宫格和正方形词格，3,976 条源记录也会保存在词书数据中；用户的判断决定下一轮只留下哪些词；刷新页面后当天状态仍在。

## 状态

这是一个已获得用户实施授权、但尚未通过独立 draft review 的实施 Plan。代码和测试已经写入工作树；结构化状态暂时保持 draft，避免把未完成的审查和 red 证据伪称为完成。

## 原始目标与覆盖核对

| 用户原话或可追溯来源                                                                | 本轮目标                                                    | REQ                     | AC                     | 处理结果                                                         |
| ----------------------------------------------------------------------------------- | ----------------------------------------------------------- | ----------------------- | ---------------------- | ---------------------------------------------------------------- |
| 2026-11-04 用户要求先把“背单词那一套东西”做出来，并允许参考 `Downloads/index.html`  | 先完成可用的本地词汇学习闭环和参考样式                      | REQ-VOCABULARY-001～008 | AC-VOCABULARY-001～008 | 已实现，等待独立审查与移动端验证                                 |
| 2026-11-04 用户提供 `373008903898286英语的平行世界单词表.doc`，要求全部初始化并排入 | 将全部源记录按原始顺序保存为默认初始词书                    | 词表来源约束            | 初始词书完整性         | 已提取 3,976 条源记录，载入 3,975 条非空词条，保留重复项和空记录 |
| 2026-11-05 用户指出禅模式必须保留一张纸 36 词、四个九宫格且不能用省略号             | 让禅模式按 6×6 方格呈现，完整显示词条并按纸张批量推进       | REQ-VOCABULARY-011      | AC-VOCABULARY-011      | 已实现，需补同一浏览器表面上的正式验收证据                       |
| 2026-11-05 用户指出视口变矮时纸张被拉成长条，网格上下出现大块空白                   | 让纸张比例跟随方格边长，不因 CSS 行高拉伸                   | REQ-VOCABULARY-011      | AC-VOCABULARY-011      | 已修复，并用 1708×1154 桌面视口补充比例验收                      |
| 2026-11-05 用户指出默认模式与禅模式没有复用组件，窄高度仍有大块上下空白             | 共用纸张、九宫格、词格和进场动效，并按可用面积选择列行      | REQ-VOCABULARY-011      | AC-VOCABULARY-011      | 已实现，并补 1708×900 窄高度布局验收                             |
| 2026-11-05 用户指出默认模式标红后进入禅模式，词格 hover 变成灰色                    | 共用词格状态规则，保证会/不会/预览状态色跨模式保持一致      | REQ-VOCABULARY-011      | AC-VOCABULARY-011      | 已修复，并补默认模式到禅模式的状态色回归断言                     |
| 2026-11-05 用户指出四个九宫格上下间距不一致且 hover 背景遮挡上一组词格              | 让上下九宫格复用内部词格间距，并约束行高避免组间重叠        | REQ-VOCABULARY-011      | AC-VOCABULARY-011      | 已修复，并补跨九宫格与内部词格间距及不重叠断言                   |
| 2026-11-05 用户指出四个九宫格中缝和左右缝仍被布局轨道撑大                           | 将四组语义九宫格放入统一 6×6 视觉网格，所有词格复用同一 gap | REQ-VOCABULARY-011      | AC-VOCABULARY-011      | 已修复，并在清理 Next 开发缓存后重新加载浏览器确认               |

## 整体判断与推进顺序

当前最确定、且能直接验证的价值是“快速扫词并反复筛选不会词”。参考 HTML 已经给出可观察的交互边界，因此先把这条链路做成本地优先模块；账户同步、长期复习算法和 AI 关联句会改变数据模型，暂不和第一版混合。实现顺序是：词汇纯逻辑 → 词汇白纸页面 → 导入导出与恢复 → 浏览器行为验收 → 再决定服务端数据模型。

## 非目标

本轮不实现写作、语法、AI 对话、账户同步、长期间隔复习或自定义词库的 AI 关联句生成。

## 变更类型

这是新增词汇模块，但采用本地优先策略，因此不触碰 Prisma schema、迁移或服务端业务 API。回滚边界是移除首页词汇入口和 `src/modules/vocabulary/`，不影响现有认证和模板 API。

## 输入规格

- 产品边界与词汇需求：[词汇 Feature](../features/vocabulary.md)
- 参考交互：用户提供的 `C:/Users/why/Documents/Downloads/index.html`；只吸收其视觉层级和已存在的本地交互，不复制为生产代码。
- 初始词书：用户提供的 `C:/Users/why/Desktop/373008903898286英语的平行世界单词表.doc`；使用 `scripts/import-parallel-world-wordbook.mjs` 提取为 `src/modules/vocabulary/data/parallel-world.json`。
- 当前工程约束：Next.js App Router、React、TypeScript、CSS Modules、Vitest、Playwright。

## 已关闭问题

- 第一版是否要求登录：本轮关闭为不要求登录。
- 第一版是否做服务端持久化：本轮关闭为只写浏览器 localStorage。
- 参考 HTML 是否直接复制：关闭为只吸收其可观察样式与交互。
- 初始词书是否臆造中文释义：关闭为只保留可确认英文词条，中文释义为空并由后续导入补充。

## 实现任务

任务结构已经写入顶部元数据。T1 负责规格与测试，T2 负责实现后的单元、浏览器、移动端和 Release 验证；在补齐 red 证据和独立审查前，任务状态保持 todo。

## 测试与验收设计

- `tests/unit/vocabulary.test.ts` 验证初始词书的 3,976 条源记录、3,975 条非空词条、重复项、英文-only 导入、错词进入下一轮、完成条件和导出格式，回答词书初始化和领域状态转换是否独立正确。
- `tests/e2e/vocabulary.spec.ts` 验证访客入口、会/不会判定、Shift 反转、多轮筛选、关联辅助、本地恢复、损坏存储、导入和导出，以及禅模式每张纸的 36 个词位、四个九宫格、方格尺寸和无省略号。
- 桌面 Chromium 的 8 条词汇验收已通过；下一步补移动 Chromium 和 Release 级检查。

## 验收方式

先由独立审查关闭 draft review，再对每条浏览器 AC 取得真实 red/green 证据，随后运行集成检查和移动端回归，最后由 Release 验证生产构建。当前已完成的直接 Playwright 运行只作为开发期行为证据，不替代正式 Plan 验收。

## 设计回写

当前第一版是浏览器本地状态，不改 Prisma 和 Hono API。等本地学习行为稳定并关闭同步语义后，再把词库、学习任务、轮次和判断记录迁移到服务端模型。

## 状态记录

- 2026-11-04：读取参考 HTML，确认它包含九宫格扫词、关联辅助、导入、本地状态和多轮筛选。
- 2026-11-04：实现本地词汇模块，并通过单元测试与桌面 Chromium 8 条验收。
- 2026-11-04：使用 antiword 从用户提供的旧 Word 词书提取 3,976 条源记录，其中 3,975 条非空，按原始顺序保留重复项和第 3,476 条空记录，生成 `src/modules/vocabulary/data/parallel-world.json`，并将非空词条设为默认初始词库。
- 2026-11-04：导入解析改为允许空中文释义，localStorage 版本升级到 v2，避免旧演示词库覆盖新初始词书。
- 2026-11-04：完整 `run-e2e` 被仓库既有迁移复制问题阻断：临时 Prisma 目录报告缺少 `migration.sql`；因此当前 browser 证据来自直接 `playwright test` 的隔离开发服务器运行。

- 2026-11-04：平行世界词书已从用户提供的旧 Word 文件提取 3,976 条源记录和 3,975 条非空词条，按原始顺序保留重复项，设为默认初始词库；单元测试 5 项、当前数据下的桌面 Chromium 8 项、类型检查和生产构建通过。当前数据下的移动 Chromium 运行被测试服务器反复返回 `/api/health` 404 阻断，未将旧数据版本的移动端结果冒充为当前证据。准备校验仍因历史上先实现后取得 red、未完成独立 draft review、缺少细化 red/implement 任务而保持 draft。docs:check 仍只报 grammar、adoption、whitepaper、workspace、writing 目标稿缺少自动化测试。
- 2026-11-05：用户确认新增 REQ-VOCABULARY-009。当前 A4 扫词纸必须在用户打开产品的屏幕尺寸内完整落入一个视口，用户无需滚动、拆页或展开即可从上到下扫完。此次只更新 Feature 和测试意图，未修改实现。
- 2026-11-05：用户补充禅模式硬约束：每张纸固定 36 个词位，排成四个 3×3 九宫格；词格保持正方形；词条必须完整显示，放不下时减少同时呈现的纸张数量而不是使用界面截断。实现同步修正为方格纸张、自适应批量和整批推进；浏览器实时检查确认当前视口中词格为正方形、词条无界面截断且无内容溢出，正式 Playwright 运行仍受仓库既有 Prisma migration 缺失问题阻断。
- 2026-11-05：冷启动浏览器检查确认当前视口显示 3 列 × 2 行共 6 张禅模式纸，每张 36 个词位、4 个九宫格、词格宽高相等且纸张区域无滚动。单元测试 6 项通过。一次桌面 Playwright 回归中 11 项通过，AC-VOCABULARY-009 暴露普通模式纸张高度适配缺口，AC-VOCABULARY-011 的旧断言误把词库原文自带的省略号当成界面截断；已分别补上普通纸张的可用高度约束和断言修正。修正后的定向 Playwright 再次启动时被既有 `/api/health` 404 readiness 问题阻断，未把它伪称为正式绿灯。
- 2026-11-05：清理残留测试服务后，使用 WSL、E2E_PORT=3100 在桌面 Chromium 重新执行 `tests/e2e/vocabulary.spec.ts`，13 项全部通过，包含 AC-VOCABULARY-009 的普通纸张完整可见性和 AC-VOCABULARY-011 的禅模式 36 词四九宫格验收。类型检查、格式检查和单元测试 6 项也通过。
- 2026-11-05：复现用户提供的窄高度截图，确认根因是网格行使用剩余高度拉伸纸张，而不是词格比例计算错误。修正禅模式纸张比例为方格决定的近正方形，并在 1708×1154 桌面视口验证纸张比例、36 词、四九宫格和完整词条均通过。
- 2026-11-05：继续追踪发现默认模式和禅模式分别复制了纸张、网格和进场动效；同时发现仅按纸张数量优先会在窄高度保留过多列数。新增 `PaperSurface` 与 `ScanGrid` 共用组件，统一纸张材质和 `sheetEnter` 动效，并改为按可用纸张面积选择布局。1708×900 视口改为两列大纸张，纸张上下边距均小于 45px。
- 2026-11-05：复现用户反馈，确认禅模式的通用 hover 规则覆盖了共享词格的红色 hover 状态，造成已标红词看起来变灰。将禅模式中性 hover 限制为未标记词格，并在 AC-VOCABULARY-011 中验证默认模式标红后进入禅模式仍保持同一红色状态反馈。
- 2026-11-05：复现四个九宫格的组间布局，确认外部 `gap` 大于内部词格间距，并且两行自适应内容高度可能造成上下词格的视觉重叠。统一组间与内部间距，改用纸张内部两行等分高度约束九宫格，浏览器验收确认组间间距与内部间距一致且无重叠。
- 2026-11-05：发现四组独立 3×3 网格即使共享 `gap`，仍会因列轨道剩余空间形成过大的中缝和两侧缝。改为统一 6×6 视觉网格，并通过显式行列位置保留四个九宫格的语义分组；清理 `.next` 开发缓存、重启 3002 并在浏览器确认所有词格间距统一。

## 准出条件

独立 draft review、移动端浏览器验收、集成检查和 Release 验证完成后，才把本 Plan 标记为 done。本轮实现虽然已可用，但不把未完成的验证伪称为完成。

<!-- ignite-progress -->

状态：`draft`（由元数据生成）

- [ ] T1 · 锁定参考交互、Feature 映射与真实验收用例 · todo
- [ ] T2 · 完成实现、单元、浏览器与响应式验证 · todo

验收缺口：账户同步、长期复习、AI 关联句和写作语法模块另立 Plan。；本 Plan 仍需独立 draft review、最终集成检查和 Release 验证。
证据：尚无
<!-- /ignite-progress -->
