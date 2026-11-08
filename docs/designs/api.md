# API 设计：当前事实与采用目标

> 文档状态：定稿

## 当前实现事实

当前 API 组合真源是 `src/server/api/index.ts`，Next.js 适配入口是 `src/app/api/[[...route]]/route.ts`，类型入口是 `AppType`。当前模板资源仍为 `/api/health`、Better Auth `/api/auth/*` 和受 session 保护的 `/api/tasks` CRUD，以及 `/api/vocabulary/state` 和 `/api/vocabulary/judgements`。

统一成功响应为 `{ "data": ... }`；错误响应为 `{ "code": number, "message": string }`。当前模块请求路径是 `Hook → createApiClient(AppType) → Hono route`。

### 词汇接口

所有词汇接口位于 `src/server/api/routes/vocabulary/index.ts`，由 `src/server/api/index.ts` 挂载，使用统一 `zValidator` 和 `{ "data": ... }` / `{ "code": number, "message": string }` 响应格式。除关联读取外都需要 Better Auth session；未登录返回 401。

- `GET /api/vocabulary/state?bookId=parallel-world&date=YYYY-MM-DD`：读取当前账号的词状态，返回 `{ data: { activeBook: null, wordStates: [{ word, known }] } }`。`wordState` 按 `userId + bookId + localDate + word` 唯一。
- `POST /api/vocabulary/judgements`：请求体 `{ bookId?, date?, judgements: [{ word, known }] }`，最多 36 条；按 session 用户批量 upsert，重复提交覆盖旧值，返回保存后的 `wordStates`。
- `DELETE /api/vocabulary/judgements`：请求体 `{ bookId?, date?, words: string[] }`，最多 36 条；删除当前账号这些词的判定，用于“撤销上一页”。
- `GET /api/vocabulary/session?bookId=...&date=...`：读取当前账号当天的轮次、游标、词序、困难词、历史和完成状态。
- `PUT /api/vocabulary/session`：保存上述每日会话；同一 `userId + bookId + date` 覆盖更新。
- `POST /api/vocabulary/reset`：请求体 `{ bookId?, date? }`，删除当前账号该词书当天的判定和每日会话；只影响当天，历史保留。
- `GET /api/vocabulary/history?bookId=...&days=30`：按日期从新到旧返回当前词书的词数、会、不会、轮次和完成状态；`days` 默认 30，最大 365。
- `GET /api/vocabulary/association?word=lesson`：公开接口，返回单个目标词的 `{ target, links: [{ word, sentence }] }` 或 `null`。
- `GET /api/vocabulary/associations?words=lesson,apple,...`：公开接口，一次最多 36 个词，返回 `{ data: { networks: { [word]: { target, links } | null } } }`。客户端按 36 词批次预取，避免每次换词单独请求。

关联数据来自 `src/modules/vocabulary/data/associations.json`。服务端首次读取后缓存在进程内，不在请求时生成模型；文件缺失或解析失败返回 500。单接口与批量接口共用同一份缓存。

来源：REQ-ACCOUNT-001、REQ-ACCOUNT-003、REQ-ACCOUNT-005、REQ-ACCOUNT-008、REQ-ACCOUNT-009、REQ-ACCOUNT-011、REQ-ACCOUNT-012、REQ-ACCOUNT-013、REQ-ACCOUNT-014、REQ-ACCOUNT-015。

## 白纸英语目标 API

目标第一阶段的服务端同步 API 只服务登录用户；游客学习不经过业务 API：

| 资源       | 方法和路径                                | 认证     | 作用                                      |
| ---------- | ----------------------------------------- | -------- | ----------------------------------------- |
| health     | `GET /api/health`                         | 否       | 运行健康检查                              |
| vocabulary | `GET /api/vocabulary`                     | 当前用户 | 读取最近词表、词条和最近学习任务          |
| vocabulary | `POST /api/vocabulary`                    | 当前用户 | 创建一张词表及初始学习任务                |
| judgement  | `POST /api/vocabulary/:listId/judgements` | 当前用户 | 写入某轮某词的会/不会自评，并更新任务状态 |

目标输入：

```json
{
  "title": "今天的词",
  "words": [{ "text": "subtle", "meaning": "微妙的" }]
}
```

判断输入：

```json
{
  "sessionId": "optional-uuid",
  "wordId": "uuid",
  "round": 1,
  "known": false,
  "currentRound": 2,
  "status": "active"
}
```

## 目标 API 约束

- 所有对象严格校验，未知字段返回 `422`。
- 未登录访问同步 API 返回 `401`；资源不存在或不属于当前用户返回 `404`。
- 服务端从 Better Auth session 取得 `userId`，不信任请求体中的用户字段。
- 同一 session、word、round 的重复判断使用幂等更新，不能制造重复学习记录。
- API 只保存账户副本；本地副本的损坏、失败和导出由工作台本地适配处理。

目标 API 只有在对应实现 Plan、行为测试、Schema 迁移和真实验证完成后，才能替换当前 `/api/tasks` 事实并移除模板接口。

- DES-API-101：当前接口边界与错误格式的事实以本编号引用。

## 事件与命令

| 已发生的变化       | 发起变化的请求         | 责任者     | 规则或策略              | 后续变化                     | 分歧和热点           |
| ------------------ | ---------------------- | ---------- | ----------------------- | ---------------------------- | -------------------- |
| 业务端点新增或删除 | REQ-* 经 Plan 进入实现 | API 维护者 | 类型以 `AppType` 为真源 | Hook、测试和错误处理同步更新 | 旧调用方是否需要兼容 |
| 错误格式调整       | 统一 API 标准变更      | API 维护者 | 边界校验和统一错误格式  | 客户端提示同步更新           | 是否影响既有调用方   |
