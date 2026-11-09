import parallelWorld from '../data/parallel-world.json'

export type VocabularyWord = {
  id: string
  en: string
  zh: string
  audio?: string
}

export type Judgement = 'known' | 'unknown'
export type LearningView = 'scan' | 'connect'

export type AssociationNetwork = {
  target: string
  links: Array<{ word: string; sentence: string; audio?: string }>
}

export type SessionHistory = {
  round: number
  total: number
  missed: number
}

export type VocabularySession = {
  round: number
  ids: string[]
  cursor: number
  missed: string[]
  marks: Record<string, Judgement>
  mode: 'known' | 'unknown'
  groups: 4 | 6
  view: LearningView
  history: SessionHistory[]
  complete: boolean
  peek: boolean
}

export type VocabularyState = {
  words: VocabularyWord[]
  networks: AssociationNetwork[]
  settings: {
    mode: 'known' | 'unknown'
    groups: 4 | 6
  }
  sessions: Record<string, VocabularySession>
  trashedIds: string[]
}

export type ImportedVocabulary = {
  words: VocabularyWord[]
  networks: AssociationNetwork[] | null
}

const demoRows = [
  ['apple', '苹果'],
  ['tree', '树'],
  ['Newton', '牛顿'],
  ['gravity', '重力'],
  ['fruit', '水果'],
  ['red', '红色的'],
  ['sweet', '甜的'],
  ['juice', '果汁'],
  ['eat', '吃'],
  ['hospital', '医院'],
  ['doctor', '医生'],
  ['nurse', '护士'],
  ['patient', '病人'],
  ['medicine', '药物'],
  ['sick', '生病的'],
  ['emergency', '紧急情况'],
  ['bed', '床'],
  ['care', '护理'],
  ['bicycle', '自行车'],
  ['wheel', '轮子'],
  ['ride', '骑'],
  ['road', '道路'],
  ['pedal', '脚踏板'],
  ['helmet', '头盔'],
  ['exercise', '锻炼'],
  ['transport', '交通工具'],
  ['balance', '平衡'],
  ['purchase', '购买'],
  ['buy', '买'],
  ['shop', '商店'],
  ['money', '钱'],
  ['price', '价格'],
  ['customer', '顾客'],
  ['pay', '付款'],
  ['receipt', '收据'],
  ['online', '在线的'],
  ['abandon', '放弃'],
  ['reluctant', '不情愿的'],
  ['sufficient', '足够的'],
  ['obstacle', '障碍'],
  ['enhance', '增强'],
  ['acquire', '获得'],
  ['confront', '面对'],
  ['emerge', '出现'],
  ['persist', '坚持'],
  ['decline', '下降；拒绝'],
  ['benefit', '益处'],
  ['maintain', '维持'],
  ['accurate', '准确的'],
  ['capture', '捕获'],
  ['discover', '发现'],
  ['observe', '观察'],
  ['measure', '测量'],
  ['determine', '决定'],
  ['respond', '回应'],
  ['develop', '发展'],
  ['compare', '比较'],
  ['consider', '考虑'],
  ['include', '包括'],
  ['provide', '提供'],
  ['require', '需要'],
  ['reduce', '减少'],
  ['improve', '改善'],
  ['produce', '生产'],
  ['protect', '保护'],
  ['prevent', '防止'],
  ['continue', '继续'],
  ['create', '创造'],
  ['complete', '完成'],
  ['introduce', '介绍'],
  ['recognize', '识别'],
  ['recall', '回忆'],
  ['repeat', '重复'],
  ['review', '复习'],
  ['remember', '记住'],
  ['forget', '忘记'],
  ['understand', '理解'],
  ['explain', '解释'],
  ['connect', '连接'],
  ['combine', '组合'],
  ['select', '选择'],
  ['mark', '标记'],
  ['clear', '清除'],
  ['random', '随机的'],
  ['context', '语境'],
  ['meaning', '含义'],
  ['sentence', '句子'],
  ['relation', '关系'],
  ['association', '联想'],
  ['memory', '记忆'],
  ['attention', '注意力'],
  ['focus', '聚焦'],
  ['learning', '学习'],
  ['language', '语言'],
  ['knowledge', '知识'],
  ['pattern', '模式'],
  ['system', '系统'],
  ['method', '方法'],
  ['practice', '练习'],
  ['progress', '进度'],
  ['result', '结果'],
  ['record', '记录'],
  ['search', '搜索'],
  ['filter', '筛选'],
  ['source', '来源'],
  ['article', '文章'],
  ['chapter', '章节'],
  ['reading', '阅读'],
  ['example', '例子'],
  ['problem', '问题'],
  ['solution', '解决方案'],
  ['efficiency', '效率'],
  ['flexible', '灵活的'],
  ['instant', '立即的'],
  ['rapid', '快速的'],
  ['gentle', '温和的'],
  ['steady', '稳定的'],
  ['confident', '自信的'],
  ['challenge', '挑战'],
  ['curious', '好奇的'],
  ['useful', '有用的'],
  ['familiar', '熟悉的'],
  ['unknown', '未知的'],
  ['strong', '强的'],
  ['weak', '弱的'],
  ['natural', '自然的'],
  ['effective', '有效的'],
  ['reliable', '可靠的'],
  ['visible', '可见的'],
  ['simple', '简单的'],
  ['complex', '复杂的'],
  ['important', '重要的'],
  ['possible', '可能的'],
  ['necessary', '必要的'],
  ['comfortable', '舒适的'],
] as const

