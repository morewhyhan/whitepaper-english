import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, resolve } from 'node:path'

const inputPath = process.argv[2]
const outputPath = process.argv[3] ?? resolve('src/modules/vocabulary/data/parallel-world.json')

if (!inputPath) {
  console.error('Usage: node scripts/import-parallel-world-wordbook.mjs <input.doc> [output.json]')
  process.exit(1)
}

const source = resolve(inputPath)
readFileSync(source)

let extracted
try {
  const antiwordBin = process.env.ANTIWORD_BIN ?? 'antiword'
  extracted = execFileSync(antiwordBin, ['-m', 'UTF-8', source], {
    encoding: 'utf8',
    env: process.env.ANTIWORDHOME
      ? { ...process.env, ANTIWORDHOME: process.env.ANTIWORDHOME }
      : process.env,
  })
} catch (error) {
  throw new Error('无法调用 antiword。请在 WSL 中准备 antiword，并设置 ANTIWORDHOME 后重试。', {
    cause: error,
  })
}

const entries = extracted
  .split(/\r?\n/)
  .map((line) => line.match(/^\s*(\d+)\.\s*(.*?)\s*$/))
  .filter((match) => match)
  .map((match) => {
    const text = match[2].replace(/\s+/g, ' ')
    const chineseNote = text.match(/^(.+?)（([\u4e00-\u9fff].*)）$/)
    return {
      en: chineseNote?.[1] ?? text,
      zh: chineseNote?.[2] ?? '',
      sourceNumber: Number(match[1]),
    }
  })

if (
  entries.length !== 3976 ||
  entries[0]?.sourceNumber !== 1 ||
  entries.at(-1)?.sourceNumber !== entries.length ||
  entries.at(-1)?.en !== 'desire' ||
  entries.filter(({ en }) => !en).length !== 1 ||
  entries.find(({ sourceNumber }) => sourceNumber === 3476)?.en !== ''
) {
  throw new Error(`词条数量或编号异常。count=${entries.length}, last=${entries.at(-1)?.en ?? ''}`)
}

const output = {
  format: 'whitepaper-vocabulary-source-v1',
  source: basename(source),
  extractionMethod: 'antiword',
  extractedRange: { start: 1, end: entries.length },
  entryCount: entries.length,
  nonEmptyEntryCount: entries.filter(({ en }) => en).length,
  blankSourceNumbers: entries.filter(({ en }) => !en).map(({ sourceNumber }) => sourceNumber),
  notes: [
    '使用 antiword 读取旧 Word 文件中的 3,976 条带序号源记录。',
    '第 3,476 条是源文件中的空白记录，应用不会把它显示成学习词条。',
    '保留源文件中的顺序和重复词条，不执行去重。',
    '源文件中的中文括注仅拆入 zh 字段，不删除原词条。',
  ],
  entries: entries.map(({ en, zh }) => ({ en, zh })),
}

mkdirSync(dirname(resolve(outputPath)), { recursive: true })
writeFileSync(resolve(outputPath), `${JSON.stringify(output, null, 2)}\n`, 'utf8')
console.log(
  `Imported ${entries.length} source rows (${entries.filter(({ en }) => en).length} non-empty entries) from ${basename(source)} to ${resolve(outputPath)}`,
)
