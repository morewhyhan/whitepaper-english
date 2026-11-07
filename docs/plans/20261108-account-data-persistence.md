<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-1794084050047780048",
  "release": "account-data-persistence-v1",
  "status": "active",
  "outcome": "登录用户请求学习状态时，接口返回自己保存的词状态，而不是永远空数组。",
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
      "source": "第三轮复审：回退与测试准备，独立审查账号持久化接口 Plan",
      "subject_fingerprint": "930fba764f79e2d254df10afee188de1043967556287b59c73fcdd42addf2a84",
      "verdict": "approved",
      "findings": [
        {
          "id": "R1",
          "severity": "blocking",
          "summary": "AC-003 只映射真实 SQLite 和 Better Auth 会话的接口测试，layer=database。",
          "resolved": true
        },
        {
          "id": "R2",
          "severity": "blocking",
          "summary": "api.yaml 进入 write_scope、T4 和 design_writeback。",
          "resolved": true
        },
        {
          "id": "R3",
          "severity": "blocking",
          "summary": "store 测试归 AC-002，Release 只纳入 AC-003。",
          "resolved": true
        },
        {
          "id": "R4",
          "severity": "blocking",
          "summary": "正文回退与 data_contract.rollback 一致，覆盖 Release 和 REQ。",
          "resolved": true
        },
        {
          "id": "R8",
          "severity": "nonblocking",
          "summary": "临时库清理移到 afterAll。",
          "resolved": true
        },
        {
          "id": "R9",
          "severity": "nonblocking",
          "summary": "beforeAll 增加认证准备断言，红灯只落在目标断言。",
          "resolved": true
        },
        {
          "id": "R5",
          "severity": "nonblocking",
          "summary": "T3 修改上一 Plan 的单测 mock，需注明历史证据对应旧提交。",
          "resolved": false
        },
        {
          "id": "R6",
          "severity": "nonblocking",
          "summary": "T1/T2 状态和原生红灯记录待回填。",
          "resolved": false
        },
        {
          "id": "R7",
          "severity": "nonblocking",
          "summary": "接口测试未覆盖 user-b 的会话身份。",
          "resolved": false
        }
      ],
      "identity_assurance": "declared",
      "recorded_at": "2026-11-07T21:01:19.546Z"
    }
  ],
  "verification_contract": 2,
  "goals": [
    {
      "text": "学习状态接口返回当前账号已经保存的词状态",
      "requirements": ["REQ-ACCOUNT-003"]
    }
  ],
  "constraints": [
    "接口只从 session 取用户，不接受客户端 userId。",
    "不重写已应用迁移；word_state 模型和迁移已在基线。",
    "只做 Web 端桌面浏览器。"
  ],
  "non_goals": ["本轮不挂载登录 UI。", "本轮不做每日闭环、释义、发音和关联辅助。"],
  "authorization": {
    "source": "2026-11-08 V1 GOAL 的 M1；用户要求账号数据按用户保存并读取。"
  },
  "deliverables": ["GET /api/vocabulary/state 返回当前账号的词状态", "真实 SQLite 的接口数据测试"],
  "remaining_work": [],
  "change_type": "存量改动",
  "base_commit": "1a9e6a72c4cdeb8499e86f44740e0fe9863f102e",
  "requirements": ["REQ-ACCOUNT-003"],
  "acceptance": [
    {
      "id": "AC-ACCOUNT-003",
      "module": "src/server/api/",
      "tests": [
        "tests/api/vocabulary-state-data.test.ts::[AC-ACCOUNT-003] returns the signed-in account word states"
      ],
      "required_layers": ["database"],
      "checks": [
        {
          "test": "tests/api/vocabulary-state-data.test.ts::[AC-ACCOUNT-003] returns the signed-in account word states",
          "layer": "database"
        }
      ]
    }
  ],
  "verification_requirements": ["database"],
  "tasks": [
    {
      "id": "T1",
      "title": "确认目标、编写真实接口数据测试并提交准备基线",
      "phase": "prepare",
      "status": "done",
      "result": "REQ/AC、测试、写入范围和基线已提交，独立审查核对 draft。",
      "scope": [
        "docs/features/product.md",
        "docs/plans/20261108-account-data-persistence.md",
        "docs/plans/releases/account-data-persistence-v1.json",
        "tests/api/vocabulary-state-data.test.ts"
      ],
      "depends_on": [],
      "owner": "morewhyhan"
    },
    {
      "id": "T2",
      "title": "运行接口数据测试并记录红灯",
      "phase": "red",
      "acceptance": ["AC-ACCOUNT-003"],
      "status": "done",
      "result": "原生 red 确认接口返回空数组而不是已保存的词状态。",
      "scope": ["tests/api/vocabulary-state-data.test.ts", "docs/others/evidence/tdd/"],
      "depends_on": ["T1"],
      "owner": "morewhyhan"
    },
    {
      "id": "T3",
      "title": "把状态接口接到账号词状态 store",
      "phase": "implement",
      "acceptance": ["AC-ACCOUNT-003"],
      "status": "doing",
      "result": "接口按 session 用户读取 listWordStates，返回自己的词状态，测试转绿。",
      "scope": ["src/server/api/vocabulary.ts", "tests/api/vocabulary-state.test.ts"],
      "depends_on": ["T2"],
      "owner": "morewhyhan"
    },
    {
      "id": "T4",
      "title": "运行集成检查、交付审查并回写设计",
      "phase": "verify",
      "status": "todo",
      "result": "check integration 和独立 delivery 审查通过，api.md 和 api.yaml 记录非空响应事实。",
      "scope": ["docs/designs/api.md", "docs/designs/api.yaml", "docs/others/evidence/"],
      "depends_on": ["T3"],
      "owner": "morewhyhan"
    }
  ],
  "depends_on": [],
  "dependency_contracts": [],
  "shared_files": [],
  "handoff": {
    "interfaces": ["GET /api/vocabulary/state 返回 wordStates"],
    "migrations": [],
    "tests": ["tests/api/vocabulary-state-data.test.ts"],
    "remaining": []
  },
  "owner": "morewhyhan",
  "risk": "feature",
  "data_contract": {
    "access_scope": "per-user",
    "access_rationale": "接口只从 session 取用户，并按 userId 查询 word_state。",
    "migration_impact": "none",
    "rollback": "回退接口读取逻辑，并把 api.md 和 api.yaml 的响应描述改回空状态；同时移除 AC-ACCOUNT-003 或把它和 REQ-ACCOUNT-003 标记为延期，Release scope 同步。",
    "destructive_authorization": null
  },
  "write_scope": [
    "docs/features/product.md",
    "tests/api/vocabulary-state-data.test.ts",
    "tests/api/vocabulary-state.test.ts",
    "src/server/api/vocabulary.ts",
    "docs/designs/api.md",
    "docs/designs/api.yaml",
    "docs/others/evidence/",
    "docs/plans/20261108-account-data-persistence.md",
    "docs/plans/releases/account-data-persistence-v1.json",
    "docs/others/evidence/tdd/"
  ],
  "tdd_evidence": [
    {
      "acceptance_id": "AC-ACCOUNT-003",
      "test": "tests/api/vocabulary-state-data.test.ts::[AC-ACCOUNT-003] returns the signed-in account word states",
      "run_id": "tdd-20261107210156-cf202f"
    }
  ],
  "required_evidence": ["check-integration"],
  "evidence": [],
  "design_writeback": {
    "changed": ["docs/designs/api.md", "docs/designs/api.yaml"],
    "reason": "接口响应从空状态变为当前账号的词状态。"
  },
  "blocker": null,
  "open_questions": [],
  "integrated_commit": null,
  "updated_at": "2026-11-07"
}
-->

