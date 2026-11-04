# 词汇白纸

## 背景与目标

依据 BUSINESS_MODEL.md 的 D05、D06、D11 和本轮采用授权，先交付访客自主扫词闭环。名称、视觉与数据控制权属于产品方向，不把经营假设或自评清零当作学习效果事实。

## 模块边界与数据

新增 modules/vocabulary。当前仅保存一个学习任务，导入替换整个任务并重置旧判断、轮次和关联。学习任务包含稳定任务 ID、词条 ID、word、meaning、当前轮次、每轮判断、页码、点击设置和可编辑关联材料。浏览器持久化有 schemaVersion。仅当前浏览器持有数据，没有账户所有权或云端备份保证。

本地持久化是采用时明确选择的服务端 RPC 链例外。纯状态不引用 window；浏览器适配器负责存储读写，hook 连接 UI。远端业务和 Better Auth 保持既有边界。修改 AGENTS 及结构检查的例外必须限制在这个模块，不能普遍放开业务 fetch。

## 业务规则

- R1（REQ-VOCABULARY-001）：访客打开首页即可进入词汇白纸，九宫格呈现单词，不强制登录；空任务显示导入入口。首次进入提供十八词演示任务，演示不代表用户已学会。
- R2（REQ-VOCABULARY-002）：每页最多九词，页码由用户前后翻页；判断不会自动翻页。每词保存会或不会，未判断有独立状态，会为浅绿，不会为浅红且同时提供文字状态。
- R3（REQ-VOCABULARY-003）：默认普通点击为会，Shift 点击为不会；设置可将普通点击改为不会，Shift 始终反转当前设置。提供可键盘操作的会与不会按钮，设置刷新后保留。
- R4（REQ-VOCABULARY-004）：新任务首轮包括全词表。下一轮只包含刚完成一轮的不会词；未判断词阻止结束并提示。复习可多轮重复，不会集合为空时显示本任务自评完成，不宣称永久掌握。
- R5（REQ-VOCABULARY-005）：困难词关联辅助使用当前任务和目标词 ID，可编辑八个已知英文关联词和对应八句英文短句；辅助中的会或不会更新原任务与同一错词池。没有外部 AI 请求，不自动伪造关联质量。
- R6（REQ-VOCABULARY-006）：任务、词表、判断、轮次、页码、关联材料和点击设置保存在当前浏览器。刷新后恢复；损坏或不支持版本显示恢复提示且不覆盖原始值，写入失败保留内存输入并提示导出。账户登录不上传或冒认本地数据，其他浏览器不自动可见。
- R7（REQ-VOCABULARY-007）：通过可粘贴文本框支持 UTF-8 CSV、TXT、JSON 导入。CSV 可有或没有 word,meaning 表头，支持引号内逗号；TXT 每行一个单词，可用制表符分隔释义；JSON 支持 word、meaning 词条数组及版本化导出结构。去掉 BOM 与首尾空白，空行忽略，空单词或错误结构给出行号或字段提示，整次失败不改原任务。同批同拼写忽略大小写去重，保留第一项；替换任务不继承旧判断或关联。
- R8（REQ-VOCABULARY-008）：当前任务可导出版本化 JSON 和可读 Markdown，包含词表、判断、轮次、关联及设置。JSON 可在另一空白浏览器重导入恢复任务；Markdown 标明任务和各词状态，可离线阅读。导出不需要账户或联网。

## 原型与交互

沿用现有设计系统，纸白背景、克制信息层级，窄屏可读。九宫格在桌面三列，窄屏允许减少列数。状态不仅依赖颜色，按钮具可访问名称与焦点。关联材料由用户输入或编辑，不需要先会全部词才允许使用其他未来模块。

## 验收标准

