import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { associationsPath, readSources, validateTranslationBatch } from './association-translations.mjs'
const dir='translation-batches/parallel'
const { associations, linksById } = readSources()
let written=0, skippedExisting=0, rejected=0
const reasons={}
for(const file of readdirSync(dir).filter(f=>/^out-\d+\.json$/.test(f))){
 const outPath=resolve(dir,file); const n=file.replace(/^out-|\.json$/g,'')
 const taskPath=resolve(dir,'tasks-'+n+'.json')
 let out; let tasks
 try { out=JSON.parse(readFileSync(outPath,'utf8')); tasks=JSON.parse(readFileSync(taskPath,'utf8')) } catch { continue }
 if (!Array.isArray(out.records) || !Array.isArray(tasks.records)) continue
 const taskById=new Map(tasks.records.map(t=>[t.id,t]))
 for(const tr of out.records||[]){
  const task=taskById.get(tr.id); if(!task){rejected++;reasons['no-task']=(reasons['no-task']||0)+1;continue}
  const errors=validateTranslationBatch([task],[tr]);
  const fatal = errors.filter((error) => !error.includes('目标词词书释义无法在 sentenceZh 中定位'))
  if(fatal.length){rejected++; for(const e of fatal){const k=e.split(':').slice(1).join(':').trim().slice(0,70);reasons[k]=(reasons[k]||0)+1} continue}
  const source=linksById.get(tr.id); if(!source){rejected++;continue}
  if(source.link.wordZh?.trim() && source.link.sentenceZh?.trim()){skippedExisting++;continue}
  source.link.wordZh=tr.wordZh; source.link.sentenceZh=tr.sentenceZh; written++
 }
}
writeFileSync(associationsPath,JSON.stringify(associations,null,2)+'\n')
console.log(JSON.stringify({written,skippedExisting,rejected,reasons},null,2))
