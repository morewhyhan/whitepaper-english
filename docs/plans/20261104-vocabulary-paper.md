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
  "binding_contract": 1,
  "content_contract": 1,
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
    "本地学习状态必须可在刷新后恢复，损坏的 localStorage 必须回到可用的平行世界初始词书。",
    "浏览器验收按 2026-11-08 用户决定只覆盖 Web 端桌面 Chromium；移动端浏览器验收和布局修复暂缓，不作为本轮完成条件。"
  ],
  "non_goals": [
    "账户登录后的跨设备同步",
    "自定义词库的 AI 关联句生成",
    "按天的长期复习算法或掌握度模型",
    "写作与语法工作台",
    "移动端浏览器验收与移动端布局修复（用户 2026-11-08 决定暂缓）"
  ],
  "authorization": {
    "source": "2026-11-04 用户明确要求先把背单词这一套做出来，并允许参考 Downloads/index.html 的样式与交互；2026-11-08 用户把当前验收范围收窄到 Web 端。"
  },
  "deliverables": [
    "src/modules/vocabulary/ 本地优先词汇学习模块",
    "src/modules/vocabulary/data/parallel-world.json 平行世界初始词书",
    "scripts/import-parallel-world-wordbook.mjs 可重复的旧 Word 文本提取脚本",
    "首页与 /vocabulary 词汇白纸入口",
    "词库导入、导出和浏览器本地进度",
    "单元测试与 Web 端浏览器验收测试"
  ],
  "remaining_work": [
    "本 Plan 尚未取得按新契约要求的 TDD red、独立 draft 审查、Plan integration 与 Release 验证。",
    "移动端浏览器验收和移动端布局修复按用户决定暂缓，恢复时另立或接续 Plan。",
    "账户同步、长期复习、AI 关联句和写作语法模块另立 Plan。"
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
      "tests": [
        "tests/e2e/vocabulary.spec.ts::[AC-VOCABULARY-004] 下一轮只保留上一轮不会词",
        "tests/contracts/vocabulary.test.ts::[AC-VOCABULARY-004] keeps only unknown words for the next round"
      ],
      "required_layers": ["unit", "browser"],
      "checks": [
        {
          "test": "tests/e2e/vocabulary.spec.ts::[AC-VOCABULARY-004] 下一轮只保留上一轮不会词",
          "layer": "browser"
        },
        {
          "test": "tests/contracts/vocabulary.test.ts::[AC-VOCABULARY-004] keeps only unknown words for the next round",
          "layer": "unit"
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
        "tests/e2e/vocabulary.spec.ts::[AC-VOCABULARY-007] 导入 CSV TXT JSON 且拒绝无效输入",
        "tests/contracts/vocabulary.test.ts::[AC-VOCABULARY-007] parses CSV, TSV, and JSON word lists"
      ],
      "required_layers": ["unit", "browser"],
      "checks": [
        {
          "test": "tests/e2e/vocabulary.spec.ts::[AC-VOCABULARY-007] 导入 CSV TXT JSON 且拒绝无效输入",
          "layer": "browser"
        },
        {
          "test": "tests/contracts/vocabulary.test.ts::[AC-VOCABULARY-007] parses CSV, TSV, and JSON word lists",
          "layer": "unit"
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
      "tests": ["tests/e2e/vocabulary.spec.ts::[AC-VOCABULARY-009] A4 扫词纸在视口内完整可见"],
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
      "tests": ["tests/e2e/vocabulary.spec.ts::[AC-VOCABULARY-010] 多本词书切换保持各自轮次"],
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
      "tests": ["tests/e2e/vocabulary.spec.ts::[AC-VOCABULARY-011] 禅模式隐藏工作台并铺满纸张"],
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
  "bindings": [
    {
      "id": "BIND-001",
      "source": "REQ-VOCABULARY-001",
      "applicable": "第一版词汇白纸的已确认业务规则",
      "status": "missing",
      "task": "T3",
      "check": "AC-VOCABULARY-001"
    },
    {
      "id": "BIND-002",
      "source": "REQ-VOCABULARY-002",
      "applicable": "第一版词汇白纸的已确认业务规则",
      "status": "missing",
      "task": "T3",
      "check": "AC-VOCABULARY-002"
    },
    {
      "id": "BIND-003",
      "source": "REQ-VOCABULARY-003",
      "applicable": "第一版词汇白纸的已确认业务规则",
      "status": "missing",
      "task": "T3",
      "check": "AC-VOCABULARY-003"
    },
    {
      "id": "BIND-004",
      "source": "REQ-VOCABULARY-004",
      "applicable": "第一版词汇白纸的已确认业务规则",
      "status": "missing",
      "task": "T3",
      "check": "AC-VOCABULARY-004"
    },
    {
      "id": "BIND-005",
      "source": "REQ-VOCABULARY-005",
      "applicable": "第一版词汇白纸的已确认业务规则",
      "status": "missing",
      "task": "T3",
      "check": "AC-VOCABULARY-005"
    },
    {
      "id": "BIND-006",
      "source": "REQ-VOCABULARY-006",
      "applicable": "第一版词汇白纸的已确认业务规则",
      "status": "missing",
      "task": "T3",
      "check": "AC-VOCABULARY-006"
    },
    {
      "id": "BIND-007",
      "source": "REQ-VOCABULARY-007",
      "applicable": "第一版词汇白纸的已确认业务规则",
      "status": "missing",
      "task": "T3",
      "check": "AC-VOCABULARY-007"
    },
    {
      "id": "BIND-008",
      "source": "REQ-VOCABULARY-008",
      "applicable": "第一版词汇白纸的已确认业务规则",
      "status": "missing",
      "task": "T3",
      "check": "AC-VOCABULARY-008"
    },
    {
      "id": "BIND-009",
      "source": "REQ-VOCABULARY-009",
      "applicable": "第一版词汇白纸的已确认业务规则",
      "status": "missing",
      "task": "T3",
      "check": "AC-VOCABULARY-009"
    },
    {
      "id": "BIND-010",
      "source": "REQ-VOCABULARY-010",
      "applicable": "第一版词汇白纸的已确认业务规则",
      "status": "missing",
      "task": "T3",
      "check": "AC-VOCABULARY-010"
    },
    {
      "id": "BIND-011",
      "source": "REQ-VOCABULARY-011",
      "applicable": "第一版词汇白纸的已确认业务规则",
      "status": "missing",
      "task": "T3",
      "check": "AC-VOCABULARY-011"
    },
    {
      "id": "BIND-012",
      "source": "AC-VOCABULARY-001",
      "applicable": "当前阶段验收",
      "status": "missing",
      "task": "T2",
      "check": "AC-VOCABULARY-001"
    },
    {
      "id": "BIND-013",
      "source": "AC-VOCABULARY-002",
      "applicable": "当前阶段验收",
      "status": "missing",
      "task": "T2",
      "check": "AC-VOCABULARY-002"
    },
    {
      "id": "BIND-014",
      "source": "AC-VOCABULARY-003",
      "applicable": "当前阶段验收",
      "status": "missing",
      "task": "T2",
      "check": "AC-VOCABULARY-003"
    },
    {
      "id": "BIND-015",
      "source": "AC-VOCABULARY-004",
      "applicable": "当前阶段验收",
      "status": "missing",
      "task": "T2",
      "check": "AC-VOCABULARY-004"
    },
    {
      "id": "BIND-016",
      "source": "AC-VOCABULARY-005",
      "applicable": "当前阶段验收",
      "status": "missing",
      "task": "T2",
      "check": "AC-VOCABULARY-005"
    },
    {
      "id": "BIND-017",
      "source": "AC-VOCABULARY-006",
      "applicable": "当前阶段验收",
      "status": "missing",
      "task": "T2",
      "check": "AC-VOCABULARY-006"
    },
    {
      "id": "BIND-018",
      "source": "AC-VOCABULARY-007",
      "applicable": "当前阶段验收",
      "status": "missing",
      "task": "T2",
      "check": "AC-VOCABULARY-007"
    },
    {
      "id": "BIND-019",
      "source": "AC-VOCABULARY-008",
      "applicable": "当前阶段验收",
      "status": "missing",
      "task": "T2",
      "check": "AC-VOCABULARY-008"
    },
    {
      "id": "BIND-020",
      "source": "AC-VOCABULARY-009",
      "applicable": "当前阶段验收",
      "status": "missing",
      "task": "T2",
      "check": "AC-VOCABULARY-009"
    },
    {
      "id": "BIND-021",
      "source": "AC-VOCABULARY-010",
      "applicable": "当前阶段验收",
      "status": "missing",
      "task": "T2",
      "check": "AC-VOCABULARY-010"
    },
    {
      "id": "BIND-022",
      "source": "AC-VOCABULARY-011",
      "applicable": "当前阶段验收",
      "status": "missing",
      "task": "T2",
      "check": "AC-VOCABULARY-011"
    }
  ],
  "tasks": [
    {
      "id": "T1",
      "title": "锁定参考交互、Feature 映射与真实 Web 验收用例",
      "phase": "prepare",
      "status": "todo",
      "result": "词汇 Feature、参考 HTML 审计、单元测试与 11 条验收用例已对应到同一批 AC，且 Web-only 范围已写入规格；失败时退回目标与用例映射。",
      "scope": [
        "docs/features/vocabulary.md",
        "docs/plans/20261104-vocabulary-paper.md",
        "docs/others/test-cases/vocabulary.md",
        "tests/contracts/vocabulary.test.ts",
        "tests/e2e/vocabulary.spec.ts"
      ],
      "depends_on": [],
      "owner": "codex"
    },
    {
      "id": "T2",
      "title": "按 AC 取得真实行为红灯",
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
        "AC-VOCABULARY-009",
        "AC-VOCABULARY-010",
        "AC-VOCABULARY-011"
      ],
      "status": "todo",
      "result": "每条 AC 在未实现版本上取得带 AC 标记的目标断言失败；环境错误和占位失败不算证据。",
      "scope": [
        "tests/contracts/vocabulary.test.ts",
        "tests/e2e/vocabulary.spec.ts",
        "docs/others/evidence/tdd/"
      ],
      "depends_on": ["T1"],
      "owner": "codex"
    },
    {
      "id": "T3",
      "title": "实现词汇白纸的本地学习闭环",
      "phase": "implement",
      "acceptance": [
        "AC-VOCABULARY-001",
        "AC-VOCABULARY-002",
        "AC-VOCABULARY-003",
        "AC-VOCABULARY-004",
        "AC-VOCABULARY-005",
        "AC-VOCABULARY-006",
        "AC-VOCABULARY-007",
        "AC-VOCABULARY-008",
        "AC-VOCABULARY-009",
        "AC-VOCABULARY-010",
        "AC-VOCABULARY-011"
      ],
      "status": "todo",
      "result": "同一批 AC 断言通过，实现保持在词汇模块、入口与导航范围内，不引入服务端持久化。",
      "scope": [
        "scripts/import-parallel-world-wordbook.mjs",
        "src/modules/vocabulary/",
        "src/app/page.tsx",
        "src/app/vocabulary/",
        "src/config/site.ts",
        "src/config/navigation.ts",
        "vitest.config.ts"
      ],
      "depends_on": ["T2"],
      "owner": "codex"
    },
    {
      "id": "T4",
      "title": "运行 Web 端计划验收并回写当前事实",
      "phase": "verify",
      "status": "todo",
      "result": "Plan integration 与交付审查通过，Design 与实现一致，移动端暂缓的范围有记录；失败时保留真实输出并回到 T3。",
      "scope": [
        "docs/designs/",
        "docs/plans/20261104-vocabulary-paper.md",
        "docs/plans/releases/vocabulary-paper.json",
        "docs/others/evidence/"
      ],
      "depends_on": ["T3"],
      "owner": "codex"
    }
  ],
  "depends_on": [],
  "dependency_contracts": [],
  "shared_files": [
    {
      "path": "src/config/navigation.ts",
      "owner": "codex",
      "mode": "exclusive"
    }
  ],
  "handoff": {
    "interfaces": [],
    "migrations": [],
    "tests": ["tests/contracts/vocabulary.test.ts", "tests/e2e/vocabulary.spec.ts"],
    "remaining": ["账户同步与长期复习另立 Plan", "移动端浏览器验收按用户决定暂缓"]
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
    "tests/contracts/vocabulary.test.ts",
    "tests/e2e/vocabulary.spec.ts",
    "docs/features/vocabulary.md",
    "docs/others/test-cases/vocabulary.md",
    "docs/others/evidence/",
    "docs/others/evidence/tdd/",
    "docs/designs/",
    "docs/plans/20261104-vocabulary-paper.md",
    "docs/plans/releases/vocabulary-paper.json"
  ],
  "tdd_evidence": [],
  "required_evidence": ["check-integration"],
  "evidence": [],
  "design_writeback": {
    "changed": ["docs/designs/domain.md", "docs/designs/execution.md"],
    "reason": "词汇模块的本地优先边界与入口事实已写入设计入口。"
  },
  "blocker": null,
  "open_questions": [],
  "integrated_commit": null,
  "updated_at": "2026-11-08"
}
-->

# Ignite 实施计划：词汇白纸第一版

## 状态

本 Plan 保持 draft。词汇白纸实现已经写入仓库并可在 Web 端运行，但按当前契约要求的 TDD red、独立 draft 审查、Plan integration 与 Release 验证尚未取得；tasks 全部保持 todo，避免把已落地代码伪称为通过红灯的实现。2026-11-08 用户明确当前只验收 Web 端，移动端浏览器验收暂缓。

## 目标

访客在 Web 端打开白纸英语后可以直接开始扫词：看到一张 A4 白纸上的词，判断会与不会，让不会的词进入下一轮，在禅模式里用 6×6 方格沉浸学习，并在刷新后继续当天进度。用户原话是「先把背单词这一套东西做出来」，并允许参考 Downloads/index.html 的视觉与交互。

## 原始目标与覆盖核对

| 用户原话或可追溯来源                                          | 本轮目标                                    | REQ                           | AC                     | 处理结果                                                     |
| ------------------------------------------------------------- | ------------------------------------------- | ----------------------------- | ---------------------- | ------------------------------------------------------------ |
| 2026-11-04 用户要求先把背单词那一套做出来                     | 完成本地词汇学习闭环与参考样式              | REQ-VOCABULARY-001～008       | AC-VOCABULARY-001～008 | 已实现；红灯、审查与正式验收待补                             |
| 2026-11-04 用户提供旧 Word 词书并要求全部初始化               | 按原始顺序保存全部源记录与非空词条          | 词表来源约束                  | 初始词书完整性         | 已完成：3,976 条源记录、3,975 条非空词条，保留重复项与空记录 |
| 2026-11-05 用户要求禅模式每张纸 36 词、四个九宫格、不用省略号 | 按 6×6 方格呈现并整批推进                   | REQ-VOCABULARY-011            | AC-VOCABULARY-011      | 已实现；正式浏览器证据待补                                   |
| 2026-11-08 用户决定当前只验收 Web 端                          | 把浏览器验收收窄到桌面 Chromium，移动端暂缓 | REQ-VOCABULARY-009 的桌面部分 | AC-VOCABULARY-009      | 已写入 Feature、Plan、Release 与运行入口                     |

阶段目标是让词书数据、本地状态和页面行为能被同一批 AC 对上；代价是要放弃「先写完再补证据」的顺路做法，改为保留缺口。本轮假设是：现有词汇实现可继续使用，不为补齐红灯而回退已交付代码。

## 整体判断与推进顺序

- 链路与事实：词书 JSON 经本地状态进入页面，再由浏览器断言验证；已确认的事实是词书数量、重复项、下一轮筛选、导入导出和桌面布局可以通过，未确认的是新契约要求的红灯与独立审查。
- 当前主要问题：实现早于红灯，导致 Plan 无法进入 ready。它不是缺代码，也不是检查器故障。
- 推进与尺度：先让 Feature、Plan、Release 与任务结构一致，再讨论证据；移动端按用户决定移出本轮，不扩围。
- 纠偏与停止：如果桌面验收回归或词书数据被改动，先把重点转回修复；如果只能在删除可用实现的前提下取得红灯，就停止取证并保留缺口。
- 目标函数：质量优先，其次时间与成本。预计 240 分钟；实际跨 2026-11-04 至 11-08 约 6 小时，超出预算，按「保留缺口、不减少验收项」处理。
- 方法选择：先读 Feature、测试标准与现有代码事实，再决定任务；没有采用「先跑一遍看报错再猜」的方式。

## 来源规格

- 需求：docs/features/vocabulary.md 的 REQ-VOCABULARY-001～011 与对应 AC；docs/features/product.md 的 REQ-WHITEPAPER-001/002/004 提供产品边界。
- 标准：docs/standards/testing.md 规定行为层级与红灯纪律；docs/standards/development.md 规定 WSL 与 Node 24.19.0 的运行环境。
- 决策：docs/others/adr/0004-spec-closure-contract.md 记录规格闭环的长期取舍。
- 设计：docs/designs/domain.md 与 docs/designs/execution.md 记录本地优先与入口事实。
- 测试意图：tests/contracts/vocabulary.test.ts 与 tests/e2e/vocabulary.spec.ts。
- 发布：docs/plans/releases/vocabulary-paper.json 定义本轮纳入范围。
- 运行记录：docs/others/evidence/ 下现有记录，本轮未新增正式集成或发布证据。
- 不适用来源与理由：docs/standards/api.md 与 database.md 不适用，本轮不新增服务端接口与表；security.md 的认证条目不适用，本轮不改变认证；test:migrations 不适用，因为没有迁移改动。

## 目标映射

| Source             | Binding  | 主要任务 | 验证                         |
| ------------------ | -------- | -------- | ---------------------------- |
| REQ-VOCABULARY-001 | BIND-001 | T3       | AC-VOCABULARY-001            |
| REQ-VOCABULARY-002 | BIND-002 | T3       | AC-VOCABULARY-002            |
| REQ-VOCABULARY-003 | BIND-003 | T3       | AC-VOCABULARY-003            |
| REQ-VOCABULARY-004 | BIND-004 | T3       | AC-VOCABULARY-004            |
| REQ-VOCABULARY-005 | BIND-005 | T3       | AC-VOCABULARY-005            |
| REQ-VOCABULARY-006 | BIND-006 | T3       | AC-VOCABULARY-006            |
| REQ-VOCABULARY-007 | BIND-007 | T3       | AC-VOCABULARY-007            |
| REQ-VOCABULARY-008 | BIND-008 | T3       | AC-VOCABULARY-008            |
| REQ-VOCABULARY-009 | BIND-009 | T3       | AC-VOCABULARY-009            |
| REQ-VOCABULARY-010 | BIND-010 | T3       | AC-VOCABULARY-010            |
| REQ-VOCABULARY-011 | BIND-011 | T3       | AC-VOCABULARY-011            |
| AC-VOCABULARY-001  | BIND-012 | T2       | tests/e2e/vocabulary.spec.ts |
| AC-VOCABULARY-004  | BIND-015 | T2       | 浏览器与单元                 |
| AC-VOCABULARY-007  | BIND-018 | T2       | 浏览器与单元                 |
| AC-VOCABULARY-009  | BIND-020 | T2       | 桌面 Chromium                |
| AC-VOCABULARY-011  | BIND-022 | T2       | 桌面 Chromium                |

按同一维度对照目标与事实：

| 维度   | 目标                               | 事实                                   | 差距             |
| ------ | ---------------------------------- | -------------------------------------- | ---------------- |
| 结果   | 访客可完成扫词、筛选、禅模式与恢复 | 桌面 Chromium 13 项通过；单元 7 项通过 | 缺红灯与正式证据 |
| 边界   | 只做词汇，不碰服务端数据           | 仅有 localStorage 与词书 JSON          | 一致             |
| 代价   | 保留现有实现                       | 实现已在仓库，测试已存在               | 不能回退取证     |
| 时间   | 240 分钟内完成                     | 跨多日约 6 小时                        | 超出，已保留缺口 |
| 兼容性 | 桌面优先                           | Web 桌面验收通过                       | 移动端按决定暂缓 |

## 主要矛盾

目标要求：新契约要求每条 AC 先在未实现版本取得带标记的红灯，再实现，并由独立审查和提交绑定的证据支撑完成。

当前依赖：词汇模块、词书数据和浏览器用例已经在旧流程下直接完成，用户要求保留这些可用成果。

冲突点：要取得本 Plan 的红灯，必须把已经可用的词汇实现退回未实现状态；保留成果就无法产生实现前失败，两者方向相反。

相互制约：同一个工作树上不能同时最大化——回退取证会破坏用户现有成果，保留成果则红灯缺失，且无法靠补写记录消除。

支撑事实是仓库里已有完整词汇模块与 13 条通过的桌面用例；它最阻碍目标，因为完成判定以红灯和审查为前置。推翻条件是：如果能把本轮收窄到一块尚未实现的行为并单独取证，矛盾就不成立；当前没有这样的切片。

## 次要矛盾

- 窄屏规则仍在 REQ-VOCABULARY-009 中，但移动端验收被用户暂缓：规则与验收范围暂时不一致，恢复移动端工作时可能暴露布局回归，因此单独记录为 remaining_work。
- src/config/navigation.ts 同时被模板刷新和词汇入口改动触及：已在本 Plan 声明 exclusive 负责人，避免两个 Plan 并行写入。

## 决策原则

- 保留用户可用成果优先于形式化绿灯。依据是主要矛盾：回退取证会破坏已交付内容。
- 证据不足时保留缺口，不补写、不伪造。依据是 testing.md 的红灯纪律与完成规则。
- 验收范围按用户授权收窄并写进真源。依据是 2026-11-08 用户只验收 Web 端的决定。
- 本地优先、不引入服务端持久化。依据是 data_contract 与现有实现事实。

## 方案比较

- 采用：保留现有实现，把缺失的红灯、审查和发布证据作为缺口记录。代价是 Plan 长期停在 draft，收益是不破坏可用功能。
- 否定：推翻现有实现、从红灯重写。理由是词书数据、布局细节和用户已确认的交互会重新承担回归风险，且没有新增产品价值。
- 否定：先修移动端再验收。理由是用户明确暂缓移动端，强行纳入会扩大范围并推迟 Web 端收口。
- 否定：把状态迁移到服务端。理由是超出本轮产品边界，会引入 schema、迁移和认证改动。
- 复审条件：如果用户恢复移动端，或需要账户同步，则重新评估范围并另立 Plan。

## 约束绑定矩阵

| Source ID          | Binding  | 任务 | 验证              |
| ------------------ | -------- | ---- | ----------------- |
| REQ-VOCABULARY-001 | BIND-001 | T3   | AC-VOCABULARY-001 |
| REQ-VOCABULARY-002 | BIND-002 | T3   | AC-VOCABULARY-002 |
| REQ-VOCABULARY-003 | BIND-003 | T3   | AC-VOCABULARY-003 |
| REQ-VOCABULARY-004 | BIND-004 | T3   | AC-VOCABULARY-004 |
| REQ-VOCABULARY-005 | BIND-005 | T3   | AC-VOCABULARY-005 |
| REQ-VOCABULARY-006 | BIND-006 | T3   | AC-VOCABULARY-006 |
| REQ-VOCABULARY-007 | BIND-007 | T3   | AC-VOCABULARY-007 |
| REQ-VOCABULARY-008 | BIND-008 | T3   | AC-VOCABULARY-008 |
| REQ-VOCABULARY-009 | BIND-009 | T3   | AC-VOCABULARY-009 |
| REQ-VOCABULARY-010 | BIND-010 | T3   | AC-VOCABULARY-010 |
| REQ-VOCABULARY-011 | BIND-011 | T3   | AC-VOCABULARY-011 |
| AC-VOCABULARY-001  | BIND-012 | T2   | AC-VOCABULARY-001 |
| AC-VOCABULARY-002  | BIND-013 | T2   | AC-VOCABULARY-002 |
| AC-VOCABULARY-003  | BIND-014 | T2   | AC-VOCABULARY-003 |
| AC-VOCABULARY-004  | BIND-015 | T2   | AC-VOCABULARY-004 |
| AC-VOCABULARY-005  | BIND-016 | T2   | AC-VOCABULARY-005 |
| AC-VOCABULARY-006  | BIND-017 | T2   | AC-VOCABULARY-006 |
| AC-VOCABULARY-007  | BIND-018 | T2   | AC-VOCABULARY-007 |
| AC-VOCABULARY-008  | BIND-019 | T2   | AC-VOCABULARY-008 |
| AC-VOCABULARY-009  | BIND-020 | T2   | AC-VOCABULARY-009 |
| AC-VOCABULARY-010  | BIND-021 | T2   | AC-VOCABULARY-010 |
| AC-VOCABULARY-011  | BIND-022 | T2   | AC-VOCABULARY-011 |

## 回退

本轮不触碰数据库、认证和业务 API。回退时移除首页词汇入口与 src/modules/vocabulary/，恢复导航到模板入口；浏览器里的 localStorage 键可以保留不动，由后续版本忽略或清理。词书 JSON 与导入脚本可一并删除，不影响其他模块。回退后仍需重跑 docs:check、类型和桌面浏览器验收，确认没有半开状态。

词书来源文件不在仓库内，回退不涉及外部数据；如果只是暂停入口，可以保留词书 JSON 不删。

## 非目标

本轮不实现写作、语法、AI 对话、账户同步、长期复习或 AI 关联句；不修移动端布局；不把本地状态迁移到服务端。

## 变更类型

这是新增模块，采用本地优先策略，不触碰 Prisma schema、迁移或服务端业务 API。shared_files 声明 src/config/navigation.ts 由本 Plan 独占写入。data_contract 记录为不适用：数据只存在浏览器本地，没有服务端归属或迁移。

## 输入规格

- 产品边界与词汇需求：docs/features/vocabulary.md 与 docs/features/product.md。
- 参考交互：用户提供的 Downloads/index.html；只吸收视觉层级与已存在的本地交互。
- 初始词书：用户提供的旧 Word 文件；由 scripts/import-parallel-world-wordbook.mjs 提取为 JSON。
- 当前工程约束：Next.js App Router、React、TypeScript、CSS Modules、Vitest、Playwright。

## 已关闭问题

- 第一版是否要求登录：不要求登录。
- 第一版是否做服务端持久化：只写浏览器 localStorage。
- 参考 HTML 是否直接复制：只吸收可观察样式与交互。
- 初始词书是否臆造中文释义：不臆造，保留空释义并由导入补充。
- 移动端是否纳入当前验收：2026-11-08 用户决定暂缓，只验收 Web 端桌面浏览器。

## 测试与验收设计

- 单元层：tests/contracts/vocabulary.test.ts 覆盖初始词书数量与重复项、导入解析、下一轮筛选、完成条件和导出格式；其中解析与下一轮两条用例带 AC 标记，回答领域状态转换是否独立正确。
- 浏览器层：tests/e2e/vocabulary.spec.ts 覆盖访客入口、会/不会判定、Shift 反转、多轮筛选、关联辅助、本地恢复、损坏存储、导入导出、A4 可见性、多词书切换与禅模式布局。
- Web-only：pnpm test:e2e:web 只运行 desktop-chromium，对应 2026-11-08 的范围决定；移动端项目保留在配置中，恢复时无需改测试。
- 当前实际结果：完整单元套件 282 项通过（含词汇 7 项）；桌面 Chromium 13 项通过；移动端 3 项布局用例失败，按用户决定暂缓，不作为本轮完成条件。

## 实现任务

- T1 锁定交互、Feature 与用例。改变条件：AC 或测试路径变化时同步映射。失败判定：AC 没有对应断言，或 Web-only 范围没有写入规格。
- T2 按 AC 取得红灯。改变条件：测试内容变化时重取对应 AC 的红灯。失败判定：失败来自环境或占位断言，不是目标行为。
- T3 实现本地学习闭环。改变条件：需要服务端能力时先改规格再另立 Plan。失败判定：引入 schema 变更或把未实现能力写成可用。
- T4 运行 Web 端验收并回写事实。改变条件：检查失败指向实现回归时回到 T3。失败判定：把开发期运行或文档绿灯当成 Plan 完成。

## 验收方式

先用 node scripts/ignite.mjs plan validate IGT-2026110402 --prepare 检查文档与任务结构，再按 AC 运行 node scripts/ignite.mjs tdd red --plan IGT-2026110402 --ac <AC-ID>，实现后用 pnpm ignite check --plan IGT-2026110402 --level integration 与 pnpm test:e2e:web 验证 Web 端，最后由 pnpm ignite release verify vocabulary-paper --plan IGT-2026110402 组合验收。当前只完成了开发期运行，未进入红灯与集成阶段。

## 设计回写

词汇当前是浏览器本地状态，不改 Prisma 与 Hono API；docs/designs/domain.md 记录本地优先的领域边界，docs/designs/execution.md 记录入口与运行事实。等同步语义关闭后再把词库、任务、轮次和判断迁移到服务端模型。

## 状态记录

- 2026-11-04：读取参考 HTML，确认它包含九宫格扫词、关联辅助、导入、本地状态和多轮筛选。
- 2026-11-04：实现本地词汇模块，并通过单元测试与桌面 Chromium 8 条验收。
- 2026-11-04：使用 antiword 从旧 Word 词书提取 3,976 条源记录，其中 3,975 条非空，按原始顺序保留重复项和第 3,476 条空记录，生成平行世界词书 JSON。
- 2026-11-04：导入解析允许空中文释义，localStorage 版本升级到 v2，避免旧演示词库覆盖新初始词书。
- 2026-11-04：完整 run-e2e 被空迁移目录阻断；后续已删除该空目录，迁移与 E2E 恢复可运行。
- 2026-11-05：用户确认 REQ-VOCABULARY-009：当前 A4 扫词纸必须在打开产品的屏幕尺寸内完整落入一个视口。
- 2026-11-05：用户补充禅模式硬约束：每张纸 36 个词位、四个 3×3 九宫格、词格正方形、词条完整显示；实现改为方格纸张与自适应批量。
- 2026-11-05：冷启动检查确认 6 张禅模式纸、36 词位、四九宫格与无滚动；修正普通纸张高度约束和省略号断言。
- 2026-11-05：桌面 Chromium 13 项通过，包含 AC-VOCABULARY-009 与 AC-VOCABULARY-011；类型、格式与单元测试通过。
- 2026-11-05：复现窄高度截图，确认根因是网格行使用剩余高度拉伸纸张；改为方格决定的近正方形比例并通过。
- 2026-11-05：默认模式与禅模式统一 PaperSurface 与 ScanGrid，按可用面积选择布局；1708×900 视口改为两列大纸张。
- 2026-11-05：修复禅模式通用 hover 覆盖已标红词格的问题，并补跨模式状态色断言。
- 2026-11-05：统一个九宫格组间与内部间距，改用纸张内部两行等分高度约束，浏览器验收确认无重叠。
- 2026-11-05：四组独立网格改为统一 6×6 视觉网格并保留语义分组，清理 .next 缓存后确认所有词格间距一致。
- 2026-11-05：REQ-VOCABULARY-009、010、011 写入 Feature 与当前 Plan；发布范围随后补齐对应 AC。
- 2026-11-08：用户决定当前只验收 Web 端，移动端浏览器验收与布局修复暂缓；Feature、Plan、Release 与 package 脚本已同步。
- 2026-11-08：本 Plan 升到 content_contract 1 与 binding_contract 1，补齐来源规格、目标映射、矛盾、决策、方案比较、绑定矩阵、回退与红/实现任务；单元测试补上 AC 标记。
- 2026-11-08：当前仍缺 TDD red、独立 draft 审查、Plan integration 与 Release verify；状态保持 draft。

## 准出条件

每条 REQ 被 AC 覆盖且 AC 有匹配层级的真实测试；Web 端桌面浏览器验收通过，移动端按用户决定排除并有记录；tasks 全部完成；integrated_commit 可追溯；Plan integration 与 Release verify 通过；Design 已回写。在这些条件成立前，本 Plan 保持 draft。

<!-- ignite-progress -->

状态：`draft`（由元数据生成）

- [ ] T1 · 锁定参考交互、Feature 映射与真实 Web 验收用例 · todo
- [ ] T2 · 按 AC 取得真实行为红灯 · todo
- [ ] T3 · 实现词汇白纸的本地学习闭环 · todo
- [ ] T4 · 运行 Web 端计划验收并回写当前事实 · todo

验收缺口：本 Plan 尚未取得按新契约要求的 TDD red、独立 draft 审查、Plan integration 与 Release 验证。；移动端浏览器验收和移动端布局修复按用户决定暂缓，恢复时另立或接续 Plan。；账户同步、长期复习、AI 关联句和写作语法模块另立 Plan。
证据：尚无
<!-- /ignite-progress -->
