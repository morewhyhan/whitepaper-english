# 目标树（需求真源 + 状态看板）

## 这是什么

整套文档的唯一入口。目标、领域、REQ、AC、测试和证据从这里串起来。

<!-- goal-status -->
（本块由 pnpm goal:status 生成，勿手改；--run 跑测试并写运行证据，--evidence 登记截图）

| AC | 需求 | 测试 | 状态 | 验证说明 |
| --- | --- | --- | --- | --- |
| AC-ADOPTION-001 | REQ-ADOPTION-001 | ../tests/contracts/product-goal.test.ts | 已验证 | 场景：Given 项目完成身份采用，When 检查 README、站点配置、项目身份、cookie slug、导航和仓库信息，Then 全部使用白纸英语命名，原始 BUSINESS_MODEL.md 未被改写。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 |
| AC-WHITEPAPER-001 | REQ-WHITEPAPER-001 | ../tests/contracts/product-goal.test.ts | 已验证 | 场景：Given 用户形成词表、原文或总结，When 编辑、保存或导出，Then 用户原始内容和确认后的版本可找回，辅助内容不会覆盖原文。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 |
| AC-ACCOUNT-001 | REQ-ACCOUNT-001 | ../tests/api/vocabulary-state.test.ts | 已验证 | 场景：Given 游客或登录用户，When 请求 /api/vocabulary/state，Then 游客返回 401，游客携带 userId 参数仍返回 401，登录用户返回 200 和 { data: { activeBook: null, wordStates: [] } }。客户端 userId 不能改变游客身份。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 |
| AC-WORKSPACE-001 | REQ-WORKSPACE-001 | ../tests/e2e/future-modules.spec.ts | 已验证 | 场景：Given 用户未完成词汇活动，When 查看写作或语法入口，Then 不因词汇未完成被页面状态阻止。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 |
| AC-ADOPTION-002 | REQ-ADOPTION-002 | ../tests/contracts/product-goal.test.ts | 已验证 | 场景：Given 保留模板工程底座，When 检查目录和依赖，Then Next.js、React、TypeScript、Hono、Prisma、React Query、Better Auth 与测试治理仍可用，且产品界面不再以 Ignite 作为用户-facing 身份。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 |
| AC-WHITEPAPER-002 | REQ-WHITEPAPER-002 | ../tests/contracts/product-goal.test.ts | 已验证 | 场景：Given 桌面或窄屏学习路径，When 用户完成一次判断，Then 文字可读、控件可达、会/不会状态不只依赖颜色。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 |
| AC-ACCOUNT-002 | REQ-ACCOUNT-002 | ../tests/contracts/product-goal.test.ts | 已验证 | 场景：Given 账号 A 和账号 B 各自保存词状态，When 分别读取自己的词状态，Then 只返回本账号保存的记录，看不到对方的记录。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 |
| AC-WHITEPAPER-003 | REQ-WHITEPAPER-003 | ../tests/contracts/product-goal.test.ts | 已验证 | 场景：Given 当前阶段未接入付费、云服务或外部模型，When 核对页面和运行配置，Then 不出现虚假的商业能力或已完成的 AI 结果。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 |
| AC-ACCOUNT-003 | REQ-ACCOUNT-003 | ../tests/api/vocabulary-state-data.test.ts | 已验证 | 场景：Given 账号 A 已保存词状态，When A 请求 /api/vocabulary/state，Then 返回 A 自己的词状态，而不是空数组。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 |
| AC-WHITEPAPER-004 | REQ-WHITEPAPER-004 | ../tests/contracts/product-goal.test.ts | 已验证 | 场景：Given 未登录访客，When 打开首页并点击第一入口，Then 不需要注册即可进入词汇白纸并开始本地学习。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 |
| AC-ACCOUNT-004 | REQ-ACCOUNT-004 | ../tests/e2e/auth-entry.spec.ts | 已验证 | 场景：Given 访客打开词汇白纸，When 点击登录并完成注册，Then 回到 /vocabulary 且显示退出；点击退出后重新显示登录。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 |
| AC-WHITEPAPER-005 | REQ-WHITEPAPER-005 | ../tests/contracts/product-goal.test.ts | 已验证 | 场景：Given 第一阶段产品入口，When 访问首页和工作台，Then 第一动作是进入词汇白纸，未实现的写作/语法不被误标为可用。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 |
| AC-ACCOUNT-005 | REQ-ACCOUNT-005 | ../tests/api/vocabulary-judgements.test.ts | 已验证 | 场景：Given 登录用户 A 提交 apple=true、tree=false，When 再提交 apple=false，Then 读取只保留 apple=false 和一条 tree=false；账号 B 读取不到 A 的记录。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 |
| AC-ACCOUNT-006 | REQ-ACCOUNT-006 | ../tests/e2e/judgement-submit.spec.ts | 已验证 | 场景：Given 登录用户在词汇白纸第一页，When 点击“下一页”，Then 当前页判定写入账号，读取状态返回这些词。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 |
| AC-WORKSPACE-006 | REQ-WORKSPACE-006 | ../tests/e2e/future-modules.spec.ts | 已验证 | 场景：Given 用户打开词汇、写作或语法中的工作台纸张，When 用户切换活动纸，Then 新纸张只展示自己的模块内容，未开放模块明确显示状态，词汇纸的输入和进度仍可返回。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 |
| AC-ACCOUNT-007 | REQ-ACCOUNT-007 | ../tests/e2e/judgement-undo.spec.ts | 已验证 | 场景：Given 登录用户已提交第一页并进入第二页，When 点击“撤销上一页”，Then 第一页的词从账号状态中删除，页面回到第一页且判定为空。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 |
| AC-ACCOUNT-008 | REQ-ACCOUNT-008 | ../tests/e2e/daily-session.spec.ts | 已验证 | 场景：Given 登录用户已进入第二页，When 清除本地存储并刷新，Then 仍回到第二页，“撤销上一页”可用。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 |
| AC-ACCOUNT-009 | REQ-ACCOUNT-009 | ../tests/api/vocabulary-daily-state.test.ts | 已验证 | 场景：Given 登录用户在 2026-11-08 提交 apple=true，When 读取 2026-11-09，Then 为空；读取 2026-11-08 返回 apple。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 |
| AC-ACCOUNT-010 | REQ-ACCOUNT-010 | ../tests/e2e/reset-today.spec.ts | 已验证 | 场景：Given 登录用户已提交第一页，When 在设置里点“重新开始今天”并确认，Then 当天判定清空，页面回到第 1 轮。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 |
| AC-ACCOUNT-011 | REQ-ACCOUNT-011 | ../tests/api/vocabulary-history.test.ts | 已验证 | 场景：Given 账号有 2026-11-07 和 2026-11-08 两天的会话与判定，When 请求学习记录，Then 按日期从新到旧返回词数、会、不会、轮次和完成状态。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 |
| AC-ACCOUNT-012 | REQ-ACCOUNT-012 | ../tests/e2e/pronunciation.spec.ts | 已验证 | 场景：Given 词汇白纸已打开，When 点击一个词条，Then 以 en-US 调用系统语音播放该词。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 |
| AC-ACCOUNT-013 | REQ-ACCOUNT-013 | ../tests/e2e/associations.spec.ts | 已验证 | 场景：Given 关联数据里存在 lesson，When 请求关联接口，Then 返回 lesson 的 8 条句子，每条包含 lesson。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 |
| AC-ACCOUNT-014 | REQ-ACCOUNT-014 | ../tests/e2e/associations.spec.ts | 已验证 | 场景：Given 九宫格已推进到第 73 个词，When 切到关联辅助，Then 显示第 73 个词；When 在关联辅助推进一词再切回九宫格，Then 从第 74 个词继续，不回到第 1 个。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 |
| AC-ACCOUNT-015 | REQ-ACCOUNT-015 | ../tests/e2e/vocabulary-polish.spec.ts | 已验证 | 场景：Given 打开关联辅助，When 当前批次加载完成，Then 只请求一次批量接口；连续点 5 次“下一词”不再发关联请求，8 个节点保持可见。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 |
| AC-ACCOUNT-016 | REQ-ACCOUNT-016 | ../tests/e2e/vocabulary-polish.spec.ts | 已验证 | 场景：Given 关联辅助显示 8 条句子，When 点击任一句子节点，Then 朗读该节点整句，文本与节点句子一致。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 |
| AC-ACCOUNT-017 | REQ-ACCOUNT-017 | ../tests/e2e/vocabulary-polish.spec.ts | 已验证 | 场景：Given 本地神经语音未加载完成或不可用，When 点击词条或句子，Then 用系统英文语音朗读；设置里没有手动音色选择。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 |
| AC-ACCOUNT-018 | REQ-ACCOUNT-018 | ../tests/e2e/vocabulary-polish.spec.ts | 已验证 | 场景：Given 设置里点“重置今天这本书”，When 在面板内确认，Then 面板关闭、页面回到第 1 页并显示“今日进度已清零”。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 |
| AC-ACCOUNT-019 | REQ-ACCOUNT-019 | ../tests/e2e/vocabulary-polish.spec.ts | 已验证 | 场景：Given 顶部导航，When 依次切换背单词、写作、学语法，Then 没有“剪到另一张纸”入口，三个 tab 的横向位置保持一致。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 |