- AC-VOCABULARY-001（REQ-VOCABULARY-001）：Given 无会话且没有本地任务，When 从首页进入 /learn，Then 词汇白纸展示十八词演示任务且导入文本框可用，受保护账户页仍有守卫。
  - required_layers: [browser]
  - checks: browser `tests/e2e/whitepaper.spec.ts::[AC-VOCABULARY-001] 未登录进入白纸词汇工作台`

- AC-VOCABULARY-002（REQ-VOCABULARY-002）：Given 十个词，When 判断首页词后手动翻页，Then 第一页最多九词且不自动翻页，第二页显示余词，返回后状态保留。
  - required_layers: [browser]
  - checks: browser `tests/e2e/whitepaper.spec.ts::[AC-VOCABULARY-002] 手动分页并判断会与不会`

- AC-VOCABULARY-003（REQ-VOCABULARY-003）：Given 默认点击为会，When 普通点击与 Shift 点击不同词后反转设置，Then 两种判断互换，刷新后设置保留。
  - required_layers: [browser]
  - checks: browser `tests/e2e/whitepaper.spec.ts::[AC-VOCABULARY-003] 配置点击默认判断并用 Shift 反转`

- AC-VOCABULARY-004（REQ-VOCABULARY-004）：Given 一轮有会词、不会词和未判断词，When 请求下一轮，Then 未判断阻止结束，全部判断后下一轮只含不会词，第二轮继续缩小错词池至空。
  - required_layers: [browser]
  - checks: browser `tests/e2e/whitepaper.spec.ts::[AC-VOCABULARY-004] 下一轮只保留上一轮不会词`

- AC-VOCABULARY-005（REQ-VOCABULARY-005）：Given 当前任务的困难词，When 编辑八组关联并修改判断，Then 原词与错词池同步；重新导入同拼写词后，旧任务判断与关联不进入新任务。
  - required_layers: [browser]
  - checks: browser `tests/e2e/whitepaper.spec.ts::[AC-VOCABULARY-005] 关联辅助共享原任务与错词池`

- AC-VOCABULARY-006（REQ-VOCABULARY-006）：Given 已完成部分判断并有页码和设置，When 刷新、遇到损坏数据或模拟存储写入失败，Then 正常状态恢复，损坏原文保留，失败时输入不丢且明确提示可导出。
  - required_layers: [browser]
  - checks: browser `tests/e2e/whitepaper.spec.ts::[AC-VOCABULARY-006] 刷新恢复本地任务与设置并处理损坏存储`

- AC-VOCABULARY-007（REQ-VOCABULARY-007）：Given 含引号逗号的 CSV、BOM TXT 和有效 JSON，When 分别导入以及尝试无效输入，Then 正确得到词表、同批重复去重，错误带位置且原任务不变。
  - required_layers: [browser]
  - checks: browser `tests/e2e/whitepaper.spec.ts::[AC-VOCABULARY-007] 导入 CSV TXT JSON 且拒绝无效输入`

- AC-VOCABULARY-008（REQ-VOCABULARY-008）：Given 带判断、关联、轮次的任务，When 导出 JSON 和 Markdown 并在空白状态重导入 JSON，Then JSON 恢复相同学习状态且 Markdown 可读包含对应状态。
  - required_layers: [browser]
  - checks: browser `tests/e2e/whitepaper.spec.ts::[AC-VOCABULARY-008] 导出 JSON Markdown 并可重导入 JSON`

## 失败、兼容和回退

首次无数据展示十八词演示任务，用户清空任务后显示空态。读取失败不能静默覆盖旧数据，导入先验证再替换。浏览器存储不等于永久备份，用户可随时导出。浏览器清理数据造成的丢失不伪称可云恢复。词条 ID 在当前任务内稳定，替换任务后不继承旧状态。

## 非目标

云同步、外部 AI 生成、写作和语法在 whitepaper-adoption Release 明确延期。此轮关联辅助提供共享任务的可编辑八组材料，不宣称八组内容已由 AI 生成。历史任务数据库和认证不因词汇上线而删除。

