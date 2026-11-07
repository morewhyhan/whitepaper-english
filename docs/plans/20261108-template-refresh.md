<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-2026110801",
  "release": "template-refresh",
  "status": "draft",
  "outcome": "白纸英语与最新 Ignite 模板共用同一套文档治理、规格闭环和执行契约；现有词汇、工作台、写作和语法规格按当前阶段收束，未开放能力不再被写成已可用。",
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
      "text": "把 Ignite 最新维护分支的规则、标准、文档契约和检查器同步到当前项目，并保留白纸英语产品边界",
      "requirements": ["REQ-ADOPTION-001", "REQ-ADOPTION-002"]
    },
    {
      "text": "让工作台、词汇、写作和语法规格只对当前阶段的真实行为提出约束，未来能力不冒充已开放功能",
      "requirements": [
        "REQ-WHITEPAPER-005",
        "REQ-WORKSPACE-001",
        "REQ-WORKSPACE-006",
        "REQ-WRITING-005",
        "REQ-GRAMMAR-005"
      ]
    }
  ],
  "constraints": [
    "使用 Ignite git@github.com:morewhyhan/Ignite.git 的 template-maintenance 分支作为本轮模板来源，不复制 archive/template-build 建设记录。",
    "保留白纸英语现有产品实现、词书数据和词汇 Plan；模板治理同步不能覆盖产品语义。",
    "所有开发和 Git 检查在 WSL、项目固定 Node 24.19.0 环境运行。",
    "不伪造此前缺失的 TDD red、独立审查或浏览器验收证据。"
  ],
  "non_goals": [
    "本轮不新增写作、语法、云同步或 AI 业务能力。",
    "本轮不删除 Tasks 历史实现，也不重写已应用数据库迁移。",
    "本轮不推送 GitHub。"
  ],
  "authorization": {
    "source": "2026-11-08 用户要求把已优化的 Ignite 模板更新到白纸英语，并按模板重新对照现有需求、把相关方法补进模板。"
  },
  "deliverables": [
    "最新版 Ignite 文档规则、标准、契约检查器与治理测试",
    "白纸英语采用身份、当前 Feature、Design、Plan 与 Release 的模板兼容基线",
    "文档检查、模板诊断、类型与单元检查的真实运行结果"
  ],
  "remaining_work": [
    "本 Plan 映射的 AC 尚未取得按新契约要求的 TDD red 与独立审查证据，正式 Plan integration 与 Release verify 未执行。",
    "词汇实现 Plan 仍需按新模板的 TDD、审查和 Release 流程在原 Plan 内接续取证。",
    "Tasks 示例实现的保留、改造或删除仍需单独建立存量改动 Plan。"
  ],
  "change_type": "存量改动",
  "base_commit": "69d36bcde0ffc3152458815ffc782034c8960e4d",
  "requirements": [
    "REQ-ADOPTION-001",
    "REQ-ADOPTION-002",
    "REQ-WHITEPAPER-005",
    "REQ-WORKSPACE-001",
    "REQ-WORKSPACE-006",
    "REQ-WRITING-005",
    "REQ-GRAMMAR-005"
  ],
  "acceptance": [
    {
      "id": "AC-ADOPTION-001",
      "tests": [
        "tests/contracts/whitepaper-adoption.test.ts::[AC-ADOPTION-001] 白纸英语项目身份在机器配置与站点配置中一致"
      ],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/whitepaper-adoption.test.ts::[AC-ADOPTION-001] 白纸英语项目身份在机器配置与站点配置中一致",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-ADOPTION-002",
      "tests": [
        "tests/contracts/whitepaper-adoption.test.ts::[AC-ADOPTION-002] 白纸英语保留 Ignite 工程底座和治理入口"
      ],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/whitepaper-adoption.test.ts::[AC-ADOPTION-002] 白纸英语保留 Ignite 工程底座和治理入口",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-WHITEPAPER-005",
      "tests": [
        "tests/e2e/vocabulary.spec.ts::[AC-VOCABULARY-001] [AC-WHITEPAPER-004] [AC-WHITEPAPER-005] 未登录进入白纸词汇工作台"
      ],
      "required_layers": ["browser"],
      "checks": [
        {
          "test": "tests/e2e/vocabulary.spec.ts::[AC-VOCABULARY-001] [AC-WHITEPAPER-004] [AC-WHITEPAPER-005] 未登录进入白纸词汇工作台",
          "layer": "browser"
        }
      ]
    },
    {
      "id": "AC-WORKSPACE-001",
      "tests": [
        "tests/e2e/future-modules.spec.ts::[AC-WORKSPACE-001] [AC-WORKSPACE-006] [AC-WRITING-005] [AC-GRAMMAR-005] 未开放模块可直接查看页面状态"
      ],
      "required_layers": ["browser"],
      "checks": [
        {
          "test": "tests/e2e/future-modules.spec.ts::[AC-WORKSPACE-001] [AC-WORKSPACE-006] [AC-WRITING-005] [AC-GRAMMAR-005] 未开放模块可直接查看页面状态",
          "layer": "browser"
        }
      ]
    },
    {
      "id": "AC-WORKSPACE-006",
      "tests": [
        "tests/e2e/future-modules.spec.ts::[AC-WORKSPACE-001] [AC-WORKSPACE-006] [AC-WRITING-005] [AC-GRAMMAR-005] 未开放模块可直接查看页面状态"
      ],
      "required_layers": ["browser"],
      "checks": [
        {
          "test": "tests/e2e/future-modules.spec.ts::[AC-WORKSPACE-001] [AC-WORKSPACE-006] [AC-WRITING-005] [AC-GRAMMAR-005] 未开放模块可直接查看页面状态",
          "layer": "browser"
        }
      ]
    },
    {
      "id": "AC-WRITING-005",
      "tests": [
        "tests/e2e/future-modules.spec.ts::[AC-WORKSPACE-001] [AC-WORKSPACE-006] [AC-WRITING-005] [AC-GRAMMAR-005] 未开放模块可直接查看页面状态"
      ],
      "required_layers": ["browser"],
      "checks": [
        {
          "test": "tests/e2e/future-modules.spec.ts::[AC-WORKSPACE-001] [AC-WORKSPACE-006] [AC-WRITING-005] [AC-GRAMMAR-005] 未开放模块可直接查看页面状态",
          "layer": "browser"
        }
      ]
    },
    {
      "id": "AC-GRAMMAR-005",
      "tests": [
        "tests/e2e/future-modules.spec.ts::[AC-WORKSPACE-001] [AC-WORKSPACE-006] [AC-WRITING-005] [AC-GRAMMAR-005] 未开放模块可直接查看页面状态"
      ],
      "required_layers": ["browser"],
      "checks": [
        {
          "test": "tests/e2e/future-modules.spec.ts::[AC-WORKSPACE-001] [AC-WORKSPACE-006] [AC-WRITING-005] [AC-GRAMMAR-005] 未开放模块可直接查看页面状态",
          "layer": "browser"
        }
      ]
    }
  ],
  "verification_requirements": ["unit", "browser"],
  "bindings": [
    {
      "id": "BIND-001",
      "source": "REQ-ADOPTION-001",
      "applicable": "项目身份与命名统一由采用契约约束",
      "status": "missing",
      "task": "T3",
      "check": "AC-ADOPTION-001"
    },
    {
      "id": "BIND-002",
      "source": "REQ-ADOPTION-002",
      "applicable": "工程底座与治理入口必须继续可用",
      "status": "missing",
      "task": "T3",
      "check": "AC-ADOPTION-002"
    },
    {
      "id": "BIND-003",
      "source": "AC-ADOPTION-001",
      "applicable": "身份一致性验收",
      "status": "missing",
      "task": "T2",
      "check": "AC-ADOPTION-001"
    },
    {
      "id": "BIND-004",
      "source": "AC-ADOPTION-002",
      "applicable": "工程底座验收",
      "status": "missing",
      "task": "T2",
      "check": "AC-ADOPTION-002"
    },
    {
      "id": "BIND-005",
      "source": "REQ-WHITEPAPER-005",
      "applicable": "首屏直接进入词汇白纸",
      "status": "missing",
      "task": "T3",
      "check": "AC-WHITEPAPER-005"
    },
    {
      "id": "BIND-006",
      "source": "AC-WHITEPAPER-005",
      "applicable": "第一入口验收",
      "status": "missing",
      "task": "T2",
      "check": "AC-WHITEPAPER-005"
    },
    {
      "id": "BIND-007",
      "source": "REQ-WORKSPACE-001",
      "applicable": "模块入口不以其他模块完成为前置",
      "status": "missing",
      "task": "T3",
      "check": "AC-WORKSPACE-001"
    },
    {
      "id": "BIND-008",
      "source": "AC-WORKSPACE-001",
      "applicable": "入口不被前置阻断的验收",
      "status": "missing",
      "task": "T2",
      "check": "AC-WORKSPACE-001"
    },
    {
      "id": "BIND-009",
      "source": "REQ-WORKSPACE-006",
      "applicable": "每张纸只承载一个模块",
      "status": "missing",
      "task": "T3",
      "check": "AC-WORKSPACE-006"
    },
    {
      "id": "BIND-010",
      "source": "AC-WORKSPACE-006",
      "applicable": "纸张切换与未开放状态验收",
      "status": "missing",
      "task": "T2",
      "check": "AC-WORKSPACE-006"
    },
    {
      "id": "BIND-011",
      "source": "REQ-WRITING-005",
      "applicable": "写作入口只显示方向与未开放状态",
      "status": "missing",
      "task": "T3",
      "check": "AC-WRITING-005"
    },
    {
      "id": "BIND-012",
      "source": "AC-WRITING-005",
      "applicable": "写作页面不伪造能力",
      "status": "missing",
      "task": "T2",
      "check": "AC-WRITING-005"
    },
    {
      "id": "BIND-013",
      "source": "REQ-GRAMMAR-005",
      "applicable": "语法三级入口均为未开放",
      "status": "missing",
      "task": "T3",
      "check": "AC-GRAMMAR-005"
    },
    {
      "id": "BIND-014",
      "source": "AC-GRAMMAR-005",
      "applicable": "语法页面不伪造掌握结论",
      "status": "missing",
      "task": "T2",
      "check": "AC-GRAMMAR-005"
    }
  ],
  "tasks": [
    {
      "id": "T1",
      "title": "核对模板来源、产品边界与写入范围",
      "phase": "prepare",
      "status": "todo",
      "result": "模板来源、同步范围、保留的产品文件、当前 Feature/Design/Plan 与不纳入本轮的历史记录均有可追溯记录；失败时退回来源与范围审查。",
      "scope": [
        "docs/features/",
        "docs/plans/",
        "tests/contracts/whitepaper-adoption.test.ts",
        "tests/e2e/future-modules.spec.ts"
      ],
      "depends_on": [],
      "owner": "codex"
    },
    {
      "id": "T2",
      "title": "按 AC 取得真实行为红灯",
      "phase": "red",
      "acceptance": [
        "AC-ADOPTION-001",
        "AC-ADOPTION-002",
        "AC-WHITEPAPER-005",
        "AC-WORKSPACE-001",
        "AC-WORKSPACE-006",
        "AC-WRITING-005",
        "AC-GRAMMAR-005"
      ],
      "status": "todo",
      "result": "每个 AC 都在未实现版本上取得带 AC 标记的失败断言并记录运行；失败时保留原始输出，不用环境错误或占位失败代替。",
      "scope": [
        "tests/contracts/whitepaper-adoption.test.ts",
        "tests/e2e/future-modules.spec.ts",
        "tests/e2e/vocabulary.spec.ts",
        "docs/others/evidence/tdd/"
      ],
      "depends_on": ["T1"],
      "owner": "codex"
    },
    {
      "id": "T3",
      "title": "同步模板治理文件并对齐产品规格边界",
      "phase": "implement",
      "acceptance": [
        "AC-ADOPTION-001",
        "AC-ADOPTION-002",
        "AC-WHITEPAPER-005",
        "AC-WORKSPACE-001",
        "AC-WORKSPACE-006",
        "AC-WRITING-005",
        "AC-GRAMMAR-005"
      ],
      "status": "todo",
      "result": "规则、规格、设计和计划之间不再保留未知的未来需求引用，模板检查器可运行且产品语义未被覆盖；失败时退回来源映射。",
      "scope": [
        ".ai/project.json",
        "AGENTS.md",
        "docs/",
        "scripts/",
        "package.json",
        "vitest.config.ts"
      ],
      "depends_on": ["T2"],
      "owner": "codex"
    },
    {
      "id": "T4",
      "title": "运行计划检查并记录交付缺口",
      "phase": "verify",
      "status": "todo",
      "result": "Plan integration 与真实运行结果已记录，未取得的审查与 Release 证据原样保留；失败时保留失败输出并回到 T3。",
      "scope": ["docs/plans/", "docs/designs/", "docs/others/evidence/"],
      "depends_on": ["T3"],
      "owner": "codex"
    }
  ],
  "depends_on": [],
  "dependency_contracts": [],
  "shared_files": [],
  "handoff": {
    "interfaces": [],
    "migrations": [],
    "tests": [],
    "remaining": ["词汇实现 Plan 的正式验证另行接续"]
  },
  "owner": "codex",
  "risk": "infrastructure",
  "data_contract": {
    "access_scope": "not-applicable",
    "access_rationale": "本轮不改业务数据、数据库 schema 或访问控制。",
    "migration_impact": "none",
    "rollback": "回退本轮模板同步和文档对齐文件即可，不触碰词书数据与历史迁移。",
    "destructive_authorization": null
  },
  "write_scope": [
    ".ai/project.json",
    "AGENTS.md",
    "docs/",
    "scripts/",
    "package.json",
    "tests/contracts/whitepaper-adoption.test.ts",
    "tests/e2e/future-modules.spec.ts",
    "tests/e2e/vocabulary.spec.ts",
    "vitest.config.ts"
  ],
  "tdd_evidence": [],
  "required_evidence": ["check-integration"],
  "evidence": [],
  "design_writeback": {
    "changed": ["docs/designs/README.md", "docs/designs/execution.md"],
    "reason": "模板治理入口与采用边界已同步；业务实现事实未在本轮改变。"
  },
  "blocker": null,
  "open_questions": [],
  "integrated_commit": null,
  "updated_at": "2026-11-08"
}
-->