const demoNetworks: AssociationNetwork[] = [
  {
    target: 'apple',
    links: [
      ['tree', 'Apples grow on trees.'],
      ['Newton', 'Newton is linked to apples.'],
      ['gravity', 'Gravity makes apples fall.'],
      ['fruit', 'An apple is a fruit.'],
      ['red', 'Some apples are red.'],
      ['sweet', 'Ripe apples taste sweet.'],
      ['juice', 'People make juice from apples.'],
      ['eat', 'People eat apples.'],
    ].map(([word, sentence]) => ({ word, sentence })),
  },
  {
    target: 'hospital',
    links: [
      ['doctor', 'Doctors work in hospitals.'],
      ['nurse', 'Nurses help hospital patients.'],
      ['patient', 'Patients visit hospitals.'],
      ['medicine', 'Hospitals provide medicine.'],
      ['sick', 'Sick people go to hospitals.'],
      ['emergency', 'Hospitals handle emergencies.'],
      ['bed', 'Hospital beds support patients.'],
      ['care', 'Hospitals provide medical care.'],
    ].map(([word, sentence]) => ({ word, sentence })),
  },
  {
    target: 'bicycle',
    links: [
      ['wheel', 'A bicycle has two wheels.'],
      ['ride', 'People ride bicycles.'],
      ['road', 'Bicycles travel on roads.'],
      ['pedal', 'We pedal a bicycle.'],
      ['helmet', 'A helmet protects bicycle riders.'],
      ['exercise', 'Riding a bicycle is exercise.'],
      ['transport', 'A bicycle is a form of transport.'],
      ['balance', 'A bicycle requires balance.'],
    ].map(([word, sentence]) => ({ word, sentence })),
  },
  {
    target: 'purchase',
    links: [
      ['buy', 'To purchase means to buy.'],
      ['shop', 'People purchase items in shops.'],
      ['money', 'We use money to purchase things.'],
      ['price', 'The price affects a purchase.'],
      ['customer', 'Customers purchase products.'],
      ['pay', 'We pay when we purchase goods.'],
      ['receipt', 'A purchase may include a receipt.'],
      ['online', 'Many people purchase goods online.'],
    ].map(([word, sentence]) => ({ word, sentence })),
  },
]

export const DEMO_NETWORKS = demoNetworks

export const defaultSettings: VocabularyState['settings'] = {
  mode: 'unknown',
  groups: 4,
}

