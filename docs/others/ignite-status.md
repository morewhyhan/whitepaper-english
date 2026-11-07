# Ignite 状态摘要

模板状态：`adopted`
输入指纹：`8f7ad19bddce`
当前 Plan：2；结构化历史：4；未迁移历史：0

## 当前工作

- `IGT-2026110402` · `draft` · `vocabulary-paper`
- `IGT-2026110801` · `draft` · `template-refresh`

## 发布范围

- `account-data-foundation-v1` · `cancelled`
  - Plan：`IGT-1794081675956926402`
  - 缺少证据：无
  - 最终版本验收：missing
  - 下一步：null
  - 未完成原始目标：GOAL-001 学习状态接口的会话边界：游客返回 401，客户端 userId 不能绕过，登录返回 200 空状态；GOAL-002 账号数据写入数据库、双账号隔离和跨会话恢复
- `account-data-persistence-v1` · `verifying`
  - Plan：`IGT-1794084050047780048`
  - 缺少证据：无
  - 最终版本验收：stale
  - 下一步：pnpm ignite release verify account-data-persistence-v1 --plan IGT-1794084050047780048
  - 未完成原始目标：无已登记缺口（仍需语义核对）
- `account-judgements-v1` · `verifying`
  - Plan：`IGT-1794090800136711353`
  - 缺少证据：无
  - 最终版本验收：missing
  - 下一步：pnpm ignite release verify account-judgements-v1 --plan IGT-1794090800136711353
  - 未完成原始目标：无已登记缺口（仍需语义核对）
- `template-refresh` · `draft`
  - Plan：`IGT-2026110801`
  - 缺少证据：`IGT-2026110801:check-integration`（missing：no run is bound to this evidence requirement）
  - 最终版本验收：missing
  - 下一步：pnpm ignite next --plan IGT-2026110801
  - 未完成原始目标：GOAL-TEMPLATE-REFRESH 把最新版 Ignite 模板治理同步到白纸英语，并按当前产品阶段重新收束规格和计划边界
- `vocabulary-paper` · `draft`
  - Plan：`IGT-2026110402`
  - 缺少证据：`IGT-2026110402:check-integration`（missing：no run is bound to this evidence requirement）
  - 最终版本验收：missing
  - 下一步：pnpm ignite next --plan IGT-2026110402
  - 未完成原始目标：GOAL-VOCABULARY-PAPER 第一版访客词汇白纸学习闭环
- `whitepaper-adoption` · `cancelled`
  - Plan：`IGT-2026110401`
  - 缺少证据：无
  - 最终版本验收：missing
  - 下一步：null
  - 未完成原始目标：GOAL-ADOPTION 产品采用目标文档及未来采用范围；GOAL-WHITEPAPER 产品边界目标文档及未来采用范围；GOAL-VOCABULARY 词汇学习目标文档及未来采用范围；GOAL-WORKSPACE 统一工作台目标文档及未来采用范围；GOAL-WRITING 写作学习目标文档及未来采用范围；GOAL-GRAMMAR 语法学习目标文档及未来采用范围

## 结构问题

- 无。

> 本文件是确定性派生视图；修改 Plan 或 Release 机器源后重新生成。