# Ignite 实施计划：account-data-persistence

## 状态

顶部元数据是唯一状态。规格和测试已提交，等待独立 draft 审查。

## 目标

登录用户请求 GET /api/vocabulary/state 时，接口返回该账号已经保存的词状态，而不是固定空数组。数据层已在基线：word_state 模型、迁移、store 和隔离测试都存在。

## 原始目标与覆盖核对

| 用户原话或可追溯来源                               | 本轮目标                                        | REQ             | AC             | 处理结果               |
| -------------------------------------------------- | ----------------------------------------------- | --------------- | -------------- | ---------------------- |
| 2026-11-08 V1 GOAL 的 M1：学习数据按账号保存并读取 | 把状态接口接到账号词状态                        | REQ-ACCOUNT-003 | AC-ACCOUNT-003 | 保留                   |
| 用户要求两个账号互不可见                           | 由基线 store 的 userId 过滤和 database 测试承接 | REQ-ACCOUNT-002 | AC-ACCOUNT-002 | 已有测试，不在本轮红灯 |

阶段目标是让账号数据通过 API 可见；代价是本轮仍不做登录 UI 和每日闭环。

## 整体判断与推进顺序

- 链路：请求 → session guard → listWordStates(userId) → 响应。当前缺少最后一跳，返回空数组。
- 主要问题：store 已按 userId 隔离，但接口没有调用它，账号数据对客户端不可见。
- 推进：先把接口接上 store，再做登录 UI 和闭环。
- 纠偏：如果 store 返回结构和接口契约不一致，先改规格再改接口。
- 目标函数：质量优先，预计 60 分钟。

## 来源规格

- 需求：docs/features/product.md 的 REQ-ACCOUNT-003、AC-ACCOUNT-003；基线隔离为 REQ-ACCOUNT-002、AC-ACCOUNT-002。
- 标准：STD-SEC-101 会话边界；STD-API-101 统一守卫与错误格式。
- 设计：docs/designs/api.md 的 DES-API-101 与当前边界段落。
- 测试：tests/contracts/vocabulary-store.test.ts 的隔离测试；本轮新增 tests/api/vocabulary-state-data.test.ts。
- 不适用：词义、发音、关联数据不在本轮。

## 目标映射