export function normalizeWords(input: unknown): VocabularyWord[] {
  if (!Array.isArray(input)) return []

  const words: VocabularyWord[] = []

  for (const item of input) {
    const value = typeof item === 'string' ? { en: item } : item
    if (!value || typeof value !== 'object') continue
    const record = value as Record<string, unknown>
    const en = String(record.en ?? record.english ?? record.word ?? '').trim()
    const zh = String(record.zh ?? record.chinese ?? record.meaning ?? '').trim()
    if (!en) continue
    const audio = typeof record.audio === 'string' ? record.audio : undefined
    words.push({ en, zh, id: `w-${words.length}-${slug(en)}`, audio })
  }

  return words
}

export const DEMO_WORDS = normalizeWords(demoRows.map(([en, zh]) => ({ en, zh })))
export const PARALLEL_WORLD_WORDS = normalizeWords(parallelWorld.entries)

export function normalizeNetworks(input: unknown): AssociationNetwork[] {
  if (!Array.isArray(input)) return []

  return input
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const value = item as Record<string, unknown>
      const links = Array.isArray(value.links)
        ? value.links
            .map((link) => {
              if (Array.isArray(link)) {
                return {
                  word: String(link[0] ?? '').trim(),
                  sentence: String(link[1] ?? '').trim(),
                }
              }
              if (!link || typeof link !== 'object') return null
              const record = link as Record<string, unknown>
              return {
                word: String(record.word ?? '').trim(),
                sentence: String(record.sentence ?? '').trim(),
                ...(typeof record.audio === 'string' ? { audio: record.audio } : {}),
              }
            })
            .filter((link): link is { word: string; sentence: string } =>
              Boolean(link?.word && link.sentence),
            )
        : []
      const target = String(value.target ?? '').trim()
      return target && links.length === 8 ? { target, links } : null
    })
    .filter((network): network is AssociationNetwork => Boolean(network))
}

export function createInitialState(): VocabularyState {
  return {
    words: PARALLEL_WORLD_WORDS,
    networks: DEMO_NETWORKS,
    settings: defaultSettings,
    sessions: {},
    trashedIds: [],
  }
}

export function createSession(
  words: VocabularyWord[],
  settings = defaultSettings,
  trashedIds: string[] = [],
): VocabularySession {
  const trashed = new Set(trashedIds)
  return {
    round: 1,
    ids: shuffle(words.filter((word) => !trashed.has(word.id)).map((word) => word.id)),
    cursor: 0,
    missed: [],
    marks: {},
    mode: settings.mode,
    groups: settings.groups,
    view: 'scan',
    history: [],
    complete: false,
    peek: false,
  }
}

export function pageSize(session: VocabularySession): number {
  return session.view === 'connect' ? 1 : session.groups * 9
}

export function pageWords(
  words: VocabularyWord[],
  session: VocabularySession,
  size = pageSize(session),
): VocabularyWord[] {
  const byId = new Map(words.map((word) => [word.id, word]))
  return session.ids
    .slice(session.cursor, session.cursor + size)
    .map((id) => byId.get(id))
    .filter((word): word is VocabularyWord => Boolean(word))
}

export function getAssociation(
  networks: AssociationNetwork[],
  word: VocabularyWord,
): AssociationNetwork | undefined {
  return networks.find((network) => network.target.toLowerCase() === word.en.toLowerCase())
}

export function toggleMark(
  session: VocabularySession,
  id: string,
  mark: Judgement,
): VocabularySession {
  const marks = { ...session.marks }
  if (marks[id] === mark) delete marks[id]
  else marks[id] = mark
  return { ...session, marks }
}

export function advanceSession(
  session: VocabularySession,
  words: VocabularyWord[],
  options: { pageSize?: number } = {},
): VocabularySession {
  if (session.complete) return session
  const currentPage = pageWords(words, session, options.pageSize)
  if (!currentPage.length) return session

  const missed = [...session.missed]
  for (const word of currentPage) {
    const judgement = session.marks[word.id] ?? (session.mode === 'known' ? 'unknown' : 'known')
    if (judgement === 'unknown' && !missed.includes(word.id)) missed.push(word.id)
  }

  const nextCursor = session.cursor + currentPage.length
  const clean = { ...session, cursor: nextCursor, missed, marks: {}, peek: false }
  if (nextCursor < session.ids.length) return clean

  const history = [
    ...session.history,
    { round: session.round, total: session.ids.length, missed: missed.length },
  ]
  if (missed.length === 0) return { ...clean, history, complete: true }

  return {
    ...clean,
    round: session.round + 1,
    ids: shuffle(missed),
    cursor: 0,
    missed: [],
    history,
  }
}

