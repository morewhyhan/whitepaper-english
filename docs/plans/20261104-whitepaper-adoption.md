<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-2026110401",
  "release": "whitepaper-adoption",
  "status": "superseded",
  "outcome": "建立白纸英语完整、可追溯的产品采用文档基线，明确第一阶段词汇白纸、游客优先和模板替换边界；本Plan仍不执行业务实现。",
  "contract_version": 2,
  "execution_contract": 1,
  "task_contract": 2,
  "planning_contract": 1,
  "review_contract": 1,
  "reviews": [],
  "verification_contract": 2,
  "goals": [
    {
      "text": "整理产品采用的目标、边界与后续验收",
      "requirements": ["REQ-ADOPTION-001", "REQ-ADOPTION-002"]
    },
    {
      "text": "整理产品边界的目标、边界与后续验收",
      "requirements": [
        "REQ-WHITEPAPER-001",
        "REQ-WHITEPAPER-002",
        "REQ-WHITEPAPER-003",
        "REQ-WHITEPAPER-004",
        "REQ-WHITEPAPER-005"
      ]
    },
    {
      "text": "整理词汇学习的目标、边界与后续验收",
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
    },
    {
      "text": "整理统一工作台的目标、边界与后续验收",
      "requirements": [
        "REQ-WORKSPACE-001",
        "REQ-WORKSPACE-002",
        "REQ-WORKSPACE-003",
        "REQ-WORKSPACE-004",
        "REQ-WORKSPACE-005"
      ]
    },
    {
      "text": "整理写作学习的目标、边界与后续验收",
      "requirements": ["REQ-WRITING-001", "REQ-WRITING-002", "REQ-WRITING-003", "REQ-WRITING-004"]
    },
    {
      "text": "整理语法学习的目标、边界与后续验收",
      "requirements": ["REQ-GRAMMAR-001", "REQ-GRAMMAR-002", "REQ-GRAMMAR-003", "REQ-GRAMMAR-004"]
    }
  ],
  "constraints": [
    "本轮仅文档整理，不改src、package、身份配置、数据库、业务测试或部署。",
    "先遵守文档所属README，产品目标、当前事实、计划与原始来源分开。",
    "BUSINESS_MODEL.md保留原文；已采用的首阶段产品决定写入Feature，第二阶段以后的方案继续标注边界。",
    "子代理仅必要审查，优先当前可用最低档gpt-6-luna，不自动升级。"
  ],
  "non_goals": ["本轮不执行品牌切换、业务开发、测试实现、迁移、AI接入、推送或部署。"],
  "authorization": {
    "source": "2026-11-04 用户最新纠偏：先完整读取文档规范并把文档做好，本轮不写业务。之前全部实施建议已被该阶段约束收窄。"
  },
  "deliverables": [
    "README和文档导航",
    "产品、工作台、词汇、写作、语法目标稿",
    "当前事实与未来目标区分",
    "记录本轮纠偏和未决事项的原Plan/Release"
  ],
  "remaining_work": [
    "关联材料来源、长期复习、写作反馈和语法资产授权仍需在对应阶段关闭；业务实现必须另立或接续授权的实施任务。"
  ],
  "change_type": "新增模块",
  "base_commit": "b437eee0cda58f46ba5c496948c94c0dd85c6442",
  "requirements": [
    "REQ-ADOPTION-001",
    "REQ-ADOPTION-002",
    "REQ-WHITEPAPER-001",
    "REQ-WHITEPAPER-002",
    "REQ-WHITEPAPER-003",
    "REQ-WHITEPAPER-004",
    "REQ-WHITEPAPER-005",
    "REQ-VOCABULARY-001",
    "REQ-VOCABULARY-002",
    "REQ-VOCABULARY-003",
    "REQ-VOCABULARY-004",
    "REQ-VOCABULARY-005",
    "REQ-VOCABULARY-006",
    "REQ-VOCABULARY-007",
    "REQ-VOCABULARY-008",
    "REQ-WORKSPACE-001",
    "REQ-WORKSPACE-002",
    "REQ-WORKSPACE-003",
    "REQ-WORKSPACE-004",
    "REQ-WORKSPACE-005",
    "REQ-WRITING-001",
    "REQ-WRITING-002",
    "REQ-WRITING-003",
    "REQ-WRITING-004",
    "REQ-GRAMMAR-001",
    "REQ-GRAMMAR-002",
    "REQ-GRAMMAR-003",
    "REQ-GRAMMAR-004"
  ],
  "acceptance": [
    {
      "id": "AC-VOCABULARY-001",
      "tests": ["tests/e2e/whitepaper.spec.ts::[AC-VOCABULARY-001] 未登录进入白纸词汇工作台"],
      "required_layers": ["browser"],
      "checks": [
        {
          "test": "tests/e2e/whitepaper.spec.ts::[AC-VOCABULARY-001] 未登录进入白纸词汇工作台",
          "layer": "browser"
        }
      ]
    },
    {
      "id": "AC-VOCABULARY-002",
      "tests": ["tests/e2e/whitepaper.spec.ts::[AC-VOCABULARY-002] 手动分页并判断会与不会"],
      "required_layers": ["browser"],
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
      "required_layers": ["browser"],
      "checks": [
        {
          "test": "tests/e2e/whitepaper.spec.ts::[AC-VOCABULARY-003] 配置点击默认判断并用 Shift 反转",
          "layer": "browser"
        }
      ]
    },
    {
      "id": "AC-VOCABULARY-004",
      "tests": ["tests/e2e/whitepaper.spec.ts::[AC-VOCABULARY-004] 下一轮只保留上一轮不会词"],
      "required_layers": ["browser"],
      "checks": [
        {
          "test": "tests/e2e/whitepaper.spec.ts::[AC-VOCABULARY-004] 下一轮只保留上一轮不会词",
          "layer": "browser"
        }
      ]
    },
    {
      "id": "AC-VOCABULARY-005",
      "tests": ["tests/e2e/whitepaper.spec.ts::[AC-VOCABULARY-005] 关联辅助共享原任务与错词池"],
      "required_layers": ["browser"],
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
      "required_layers": ["browser"],
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
      "required_layers": ["browser"],
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
      "required_layers": ["browser"],
      "checks": [
        {
          "test": "tests/e2e/whitepaper.spec.ts::[AC-VOCABULARY-008] 导出 JSON Markdown 并可重导入 JSON",
          "layer": "browser"
        }
      ]
    },
    {
      "id": "AC-ADOPTION-001",
      "tests": ["tests/e2e/whitepaper.spec.ts::[AC-ADOPTION-001] 产品身份与认证保留"],
      "required_layers": ["browser"],
      "checks": [
        {
          "test": "tests/e2e/whitepaper.spec.ts::[AC-ADOPTION-001] 产品身份与认证保留",
          "layer": "browser"
        }
      ]
    },
    {
      "id": "AC-ADOPTION-002",
      "tests": ["tests/e2e/adoption.spec.ts::[AC-ADOPTION-002] 后续产品行为验收"],
      "required_layers": ["browser"],
      "checks": [
        {
          "test": "tests/e2e/adoption.spec.ts::[AC-ADOPTION-002] 后续产品行为验收",
          "layer": "browser"
        }
      ]
    },
    {
      "id": "AC-WHITEPAPER-001",
      "tests": ["tests/e2e/whitepaper.spec.ts::[AC-WHITEPAPER-001] 后续产品行为验收"],
      "required_layers": ["browser"],
      "checks": [
        {
          "test": "tests/e2e/whitepaper.spec.ts::[AC-WHITEPAPER-001] 后续产品行为验收",
          "layer": "browser"
        }
      ]
    },
    {
      "id": "AC-WHITEPAPER-002",
      "tests": ["tests/e2e/whitepaper.spec.ts::[AC-WHITEPAPER-002] 后续产品行为验收"],
      "required_layers": ["browser"],
      "checks": [
        {
          "test": "tests/e2e/whitepaper.spec.ts::[AC-WHITEPAPER-002] 后续产品行为验收",
          "layer": "browser"
        }
      ]
    },
    {
      "id": "AC-WHITEPAPER-003",
      "tests": ["tests/e2e/whitepaper.spec.ts::[AC-WHITEPAPER-003] 后续产品行为验收"],
      "required_layers": ["browser"],
      "checks": [
        {
          "test": "tests/e2e/whitepaper.spec.ts::[AC-WHITEPAPER-003] 后续产品行为验收",
          "layer": "browser"
        }
      ]
    },
    {
      "id": "AC-WHITEPAPER-004",
      "tests": ["tests/e2e/whitepaper.spec.ts::[AC-WHITEPAPER-004] 未登录访客进入第一张白纸"],
      "required_layers": ["browser"],
      "checks": [
        {
          "test": "tests/e2e/whitepaper.spec.ts::[AC-WHITEPAPER-004] 未登录访客进入第一张白纸",
          "layer": "browser"
        }
      ]
    },
    {
      "id": "AC-WHITEPAPER-005",
      "tests": ["tests/e2e/whitepaper.spec.ts::[AC-WHITEPAPER-005] 第一入口是词汇白纸"],
      "required_layers": ["browser"],
      "checks": [
        {
          "test": "tests/e2e/whitepaper.spec.ts::[AC-WHITEPAPER-005] 第一入口是词汇白纸",
          "layer": "browser"
        }
      ]
    },
    {
      "id": "AC-WORKSPACE-001",
      "tests": ["tests/e2e/workspace.spec.ts::[AC-WORKSPACE-001] 后续产品行为验收"],
      "required_layers": ["browser"],
      "checks": [
        {
          "test": "tests/e2e/workspace.spec.ts::[AC-WORKSPACE-001] 后续产品行为验收",
          "layer": "browser"
        }
      ]
    },
    {
      "id": "AC-WORKSPACE-002",
      "tests": ["tests/e2e/workspace.spec.ts::[AC-WORKSPACE-002] 后续产品行为验收"],
      "required_layers": ["browser"],
      "checks": [
        {
          "test": "tests/e2e/workspace.spec.ts::[AC-WORKSPACE-002] 后续产品行为验收",
          "layer": "browser"
        }
      ]
    },
    {
      "id": "AC-WORKSPACE-003",
      "tests": ["tests/e2e/workspace.spec.ts::[AC-WORKSPACE-003] 后续产品行为验收"],
      "required_layers": ["browser"],
      "checks": [
        {
          "test": "tests/e2e/workspace.spec.ts::[AC-WORKSPACE-003] 后续产品行为验收",
          "layer": "browser"
        }
      ]
    },
    {
      "id": "AC-WORKSPACE-004",
      "tests": ["tests/e2e/workspace.spec.ts::[AC-WORKSPACE-004] 后续产品行为验收"],
      "required_layers": ["browser"],
      "checks": [
        {
          "test": "tests/e2e/workspace.spec.ts::[AC-WORKSPACE-004] 后续产品行为验收",
          "layer": "browser"
        }
      ]
    },
    {
      "id": "AC-WORKSPACE-005",
      "tests": ["tests/e2e/workspace.spec.ts::[AC-WORKSPACE-005] 后续产品行为验收"],
      "required_layers": ["browser"],
      "checks": [
        {
          "test": "tests/e2e/workspace.spec.ts::[AC-WORKSPACE-005] 后续产品行为验收",
          "layer": "browser"
        }
      ]
    },
    {
      "id": "AC-WRITING-001",
      "tests": ["tests/e2e/writing.spec.ts::[AC-WRITING-001] 后续产品行为验收"],
      "required_layers": ["browser"],
      "checks": [
        {
          "test": "tests/e2e/writing.spec.ts::[AC-WRITING-001] 后续产品行为验收",
          "layer": "browser"
        }
      ]
    },
    {
      "id": "AC-WRITING-002",
      "tests": ["tests/e2e/writing.spec.ts::[AC-WRITING-002] 后续产品行为验收"],
      "required_layers": ["browser"],
      "checks": [
        {
          "test": "tests/e2e/writing.spec.ts::[AC-WRITING-002] 后续产品行为验收",
          "layer": "browser"
        }
      ]
    },
    {
      "id": "AC-WRITING-003",
      "tests": ["tests/e2e/writing.spec.ts::[AC-WRITING-003] 后续产品行为验收"],
      "required_layers": ["browser"],
      "checks": [
        {
          "test": "tests/e2e/writing.spec.ts::[AC-WRITING-003] 后续产品行为验收",
          "layer": "browser"
        }
      ]
    },
    {
      "id": "AC-WRITING-004",
      "tests": ["tests/e2e/writing.spec.ts::[AC-WRITING-004] 后续产品行为验收"],
      "required_layers": ["browser"],
      "checks": [
        {
          "test": "tests/e2e/writing.spec.ts::[AC-WRITING-004] 后续产品行为验收",
          "layer": "browser"
        }
      ]
    },
    {
      "id": "AC-GRAMMAR-001",
      "tests": ["tests/e2e/grammar.spec.ts::[AC-GRAMMAR-001] 后续产品行为验收"],
      "required_layers": ["browser"],
      "checks": [
        {
          "test": "tests/e2e/grammar.spec.ts::[AC-GRAMMAR-001] 后续产品行为验收",
          "layer": "browser"
        }
      ]
    },
    {
      "id": "AC-GRAMMAR-002",
      "tests": ["tests/e2e/grammar.spec.ts::[AC-GRAMMAR-002] 后续产品行为验收"],
      "required_layers": ["browser"],
      "checks": [
        {
          "test": "tests/e2e/grammar.spec.ts::[AC-GRAMMAR-002] 后续产品行为验收",
          "layer": "browser"
        }
      ]
    },
    {
      "id": "AC-GRAMMAR-003",
      "tests": ["tests/e2e/grammar.spec.ts::[AC-GRAMMAR-003] 后续产品行为验收"],
      "required_layers": ["browser"],
      "checks": [
        {
          "test": "tests/e2e/grammar.spec.ts::[AC-GRAMMAR-003] 后续产品行为验收",
          "layer": "browser"
        }
      ]
    },
    {
      "id": "AC-GRAMMAR-004",
      "tests": ["tests/e2e/grammar.spec.ts::[AC-GRAMMAR-004] 后续产品行为验收"],
      "required_layers": ["browser"],
      "checks": [
        {
          "test": "tests/e2e/grammar.spec.ts::[AC-GRAMMAR-004] 后续产品行为验收",
          "layer": "browser"
        }
      ]
    }
  ],
  "verification_requirements": ["browser"],
  "tasks": [
    {
      "id": "T1",
      "title": "依照所属规范整理产品文档",
      "phase": "prepare",
      "result": "产品定位统一，四模块规格说明来源、行为、验收意图和未决问题，当前事实不冒充已实现能力。",
      "scope": [
        "README.md",
        "docs/README.md",
        "docs/features/",
        "docs/designs/",
        "docs/others/test-cases/",
        ".ai/README.md"
      ],
      "depends_on": [],
      "owner": "main-agent",
      "status": "doing"
    },
    {
      "id": "T2",
      "title": "审查文档职责、来源与链接",
      "phase": "prepare",
      "result": "独立低档代理只审文档矛盾，主代理修正并运行文档及格式检查，业务仍不具备开工条件。",
      "scope": ["docs/plans/20261104-whitepaper-adoption.md"],
      "depends_on": ["T1"],
      "owner": "main-agent",
      "status": "todo"
    },
    {
      "id": "T3",
      "title": "后续另行启动：记录词汇和采用目标断言红灯",
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
        "AC-ADOPTION-001",
        "AC-ADOPTION-002",
        "AC-WHITEPAPER-001",
        "AC-WHITEPAPER-002",
        "AC-WHITEPAPER-003",
        "AC-WHITEPAPER-004",
        "AC-WHITEPAPER-005",
        "AC-WORKSPACE-001",
        "AC-WORKSPACE-002",
        "AC-WORKSPACE-003",
        "AC-WORKSPACE-004",
        "AC-WORKSPACE-005",
        "AC-WRITING-001",
        "AC-WRITING-002",
        "AC-WRITING-003",
        "AC-WRITING-004",
        "AC-GRAMMAR-001",
        "AC-GRAMMAR-002",
        "AC-GRAMMAR-003",
        "AC-GRAMMAR-004"
      ],
      "result": "原生 red 保存目标断言失败，模块加载或环境失败不算。",
      "scope": ["tests/e2e/whitepaper.spec.ts", "docs/others/evidence/tdd/"],
      "depends_on": ["T2"],
      "owner": "main-agent",
      "status": "todo"
    },
    {
      "id": "T4",
      "title": "后续另行启动：实现纯词汇状态和导入导出",
      "phase": "implement",
      "acceptance": [
        "AC-VOCABULARY-004",
        "AC-VOCABULARY-005",
        "AC-VOCABULARY-007",
        "AC-VOCABULARY-008"
      ],
      "result": "纯 reducer 保持轮次和关联身份，三种导入及两种导出满足既定断言。",
      "scope": ["src/modules/vocabulary/"],
      "depends_on": ["T3"],
      "owner": "main-agent",
      "status": "todo"
    },
    {
      "id": "T5",
      "title": "后续另行启动：集成本地白纸体验与采用身份",
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
        "AC-ADOPTION-001",
        "AC-ADOPTION-002",
        "AC-WHITEPAPER-001",
        "AC-WHITEPAPER-002",
        "AC-WHITEPAPER-003",
        "AC-WHITEPAPER-004",
        "AC-WHITEPAPER-005",
        "AC-WORKSPACE-001",
        "AC-WORKSPACE-002",
        "AC-WORKSPACE-003",
        "AC-WORKSPACE-004",
        "AC-WORKSPACE-005",
        "AC-WRITING-001",
        "AC-WRITING-002",
        "AC-WRITING-003",
        "AC-WRITING-004",
        "AC-GRAMMAR-001",
        "AC-GRAMMAR-002",
        "AC-GRAMMAR-003",
        "AC-GRAMMAR-004"
      ],
      "result": "未来实现任务将让访客完成词汇旅程并刷新恢复，项目品牌更新，认证回归保留；本阶段不执行。",
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
      "depends_on": ["T4"],
      "owner": "main-agent",
      "status": "todo"
    },
    {
      "id": "T6",
      "title": "后续另行启动：独立交付审查与当前事实回写",
      "phase": "verify",
      "result": "Plan integration 与 delivery 审查有真实证据，Design 反映实现，Release 最终验收及交付检查由主代理执行。",
      "scope": [
        "docs/designs/",
        "docs/others/evidence/",
        "docs/plans/20261104-whitepaper-adoption.md",
        "docs/plans/releases/whitepaper-adoption.json"
      ],
      "depends_on": ["T5"],
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
    "interfaces": ["Feature描述目标，Design描述当前源码，Plan记录阶段；本轮没有已批准的实现接口。"],
    "migrations": ["不修改历史迁移；Tasks 若退役只通过新增具名 migration 并验证历史数据升级。"],
    "tests": ["顶部tests/checks是未来规划路径，当前没有新业务自动化测试，开工前需重新细化。"],
    "remaining": [
      "本轮只完成文档；任何后续实现须先解决open_questions，补真实测试、独立审查和原生开工检查。"
    ]
  },
  "owner": "main-agent",
  "risk": "infrastructure",
  "data_contract": {
    "access_scope": "not-applicable",
    "access_rationale": "本轮仅文档，未建立新的数据归属或保存机制；后续产品数据方案须确认。",
    "migration_impact": "none",
    "rollback": "本轮只修正文档，可通过Git恢复；商业文件、源码、认证数据与历史迁移不变。",
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
    "src/modules/auth/",
    "docs/features/",
    "docs/README.md",
    "docs/others/test-cases/",
    ".ai/README.md",
    "docs/features/template.md"
  ],
  "tdd_evidence": [],
  "required_evidence": ["check-integration"],
  "evidence": [],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": null,
  "updated_at": "2026-11-07"
}
-->

