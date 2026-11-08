# 领域模型：当前事实与采用目标

关联需求：REQ-WORKSPACE-001、REQ-ACCOUNT-014

> 文档状态：定稿

## 当前实现事实

Better Auth 仍使用 `user`、`session`、`account`、`verification`；模板业务参考切片仍是 `user → task`。本轮新增加的第一版词汇闭环暂时使用浏览器本地状态，由 `src/modules/vocabulary/lib/vocabulary.ts` 中的 `VocabularyState`、`VocabularySession`、`VocabularyWord` 和 `Judgement` 表达，不写 Prisma。

默认词表由 `src/modules/vocabulary/data/parallel-world.json` 提供。当前数据按源文件顺序保留英文词和短语及重复项，释义字段可以为空。

本地状态关系是：

```text
VocabularyState
├─ words[]
├─ settings
└─ sessions[date]
   ├─ ids[] / cursor / round
   ├─ marks[wordId] = known | unknown
   └─ missed[] / history[] / complete
```

当前入口是首页和 `/vocabulary`；模板 Tasks 仍属于迁移前事实，不是第一阶段产品入口。

## 白纸英语采用目标

白纸英语把 Tasks 示例替换为词汇领域，但保留用户和 session 的认证边界：

```text
user
├─ vocabularyList[]
│  └─ vocabularyWord[]
└─ learningSession[]
   └─ learningJudgement[] → vocabularyWord
```

- `vocabularyList` 是用户拥有的一组词及其顺序。
- `vocabularyWord` 是词表中的一个可编辑词条，可带释义和可选关联材料。
- `learningSession` 是一次学习任务，记录当前轮次和 active/completed 状态。
- `learningJudgement` 记录某个词在某一任务、某一轮的会/不会自评。
- 未登录用户的第一阶段副本属于浏览器本地工作台；登录后的服务端对象仍是后续同步阶段，必须绑定当前 session 的 `userId`。

## 目标不变量

- 任何账户查询只返回当前 `userId` 拥有的词表、任务和判断。
- 同一任务、同一词、同一轮最多一条判断；重复提交更新这一次自评，而不是制造重复记录。
- 下一轮的词集合只能来自上一轮的“不会”，未判断不能自动进入“会”。
- 删除词表时级联删除词条、任务和判断；删除账户时级联删除账户副本。
- 本地副本和账户副本不是两个互相覆盖的事实源；同步冲突必须在工作台明确呈现并由用户确认。

## 认证与产品外壳

首页和 `/dashboard` 在目标产品中对游客开放；Better Auth 只为同步和账户设置提供能力。Landing、Dashboard、Settings 是界面外壳，不额外制造学习领域实体。写作和语法在各自阶段建立独立实体，通过工作台引用原文和来源，不复用词汇掌握字段。

## 迁移边界

当前 `task` 是模板样例，不列入白纸英语目标数据。执行迁移前必须确认本地开发库和任何外部环境没有需要保留的真实 Tasks 数据；若有真实数据，另立备份/转换计划，不能直接删除。

- DES-DOMAIN-101：当前认证、词汇本地状态和 Tasks 迁移边界以本编号引用。

## 事件与命令

| 已发生的变化 | 发起变化的请求 | 责任者       | 规则或策略                       | 后续变化          | 分歧和热点             |
| ------------ | -------------- | ------------ | -------------------------------- | ----------------- | ---------------------- |
| 用户判断词条 | 点击会或不会   | 词汇学习模块 | 未判断不等于会，下一轮只收不会词 | 本地 session 更新 | 多模式是否共享同一状态 |
| 词书被替换   | 导入或选择词书 | 词汇工作台   | 原始顺序和重复项保留             | 当前纸和轮次重建  | 旧进度是否随词书保留   |
