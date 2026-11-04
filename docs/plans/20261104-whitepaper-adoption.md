<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-2026110401",
  "release": "whitepaper-adoption",
  "status": "draft",
  "outcome": "白纸英语访客可在本地完成可带走的词汇学习闭环，同时保留认证基础设施。",
  "contract_version": 2,
  "execution_contract": 1,
  "task_contract": 2,
  "planning_contract": 1,
  "review_contract": 1,
  "reviews": [],
  "verification_contract": 2,
  "goals": [
    {
      "text": "采用白纸英语身份并保留认证和用户商业文件",
      "requirements": [
        "REQ-ADOPTION-001"
      ]
    },
    {
      "text": "访客本地优先完成词汇判断、多轮与关联、导入导出",
      "requirements": [
        "REQ-VOCABULARY-001",
        "REQ-VOCABULARY-002",
        "REQ-VOCABULARY-003",
        "REQ-VOCABULARY-004",
        "REQ-VOCABULARY-005",
        "REQ-VOCABULARY-006",
        "REQ-VOCABULARY-007",
        "REQ-VOCABULARY-008"
      ]
    }
  ],
  "constraints": [
    "BUSINESS_MODEL.md 是用户文件，不修改或清理。",
    "保留 Better Auth、独立认证回归和全部历史 migrations。",
    "准备阶段仅写规格计划测试，实施须经过独立审查和真实红灯。",
    "词汇浏览器持久化是经用户授权的 RPC 例外，服务端业务仍走原 RPC 链。",
    "BUSINESS_MODEL.md 保留原始字节；仅在 .prettierignore 增加精确排除，不格式化该用户文件。"
  ],
  "non_goals": [
    "本次不交付云同步、写作检查或语法教学；这些能力在 Release 明确延期。",
    "不发送外部 AI 请求，不部署、不宣称学习效果。"
  ],
  "authorization": {
    "source": "2026-11-04 用户授权全部既定采用工作，并限定本执行者只做文档准备；后续主代理经 review/TDD 实施。"
  },
  "deliverables": [
    "白纸英语身份与访客词汇工作台",
    "本地数据和 JSON/Markdown 导出",
    "保留认证基础设施及回归"
  ],
  "remaining_work": [],
  "change_type": "新增模块",
  "base_commit": "b437eee0cda58f46ba5c496948c94c0dd85c6442",
  "requirements": [
    "REQ-ADOPTION-001",
    "REQ-VOCABULARY-001",
    "REQ-VOCABULARY-002",
    "REQ-VOCABULARY-003",
    "REQ-VOCABULARY-004",
    "REQ-VOCABULARY-005",
    "REQ-VOCABULARY-006",
    "REQ-VOCABULARY-007",
    "REQ-VOCABULARY-008"
  ],
  "acceptance": [
    {
      "id": "AC-VOCABULARY-001",
      "tests": [
        "tests/e2e/whitepaper.spec.ts::[AC-VOCABULARY-001] 未登录进入白纸词汇工作台"
      ],
      "required_layers": [
        "browser"
      ],
      "checks": [
        {
          "test": "tests/e2e/whitepaper.spec.ts::[AC-VOCABULARY-001] 未登录进入白纸词汇工作台",
          "layer": "browser"
        }
      ]
    },
    {
      "id": "AC-VOCABULARY-002",
      "tests": [
        "tests/e2e/whitepaper.spec.ts::[AC-VOCABULARY-002] 手动分页并判断会与不会"
      ],
      "required_layers": [
        "browser"
      ],
      "checks": [
        {
          "test": "tests/e2e/whitepaper.spec.ts::[AC-VOCABULARY-002] 手动分页并判断会与不会",
          "layer": "browser"
        }
      ]
    },
    {
      "id": "AC-VOCABULARY-003",
      "tests": [
        "tests/e2e/whitepaper.spec.ts::[AC-VOCABULARY-003] 配置点击默认判断并用 Shift 反转"
      ],
      "required_layers": [
        "browser"
      ],
      "checks": [
        {
          "test": "tests/e2e/whitepaper.spec.ts::[AC-VOCABULARY-003] 配置点击默认判断并用 Shift 反转",
          "layer": "browser"
        }
      ]
    },
    {
      "id": "AC-VOCABULARY-004",
      "tests": [
        "tests/e2e/whitepaper.spec.ts::[AC-VOCABULARY-004] 下一轮只保留上一轮不会词"
      ],
      "required_layers": [
        "browser"
      ],
      "checks": [
        {
          "test": "tests/e2e/whitepaper.spec.ts::[AC-VOCABULARY-004] 下一轮只保留上一轮不会词",
          "layer": "browser"
        }
      ]
    },
    {
      "id": "AC-VOCABULARY-005",
      "tests": [
        "tests/e2e/whitepaper.spec.ts::[AC-VOCABULARY-005] 关联辅助共享原任务与错词池"
      ],
      "required_layers": [
        "browser"
      ],
      "checks": [
        {
          "test": "tests/e2e/whitepaper.spec.ts::[AC-VOCABULARY-005] 关联辅助共享原任务与错词池",
          "layer": "browser"
        }
      ]
    },
    {
      "id": "AC-VOCABULARY-006",
      "tests": [
        "tests/e2e/whitepaper.spec.ts::[AC-VOCABULARY-006] 刷新恢复本地任务与设置并处理损坏存储"
      ],
      "required_layers": [
        "browser"
      ],
      "checks": [
        {
          "test": "tests/e2e/whitepaper.spec.ts::[AC-VOCABULARY-006] 刷新恢复本地任务与设置并处理损坏存储",
          "layer": "browser"
        }
      ]
    },
    {
      "id": "AC-VOCABULARY-007",
      "tests": [
        "tests/e2e/whitepaper.spec.ts::[AC-VOCABULARY-007] 导入 CSV TXT JSON 且拒绝无效输入"
      ],
      "required_layers": [
        "browser"
      ],
      "checks": [
        {
          "test": "tests/e2e/whitepaper.spec.ts::[AC-VOCABULARY-007] 导入 CSV TXT JSON 且拒绝无效输入",
          "layer": "browser"
        }
      ]
    },
    {
      "id": "AC-VOCABULARY-008",
      "tests": [
        "tests/e2e/whitepaper.spec.ts::[AC-VOCABULARY-008] 导出 JSON Markdown 并可重导入 JSON"
      ],
      "required_layers": [
        "browser"
      ],
      "checks": [
        {
          "test": "tests/e2e/whitepaper.spec.ts::[AC-VOCABULARY-008] 导出 JSON Markdown 并可重导入 JSON",
          "layer": "browser"
        }
      ]
    },
    {
      "id": "AC-ADOPTION-001",
      "tests": [
        "tests/e2e/whitepaper.spec.ts::[AC-ADOPTION-001] 产品身份与认证保留"
      ],
      "required_layers": [
        "browser"
      ],
      "checks": [
        {
          "test": "tests/e2e/whitepaper.spec.ts::[AC-ADOPTION-001] 产品身份与认证保留",
          "layer": "browser"
        }
      ]
    }
  ],
  "verification_requirements": [
    "browser"
  ],
  "tasks": [
    {
      "id": "T1",
      "title": "完成规格与真实断言准备基线",
      "phase": "prepare",
      "result": "全部目标进入 Feature 和 Release，两个测试文件含真实断言，主代理提交规格测试基线。",
      "scope": [
        "docs/features/product.md",
        "docs/features/vocabulary.md",
        "docs/plans/20261104-whitepaper-adoption.md",
        "docs/plans/releases/whitepaper-adoption.json",
        "tests/e2e/whitepaper.spec.ts"
      ],
      "depends_on": [],
      "owner": "main-agent",
      "status": "todo"
    },
    {
      "id": "T2",
      "title": "取得独立草稿审查及准备检查",
      "phase": "prepare",
      "result": "独立审查记录当前语义且无阻断，原生 prepare 返回 ready=true。",
      "scope": [
        "docs/plans/20261104-whitepaper-adoption.md"
      ],
      "depends_on": [
        "T1"
      ],
      "owner": "main-agent",
      "status": "todo"
    },
    {
      "id": "T3",
      "title": "记录词汇和采用目标断言红灯",
      "phase": "red",
      "acceptance": [
        "AC-VOCABULARY-001",
        "AC-VOCABULARY-002",
        "AC-VOCABULARY-003",
        "AC-VOCABULARY-004",
        "AC-VOCABULARY-005",
        "AC-VOCABULARY-006",
        "AC-VOCABULARY-007",
        "AC-VOCABULARY-008",
        "AC-ADOPTION-001"
      ],
      "result": "原生 red 保存目标断言失败，模块加载或环境失败不算。",
      "scope": [
        "tests/e2e/whitepaper.spec.ts",
        "docs/others/evidence/tdd/"
      ],
      "depends_on": [
        "T2"
      ],
      "owner": "main-agent",
      "status": "todo"
    },
    {
      "id": "T4",
      "title": "实现纯词汇状态和导入导出",
      "phase": "implement",
      "acceptance": [
        "AC-VOCABULARY-004",
        "AC-VOCABULARY-005",
        "AC-VOCABULARY-007",
        "AC-VOCABULARY-008"
      ],
      "result": "纯 reducer 保持轮次和关联身份，三种导入及两种导出满足既定断言。",
      "scope": [
        "src/modules/vocabulary/"
      ],
      "depends_on": [
        "T3"
      ],
      "owner": "main-agent",
      "status": "todo"
    },
    {
      "id": "T5",
      "title": "集成本地白纸体验与采用身份",
      "phase": "implement",
      "acceptance": [
        "AC-VOCABULARY-001",
        "AC-VOCABULARY-002",
        "AC-VOCABULARY-003",
        "AC-VOCABULARY-006",
        "AC-ADOPTION-001"
      ],
      "result": "访客可直接完成词汇旅程并刷新恢复，项目品牌更新，认证回归保留。",
      "scope": [
        "src/modules/vocabulary/",
        "src/modules/landing/",
        "src/modules/dashboard/",
        "src/modules/tasks/",
        "src/app/",
        "src/config/",
        "src/server/api/",
        "src/lib/",
        "package.json",
        ".ai/project.json",
        "AGENTS.md",
        "docs/standards/adoption.md",
        "tests/api/",
        "tests/e2e/",
        "tests/contracts/",
        "scripts/",
        "prisma/schema.prisma",
        "prisma/migrations/",
        "README.md",
        ".prettierignore",
        "src/components/layout/",
        "src/modules/auth/"
      ],
      "depends_on": [
        "T4"
      ],
      "owner": "main-agent",
      "status": "todo"
    },
    {
      "id": "T6",
      "title": "独立交付审查与当前事实回写",
      "phase": "verify",
      "result": "Plan integration 与 delivery 审查有真实证据，Design 反映实现，Release 最终验收及交付检查由主代理执行。",
      "scope": [
        "docs/designs/",
        "docs/others/evidence/",
        "docs/plans/20261104-whitepaper-adoption.md",
        "docs/plans/releases/whitepaper-adoption.json"
      ],
      "depends_on": [
        "T5"
      ],
      "owner": "main-agent",
      "status": "todo"
    }
  ],
  "depends_on": [],
  "dependency_contracts": [],
  "shared_files": [
    {
      "path": "docs/plans/20261104-whitepaper-adoption.md",
      "owner": "main-agent",
      "mode": "integrator"
    },
    {
      "path": "prisma/schema.prisma",
      "owner": "main-agent",
      "mode": "integrator"
    },
    {
      "path": "src/server/api/index.ts",
      "owner": "main-agent",
      "mode": "integrator"
    },
    {
      "path": "src/config/navigation.ts",
      "owner": "main-agent",
      "mode": "integrator"
    }
  ],
  "handoff": {
    "interfaces": [
      "纯 reducer + zod 持久化 schema + 浏览器 hook adapter；UI 放 modules/vocabulary/components。"
    ],
    "migrations": [
      "不修改历史迁移；Tasks 若退役只通过新增具名 migration 并验证历史数据升级。"
    ],
    "tests": [
      "tests/e2e/whitepaper.spec.ts"
    ],
    "remaining": [
      "主代理编写 tests/e2e/whitepaper.spec.ts；独立草稿审查、原生 prepare 和真实浏览器红灯尚待执行。"
    ]
  },
  "owner": "main-agent",
  "risk": "infrastructure",
  "data_contract": {
    "access_scope": "not-applicable",
    "access_rationale": "词汇归当前浏览器访客，不基于 session，不上云；认证账户仍由 Better Auth session 管理。",
    "migration_impact": "none",
    "rollback": "浏览器数据版本化并先导出；回退 Git 实现不清空本地词汇或认证记录。Tasks 表本轮保留，任何后续删除另行确认数据影响。",
    "destructive_authorization": null
  },
  "write_scope": [
    "docs/features/product.md",
    "docs/features/vocabulary.md",
    "docs/plans/20261104-whitepaper-adoption.md",
    "docs/plans/releases/whitepaper-adoption.json",
    "tests/e2e/whitepaper.spec.ts",
    "src/modules/vocabulary/",
    "src/modules/landing/",
    "src/modules/dashboard/",
    "src/modules/tasks/",
    "src/app/",
    "src/config/",
    "src/server/api/",
    "src/lib/",
    "package.json",
    ".ai/project.json",
    "AGENTS.md",
    "docs/standards/adoption.md",
    "tests/api/",
    "tests/e2e/",
    "tests/contracts/",
    "scripts/",
    "prisma/schema.prisma",
    "prisma/migrations/",
    "docs/designs/",
    "docs/others/evidence/",
    "README.md",
    ".prettierignore",
    "src/components/layout/",
    "src/modules/auth/"
  ],
  "tdd_evidence": [],
  "required_evidence": [
    "check-integration"
  ],
  "evidence": [],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": null,
  "updated_at": "2026-11-04"
}
-->