合计 28 条：已验证 28（验证于 2026-11-08 19:01）
<!-- /goal-status -->

<!-- goal-current -->

当前：产品 GOAL 迁移完成，等待最终验证。
<!-- /goal-current -->

## 目标

> 让一个人每天在一张纸上完成词汇自评、理解与清零。

## 领域

| 领域           | 管什么                                 | 不管什么                    | 类型   | 模块                     | 设计事实                       |
| -------------- | -------------------------------------- | --------------------------- | ------ | ------------------------ | ------------------------------ |
| 外壳（非领域） | 词汇白纸、账户、设置、导航、发音与关联 | 写作/语法评分、外部模型生成 | 非领域 | `src/modules/vocabulary` | [design.md](designs/design.md) |

## 规则与验收

### 领域：外壳（非领域）

白纸产品只组合词汇、账户与设置；业务规则全部落在下面的 REQ/AC。

**REQ-ADOPTION-001 产品身份统一使用“白纸英语 / WhitePaper English”，仓库为 `morewhyhan/whitepaper-english`；品牌、站点说明、导航、cookie slug、README 和 `.ai` 项目身份必须使用同一份命名。**

- AC-ADOPTION-001（REQ-ADOPTION-001）：Given 项目完成身份采用，When 检查 README、站点配置、项目身份、cookie slug、导航和仓库信息，Then 全部使用白纸英语命名，原始 BUSINESS_MODEL.md 未被改写。
  - 细节：[product.md](features/product.md) ｜ 验证：[../tests/contracts/product-goal.test.ts](../tests/contracts/product-goal.test.ts) ｜ 说明：场景：Given 项目完成身份采用，When 检查 README、站点配置、项目身份、cookie slug、导航和仓库信息，Then 全部使用白纸英语命名，原始 BUSINESS_MODEL.md 未被改写。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 ｜ 证据：[查看](others/evidence/README.md)

