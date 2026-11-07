<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-1794090800136711353",
  "release": "account-judgements-v1",
  "status": "active",
  "outcome": "登录用户可以把当前页的会/不会判定批量保存到自己的账号，另一个账号看不到。",
  "contract_version": 2,
  "execution_contract": 1,
  "task_contract": 2,
  "planning_contract": 1,
  "review_contract": 1,
  "reviews": [
    {
      "stage": "draft",
      "reviewer": "subagent-reviewer-1",
      "executor": "morewhyhan",
      "source": "复审：重复提交与回退，独立审查批量判定 Plan",
      "subject_fingerprint": "d8870a5dc314f76f280887de01b9ac2a326691da99127a2624a23c810a9c81c4",
      "verdict": "approved",
      "findings": [
        {
          "id": "R1",
          "severity": "blocking",
          "summary": "重复提交覆盖旧值已有真实数据库行为测试。",
          "resolved": true
        },
        {
          "id": "R2",
          "severity": "nonblocking",
          "summary": "正文回退待补 REQ-005。",
          "resolved": false
        },
        {
          "id": "R3",
          "severity": "nonblocking",
          "summary": "旧测试是否需改待实现时验证。",
          "resolved": false
        },
        {
          "id": "R4",
          "severity": "nonblocking",
          "summary": "事务部分失败未覆盖。",
          "resolved": false
        },
        {
          "id": "R5",
          "severity": "nonblocking",
          "summary": "T1/T2 与原生红灯待回填。",
          "resolved": false
        },
        {
          "id": "R6",
          "severity": "nonblocking",
          "summary": "api.md 旧来源行待清理。",
          "resolved": false
        },
        {
          "id": "R7",
          "severity": "nonblocking",
          "summary": "AC-002 基线依赖不冒充本轮验收。",
          "resolved": false
        }
      ],
      "identity_assurance": "declared",
      "recorded_at": "2026-11-07T22:39:34.731Z"
    }
  ],
  "verification_contract": 2,
  "goals": [
    {
      "text": "批量提交当前页判定并按账号隔离",
      "requirements": ["REQ-ACCOUNT-005"]
    }
  ],
  "constraints": [
    "只从 session 取用户，不接受客户端 userId。",
    "同一账号同一词重复提交覆盖旧值。",
    "不重写已应用迁移。"
  ],
  "non_goals": ["本轮不做前端提交按钮。", "本轮不做每日轮次和通关页。"],
  "authorization": {
    "source": "2026-11-08 V1 GOAL 的 M1；用户要求判定按账号保存。"
  },
  "deliverables": [
    "POST /api/vocabulary/judgements 批量保存判定",
    "真实 SQLite 和 Better Auth 的接口数据库测试",
    "路由归位到 routes/vocabulary/"
  ],
  "remaining_work": [],
  "change_type": "存量改动",
  "base_commit": "cfad7317f85d72abd0c64a36f72c18504de07b86",
  "requirements": ["REQ-ACCOUNT-005"],
  "acceptance": [
    {
      "id": "AC-ACCOUNT-005",
      "module": "src/server/api/routes/vocabulary/",
      "tests": [
        "tests/api/vocabulary-judgements.test.ts::[AC-ACCOUNT-005] saves a page of judgements for the signed-in account"
      ],
      "required_layers": ["database"],
      "checks": [
        {
          "test": "tests/api/vocabulary-judgements.test.ts::[AC-ACCOUNT-005] saves a page of judgements for the signed-in account",
          "layer": "database"
        }
      ]
    }
  ],
  "verification_requirements": ["database"],
  "tasks": [
    {
      "id": "T1",
      "title": "确认目标、编写判定接口数据库测试并提交准备基线",
      "phase": "prepare",
      "status": "done",
      "result": "REQ/AC、测试、写入范围和基线已提交。",
      "scope": [
        "docs/features/product.md",
        "docs/plans/20261108-account-judgements.md",
        "docs/plans/releases/account-judgements-v1.json",
        "tests/api/vocabulary-judgements.test.ts"
      ],
      "depends_on": [],
      "owner": "morewhyhan"
    },
    {
      "id": "T2",
      "title": "运行判定接口测试并记录红灯",
      "phase": "red",
      "acceptance": ["AC-ACCOUNT-005"],
      "status": "doing",
      "result": "原生 red 确认 POST 返回 404，判定没有保存。",
      "scope": ["tests/api/vocabulary-judgements.test.ts", "docs/others/evidence/tdd/"],
      "depends_on": ["T1"],
      "owner": "morewhyhan"
    },
    {
      "id": "T3",
      "title": "实现批量判定并归位词汇路由",
      "phase": "implement",
      "acceptance": ["AC-ACCOUNT-005"],
      "status": "todo",
      "result": "POST 批量 upsert，GET 复用同一路由，测试转绿。",
      "scope": [
        "src/server/vocabulary/store.ts",
        "src/server/api/routes/vocabulary/index.ts",
        "src/server/api/index.ts",
        "src/server/api/vocabulary.ts"
      ],
      "depends_on": ["T2"],
      "owner": "morewhyhan"
    },
    {
      "id": "T4",
      "title": "运行集成检查、交付审查并回写设计",
      "phase": "verify",
      "status": "todo",
      "result": "check integration 和 delivery 审查通过，api.md/api.yaml 记录批量判定。",
      "scope": ["docs/designs/api.md", "docs/designs/api.yaml", "docs/others/evidence/"],
      "depends_on": ["T3"],
      "owner": "morewhyhan"
    }
  ],
  "depends_on": [],
  "dependency_contracts": [],
  "shared_files": [
    {
      "path": "src/server/api/index.ts",
      "owner": "morewhyhan",
      "mode": "exclusive",
      "integration": "词汇路由挂载点；本 Plan 独占写入，后续 Plan 只读。"
    }
  ],
  "handoff": {
    "interfaces": ["POST /api/vocabulary/judgements", "GET /api/vocabulary/state"],
    "migrations": [],
    "tests": ["tests/api/vocabulary-judgements.test.ts"],
    "remaining": []
  },
  "owner": "morewhyhan",
  "risk": "feature",
  "data_contract": {
    "access_scope": "per-user",
    "access_rationale": "路由只从 session 取 userId，upsert 以 userId+word 唯一键写入。",
    "migration_impact": "none",
    "rollback": "回退路由和 store 批量函数，保留 word_state 数据；移除或延期 AC-ACCOUNT-005 和 REQ-ACCOUNT-005，并同步 Release scope；不改 schema 或迁移。",
    "destructive_authorization": null
  },
  "write_scope": [
    "docs/features/product.md",
    "docs/plans/20261108-account-judgements.md",
    "docs/plans/releases/account-judgements-v1.json",
    "tests/api/vocabulary-judgements.test.ts",
    "src/server/vocabulary/store.ts",
    "src/server/api/routes/vocabulary/index.ts",
    "src/server/api/index.ts",
    "src/server/api/vocabulary.ts",
    "docs/designs/api.md",
    "docs/designs/api.yaml",
    "docs/others/evidence/",
    "docs/others/evidence/tdd/"
  ],
  "tdd_evidence": [
    {
      "acceptance_id": "AC-ACCOUNT-005",
      "test": "tests/api/vocabulary-judgements.test.ts::[AC-ACCOUNT-005] saves a page of judgements for the signed-in account",
      "run_id": "tdd-20261107224032-a4d46c"
    }
  ],
  "required_evidence": ["check-integration"],
  "evidence": [],
  "design_writeback": {
    "changed": ["docs/designs/api.md", "docs/designs/api.yaml"],
    "reason": "新增批量判定接口，词汇路由归位到 routes/vocabulary/。"
  },
  "blocker": null,
  "open_questions": [],
  "integrated_commit": null,
  "updated_at": "2026-11-07"
}
-->