# Ignite 模板刷新与白纸英语规格对齐

## 状态

本 Plan 保持 draft。模板治理文件、检查器和产品规格已按用户授权写入工作树，但按新契约要求的真实红灯、独立审查与 Release 验证尚未取得，因此 tasks 全部保持 todo，本轮不以文档绿灯冒充完成。已落地的改动记在「状态记录」，它们早于本 Plan 的红灯契约，不作为本 Plan 的实现证据。

## 目标

完成后，白纸英语与最新 Ignite 模板使用同一套文档治理、规格闭环和执行契约；词汇、工作台、写作和语法的现有需求按当前阶段重新收束，未开放能力不再被写成可用功能。用户原话是「你把我那个模板在这更新一下子」「把我们的这些需求啊这些东西重新对照着来把它改好」「把相关的东西补进模板里面去」。

## 原始目标与覆盖核对

| 用户原话或可追溯来源                            | 本轮目标                                                                   | REQ                                                                                        | AC                               | 处理结果                                     |
| ----------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------- | -------------------------------------------- |
| 2026-11-08 用户要求把已优化的模板更新到当前项目 | 同步 template-maintenance 的规则、标准、检查器与治理测试，保留项目身份边界 | REQ-ADOPTION-001、REQ-ADOPTION-002                                                         | AC-ADOPTION-001、AC-ADOPTION-002 | 已写入工作树；正式行为证据待取得             |
| 2026-11-08 用户要求把现有需求重新对照模板改好   | 当前 Feature、Design、Plan、Release 使用同一契约，未开放模块不冒充当前能力 | REQ-WHITEPAPER-005、REQ-WORKSPACE-001、REQ-WORKSPACE-006、REQ-WRITING-005、REQ-GRAMMAR-005 | 对应 AC                          | 文档与测试入口已对齐；浏览器证据待取得       |
| 2026-11-08 用户要求把相关方法补进模板           | 规格闭环、术语、绑定、设计回写等方法成为仓库真源的一部分                   | REQ-ADOPTION-002                                                                           | AC-ADOPTION-002                  | 已同步到 docs 与 scripts；审查与发布证据待补 |