**REQ-WHITEPAPER-001 用户拥有自己的输入、判断、原文和确认后的成果；基础内容可编辑、可导出，AI 辅助不能替用户宣布掌握。**

- AC-WHITEPAPER-001（REQ-WHITEPAPER-001）：Given 用户形成词表、原文或总结，When 编辑、保存或导出，Then 用户原始内容和确认后的版本可找回，辅助内容不会覆盖原文。
  - 细节：[product.md](features/product.md) ｜ 验证：[../tests/contracts/product-goal.test.ts](../tests/contracts/product-goal.test.ts) ｜ 说明：场景：Given 用户形成词表、原文或总结，When 编辑、保存或导出，Then 用户原始内容和确认后的版本可找回，辅助内容不会覆盖原文。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 ｜ 证据：[查看](others/evidence/README.md)

**REQ-ACCOUNT-001 学习状态接口只接受 session 身份。未登录访问返回 401；客户端传入的用户标识不能改变身份。账号数据的持久化和双账号隔离在独立 Plan 中定义规格与验收。**

- AC-ACCOUNT-001（REQ-ACCOUNT-001）：Given 游客或登录用户，When 请求 /api/vocabulary/state，Then 游客返回 401，游客携带 userId 参数仍返回 401，登录用户返回 200 和 { data: { activeBook: null, wordStates: [] } }。客户端 userId 不能改变游客身份。
  - 细节：[product.md](features/product.md) ｜ 验证：[../tests/api/vocabulary-state.test.ts](../tests/api/vocabulary-state.test.ts) ｜ 说明：场景：Given 游客或登录用户，When 请求 /api/vocabulary/state，Then 游客返回 401，游客携带 userId 参数仍返回 401，登录用户返回 200 和 { data: { activeBook: null, wordStates: [] } }。客户端 userId 不能改变游客身份。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 ｜ 证据：[查看](others/evidence/README.md)

