# 白纸英语 · WhitePaper English

直接写，直接学。一张由学习者自己主导的英语学习白纸。

白纸英语把词汇、写作和语法学习组织在同一工作台。第一阶段已经落地为可用的词汇白纸：3,867 个词、每日 36 词九宫格、会/不会判定、1:8 关联辅助、整句朗读、学习记录和重置今天。写作与语法目前只保留页面外壳。

## 当前仓库

本仓库已迁移到 [Ignite v1.1](https://github.com/morewhyhan/Ignite) 的目标树底座：需求从 [docs/GOAL.md](./docs/GOAL.md) 进入，设计、标准、决策和证据分五层维护。旧 Plan/Release/强制引擎已退出活动门禁，历史保留在 pre-ignite-1.1 分支。

## 从这里阅读

| 需要了解什么 | 入口 |
| --- | --- |
| 目标、REQ、AC 与当前状态 | [目标树](./docs/GOAL.md) |
| 产品范围与边界 | [产品规格](./docs/features/product.md) |
| 词汇白纸的交互细节 | [词汇规格](./docs/features/vocabulary.md) |
| 工作台、设置与多纸 | [工作台规格](./docs/features/workspace.md) |
| 当前代码实际有什么 | [设计事实](./docs/designs/README.md) |
| 文档体系怎么读 | [文档系统](./docs/README.md) |
| AI 每轮怎么开工 | [开工提示词](./PROMPT.md) |
| AI 规则 | [AGENTS.md](./AGENTS.md) |

## 开发环境

采用 WSL Ubuntu，Node 版本以 .node-version 为准，pnpm 版本以 package.json 为准。不要用 Windows 与 WSL 共享 node_modules。环境准备与基线验证见 [采用规范](./docs/standards/adoption.md)。

```bash
pnpm install
pnpm dev
pnpm docs:check
pnpm goal:audit
pnpm goal:trace
pnpm test
pnpm build
```

## 当前事实

- 词库：3,867 个唯一词卡，全部有 1–3 个中文核心义。
- 关联：3,867 个目标词 × 8 条，共 30,936 条，前端按 36 词批量预取。
- 发音：优先本地神经语音 Kokoro，首次加载约 92MB；未就绪时用系统英文语音兜底。
- 账户：游客进度保存在本机；登录后判定、轮次和学习记录写入账号。
- 未实现：写作输入/保存、语法课程、跨设备冲突处理。
