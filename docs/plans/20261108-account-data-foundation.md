<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-1794081675956926402",
  "release": "account-data-foundation-v1",
  "status": "draft",
  "outcome": "学习状态接口具备会话边界：游客带不带 userId 都返回 401，登录用户返回 200 的空状态。",
  "contract_version": 2,
  "execution_contract": 1,
  "task_contract": 2,
  "planning_contract": 1,
  "review_contract": 1,
  "reviews": [],
  "verification_contract": 2,
  "goals": [
    {
      "text": "学习状态接口只接受 session 身份，客户端 userId 不能绕过守卫",
      "requirements": ["REQ-ACCOUNT-001"]
    }
  ],
  "constraints": [
    "账号可选：登录后数据归账号，未登录数据只在本机。",
    "服务端只信任 session 用户，不信任客户端传入的 userId。",
    "不重写已应用的迁移，新增账号数据使用具名 migration。",
    "只做 Web 端桌面浏览器。"
  ],
  "non_goals": [
    "本轮不实现学习记录曲线和设置两栏。",
    "本轮不做导入、导出和清空全部。",
    "本轮不改关联辅助数据管线。"
  ],
  "authorization": {
    "source": "2026-11-08 用户接受 V1 GOAL：使用账号承载学习数据，多个使用者互不可见。对应 docs/others/20261108-vocabulary-goal.md 的 M1。"
  },
  "deliverables": ["账号学习状态接口与会话守卫", "401 与 200 的接口契约测试"],
  "remaining_work": [],
  "change_type": "存量改动",
  "base_commit": "df562222c1ecb322b9b5081a4bd5807fe2aa8045",
  "requirements": ["REQ-ACCOUNT-001"],
  "acceptance": [
    {
      "id": "AC-ACCOUNT-001",
      "module": "src/server/api/routes/vocabulary/",
      "tests": [
        "tests/api/vocabulary-state.test.ts::[AC-ACCOUNT-001] rejects guests",
        "tests/api/vocabulary-state.test.ts::[AC-ACCOUNT-001] ignores a client supplied user id for guests",
        "tests/api/vocabulary-state.test.ts::[AC-ACCOUNT-001] returns 200 for a signed-in user",
        "tests/api/vocabulary-state.test.ts::[AC-ACCOUNT-001] returns the empty state for a signed-in user"
      ],
      "required_layers": ["unit"],
      "checks": [
        { "test": "tests/api/vocabulary-state.test.ts::[AC-ACCOUNT-001] rejects guests", "layer": "unit" },
        { "test": "tests/api/vocabulary-state.test.ts::[AC-ACCOUNT-001] ignores a client supplied user id for guests", "layer": "unit" },
        { "test": "tests/api/vocabulary-state.test.ts::[AC-ACCOUNT-001] returns 200 for a signed-in user", "layer": "unit" },
        { "test": "tests/api/vocabulary-state.test.ts::[AC-ACCOUNT-001] returns the empty state for a signed-in user", "layer": "unit" }
      ]
    }
  ],
  "verification_requirements": ["unit"],
  "tasks": [
    {
      "id": "T1",
      "title": "确认本轮目标、编写真实测试并提交准备基线",
      "phase": "prepare",
      "status": "todo",
      "result": "原始目标、Feature、真实断言、测试路径和写入边界均已对应，规格与测试已提交，独立审查者已核对 draft。",
      "scope": [
        "docs/plans/20261108-account-data-foundation.md",
        "docs/plans/releases/account-data-foundation-v1.json",
        "docs/features/product.md",
        "tests/api/vocabulary-state.test.ts"
      ],
      "depends_on": [],
      "owner": "morewhyhan"
    },
    {
      "id": "T2",
      "title": "运行真实断言并记录目标行为红灯",
      "phase": "red",
      "acceptance": ["AC-ACCOUNT-001"],
      "status": "todo",
      "result": "原生 red 运行确认未登录请求返回 404 而不是 401，并记录真实红灯。",
      "scope": ["tests/api/vocabulary-state.test.ts", "docs/others/evidence/tdd/"],
      "depends_on": ["T1"],
      "owner": "morewhyhan"
    },
    {
      "id": "T3",
      "title": "实现已定义的行为切片",
      "phase": "implement",
      "acceptance": ["AC-ACCOUNT-001"],
      "status": "todo",
      "result": "未登录请求返回 401，已登录请求返回 200 和空学习状态，测试转绿。",
      "scope": ["src/server/api/index.ts", "src/server/api/routes/vocabulary/", "src/server/vocabulary/"],
      "depends_on": ["T2"],
      "owner": "morewhyhan"
    },
    {
      "id": "T4",
      "title": "验证兼容性并回写当前设计",
      "phase": "verify",
      "status": "todo",
      "result": "Plan integration 和独立 delivery 审查均通过，Design 已记录实际结果及缺口。",
      "scope": ["docs/designs/", "docs/others/evidence/"],
      "depends_on": ["T3"],
      "owner": "morewhyhan"
    }
  ],
  "depends_on": [],
  "dependency_contracts": [],
  "shared_files": [{ "path": "src/server/api/index.ts", "owner": "morewhyhan", "mode": "exclusive" }],
  "handoff": {
    "interfaces": [],
    "migrations": [],
    "tests": [],
    "remaining": []
  },
  "owner": "morewhyhan",
  "risk": "security",
  "data_contract": {
    "access_scope": "per-user",
    "access_rationale": "本轮只读空状态，不查询或写入用户数据；接口只从 session 取身份，不接受客户端标识。",
    "migration_impact": "none",
    "rollback": "移除新接口和路由即可恢复，不修改已应用迁移或现有数据。",
    "destructive_authorization": null
  },
  "write_scope": [
    "docs/features/product.md",
    "tests/api/vocabulary-state.test.ts",
    "src/server/api/index.ts",
    "src/server/api/routes/vocabulary/",
    "src/server/vocabulary/",
    "docs/designs/",
    "docs/others/evidence/",
    "docs/plans/20261108-account-data-foundation.md",
    "docs/plans/releases/account-data-foundation-v1.json",
    "docs/others/evidence/tdd/"
  ],
  "tdd_evidence": [],
  "required_evidence": ["check-integration"],
  "evidence": [],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": null,
  "updated_at": "2026-11-08"
}
-->