**REQ-WORKSPACE-001 用户可从词汇、写作或语法活动进入，不以完成另一个模块作为强制前置；第一阶段只开放词汇实际入口。**

- AC-WORKSPACE-001（REQ-WORKSPACE-001）：Given 用户未完成词汇活动，When 查看写作或语法入口，Then 不因词汇未完成被页面状态阻止。
  - 细节：[product.md](features/product.md) ｜ 验证：[../tests/e2e/future-modules.spec.ts](../tests/e2e/future-modules.spec.ts) ｜ 说明：场景：Given 用户未完成词汇活动，When 查看写作或语法入口，Then 不因词汇未完成被页面状态阻止。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 ｜ 证据：[查看](others/evidence/AC-WORKSPACE-001/2026-11-09.png)

**REQ-ADOPTION-002 工程底座沿用模板的类型安全、认证边界、模块目录、RPC、Prisma 和验证体系；产品名称、首页、工作台、导航、视觉和业务领域不继续使用 Ignite 示例语义。**

- AC-ADOPTION-002（REQ-ADOPTION-002）：Given 保留模板工程底座，When 检查目录和依赖，Then Next.js、React、TypeScript、Hono、Prisma、React Query、Better Auth 与测试治理仍可用，且产品界面不再以 Ignite 作为用户-facing 身份。
  - 细节：[product.md](features/product.md) ｜ 验证：[../tests/contracts/product-goal.test.ts](../tests/contracts/product-goal.test.ts) ｜ 说明：场景：Given 保留模板工程底座，When 检查目录和依赖，Then Next.js、React、TypeScript、Hono、Prisma、React Query、Better Auth 与测试治理仍可用，且产品界面不再以 Ignite 作为用户-facing 身份。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 ｜ 证据：[查看](others/evidence/README.md)

**REQ-WHITEPAPER-002 页面遵循纸张、黑字、留白、低干扰和窄屏可读性；任何颜色状态都有文字、名称或其他可访问表达。**

- AC-WHITEPAPER-002（REQ-WHITEPAPER-002）：Given 桌面或窄屏学习路径，When 用户完成一次判断，Then 文字可读、控件可达、会/不会状态不只依赖颜色。
  - 细节：[product.md](features/product.md) ｜ 验证：[../tests/contracts/product-goal.test.ts](../tests/contracts/product-goal.test.ts) ｜ 说明：场景：Given 桌面或窄屏学习路径，When 用户完成一次判断，Then 文字可读、控件可达、会/不会状态不只依赖颜色。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 ｜ 证据：[查看](others/evidence/README.md)

**REQ-ACCOUNT-002 学习数据按账号持久化并隔离。两个账号保存的词状态互不可见，读取只返回当前 session 用户自己的记录。**

- AC-ACCOUNT-002（REQ-ACCOUNT-002）：Given 账号 A 和账号 B 各自保存词状态，When 分别读取自己的词状态，Then 只返回本账号保存的记录，看不到对方的记录。
  - 细节：[product.md](features/product.md) ｜ 验证：[../tests/contracts/product-goal.test.ts](../tests/contracts/product-goal.test.ts) ｜ 说明：场景：Given 账号 A 和账号 B 各自保存词状态，When 分别读取自己的词状态，Then 只返回本账号保存的记录，看不到对方的记录。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 ｜ 证据：[查看](others/evidence/README.md)

**REQ-WHITEPAPER-003 本阶段不自动开通付费、云服务、教材分发或外部模型；需要这些能力时另立规格、权限、成本和验收。**

- AC-WHITEPAPER-003（REQ-WHITEPAPER-003）：Given 当前阶段未接入付费、云服务或外部模型，When 核对页面和运行配置，Then 不出现虚假的商业能力或已完成的 AI 结果。
  - 细节：[product.md](features/product.md) ｜ 验证：[../tests/contracts/product-goal.test.ts](../tests/contracts/product-goal.test.ts) ｜ 说明：场景：Given 当前阶段未接入付费、云服务或外部模型，When 核对页面和运行配置，Then 不出现虚假的商业能力或已完成的 AI 结果。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 ｜ 证据：[查看](others/evidence/README.md)