# 白纸英语采用与词汇闭环

## 状态

状态与任务只维护在顶部元数据。当前是准备草稿，没有运行或审查通过记录。

## 目标

采用白纸英语身份，使访客无需登录即可完成九宫格扫词、错词复习、关联辅助和导入导出。用户的 BUSINESS_MODEL.md 保持原样。

## 原始目标与覆盖核对

| 用户原话或来源                                                               | 本轮目标                             | REQ                | AC                | 处理结果                    |
| ---------------------------------------------------------------------------- | ------------------------------------ | ------------------ | ----------------- | --------------------------- |
| 本聊天要求采用项目身份，保留 Better Auth、历史 migrations、BUSINESS_MODEL.md | 产品采用及兼容                       | REQ-ADOPTION-001   | AC-ADOPTION-001   | 纳入，认证不得随 Tasks 删除 |
| 本聊天明确要求 未登录进入白纸词汇工作台                                      | 未登录进入白纸词汇工作台             | REQ-VOCABULARY-001 | AC-VOCABULARY-001 | 纳入                        |
| 本聊天明确要求 手动分页并判断会与不会                                        | 手动分页并判断会与不会               | REQ-VOCABULARY-002 | AC-VOCABULARY-002 | 纳入                        |
| 本聊天明确要求 配置点击默认判断并用 Shift 反转                               | 配置点击默认判断并用 Shift 反转      | REQ-VOCABULARY-003 | AC-VOCABULARY-003 | 纳入                        |
| 本聊天明确要求 下一轮只保留上一轮不会词                                      | 下一轮只保留上一轮不会词             | REQ-VOCABULARY-004 | AC-VOCABULARY-004 | 纳入                        |
| 本聊天明确要求 关联辅助共享原任务与错词池                                    | 关联辅助共享原任务与错词池           | REQ-VOCABULARY-005 | AC-VOCABULARY-005 | 纳入                        |
| 本聊天明确要求 刷新恢复本地任务与设置并处理损坏存储                          | 刷新恢复本地任务与设置并处理损坏存储 | REQ-VOCABULARY-006 | AC-VOCABULARY-006 | 纳入                        |
| 本聊天明确要求 导入 CSV TXT JSON 且拒绝无效输入                              | 导入 CSV TXT JSON 且拒绝无效输入     | REQ-VOCABULARY-007 | AC-VOCABULARY-007 | 纳入                        |
| 本聊天明确要求 导出 JSON Markdown 并可重导入 JSON                            | 导出 JSON Markdown 并可重导入 JSON   | REQ-VOCABULARY-008 | AC-VOCABULARY-008 | 纳入                        |
| 助手提出未来延期方案并获全部采用授权，后续范围澄清                           | 保留未来规格，不宣称交付             | REQ-ADOPTION-002   | AC-ADOPTION-002   | Release 延期                |