# Ignite 实施计划：account-judgements

## 状态

顶部元数据是唯一状态。规格和测试已提交，等待独立 draft 审查。

## 目标

登录用户提交当前页判定时，接口按 session 用户批量保存 word_state；另一个账号看不到这些记录。词汇路由从组合层归位到 routes/vocabulary/。

## 原始目标与覆盖核对

| 用户原话或可追溯来源                           | 本轮目标                              | REQ             | AC             | 处理结果 |
| ---------------------------------------------- | ------------------------------------- | --------------- | -------------- | -------- |
| 2026-11-08 V1 GOAL 的 M1：判定、轮次按账号保存 | 批量保存当前页判定                    | REQ-ACCOUNT-005 | AC-ACCOUNT-005 | 保留     |
| 用户要求两个账号互不可见                       | 由 userId+word upsert 和 A/B 测试承接 | REQ-ACCOUNT-002 | AC-ACCOUNT-002 | 基线依赖 |

阶段目标是让判定真正写入账号数据；代价是本轮不接前端提交按钮。

## 整体判断与推进顺序

- 链路：POST → session guard → 校验 → upsert → GET 状态。
- 主要问题：word_state 已有读取，但没有写入接口。
- 推进：先写接口，再让页面调用。
- 纠偏：如果批量写入与单条 store 冲突，先统一到 store。
- 目标函数：质量优先，预计 90 分钟。

## 来源规格

- 需求：docs/features/product.md 的 REQ-ACCOUNT-005、AC-ACCOUNT-005。
- 标准：STD-SEC-101、STD-API-101、STD-DATA-101。
- 设计：docs/designs/api.md、api.yaml 的当前词汇接口。
- 测试：tests/api/vocabulary-judgements.test.ts。
- 不适用：释义、发音、关联辅助。