**REQ-ACCOUNT-003 学习状态接口返回当前 session 用户已经保存的词状态，而不是固定空数组。**

- AC-ACCOUNT-003（REQ-ACCOUNT-003）：Given 账号 A 已保存词状态，When A 请求 /api/vocabulary/state，Then 返回 A 自己的词状态，而不是空数组。
  - 细节：[product.md](features/product.md) ｜ 验证：[../tests/api/vocabulary-state-data.test.ts](../tests/api/vocabulary-state-data.test.ts) ｜ 说明：场景：Given 账号 A 已保存词状态，When A 请求 /api/vocabulary/state，Then 返回 A 自己的词状态，而不是空数组。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 ｜ 证据：[查看](others/evidence/README.md)

**REQ-WHITEPAPER-004 未登录用户可以开始第一阶段词汇学习；账户只用于同步、备份和跨设备恢复。**

- AC-WHITEPAPER-004（REQ-WHITEPAPER-004）：Given 未登录访客，When 打开首页并点击第一入口，Then 不需要注册即可进入词汇白纸并开始本地学习。
  - 细节：[product.md](features/product.md) ｜ 验证：[../tests/contracts/product-goal.test.ts](../tests/contracts/product-goal.test.ts) ｜ 说明：场景：Given 未登录访客，When 打开首页并点击第一入口，Then 不需要注册即可进入词汇白纸并开始本地学习。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 ｜ 证据：[查看](others/evidence/README.md)

**REQ-ACCOUNT-004 词汇白纸提供可见的登录入口；登录或注册成功后回到词汇白纸，退出后回到访客状态。**

- AC-ACCOUNT-004（REQ-ACCOUNT-004）：Given 访客打开词汇白纸，When 点击登录并完成注册，Then 回到 /vocabulary 且显示退出；点击退出后重新显示登录。
  - 细节：[product.md](features/product.md) ｜ 验证：[../tests/e2e/auth-entry.spec.ts](../tests/e2e/auth-entry.spec.ts) ｜ 说明：场景：Given 访客打开词汇白纸，When 点击登录并完成注册，Then 回到 /vocabulary 且显示退出；点击退出后重新显示登录。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 ｜ 证据：[查看](others/evidence/AC-ACCOUNT-004/2026-11-09.png)

**REQ-WHITEPAPER-005 第一阶段的首屏直接进入词汇白纸，不先展示 Tasks、设置或模板说明；写作和语法在未实现前不得展示为可用学习功能。**

- AC-WHITEPAPER-005（REQ-WHITEPAPER-005）：Given 第一阶段产品入口，When 访问首页和工作台，Then 第一动作是进入词汇白纸，未实现的写作/语法不被误标为可用。
  - 细节：[product.md](features/product.md) ｜ 验证：[../tests/contracts/product-goal.test.ts](../tests/contracts/product-goal.test.ts) ｜ 说明：场景：Given 第一阶段产品入口，When 访问首页和工作台，Then 第一动作是进入词汇白纸，未实现的写作/语法不被误标为可用。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 ｜ 证据：[查看](others/evidence/README.md)

**REQ-ACCOUNT-005 登录用户可以批量提交当前页的会/不会判定；同一账号同一词重复提交时覆盖旧值，其他账号不可见。**

- AC-ACCOUNT-005（REQ-ACCOUNT-005）：Given 登录用户 A 提交 apple=true、tree=false，When 再提交 apple=false，Then 读取只保留 apple=false 和一条 tree=false；账号 B 读取不到 A 的记录。
  - 细节：[product.md](features/product.md) ｜ 验证：[../tests/api/vocabulary-judgements.test.ts](../tests/api/vocabulary-judgements.test.ts) ｜ 说明：场景：Given 登录用户 A 提交 apple=true、tree=false，When 再提交 apple=false，Then 读取只保留 apple=false 和一条 tree=false；账号 B 读取不到 A 的记录。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 ｜ 证据：[查看](others/evidence/README.md)

**REQ-ACCOUNT-006 登录用户点“下一页”时，当前页的判定提交到自己的账号；未登录用户只保存在本机。**