| Source          | Binding      | 任务 | 验证                                    |
| --------------- | ------------ | ---- | --------------------------------------- |
| REQ-ACCOUNT-003 | 本轮需求     | T3   | AC-ACCOUNT-003                          |
| AC-ACCOUNT-003  | 本轮验收     | T2   | tests/api/vocabulary-state-data.test.ts |
| STD-SEC-101     | 会话身份     | T3   | mocked session 只返回 user-a            |
| STD-API-101     | 统一守卫     | T3   | requireUserId                           |
| DES-API-101     | 当前接口事实 | T4   | api.md                                  |

## 主要矛盾

目标要求接口返回账号自己的数据；当前接口固定返回空数组。冲突是：store 已能按 userId 查询，但接口没有接线。接线会改变响应契约，收益是账号数据第一次对客户端可见；代价是旧单元测试的 mock 需要同步。推翻条件是 store 查询结果与接口契约不一致。

## 次要矛盾

- 旧单测 tests/api/vocabulary-state.test.ts mock 了空 prisma，接口接线后需要 mock store，否则会失败。
- 接口数据库测试使用真实 Better Auth 注册会话，没有 mock；store 测试证明 A/B 隔离，接口测试证明当前会话读取。

## 决策原则

- 复用已有 store，不在 route 里重复写 Prisma 查询。
- 只从 session 取 userId。
- 不改 schema 或迁移。

## 方案比较

- 采用：route 调用 listWordStates(prisma, userId)。
- 否定：在 route 里直接写 prisma.word_state.findMany。理由是重复查询逻辑，后续闭环还要用 store。
- 否定：把数据拼进前端 localStorage。理由是账号数据必须来自数据库。

## 约束绑定矩阵

| Source ID       | Binding  | 任务 | 验证           |
| --------------- | -------- | ---- | -------------- |
| REQ-ACCOUNT-003 | 本轮需求 | T3   | AC-ACCOUNT-003 |
| AC-ACCOUNT-003  | 本轮验收 | T2   | 接口数据测试   |
| STD-SEC-101     | 会话     | T3   | session mock   |
| STD-API-101     | 守卫     | T3   | requireUserId  |
| DES-API-101     | 设计事实 | T4   | api.md         |

## 回退

回退接口到空数组即可恢复，不改 schema、迁移或 store。回退时把 api.md 和 api.yaml 的响应描述改回空状态，并移除 AC-ACCOUNT-003 和接口数据测试，或把 AC-ACCOUNT-003 与 REQ-ACCOUNT-003 标记为延期；Release scope 同步移除或改成 deferred，避免留下引用已删除 AC 的发布范围。

## 非目标

本轮不做登录 UI、每日闭环、释义、发音、关联辅助和学习记录。

## 变更类型

存量改动，没有迁移。src/server/api/vocabulary.ts 是唯一业务文件。

## 输入规格

基线 1a9e6a7 已包含 word_state 模型、迁移、store 和隔离测试。本轮只读取，不修改数据层。

## 已关闭问题

- 响应结构：data.activeBook 为 null，data.wordStates 为 word 和 known 数组。
- 身份来源：只从 session，忽略客户端 userId。

## 测试与验收设计

tests/api/vocabulary-state-data.test.ts 建真实 SQLite，应用两份迁移，通过 Better Auth 注册 user-a 并拿到真实 cookie，给 user-a 写入 apple，带 cookie 请求接口并断言 body 含 apple。测试内没有 mock。当前返回空数组，末尾对象断言失败，红灯可归属 AC。

## 实现任务

- T1 规格、测试和基线提交。失败判定：测试没有目标断言。
- T2 原生红灯。失败判定：失败来自环境或导入错误。
- T3 接口接 store。失败判定：仍返回空数组或跨账号数据。
- T4 集成检查和交付审查。失败判定：把绿灯当成账号数据完成。

## 验收方式

node scripts/ignite.mjs plan validate IGT-1794084050047780048 --prepare
node scripts/ignite.mjs tdd red --plan IGT-1794084050047780048 --ac AC-ACCOUNT-003
pnpm ignite check --plan IGT-1794084050047780048 --level integration

## 设计回写

实现后把 api.md 和 api.yaml 的学习状态接口响应改成返回当前账号的 wordStates，并更新 word 和 known 字段。

## 状态记录

- 2026-11-08：基线 1a9e6a7 已包含 word_state、迁移、store 和隔离测试。
- 2026-11-08：新增 AC-ACCOUNT-003 和接口数据测试，本地运行返回空数组，红灯成立。
- 2026-11-08：等待独立 draft 审查。

## 准出条件

AC-ACCOUNT-003 的 database 测试通过；原生红灯和集成检查有记录；交付审查通过；api.md 和 api.yaml 回写；tasks 全部完成。

<!-- ignite-progress -->

状态：`active`（由元数据生成）

- [x] T1 · 确认目标、编写真实接口数据测试并提交准备基线 · done
- [x] T2 · 运行接口数据测试并记录红灯 · done
- [ ] T3 · 把状态接口接到账号词状态 store · doing
- [ ] T4 · 运行集成检查、交付审查并回写设计 · todo

验收缺口：未记录；完成仍须实际证据
证据：尚无
<!-- /ignite-progress -->