# 白纸英语文档整理与后续采用

## 状态

本 Plan 保留 draft。本轮完成产品文档基线，仍未授权进入业务实施；顶部 tasks 是唯一任务状态，未来 red、implement、verify 阶段继续保留 todo。

## 目标

按用户要求，先把文档规范和产品采用边界写完整。当前文档已经明确：白纸英语替换 Ignite 的产品外壳和业务语义，保留工程底座；第一阶段是游客可用的词汇白纸，写作与语法按后续阶段进入。

## 原始目标与覆盖核对

| 用户来源                   | 本轮处理                                              | 规格位置                                         |
| -------------------------- | ----------------------------------------------------- | ------------------------------------------------ |
| 初始A4白纸对话             | 固化第一阶段的纸张扫词、多轮筛选和同任务进度边界      | vocabulary.md                                    |
| 用户提供商业模式文件       | 原文保留，区分经营方向、假设与产品行为                | product.md、workspace.md、writing.md、grammar.md |
| 要求采用模板               | 明确保留工程底座、替换产品外壳与 Tasks 领域的采用目标 | product.md、Design、database.md、api.md          |
| 要求用poteto思考与内部设计 | 遵循所属README固定方法，记录依据和未决问题            | 本Plan及各文档                                   |
| “先把我的文档全部做好”     | 本轮只做文档，不写业务代码、品牌配置或业务测试        | 当前constraints与tasks                           |
| 子代理用最低档以节省额度   | 必要审查才委派，最低可用档位，不静默升级              | 当前constraints                                  |

