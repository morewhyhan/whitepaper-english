import { readFileSync, writeFileSync } from 'node:fs'
const a=JSON.parse(readFileSync('src/modules/vocabulary/data/associations.json','utf8'))
const t=JSON.parse(readFileSync('translation-batches/target-terms.json','utf8'))
let written=0,skipped=0
for(const r of t.records){
 const [target,index]=r.id.split(':'); const link=a[target]?.links?.[Number(index)]
 if(!link||!r.targetZhInSentence?.trim()){skipped++;continue}
 if(!link.sentenceZh?.includes(r.targetZhInSentence)){skipped++;continue}
 link.targetZhInSentence=r.targetZhInSentence; written++
}
writeFileSync('src/modules/vocabulary/data/associations.json',JSON.stringify(a,null,2)+'\n')
console.log({written,skipped})