export function parseImport(text: string, filename = ''): ImportedVocabulary {
  const raw = text.replace(/^\uFEFF/, '').trim()
  if (!raw) throw new Error('词库内容为空')

  let content: unknown
  let networks: AssociationNetwork[] | null = null
  const isJson =
    filename.toLowerCase().endsWith('.json') || raw.startsWith('[') || raw.startsWith('{')

  if (isJson) {
    const parsed: unknown = JSON.parse(raw)
    if (Array.isArray(parsed)) content = parsed
    else if (
      parsed &&
      typeof parsed === 'object' &&
      Array.isArray((parsed as { words?: unknown }).words)
    ) {
      content = (parsed as { words: unknown[] }).words
      networks = normalizeNetworks((parsed as { networks?: unknown }).networks)
    } else throw new Error('JSON 须是数组或包含 words 数组的对象')
  } else {
    const lines = raw.split(/\r?\n/).filter((line) => line.trim())
    const table = lines[0].includes('\t') ? lines.map((line) => line.split('\t')) : parseCsv(raw)
    const headers = table[0].map((cell) => cell.trim().toLowerCase())
    const english = headers.findIndex((header) =>
      ['word', 'english', 'en', '单词', '英文'].includes(header),
    )
    const meaning = headers.findIndex((header) =>
      ['meaning', 'chinese', 'zh', '中文', '释义'].includes(header),
    )
    const hasHeader = table[0].length > 1 && english >= 0
    content = table.slice(hasHeader ? 1 : 0).map((row) => ({
      en: row[hasHeader ? english : 0],
      zh: hasHeader && meaning >= 0 ? row[meaning] : (row[1] ?? ''),
    }))
  }

  const words = normalizeWords(content)
  if (!words.length) throw new Error('未找到有效的英文')
  return { words, networks }
}

export function exportJson(state: VocabularyState): string {
  return JSON.stringify(
    {
      format: 'whitepaper-vocabulary-v1',
      exportedAt: new Date().toISOString(),
      words: state.words.map(({ en, zh }) => ({ en, zh })),
      networks: state.networks,
      settings: state.settings,
      sessions: state.sessions,
    },
    null,
    2,
  )
}

export function exportMarkdown(state: VocabularyState): string {
  const sessions = Object.entries(state.sessions)
    .map(
      ([date, session]) =>
        `- ${date}：第 ${session.round} 轮，${session.complete ? '已完成' : `已扫 ${session.cursor} 词`}`,
    )
    .join('\n')
  return [
    '# 白纸英语词库',
    '',
    `导出时间：${new Date().toISOString()}`,
    '',
    '## 词条',
    '',
    '| English | 中文 |',
    '| --- | --- |',
    ...state.words.map((word) => `| ${word.en} | ${word.zh} |`),
    '',
    '## 本次学习记录',
    '',
    sessions || '暂无本地学习记录。',
    '',
  ].join('\n')
}

export function shuffle<T>(items: T[]): T[] {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1))
    ;[result[index], result[target]] = [result[target], result[index]]
  }
  return result
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]
    if (character === '"') {
      if (quoted && text[index + 1] === '"') {
        cell += '"'
        index += 1
      } else quoted = !quoted
    } else if (character === ',' && !quoted) {
      row.push(cell)
      cell = ''
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && text[index + 1] === '\n') index += 1
      row.push(cell)
      if (row.some((value) => value.trim())) rows.push(row)
      row = []
      cell = ''
    } else cell += character
  }

  row.push(cell)
  if (row.some((value) => value.trim())) rows.push(row)
  return rows
}

function slug(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'word'
  )
}