- AC-ACCOUNT-006（REQ-ACCOUNT-006）：Given 登录用户在词汇白纸第一页，When 点击“下一页”，Then 当前页判定写入账号，读取状态返回这些词。
  - 细节：[product.md](features/product.md) ｜ 验证：[../tests/e2e/judgement-submit.spec.ts](../tests/e2e/judgement-submit.spec.ts) ｜ 说明：场景：Given 登录用户在词汇白纸第一页，When 点击“下一页”，Then 当前页判定写入账号，读取状态返回这些词。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 ｜ 证据：[查看](others/evidence/AC-ACCOUNT-006/2026-11-09.png)

**REQ-WORKSPACE-006 工作台以纸张堆叠组织多个学习上下文；用户切换活动纸时，当前纸只承载一个模块和一个学习任务，不把不同模块内容纵向拼接；未开放模块只显示页面外壳和状态。**

- AC-WORKSPACE-006（REQ-WORKSPACE-006）：Given 用户打开词汇、写作或语法中的工作台纸张，When 用户切换活动纸，Then 新纸张只展示自己的模块内容，未开放模块明确显示状态，词汇纸的输入和进度仍可返回。
  - 细节：[product.md](features/product.md) ｜ 验证：[../tests/e2e/future-modules.spec.ts](../tests/e2e/future-modules.spec.ts) ｜ 说明：场景：Given 用户打开词汇、写作或语法中的工作台纸张，When 用户切换活动纸，Then 新纸张只展示自己的模块内容，未开放模块明确显示状态，词汇纸的输入和进度仍可返回。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 ｜ 证据：[查看](others/evidence/AC-WORKSPACE-006/2026-11-09.png)

**REQ-ACCOUNT-007 登录用户点“撤销上一页”时，清空该页在账号里的判定并只回退一页；刷新后该页不再显示为已判定。**

- AC-ACCOUNT-007（REQ-ACCOUNT-007）：Given 登录用户已提交第一页并进入第二页，When 点击“撤销上一页”，Then 第一页的词从账号状态中删除，页面回到第一页且判定为空。
  - 细节：[product.md](features/product.md) ｜ 验证：[../tests/e2e/judgement-undo.spec.ts](../tests/e2e/judgement-undo.spec.ts) ｜ 说明：场景：Given 登录用户已提交第一页并进入第二页，When 点击“撤销上一页”，Then 第一页的词从账号状态中删除，页面回到第一页且判定为空。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 ｜ 证据：[查看](others/evidence/AC-ACCOUNT-007/2026-11-09.png)

**REQ-ACCOUNT-008 登录用户的每日轮次、页码和判定按账号保存；清掉本机存储或换标签页后刷新，仍能回到同一轮同一页。**

- AC-ACCOUNT-008（REQ-ACCOUNT-008）：Given 登录用户已进入第二页，When 清除本地存储并刷新，Then 仍回到第二页，“撤销上一页”可用。
  - 细节：[product.md](features/product.md) ｜ 验证：[../tests/e2e/daily-session.spec.ts](../tests/e2e/daily-session.spec.ts) ｜ 说明：场景：Given 登录用户已进入第二页，When 清除本地存储并刷新，Then 仍回到第二页，“撤销上一页”可用。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 ｜ 证据：[查看](others/evidence/AC-ACCOUNT-008/2026-11-09.png)

**REQ-ACCOUNT-009 词状态按词书和本地日期保存；读取按日期隔离，重置今天只影响今天，历史日期保留。**

- AC-ACCOUNT-009（REQ-ACCOUNT-009）：Given 登录用户在 2026-11-08 提交 apple=true，When 读取 2026-11-09，Then 为空；读取 2026-11-08 返回 apple。
  - 细节：[product.md](features/product.md) ｜ 验证：[../tests/api/vocabulary-daily-state.test.ts](../tests/api/vocabulary-daily-state.test.ts) ｜ 说明：场景：Given 登录用户在 2026-11-08 提交 apple=true，When 读取 2026-11-09，Then 为空；读取 2026-11-08 返回 apple。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 ｜ 证据：[查看](others/evidence/README.md)

**REQ-ACCOUNT-010 设置里的“重新开始今天”清空当前词书当天的判定和会话，重建完整首轮；其他日期不受影响。**