# Ignite 实施计划：account-data-foundation

## 状态

本 Plan 保持 draft。规格、测试和元数据已提交；独立 draft 审查第一轮要求收窄范围，本轮已按审查意见收窄，等待复审。

## 目标

游客请求学习状态接口返回 401，携带 userId 参数也不能绕过；登录用户返回 200 和空学习状态。这个切片只固定接口和会话边界，不声称账号数据已经隔离或持久化。

## 原始目标与覆盖核对

| 用户原话或可追溯来源                                         | 本轮目标                      | REQ             | AC             | 处理结果                                  |
| ------------------------------------------------------------ | ----------------------------- | --------------- | -------------- | ----------------------------------------- |
| 2026-11-08 V1 GOAL 的 M1：用账号承载学习数据，多用户互不可见 | 先固定学习状态接口的会话边界  | REQ-ACCOUNT-001 | AC-ACCOUNT-001 | 本轮只覆盖边界，数据库隔离延期到后续 Plan |
| 用户要求同一时间只学一本书、账号可选                         | 不在本切片实现                | 无              | 无             | 延期                                      |
| 审查 R1：不要把 M1 全部写成本轮结果                          | 收窄 outcome 和 Release scope | 无              | 无             | 已修正                                    |

阶段目标是让后续数据库隔离有一个可信入口；代价是本轮不能证明真实隔离；假设是 Hono session guard 可以复用现有 Better Auth 配置。

## 整体判断与推进顺序

- 链路与事实：请求进入 Hono，session guard 取当前用户，学习状态按用户返回。当前没有这个路由，请求得到 404。
- 当前主要问题：接口边界不存在，后续数据库隔离没有唯一入口。先做 401 和空 200，再用另一个 Plan 做模型、迁移和双账号隔离。
- 推进与尺度：只做只读接口和守卫，不挂载登录 UI，不建表。
- 纠偏与停止：如果 session guard 不能稳定复用，退回 Hono 层最小守卫，不引入第二套认证。
- 目标函数：质量优先。预计 90 分钟，实际待回填。
- 方法选择：先读 session、API 组合和测试写法，再写断言。

## 来源规格

- 需求：docs/features/product.md 的 REQ-ACCOUNT-001、AC-ACCOUNT-001；REQ-WHITEPAPER-004 的游客本地学习边界。
- 标准：docs/standards/security.md 的 STD-SEC-101；docs/standards/api.md 的 STD-API-101。
- 决策：本轮没有新增 ADR。
- 设计：docs/designs/api.md 的 DES-API-101 当前接口事实。
- 测试意图：tests/api/vocabulary-state.test.ts。
- 发布：docs/plans/releases/account-data-foundation-v1.json。
- 运行记录：本轮尚未新增集成或发布证据。
- 不适用来源：数据库迁移、关联辅助、词义数据不涉及。

## 目标映射

| Source          | Binding        | 任务 | 验证                               |
| --------------- | -------------- | ---- | ---------------------------------- |
| REQ-ACCOUNT-001 | 本轮需求       | T3   | AC-ACCOUNT-001                     |
| AC-ACCOUNT-001  | 本轮验收       | T2   | tests/api/vocabulary-state.test.ts |
| STD-SEC-101     | 会话与密钥边界 | T3   | 游客 401、客户端 userId 无效       |
| STD-API-101     | 统一会话守卫   | T3   | 路由使用 requireUserId             |
| DES-API-101     | 当前接口事实   | T4   | 设计回写                           |

目标与事实：目标是游客 401、登录 200；当前是 404。差距是路由和守卫都还没有。

## 主要矛盾