## 目标映射

| Source          | Binding          | 任务 | 验证            |
| --------------- | ---------------- | ---- | --------------- |
| REQ-ACCOUNT-005 | 本轮需求         | T3   | AC-ACCOUNT-005  |
| AC-ACCOUNT-005  | 本轮验收         | T2   | 判定接口测试    |
| STD-SEC-101     | 会话身份         | T3   | requireUserId   |
| STD-API-101     | 统一守卫和错误   | T3   | zValidator      |
| STD-DATA-101    | userId+word 唯一 | T3   | upsert          |
| DES-API-101     | 接口事实         | T4   | api.md/api.yaml |

## 主要矛盾

目标要求判定写入账号；当前只有读取。冲突是：接口缺失，页面只能存在本地。写入会改变数据归属，收益是跨设备恢复；代价是必须防止跨账号写入。推翻条件是批量写入无法保证 userId 过滤。

## 次要矛盾

- 路由现在在 src/server/api/vocabulary.ts，新增写入后应归位 routes/vocabulary/。
- 旧测试 mock 了 store，路由移动后需要同步导入路径。

## 决策原则

- 复用 store，不在 route 里写 Prisma。
- 批量 upsert 用事务。
- 只信 session userId。

## 方案比较

- 采用：POST /api/vocabulary/judgements，body 为 judgements 数组，事务 upsert。
- 否定：每词一个请求。理由是页面一页 36 词，请求过多。
- 否定：写 localStorage 后同步。理由是账号数据先落库，前端再做本地镜像。

## 约束绑定矩阵

| Source ID       | Binding  | 任务 | 验证           |
| --------------- | -------- | ---- | -------------- |
| REQ-ACCOUNT-005 | 本轮需求 | T3   | AC-ACCOUNT-005 |
| AC-ACCOUNT-005  | 本轮验收 | T2   | 判定接口测试   |
| STD-SEC-101     | 会话     | T3   | requireUserId  |
| STD-API-101     | 校验     | T3   | zValidator     |
| STD-DATA-101    | 唯一键   | T3   | upsert         |
| DES-API-101     | 设计     | T4   | api.md         |

## 回退

回退 POST 路由和 setWordStates，保留已有 word_state 数据和 GET；移除 AC-ACCOUNT-005 和测试，Release scope 同步。不改 schema 或迁移。

## 非目标

本轮不做前端下一页提交、轮次、通关页、释义、发音和关联辅助。

## 变更类型

存量改动，无迁移；新增批量写入并把词汇路由归位。

## 输入规格

基线 cfad731 已有 GET /api/vocabulary/state、word_state 模型、store 和真实会话测试。

## 已关闭问题

- 请求体：{ judgements: [{ word, known }] }，最多 36 条。
- 响应：200 和保存后的状态。
- 身份：只从 session。

## 测试与验收设计

tests/api/vocabulary-judgements.test.ts 建真实 SQLite，注册 A/B，A 提交 apple=true、tree=false，再提交 apple=false，读取到 apple=false 和 tree=false，B 为空。测试内没有 mock。当前 POST 404，末尾对象断言失败。

## 实现任务

- T1 规格、测试和基线提交。
- T2 原生红灯。
- T3 store 批量 upsert，路由归位，测试转绿。
- T4 集成检查、交付审查、设计回写。

## 验收方式

node scripts/ignite.mjs plan validate IGT-1794090800136711353 --prepare
node scripts/ignite.mjs tdd red --plan IGT-1794090800136711353 --ac AC-ACCOUNT-005
pnpm ignite check --plan IGT-1794090800136711353 --level integration

## 设计回写

api.md 和 api.yaml 增加 POST /api/vocabulary/judgements，并把词汇路由位置改为 routes/vocabulary/。

## 状态记录

- 2026-11-08：基线 cfad731 已有 GET 状态接口。
- 2026-11-08：新增 AC-ACCOUNT-005 和判定测试，本地 POST 404，红灯成立。
- 2026-11-08：等待独立 draft 审查。

## 准出条件

AC-ACCOUNT-005 的 database 测试通过；原生红灯和集成检查有记录；交付审查通过；api.md/api.yaml 回写；tasks 全部完成。

<!-- ignite-progress -->

状态：`active`（由元数据生成）

- [x] T1 · 确认目标、编写判定接口数据库测试并提交准备基线 · done
- [ ] T2 · 运行判定接口测试并记录红灯 · doing
- [ ] T3 · 实现批量判定并归位词汇路由 · todo
- [ ] T4 · 运行集成检查、交付审查并回写设计 · todo

验收缺口：未记录；完成仍须实际证据
证据：尚无
<!-- /ignite-progress -->