## 整体判断与推进顺序

最先需要修正的是文档职责。当前 Feature 统一使用白纸英语身份，模板契约单独保留；采用决策、模块边界、目标数据模型、目标 API 和目标视觉均已写入文档，并在 Design 中和当前模板事实分开。

先读规范、整理来源与状态，再检查各模块和跨模块边界，最后审查链接、编号与文档表述。没有必要为这一阶段开发编辑器、数据库或门禁工具。出现新用户要求时先更新当前Plan，不能用旧实施授权覆盖新的只做文档约束。

## 非目标

当前 non_goals 只限制本轮不写代码。词汇第一阶段的产品边界已经确定；写作、语法、关联材料和长期复习仍是后续阶段，不因本轮文档完成而自动开工。

## 变更类型

保留采用计划的原始类型。当前只更新文档，源码、Schema和迁移不改；原始商业文件不改。没有数据迁移或破坏性操作。此前提前创建的业务测试从当前工作树撤回，验收意图转存文档。

## 输入规格

[产品规格](../features/product.md)、[工作台](../features/workspace.md)、[词汇](../features/vocabulary.md)、[写作](../features/writing.md)、[语法](../features/grammar.md)。文档职责与方法遵循各目录README，用户商业文件和引用对话是输入来源，不作为已实现证明。

