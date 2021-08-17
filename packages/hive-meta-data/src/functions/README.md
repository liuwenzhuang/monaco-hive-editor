# Hive Functions

从 https://cwiki.apache.org/confluence/display/Hive/LanguageManual+UDF 页面解析而来：

```js
// Chrome Dev Tools Console

const functionTables = Array.from($$('.confluenceTable'))
  .slice(7)
  .filter((item) => {
    const tr = item.querySelector('thead tr')
    if (!tr) {
      return false
    }
    const ths = Array.from(tr.querySelectorAll('th'))
    if (!ths || !ths.length) {
      return false
    }

    return ths[0].textContent == 'Return Type'
  })

const tableBodys = functionTables.reduce((acc, cur) => {
  const trs = cur.querySelectorAll(':scope > tbody > tr')
  const tds = []
  trs.forEach((cur) => {
    const cells = Array.from(cur.querySelectorAll(':scope > td'))
    const name = cells[1].textContent
    const nameKeyword = name.split('(')[0]
    const desc = cells[2].textContent
    const returnType = cells[1].textContent
    tds.push({
      desc: desc,
      returnType: returnType,
      name: nameKeyword,
      synax: name,
    })
  })
  return acc.concat(tds)
}, [])

copy(tableBodys)
```