## 整体判断与推进顺序

当前入口 src/app/page.tsx 消费 LandingScreen，Tasks hook 使用 Hono RPC，package 仍名 ignite。BUSINESS_MODEL.md 的 D05、D06、D11 已给定本地词汇方向。依赖已由主代理安装；用户文件与 README 保留提交 b437eee0cda58f46ba5c496948c94c0dd85c6442 为实施基线，未把历史模板结果当作本项目验收。

最先缺少的是可执行的词汇行为契约与独立审查。先提交规格和真实浏览器测试基线，再记录目标断言红灯，随后实现 reducer、存储边界与页面。测试由主代理编写。每条词汇旅程先 page.goto('/learn')，以带该 AC 标记的 expect 检查“词汇白纸”可见，随后验证该条具体操作。测试路径存在不等于测试通过，模块导入失败也不是有效红灯。若结构门禁不支持本地存储例外，先由主代理更新原规则的明确边界再实施，不假建服务端同步。

## 非目标

写作、语法、云同步均为未来延期功能。页面可说明未来方向，但不得提供伪工作按钮或宣称已支持。PWA 安装、AI 生成、付费、远端部署不在本次验收。

## 变更类型

新增词汇模块并在同一采用结果中调整产品外壳。推荐退役 Tasks 导航、UI 与示例 API，保留 Better Auth 及独立认证测试。Tasks 表和历史 migrations 先保留，避免把界面退役变成破坏性数据删除。需要改 schema 时重新声明 additive 迁移并执行迁移验收；不得重写历史迁移。

