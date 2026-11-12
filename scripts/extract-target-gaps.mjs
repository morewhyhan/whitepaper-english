import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { chineseHighlightTerms } from './association-translations.mjs'
const a=JSON.parse(readFileSync('src/modules/vocabulary/data/associations.json','utf8'))
const w=JSON.parse(readFileSync('src/modules/vocabulary/data/parallel-world.json','utf8'))
const byEn=new Map(w.entries.map(x=>[x.en.toLowerCase(),x.zh]))
const records=[]
for(const [target,net] of Object.entries(a)){
 const targetZh=byEn.get(target.toLowerCase())||''
 for(const [i,l] of net.links.entries()){
  if(!l.sentenceZh||!l.wordZh) continue
  const terms=chineseHighlightTerms(targetZh)
  if(!terms.some(t=>l.sentenceZh.includes(t))) records.push({id:target+':'+i,target,targetZh,sentence:l.sentence,sentenceZh:l.sentenceZh,word:l.word,wordZh:l.wordZh})
 }
}
mkdirSync('translation-batches',{recursive:true})
writeFileSync('translation-batches/target-gaps.json',JSON.stringify({batchId:'target-gaps',records},null,2))
console.log({records:records.length})