阶段目标是让仓库的自带检查能真实运行并暴露问题，而不是只改文字。代价是要人工判断哪些文件属于模板治理层、哪些属于白纸英语产品层，且要放弃「重克隆覆盖」这种看起来更快的做法。本轮假设是：现有词汇实现和词书数据属于用户要求保留的成果，不应为换取形式化绿灯而回退。

## 整体判断与推进顺序

- 链路与事实：模板治理从 Ignite 维护分支进入 docs 与 scripts，检查器再由仓库自身的 docs:check、ignite validate、typecheck、test 运行验证；产品层则由现有 Feature 与词汇模块承载。已确认的事实是文档结构与身份测试可以通过，未确认的是这些 AC 在新契约下的红灯与浏览器证据。
- 当前主要问题：模板要求的「先红灯后实现」与「成果已经落地」正面冲突，详见主要矛盾。它不是缺文件，也不是检查器坏了。
- 推进与尺度：先把治理层同步到可运行，再让产品规格说清当前阶段能做什么，最后才谈证据。其余发现（Tasks 去留、词汇 Plan 取证）转入 remaining_work，不在本轮扩围。
- 纠偏与停止：如果新检查器本身与模板真源不一致，或同步破坏了词汇功能，当前重点必须从「对齐文档」转为「修复同步」。若只能在回退已交付成果的前提下取得红灯，则停止取证并保留缺口，这正是当前选择。
- 目标函数：质量优先，其次时间与成本。预计 90 分钟；实际首轮约 31 分钟后额度中断，接续约 1 小时，合计超出预算，按「保留缺口、不减少验收项」处理。
- 方法选择：模板要求逐类来源核对，所以先读 Plan 规则、检查器与现有 Feature，再动文件；没有采用「先跑一遍看报错再猜」的方式。

