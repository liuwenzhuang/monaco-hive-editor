import MonacoHiveEditor from '../src/index'

let editorInstance

document.addEventListener('DOMContentLoaded', onDOMContentLoaded)

function onDOMContentLoaded() {
  const container = document.getElementById('container')

  editorInstance = new MonacoHiveEditor(container, {
    value: [
      'use mammut_idc;',
      '-- set hive.execution.engine=spark;',
      'select count(*) from (select * from src) A left join (select * from src) B on A.key = B.key;',
      'create table students(id int, age char(2));',
    ].join('\n'),
  })

  const btnGroup = document.getElementById('btn-group')
  btnGroup.addEventListener('click', onBtnGroupClick)
}

function onBtnGroupClick(e: Event) {
  const target = e.target as HTMLButtonElement
  switch (target.id) {
    case 'setCompletionsOptions':
      editorInstance.updateCompletionsOptions({
        azkabanKeywords: [{ label: 'az.1.day.ago', detail: '一天前' }],
        noTestDataBase: true,
      })
      break
    case 'getSelectedValue':
      alert((editorInstance as MonacoHiveEditor).getSelectedValue())
      break
    case 'getAllSelectedValue':
      alert((editorInstance as MonacoHiveEditor).getAllSelectedValue())
      break
  }
}
