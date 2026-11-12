const url='https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q='+encodeURIComponent('This lesson is easy for me.')
fetch(url,{headers:{'User-Agent':'Mozilla/5.0'}}).then(r=>r.text()).then(t=>console.log(t.slice(0,500))).catch(e=>console.log('ERR',e.message))