- AC-ACCOUNT-010（REQ-ACCOUNT-010）：Given 登录用户已提交第一页，When 在设置里点“重新开始今天”并确认，Then 当天判定清空，页面回到第 1 轮。
  - 细节：[product.md](features/product.md) ｜ 验证：[../tests/e2e/reset-today.spec.ts](../tests/e2e/reset-today.spec.ts) ｜ 说明：场景：Given 登录用户已提交第一页，When 在设置里点“重新开始今天”并确认，Then 当天判定清空，页面回到第 1 轮。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 ｜ 证据：[查看](others/evidence/AC-ACCOUNT-010/2026-11-09.png)

**REQ-ACCOUNT-011 学习记录按天返回当前词书的词数、会、不会、轮次和是否完成；日期从新到旧。**

- AC-ACCOUNT-011（REQ-ACCOUNT-011）：Given 账号有 2026-11-07 和 2026-11-08 两天的会话与判定，When 请求学习记录，Then 按日期从新到旧返回词数、会、不会、轮次和完成状态。
  - 细节：[product.md](features/product.md) ｜ 验证：[../tests/api/vocabulary-history.test.ts](../tests/api/vocabulary-history.test.ts) ｜ 说明：场景：Given 账号有 2026-11-07 和 2026-11-08 两天的会话与判定，When 请求学习记录，Then 按日期从新到旧返回词数、会、不会、轮次和完成状态。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 ｜ 证据：[查看](others/evidence/README.md)

**REQ-ACCOUNT-012 点击词条或关联句时播放美式发音；优先本地神经语音，模型未就绪或不可用时用系统最佳英文语音兜底；不提供手动音色选择。**

- AC-ACCOUNT-012（REQ-ACCOUNT-012）：Given 词汇白纸已打开，When 点击一个词条，Then 以 en-US 调用系统语音播放该词。
  - 细节：[product.md](features/product.md) ｜ 验证：[../tests/e2e/pronunciation.spec.ts](../tests/e2e/pronunciation.spec.ts) ｜ 说明：场景：Given 词汇白纸已打开，When 点击一个词条，Then 以 en-US 调用系统语音播放该词。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 ｜ 证据：[查看](others/evidence/AC-ACCOUNT-012/2026-11-09.png)

**REQ-ACCOUNT-013 关联辅助按目标词返回 8 条真实短句，句子同时包含目标词和外围词。**

- AC-ACCOUNT-013（REQ-ACCOUNT-013）：Given 关联数据里存在 lesson，When 请求关联接口，Then 返回 lesson 的 8 条句子，每条包含 lesson。
  - 细节：[product.md](features/product.md) ｜ 验证：[../tests/e2e/associations.spec.ts](../tests/e2e/associations.spec.ts) ｜ 说明：场景：Given 关联数据里存在 lesson，When 请求关联接口，Then 返回 lesson 的 8 条句子，每条包含 lesson。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 ｜ 证据：[查看](others/evidence/AC-ACCOUNT-013/2026-11-09.png)

**REQ-ACCOUNT-014 九宫格扫词与关联辅助共用同一学习游标。切换视图不重置位置；任一视图推进后，另一视图从同一位置继续，不重复已过词。**

- AC-ACCOUNT-014（REQ-ACCOUNT-014）：Given 九宫格已推进到第 73 个词，When 切到关联辅助，Then 显示第 73 个词；When 在关联辅助推进一词再切回九宫格，Then 从第 74 个词继续，不回到第 1 个。
  - 细节：[product.md](features/product.md) ｜ 验证：[../tests/e2e/associations.spec.ts](../tests/e2e/associations.spec.ts) ｜ 说明：场景：Given 九宫格已推进到第 73 个词，When 切到关联辅助，Then 显示第 73 个词；When 在关联辅助推进一词再切回九宫格，Then 从第 74 个词继续，不回到第 1 个。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 ｜ 证据：[查看](others/evidence/AC-ACCOUNT-014/2026-11-09.png)

**REQ-ACCOUNT-015 关联辅助按当前 36 词批量预取并缓存；进入只发一次批量请求，连续换词不再逐词请求；加载中保留目标词和骨架。**

- AC-ACCOUNT-015（REQ-ACCOUNT-015）：Given 打开关联辅助，When 当前批次加载完成，Then 只请求一次批量接口；连续点 5 次“下一词”不再发关联请求，8 个节点保持可见。
  - 细节：[product.md](features/product.md) ｜ 验证：[../tests/e2e/vocabulary-polish.spec.ts](../tests/e2e/vocabulary-polish.spec.ts) ｜ 说明：场景：Given 打开关联辅助，When 当前批次加载完成，Then 只请求一次批量接口；连续点 5 次“下一词”不再发关联请求，8 个节点保持可见。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 ｜ 证据：[查看](others/evidence/AC-ACCOUNT-015/2026-11-09.png)