## 来源规格

- 需求：docs/features/product.md、vocabulary.md、workspace.md、writing.md、grammar.md、template.md 中的 REQ-ADOPTION-001/002、REQ-WHITEPAPER-005、REQ-WORKSPACE-001/006、REQ-WRITING-005、REQ-GRAMMAR-005。
- 标准：docs/standards/ai-agents.md（共用地基）、adoption.md（采用边界）、testing.md（检查层级与红灯纪律）、development.md（运行环境）。
- 决策：docs/others/adr/0004-spec-closure-contract.md，规格闭环的长期取舍。
- 设计：docs/designs/README.md 与 execution.md，记录当前治理入口与执行事实。
- 测试意图：tests/contracts/whitepaper-adoption.test.ts 与 tests/e2e/future-modules.spec.ts、tests/e2e/vocabulary.spec.ts。
- 发布：docs/plans/releases/template-refresh.json 定义本轮纳入范围。
- 运行记录：docs/others/evidence/ 下的现有证据，本轮未新增通过的集成或发布记录。
- 不适用来源与理由：docs/standards/api.md 与 database.md 不适用，本轮不改接口与 schema；security.md 中认证条目不适用，本轮不动认证；docs/others/adr/0001 至 0003 不适用，它们约束的是模块、任务与证据结构而非文档治理；test:migrations 不适用，因为没有迁移改动。