目标要求学习状态只在当前 session 下可读；当前没有路由，也没有账号数据层。冲突是先做数据库还是先做接口边界。边界先行的代价是本轮不能证明隔离，收益是后续实现有唯一入口，不会把认证、数据库和 UI 混进一个无法回滚的改动。推翻条件是现有 session guard 不能在不改认证配置的前提下复用。

## 次要矛盾

- 空状态响应结构只在 Feature 和 Plan 固定，没有 Design 事实；实现后回写 api.md。
- 测试 mock session，不能证明真实 Better Auth guard；本轮只证明路由调用了守卫。

## 决策原则

- 先边界后数据。依据是主要矛盾。
- 服务端只信 session。依据是 STD-SEC-101 和 STD-API-101。
- 小切片可回滚。依据是 Plan 交付单位。

## 方案比较

- 采用：加 GET /api/vocabulary/state 和 session guard，返回空状态。
- 否定：一次做账号 UI、数据库和闭环。理由是红灯和审查无法聚焦，且用户可观察结果会被拆散。
- 否定：直接建表不写接口。理由是本轮没有可观察行为，红灯会退化成结构检查。
- 复审条件：空状态结构变化时先改 Feature，再改接口。

## 约束绑定矩阵

| Source ID       | Binding  | 任务 | 验证                               |
| --------------- | -------- | ---- | ---------------------------------- |
| REQ-ACCOUNT-001 | 本轮需求 | T3   | AC-ACCOUNT-001                     |
| AC-ACCOUNT-001  | 本轮验收 | T2   | tests/api/vocabulary-state.test.ts |
| STD-SEC-101     | 会话边界 | T3   | 游客与客户端 userId 用例           |
| STD-API-101     | 统一守卫 | T3   | requireUserId                      |
| DES-API-101     | 接口事实 | T4   | docs/designs/api.md                |

## 回退

删除新路由和 api/index.ts 的挂载即可恢复。回退时同时移除 Feature 的 AC-ACCOUNT-001 和对应测试，避免留下期望 401 的孤儿断言；不需要改 schema 或数据。

## 非目标

本轮不挂载登录 UI，不建数据库模型，不做双账号隔离、刷新恢复、学习闭环或学习记录。这些由后续 Plan 和 Release 的延期条目承接。

## 变更类型

存量改动，新增一个只读接口。没有数据迁移，不触碰 Prisma schema。src/server/api/index.ts 是共享文件，由本 Plan 独占写入。

## 输入规格

读取 product.md、security.md、api.md、designs/api.md、session.ts、api/index.ts 和 tests/api/tasks.test.ts 的 mock 写法。账号数据模型留到后续 Plan。

## 已关闭问题

- 空状态结构：activeBook 为 null，wordStates 为空数组，已写入 AC。
- 未登录状态码：401，沿用现有 guard。
- 客户端 userId：不作为身份来源，游客带参数仍 401。
- 数据库隔离：不在本轮，Release 记为延期。

## 测试与验收设计

四个用例分别覆盖游客 401、游客带 userId 仍 401、登录 200 和空状态 body。每个用例的目标断言带 AC 标记，红灯能归属 AC。测试 mock session 和 prisma，只证明 unit 层的路由和守卫，不证明数据库隔离；数据库隔离由后续 Plan 用真实 SQLite 验收。

当前红灯：期望 401，实际 404，断言失败，不是环境错误。

## 实现任务

- T1 规格、测试和基线提交。改变条件：AC 或响应结构变化时同步。失败判定：测试没有目标断言。
- T2 原生红灯。改变条件：测试内容变化时重取。失败判定：失败来自环境或导入错误。
- T3 实现路由和守卫。改变条件：guard 不能复用时改最小守卫。失败判定：游客不是 401，或登录不是 200。
- T4 集成检查、复审和设计回写。改变条件：检查失败指向回归时回到 T3。失败判定：把绿灯当成账号隔离完成。

## 验收方式

node scripts/ignite.mjs plan validate IGT-1794081675956926402 --prepare
node scripts/ignite.mjs tdd red --plan IGT-1794081675956926402 --ac AC-ACCOUNT-001
pnpm ignite check --plan IGT-1794081675956926402 --level integration

## 设计回写

实现后更新 docs/designs/api.md 的路由事实，写明 GET /api/vocabulary/state 的 401 和空状态。数据库模型不在本轮。

## 状态记录

- 2026-11-08：基线 df56222，docs:check 和 ignite validate 通过。
- 2026-11-08：新增 REQ-ACCOUNT-001、AC-ACCOUNT-001 和测试，初版 AC 过度声明账号隔离。
- 2026-11-08：独立审查提出 R1–R10，4 条阻断。已收窄 outcome、AC 和 Release，拆分测试目标断言，移除 T3 的测试写入范围，补标准绑定。
- 2026-11-08：本地红灯仍是期望 401、实际 404；尚未用原生命令记录。
- 2026-11-08：等待复审。

## 准出条件

AC-ACCOUNT-001 的三个用例通过；原生红灯和集成检查有记录；复审通过；Design 回写；tasks 全部完成。数据库隔离不在本轮，Release 明确延期。