## 已关闭问题

名称与仓库已确定，开发环境采用 WSL。第一阶段入口、游客范围、模块顺序和 Tasks 退役方向已经关闭；关联材料来源、长期复习、写作供应商和语法资产授权仍保留为后续阶段问题。

## 测试与验收设计

文档检查器当前要求所有Feature的AC已经被自动化测试命名，即使对应Plan仍是draft。用户本轮只要求文档，因而不为满足该检查创建占位测试或改写检查器。现有docs:check会报告新增目标AC没有自动化映射；这属于进入业务准备阶段前需补的明确缺口，不代表本文所列行为已验收。文档结构、链接及格式另行核对。

本轮检查文档结构、链接、编号和格式，并逐项审阅目标与源码事实是否混淆。顶部业务 AC 映射仅保留为未来测试规划，当前对应代码已撤回，不是现有测试或通过证明。未来进入实施前重新按 Feature 补齐真实断言。

## 实现任务

T1 服务于当前文档整理；T2 仍需要独立读者按规则审查。后续 red、implement、verify 任务保留为未来采用过程，当前不得启动。只完成文档不把整个业务 Plan 标为 done。

## 验收方式

先审文档矛盾和原始目标覆盖，再执行docs:check、针对修改文档的format检查和git diff --check。可运行原生prepare确认剩余问题，但不以prepared冒充业务ready。用户未要求业务验收，不运行新的产品测试或生产发布。