## 目标映射

| Source             | Binding  | 主要任务 | 验证                                        |
| ------------------ | -------- | -------- | ------------------------------------------- |
| REQ-ADOPTION-001   | BIND-001 | T3       | AC-ADOPTION-001                             |
| REQ-ADOPTION-002   | BIND-002 | T3       | AC-ADOPTION-002                             |
| AC-ADOPTION-001    | BIND-003 | T2       | tests/contracts/whitepaper-adoption.test.ts |
| AC-ADOPTION-002    | BIND-004 | T2       | tests/contracts/whitepaper-adoption.test.ts |
| REQ-WHITEPAPER-005 | BIND-005 | T3       | AC-WHITEPAPER-005                           |
| AC-WHITEPAPER-005  | BIND-006 | T2       | tests/e2e/vocabulary.spec.ts                |
| REQ-WORKSPACE-001  | BIND-007 | T3       | AC-WORKSPACE-001                            |
| AC-WORKSPACE-001   | BIND-008 | T2       | tests/e2e/future-modules.spec.ts            |
| REQ-WORKSPACE-006  | BIND-009 | T3       | AC-WORKSPACE-006                            |
| AC-WORKSPACE-006   | BIND-010 | T2       | tests/e2e/future-modules.spec.ts            |
| REQ-WRITING-005    | BIND-011 | T3       | AC-WRITING-005                              |
| AC-WRITING-005     | BIND-012 | T2       | tests/e2e/future-modules.spec.ts            |
| REQ-GRAMMAR-005    | BIND-013 | T3       | AC-GRAMMAR-005                              |
| AC-GRAMMAR-005     | BIND-014 | T2       | tests/e2e/future-modules.spec.ts            |