回退通过原基线恢复应用代码；保留本地版本化数据、用户文件及账户数据。后续回退不默认清空 localStorage。

## 输入规格

- docs/features/product.md 的新增采用规则及 docs/features/vocabulary.md。
- AGENTS.md、docs/standards/adoption.md、docs/standards/testing.md。
- src/app/page.tsx、src/modules/tasks/hooks/use-tasks.ts、tests/e2e/tasks.spec.ts 与 package.json。
- BUSINESS_MODEL.md 只读，属于经营方向依据，不是已实现功能证据。

## 已关闭问题

用户授权本地优先方向；未来云同步延期来自已接受的实施建议和本轮范围澄清。访客无需注册。默认点击为会，Shift 为不会，设置可反转。九词一页且只手动翻页。关联辅助沿用原任务而不复制错词池。此处默认操作细节是可回退实施选择，已写入规格供审查。

## 测试与验收设计

所有纳入 AC 都映射到 tests/e2e/whitepaper.spec.ts 的真实浏览器旅程。纯状态单测可在实现后补充，但不冒充本轮原生红灯。每个标题和 AC 映射在元数据。浏览器本地存储通过刷新、读取实际 localStorage、损坏恢复与写入失败断言验收，不冒称 Prisma database 层，也不伪造 RPC 同步。认证使用既有实际账户注册、登录、退出和守卫回归。

