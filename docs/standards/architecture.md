# 架构标准

> 文档状态：定稿

Ignite 是可复制的模块化全栈模板。新增项目功能应复用现有基线，在 `src/modules/`、`src/server/`、`docs/features/` 和 `docs/designs/` 中形成对应的纵向切片；不要为了单个项目需求破坏模板的公共边界。

Ignite 是模块化单体。业务客户端按模块组织，服务端能力按运行时边界隔离。

```text
src/app/                  Next.js 路由和页面组合
src/modules/<module>/     业务模块的客户端组件、Hook 和类型
src/components/            跨模块共享 UI
src/lib/                   浏览器安全的共享基础设施
src/server/                Hono、认证、数据库和第三方服务
```

## 业务数据链路

```text
页面 → module screen → module Hook → Hono Typed RPC → Hono route → session/校验 → Prisma
```

- 页面只从 module 的 `index.ts` 引入 screen。
- 远程业务数据必须由 module Hook 封装。
- Hook 统一使用 `src/lib/api-client.ts` 提供的 Hono Typed RPC 契约；当前 Web 单例由该文件适配浏览器 origin 和 Cookie。`createApiClient` 接受注入的 origin/fetcher，未来端可复用同一 `AppType`，但各端认证与运行时适配单独实现。
- 可复用的业务 Hook 不直接依赖 `window`、`location` 或 Web 通知 UI；通知由 screen/平台外壳处理。Better Auth 客户端仍是认证专用边界。
- API 类型以 `src/server/api/index.ts` 的 `AppType` 为真源。
- 客户端不能运行时导入 `src/server/`。
- 认证、服务端 layout 守卫和第三方服务 adapter 是明确的运行时例外。

## 新模块

新业务沿用 `tasks` 参考切片：数据库模型、API 路由、客户端 Hook、业务 screen、
Next.js route page。不要为尚未出现的复杂度预先创建 service、repository 或 domain
空目录。

## 打样与分层原则

- 约定大于配置：新模块复制目录、命名、响应、错误和测试不变量，不复制 Tasks 的业务语义。
- 编排与原子能力分离：route page 和 screen 负责组合；Hook、UI primitive、validator、adapter 和领域服务负责可复用原子能力。
- 操作者与对象分离：用户身份只来自 session；资源 ID 来自请求，所有权在服务端查询条件中组合。
- 简单 CRUD 可以采用 `Hono route → Prisma → response`，不为形式建立空 Service/Repository。
- 当同一业务规则被多个 route 复用、需要复杂事务或独立领域测试时，增加 module 对应的服务层。
- 复杂只读查询可以建立显式 Query 类型和查询函数，但仍通过同一个 Hono 契约返回。

分层是对已出现复杂度的响应，不是新模块默认必须填满的目录清单。

- STD-ARCH-101：模块边界、目录职责与共享壳层的规则以本编号引用；新增规则另起编号。

## 前端外壳与路由

工作台外壳包括顶栏、模块标签、纸张背景和全局操作。它由 Next.js 路由 layout 提供，全站只有一个实例。模块 screen 只渲染本模块的内容，不渲染外壳，也不为切换模式重写顶栏。

模块入口是路由，不是屏幕内的条件渲染。背单词、写作和语法各自有地址，标签用链接跳转。浏览器前进、后退和直接打开某个模块都要正常工作。

外壳在模块切换时保持稳定：顶栏的位置、尺寸、品牌和全局操作不因模式变化而重排。模块专属操作放在该模块的内容区，不挤进全局顶栏。

跨路由共享的本地状态由模块存储层读取，不放进 layout 的一次性渲染。切换模块不能重建学习进度。

反例：在 screen 内用状态变量替换整个页面，复制一份 header，或按模式隐藏顶栏按钮导致布局跳动。出现这些写法时，先改外壳结构，不继续在 screen 里补条件分支。

- STD-ARCH-102：前端外壳由路由 layout 承载，模块切换走路由，模块 screen 不拥有全局顶栏；判断实现是否符合本规则时引用本编号。