按同一维度对照目标与事实：

| 维度   | 目标                     | 事实                                         | 差距                                     |
| ------ | ------------------------ | -------------------------------------------- | ---------------------------------------- |
| 结果   | 治理检查可运行、身份一致 | docs:check 已能识别缺口，身份测试文件存在    | 缺口正是本 Plan 的文档结构，修复后需重跑 |
| 边界   | 不动产品语义与词书       | 本轮未改词汇数据与业务 API                   | 一致                                     |
| 代价   | 保留未提交成果           | 工作树仍有 60 余个文件改动                   | 需分批提交，不能一次混提                 |
| 时间   | 90 分钟内完成            | 首次 31 分钟中断，接续约 1 小时              | 超出，已改为保留缺口而非砍验收           |
| 兼容性 | 身份与包名切换不影响运行 | site.ts、package.json、.ai/project.json 已改 | 一致，但需类型与测试确认                 |

## 主要矛盾

目标要求：采用新模板后，每个交付都要先在未实现版本取得带 AC 标记的真实红灯，再实现，并由独立审查与提交绑定的证据支撑完成判定。

当前依赖：白纸英语的模板同步、词汇实现和规格文档已经在旧契约下直接写入未提交的工作树，而这些成果正是用户明确要求保留的内容。

冲突点：要取得本 Plan 要求的红灯，必须把已经实现的行为退回未实现状态；要保留这些成果，就无法产生「实现前失败」的证据，两者方向相反。

相互制约：在同一个工作树上不能同时最大化——回退取证会破坏用户现有成果，保留成果则红灯缺失，且这一缺失无法靠补写记录消除。

支撑事实是：工作树包含词汇模块、词书数据与多处文档改动，且这些文件从未以「测试先行」的顺序提交过。它最阻碍目标，因为模板的完成判定以红灯和审查为前置，没有它们，Plan 只能停在 draft。推翻条件是：如果能把本 Plan 收窄到一块仍未实现的行为并单独取证，这个矛盾就不成立；当前没有这样的切片，所以选择保留缺口。

## 次要矛盾

- 产品规格与模板示例语义并存：template.md 继续保留 REQ-PRODUCT 编号用于追溯，而仓库里仍有 Tasks 示例实现。当前用「继承契约」边界声明压住，但它会在有人把示例代码当成产品能力时升级，因此单列 remaining_work。
- 词汇 Plan 的浏览器证据与 Release 组合验收尚未完成，会让 template-refresh 的 Release 无法判定完成。它当前阻碍较小，因为本轮交付的是治理层，但 Release verify 必须以两个 Plan 都完成为前提。

## 决策原则

- 保留用户已落地成果优先于形式化绿灯。依据是主要矛盾：回退取证会破坏用户要求保留的内容，代价高于缺口本身。
- 证据不足时如实保留缺口，不补写、不伪造。依据是 AGENTS.md 的完成规则与 testing.md 的红灯纪律。
- 模板治理层与产品层分开处理。依据是方案比较中被否的「覆盖式同步」，以及 .ai/project.json 的 adopted 身份。
- 结构检查必须真实通过。依据是用户要求「完全符合模板」，而 docs:check 与 ignite validate 正是模板自带的结构底线。

## 方案比较