## 实现任务

纯逻辑与 UI 共用一个模块写入范围，先由 main-agent 串行集成，避免不同执行者同时写 index 和 schema。可独立审查本准备草稿。准备 T1 包括真实断言和提交，T2 由实际独立读者核对，作者自查不能代替审查。

实现草图为纯 VocabularyState reducer，状态包含任务、稳定 word ID、页码、当前轮次、逐词判断和上一轮错词集合。zod schema 只在 JSON 导入和持久化读取边界校验，浏览器 adapter 封装读取、写入和异常。hook 将 reducer 连接 adapter，components 只消费 hook。src/app 只作 screen 编排。该草图尚未实现。

## 验收方式

主代理先获取 review context 并发起独立审查，再运行原生 plan validate --prepare。ready=true 后按原生任务命令进入 red；有效红灯提交后才开始 implement。依次运行 Plan check --level auto、独立 delivery 审查、Design 回写和 delivery:check。Plan 完成后在同一最终版本执行 Release verify。不以安装成功或构建代替业务验收。

## 设计回写

由实施者在验收后更新 docs/designs/domain.md、design.md、runtime.md 及真正受影响的认证/API 事实。准备不将未来实现写成既成事实。

## 状态记录

2026-11-04 文档执行者仅准备 Feature、Plan、Release。所有证据数组为空，独立审查由主代理安排。用户将本地存储确定为有意架构例外，云同步、写作和语法明确延期。没有伪同步或通过声明。