## 设计回写

Design只增加当前项目阶段说明，并保持已有认证、Tasks、API与数据库事实。不把“计划本地优先”写成“已有浏览器词汇存储”。

## 状态记录

2026-11-04 文档整理后，针对变更文件的Prettier检查和git diff --check通过。docs:check未报告链接、标题或编号结构错误，仅报告新增26条AC尚无自动化测试；这些业务测试本轮不编写。原生prepare因未决问题、未写测试和缺少有效独立审查仍不允许ready。

2026-11-04 最后一次独立审查按用户成本偏好使用gpt-6-luna。该代理未读取实际文件，未形成有效结论，不记录批准，也不把主代理自查说成独立审查。后续无需为当前文档反复启动代理；正式业务开工前再按届时范围处理审查缺口。

2026-11-04 实际Git差异确认src、package.json、prisma、.ai/project.json及BUSINESS_MODEL.md没有本轮改动。前置业务测试已从当前工作树删除，09418ca仍保留其历史版本。当前只交付可讨论的文档稿，不声称产品已完成或可开工。

2026-11-04 已准备WSL依赖并归档模板历史。模板生产构建曾成功，仅证明原模板可编译；整体verify在格式检查停止，没有业务通过证据。

2026-11-04 用户指出推进过快、文档规范未落实，明确改为先完成文档。停止原业务审查，撤回提前创建的业务测试。既有商业文件与模板源码保持不变。

## 准出条件

当前文档交付与业务Plan完成分开。文档可完成审查，业务仍保留draft、未决问题、未运行验收和未来任务，不宣称具备正式开工条件。

<!-- ignite-progress -->

状态：`superseded`（由元数据生成）

- [ ] T1 · 依照所属规范整理产品文档 · doing
- [ ] T2 · 审查文档职责、来源与链接 · todo
- [ ] T3 · 后续另行启动：记录词汇和采用目标断言红灯 · todo
- [ ] T4 · 后续另行启动：实现纯词汇状态和导入导出 · todo
- [ ] T5 · 后续另行启动：集成本地白纸体验与采用身份 · todo
- [ ] T6 · 后续另行启动：独立交付审查与当前事实回写 · todo

验收缺口：关联材料来源、长期复习、写作反馈和语法资产授权仍需在对应阶段关闭；业务实现必须另立或接续授权的实施任务。
证据：尚无
<!-- /ignite-progress -->
