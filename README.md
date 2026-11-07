# 白纸英语 · WhitePaper English

直接写，直接学。一张由学习者自己主导的英语学习白纸。

白纸英语把词汇、写作和语法学习组织在同一工作台，提供可选辅助，并让用户留下可编辑、可导出的学习成果。第一阶段已经落地为游客可用的本地词汇白纸；写作、语法和账户同步仍在后续阶段。

## 当前仓库

本仓库继承 [Ignite](https://github.com/morewhyhan/Ignite) 模板的工程底座。当前首页和 `/vocabulary` 已进入词汇白纸；旧 Dashboard、Tasks、认证和设置仍作为迁移边界保留。写作检查、语法助教、云同步及付费尚未实现。

词汇第一版是本地优先实现：打开就能学，刷新可恢复，账户同步另立 Plan。目标方案、当前词汇实现和模板遗留事实在 Design 中明确分开。

## 从这里阅读

| 需要了解什么                 | 入口                                                   |
| ---------------------------- | ------------------------------------------------------ |
| 为什么做、为谁服务及经营假设 | [商业模式](./BUSINESS_MODEL.md)                        |
| 产品范围与未决问题           | [产品规格](./docs/features/product.md)                 |
| 各类文档的职责和阅读顺序     | [文档系统](./docs/README.md)                           |
| 词汇、写作、语法如何协同     | [工作台规格](./docs/features/workspace.md)             |
| 当前代码实际有什么           | [当前设计](./docs/designs/README.md)                   |
| 本轮整理到哪里、后续缺什么   | [词汇 Plan](./docs/plans/20261104-vocabulary-paper.md) |
| AI应遵循的规则               | [AGENTS.md](./AGENTS.md)                               |

BUSINESS_MODEL.md 是用户提供的原始经营文件，保留原文。它不是功能已完成的证据。Feature 描述目标，Plan 记录本轮，Design 描述实际实现。

## 开发环境

采用 WSL Ubuntu，Node 版本以 .node-version 为准，pnpm 版本以 package.json 为准。不要用 Windows 与 WSL 共享 node_modules。完整环境准备、迁移与验证步骤见 [采用规范](./docs/standards/adoption.md#第一步准备环境并验证基线)。

现有模块按 Next.js 页面、module screen、Hook、Hono Typed RPC 和 Prisma 组织。Better Auth 管理账户。产品目标采用本地优先、账户同步可选；具体存储和冲突处理仍须在实现 Plan 中验证，不因目标文档假装已经具备同步。

## 工作方式

使用项目自带 poteto-mode，按各文档目录的固定方法工作。只读取和执行本阶段需要的方法。实现前先更新 Feature 与 Plan，完成后把当前事实回写 Design；未实现的写作、语法和同步继续保留为后续边界。

子代理按任务必要性使用；用户已要求优先最低档可用模型。没有适用模型时由主代理处理，不静默升级。审查需明确对象与范围，不把多轮代理意见当作业务验收。
