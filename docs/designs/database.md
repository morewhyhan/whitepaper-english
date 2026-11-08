# 数据库设计：当前事实与采用目标

关联需求：REQ-ACCOUNT-002、REQ-ACCOUNT-009

> 文档状态：定稿

## 当前实现事实

当前 provider 是 SQLite，由 `DATABASE_URL` 提供；生产默认拒绝 SQLite，迁移真源位于 `prisma/migrations/`。当前模板核心业务仍是 `user 1 ─── n task`，完整字段以 `prisma/schema.prisma` 为准。

本轮词汇白纸不新增业务表，也不写匿名用户记录；词库、当天轮次和判断暂存在浏览器 `localStorage`。这使访客可以先验证学习闭环，同时把服务端同步留在下一轮独立 Plan。

| 当前模型       | 关键字段                                    | 约束                          |
| -------------- | ------------------------------------------- | ----------------------------- |
| `user`         | id、email、name、timestamps                 | email unique                  |
| `session`      | userId、expiresAt、token                    | token unique、userId index    |
| `account`      | userId、providerId、accountId、token fields | providerId + accountId unique |
| `verification` | identifier、value、expiresAt                | identifier + value unique     |
| `task`         | title、completed、userId、timestamps        | userId + createdAt index      |

## 白纸英语目标 Schema

采用目标保留 Better Auth 四张表，并用以下四张业务表替换 `task`：

| 目标模型            | 关键字段                                                       | 约束/索引                         |
| ------------------- | -------------------------------------------------------------- | --------------------------------- |
| `vocabularyList`    | id、title、userId、timestamps                                  | userId + updatedAt index          |
| `vocabularyWord`    | id、listId、text、meaning?、association?、position、timestamps | listId + position index           |
| `learningSession`   | id、listId、userId、currentRound、status、timestamps           | userId/listId + updatedAt index   |
| `learningJudgement` | sessionId、wordId、round、known、createdAt                     | sessionId + wordId + round unique |

目标关系：

```text
user 1 ─── n vocabularyList 1 ─── n vocabularyWord
user 1 ─── n learningSession n ─── 1 vocabularyList
learningSession 1 ─── n learningJudgement n ─── 1 vocabularyWord
```

## 数据归属与迁移

- 游客第一阶段先使用本地副本；本地副本不是 Prisma 记录，也不因未登录而创建匿名用户。
- 登录同步后，服务端每条业务记录均绑定 Better Auth 的当前 `userId`；API 不信任客户端传入的用户归属。
- `task` 删除属于破坏性变化。正式执行必须先备份并确认目标环境没有真实业务数据，然后生成具名 migration，保留旧 migration，不重写已应用历史。
- 关联材料和写作/语法表不在第一阶段 Schema 中提前创建；进入对应阶段时按独立 Feature/Plan 增量增加。

## 回退

第一阶段 migration 失败时回退到上一版本数据库备份和上一版本源码；不能只恢复 Prisma Schema 而留下不匹配的数据库。正式 Plan 必须记录备份位置、迁移命令、回退条件和实际结果。

- DES-DATABASE-101：当前数据归属、迁移和回退边界以本编号引用。

## 事件与命令

| 已发生的变化             | 发起变化的请求        | 责任者     | 规则或策略                     | 后续变化                | 分歧和热点                 |
| ------------------------ | --------------------- | ---------- | ------------------------------ | ----------------------- | -------------------------- |
| Schema 或 migration 改变 | 数据需求进入 Plan     | 数据维护者 | 具名 migration，不改已应用历史 | 迁移测试和 Design 回写  | 是否存在需要保留的真实数据 |
| 本地状态进入账户同步     | 同步功能进入独立 Plan | 数据维护者 | 以当前用户 session 绑定归属    | API、权限和冲突处理同步 | 本地副本与账户副本如何合并 |