- 采用：逐文件同步治理层，保留产品层。可回滚、范围清晰，代价是每个文件要判断归属，且工作树改动量大。
- 否定：重新克隆模板覆盖工作树。理由是模板不含白纸英语的词书数据、词汇实现和产品文档，覆盖会直接丢失未提交成果。
- 否定：只改 docs 不跑检查。理由是结构契约正是本轮要采用的规则，跳过检查等于没有采用，且无法发现计划与规格的引用断裂。
- 否定：等词汇 Plan 完成后再做模板对齐。理由是用户当前就要对齐，且后续工作会继续按旧契约产出，拖得越久迁移成本越高。
- 复审条件：如果检查器与模板真源出现不一致，或同步导致词汇功能回归，则回到方案比较，优先修同步而不是继续改文档。

## 约束绑定矩阵

| Source ID          | Binding  | 任务 | 验证              |
| ------------------ | -------- | ---- | ----------------- |
| REQ-ADOPTION-001   | BIND-001 | T3   | AC-ADOPTION-001   |
| REQ-ADOPTION-002   | BIND-002 | T3   | AC-ADOPTION-002   |
| AC-ADOPTION-001    | BIND-003 | T2   | AC-ADOPTION-001   |
| AC-ADOPTION-002    | BIND-004 | T2   | AC-ADOPTION-002   |
| REQ-WHITEPAPER-005 | BIND-005 | T3   | AC-WHITEPAPER-005 |
| AC-WHITEPAPER-005  | BIND-006 | T2   | AC-WHITEPAPER-005 |
| REQ-WORKSPACE-001  | BIND-007 | T3   | AC-WORKSPACE-001  |
| AC-WORKSPACE-001   | BIND-008 | T2   | AC-WORKSPACE-001  |
| REQ-WORKSPACE-006  | BIND-009 | T3   | AC-WORKSPACE-006  |
| AC-WORKSPACE-006   | BIND-010 | T2   | AC-WORKSPACE-006  |
| REQ-WRITING-005    | BIND-011 | T3   | AC-WRITING-005    |
| AC-WRITING-005     | BIND-012 | T2   | AC-WRITING-005    |
| REQ-GRAMMAR-005    | BIND-013 | T3   | AC-GRAMMAR-005    |
| AC-GRAMMAR-005     | BIND-014 | T2   | AC-GRAMMAR-005    |

## 回退

本轮不触碰数据库、认证和词书数据，回退按文件组处理：治理层（docs/standards、docs/plans/README.md、scripts/ignite）用 git checkout 恢复到 base_commit 的版本；采用身份（.ai/project.json、package.json、src/config）单独回退，并确认包名与项目身份同步恢复，避免半套命名。检查器回退后必须重跑 docs:check 与 ignite validate，确认仍按旧规则运行，不留半开状态。

接口与对外行为没有变化，因此没有旧调用方兼容期；唯一的外部可见变化是 package.json 名称与仓库身份，回退时一并恢复。

## 非目标

不新增写作、语法、云同步或 AI 能力；不删除 Tasks 示例实现；不重写已应用迁移；不推送 GitHub。这里只解释边界：模板同步不包含模板建设期的历史 Plan 和证据，采用项目也不能套用模板的清理规则。

## 变更类型

顶部 change_type 为存量改动，属于基础设施调整。兼容性影响只有项目身份与包名，无数据迁移；shared_files 为空，因为导航文件属于词汇 Plan 的写入范围，不在本轮声明。data_contract 记录为不适用：本轮不改数据归属、访问控制或迁移。

## 输入规格

读取的输入包括：本轮 Plan 规则与模板、docs/features 下六份规格、docs/standards 的 ai-agents 与 testing、ADR-0004、docs/designs 的 README 与 execution、两个测试文件，以及 releases/template-refresh.json。跨 Plan 依赖只有词汇 Plan，本轮不共享写入，因此原协作字段保持为空。

## 已关闭问题

- Tasks 示例实现的去留：本轮保留，理由是无法在模板刷新里同时决定产品去留，需单独建立存量改动 Plan。
- 词汇 Plan 的历史证据：保留原记录，按 testing.md 的测试修正恢复步骤在原 Plan 内接续，不新建「收口」Plan。
- 模板建设期记录：不复制，理由见 AGENTS.md 的模板定位与采用规范。

## 测试与验收设计