<!-- ignite-progress -->
<!-- /ignite-progress -->

## 准出条件

原始目标全部对应真实 AC 证据、同一版本 Plan integration、独立 delivery 审查和当前 Design 后才能 done。Release 另行执行生产组合验收；延期能力不算已交付。

## 浏览器 UI 契约

主代理据以下契约编写测试并实现，准备执行者不写测试。

- 首页 heading 为“词汇白纸”，品牌文字为“白纸英语”。
- 导入 textarea label 为“导入词表”，按钮为“应用词表”；翻页按钮为“上一页”“下一页”，复习按钮为“结束本轮”。
- 导出按钮为“导出 JSON”“导出 Markdown”，输出 textarea label 为“导出内容”。
- 设置 label 为“点击默认判断”，选项为“会”“不会”。
- 词卡 data-testid 为 word，data-judgment 为 known、unknown 或未判断值，包含单词文本及“未判断”“会”“不会”状态。普通点击卡片判断，Shift 反转。另提供每张卡内具可访问名称的会与不会按钮。
- 关联入口按钮为“关联辅助”，返回按钮为“快速扫词”，关联 heading 为“关联辅助”，编辑区 label 为“关联词 1”至“关联词 8”、“例句 1”至“例句 8”，保存按钮为“保存关联”。
- 页码文字为“第 1 页”等，轮次文字为“第 2 轮”等，完成文字为“本次自评已清零”，失败提示使用 role alert。
- 版本化浏览器存储键为 whitepaper-vocabulary-v1。以真实浏览器刷新与实际存储读取断言持久化。

本地浏览器保存属于 browser 层，不谎称数据库或云同步。Tasks 仅退役产品 UI/API，原表和历史迁移保留。BUSINESS_MODEL.md 不在本执行者写入范围；主代理如纳入提交必须保留字节。
准备复核发现主代理已创建九条同名浏览器用例，全部进入真实页面且无缺失模块导入。当前关联用例只证明切换后判断保持，尚未证明八组编辑与从辅助更新原错词池；导出用例只证明结构与词数，尚未证明完整状态恢复；认证用例只打开登录表单，尚未证明注册、登录、退出、守卫回归。损坏存储用例需补原文保留、写入失败及恢复输入断言。上述具体缺口由 T1 完善和独立 draft 审查解决，不能缩减 Feature 或宣称 ready。