**REQ-ACCOUNT-016 关联辅助的 8 个外围句子可点击朗读整句；目标词点击朗读单词并按当前模式判定。**

- AC-ACCOUNT-016（REQ-ACCOUNT-016）：Given 关联辅助显示 8 条句子，When 点击任一句子节点，Then 朗读该节点整句，文本与节点句子一致。
  - 细节：[product.md](features/product.md) ｜ 验证：[../tests/e2e/vocabulary-polish.spec.ts](../tests/e2e/vocabulary-polish.spec.ts) ｜ 说明：场景：Given 关联辅助显示 8 条句子，When 点击任一句子节点，Then 朗读该节点整句，文本与节点句子一致。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 ｜ 证据：[查看](others/evidence/AC-ACCOUNT-016/2026-11-09.png)

**REQ-ACCOUNT-017 登录与设置使用白纸视觉；顶部不提供“剪到另一张纸”。**

- AC-ACCOUNT-017（REQ-ACCOUNT-017）：Given 本地神经语音未加载完成或不可用，When 点击词条或句子，Then 用系统英文语音朗读；设置里没有手动音色选择。
  - 细节：[product.md](features/product.md) ｜ 验证：[../tests/e2e/vocabulary-polish.spec.ts](../tests/e2e/vocabulary-polish.spec.ts) ｜ 说明：场景：Given 本地神经语音未加载完成或不可用，When 点击词条或句子，Then 用系统英文语音朗读；设置里没有手动音色选择。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 ｜ 证据：[查看](others/evidence/AC-ACCOUNT-017/2026-11-09.png)

**REQ-ACCOUNT-018 重置今天在设置面板内二次确认；确认后关闭面板、回到第 1 页并显示清零提示。**

- AC-ACCOUNT-018（REQ-ACCOUNT-018）：Given 设置里点“重置今天这本书”，When 在面板内确认，Then 面板关闭、页面回到第 1 页并显示“今日进度已清零”。
  - 细节：[product.md](features/product.md) ｜ 验证：[../tests/e2e/vocabulary-polish.spec.ts](../tests/e2e/vocabulary-polish.spec.ts) ｜ 说明：场景：Given 设置里点“重置今天这本书”，When 在面板内确认，Then 面板关闭、页面回到第 1 页并显示“今日进度已清零”。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 ｜ 证据：[查看](others/evidence/AC-ACCOUNT-018/2026-11-09.png)

**REQ-ACCOUNT-019 背单词、写作、学语法切换时，顶部三个 tab 的位置不因当前模块可用操作变化而移动。**

- AC-ACCOUNT-019（REQ-ACCOUNT-019）：Given 顶部导航，When 依次切换背单词、写作、学语法，Then 没有“剪到另一张纸”入口，三个 tab 的横向位置保持一致。
  - 细节：[product.md](features/product.md) ｜ 验证：[../tests/e2e/vocabulary-polish.spec.ts](../tests/e2e/vocabulary-polish.spec.ts) ｜ 说明：场景：Given 顶部导航，When 依次切换背单词、写作、学语法，Then 没有“剪到另一张纸”入口，三个 tab 的横向位置保持一致。；通过：用户看到的结果符合这条 AC；不过：用户看到错误结果或数据越界；未覆盖：人工判断与极端边界。 ｜ 证据：[查看](others/evidence/AC-ACCOUNT-019/2026-11-09.png)

## 术语

| 编号       | 术语     | 定义                               |
| ---------- | -------- | ---------------------------------- |
| TERM-SHEET | 白纸     | 一轮学习所用的 A4 词纸             |
| TERM-ASSOC | 关联辅助 | 一个目标词 + 8 个外围词 + 8 句英文 |

## 关系

```text
账户  归属  学习进度与判定
外壳  组合  词汇、账户、设置
```

## 当前不覆盖

```text
1. 移动端原生 App
2. 写作/语法评分
3. 长期复习算法
4. 多人协作
```

## 完成判定

验收标准见 [测试标准](standards/testing.md)；本文件只声明要什么。