- AC-ADOPTION-001、AC-ADOPTION-002 用 unit 层断言检查项目身份字段与工程依赖清单。它们能发现身份漂移或治理入口被删，但发现不了浏览器行为。
- AC-WHITEPAPER-005 用 Playwright 断言未登录访问首页后的第一入口是词汇白纸。它能发现首屏退回 Tasks 或模板落地页的回归。
- AC-WORKSPACE-001、AC-WORKSPACE-006、AC-WRITING-005、AC-GRAMMAR-005 用同一个浏览器用例分别到达写作、语法与工作台纸张，断言每张纸只显示自己的模块和未开放状态。它能发现模块内容纵向拼接或把未开放能力写成可用。
- 上述浏览器用例需要运行中的应用与 Playwright 环境；本轮尚未执行，属于未完成证据，不作为通过依据。unit 层按实际运行结果记录。

## 实现任务

- T1 核对模板来源、产品边界与写入范围。改变条件：发现模板分支内容与记录不符或产品文件被判为治理层时，重做范围映射。失败判定：来源无法追溯或写入范围覆盖产品实现。
- T2 按 AC 取得真实行为红灯。改变条件：测试路径或 AC 标记变化时，同步调整映射。失败判定：红灯来自环境错误或占位失败，而不是目标断言。
- T3 同步模板治理文件并对齐产品规格边界。改变条件：检查器要求与产品语义冲突时，先改规格再改实现。失败判定：docs:check 或 ignite validate 仍失败，或覆盖了词书与业务代码。
- T4 运行计划检查并记录交付缺口。改变条件：检查失败指向代码回归时，回到 T3。失败判定：把文档绿灯当成 Plan 完成，或隐藏未取得的审查与发布证据。

## 验收方式

先用 node scripts/ignite.mjs plan validate IGT-2026110801 --prepare 检查文档与任务结构，再按 AC 运行 node scripts/ignite.mjs tdd red --plan IGT-2026110801 --ac <AC-ID>，之后用 pnpm ignite check --plan IGT-2026110801 --level integration。全部 Plan 完成后才运行 pnpm ignite release verify template-refresh --plan IGT-2026110801。当前只完成了结构检查与部分工程检查，尚未进入红灯与集成阶段。

## 设计回写

本轮只回写治理入口：docs/designs/README.md 记录新的文档方法入口，docs/designs/execution.md 记录执行契约的当前事实。词汇、工作台、写作、语法的实现事实没有变化，不回写。

## 状态记录

- 2026-11-08：从 Ignite 仓库取 template-maintenance 分支比对，确认 main 是干净模板、维护分支才含规格闭环与绑定检查；按此来源同步治理层，未复制 archive/template-build 的建设记录。
- 2026-11-08：第一轮 docs:check 通过治理文件，但本 Plan 因缺章节、绑定 ID 与 red 任务失败；据此重写本 Plan，保留 draft，不伪造证据。
- 2026-11-08：修复 docs/features/template.md 的补丁残留与过期「模板基线」描述，改为 adopted 状态并保留继承契约说明。
- 2026-11-08：类型与单元检查结果见本轮运行；浏览器与 Release 未运行，保留为缺口。

## 准出条件

每条 REQ 被 AC 覆盖且 AC 有匹配层级的真实测试；tasks 全部完成；integrated_commit 可追溯；Plan integration 与 Release verify 通过；Design 已回写。在这些条件成立前，本 Plan 保持 draft，并在报告中写明未取得的证据。

<!-- ignite-progress -->

状态：`draft`（由元数据生成）

- [ ] T1 · 核对模板来源、产品边界与写入范围 · todo
- [ ] T2 · 按 AC 取得真实行为红灯 · todo
- [ ] T3 · 同步模板治理文件并对齐产品规格边界 · todo
- [ ] T4 · 运行计划检查并记录交付缺口 · todo

验收缺口：本 Plan 映射的 AC 尚未取得按新契约要求的 TDD red 与独立审查证据，正式 Plan integration 与 Release verify 未执行。；词汇实现 Plan 仍需按新模板的 TDD、审查和 Release 流程在原 Plan 内接续取证。；Tasks 示例实现的保留、改造或删除仍需单独建立存量改动 Plan。
证据：尚无
<!-- /ignite-progress -->
