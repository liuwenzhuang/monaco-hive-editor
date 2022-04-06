import MonacoHiveEditor from '../src/index'

let editorInstance: MonacoHiveEditor

document.addEventListener('DOMContentLoaded', onDOMContentLoaded)

function onDOMContentLoaded() {
  const container = document.getElementById('container')

  editorInstance = new MonacoHiveEditor(container, {
    value: [
      'use mammut_idc;',
      '-- set hive.execution.engine=spark;',
      'SELECT c.ID, c.NAME, c.AGE, o.AMOUNT',
      'FROM CUSTOMERS c JOIN ORDERS o',
      'ON (c.ID = o.CUSTOMER_ID);',
      'create table mammut_qa.students(id int, age char(2));',
      'select from testTable1;',
    ].join('\n'),
  })

  const btnGroup = document.getElementById('btn-group')
  btnGroup.addEventListener('click', onBtnGroupClick)
}

function onBtnGroupClick(e: Event) {
  const target = e.target as HTMLButtonElement
  switch (target.id) {
    case 'setCompletionsOptions':
      editorInstance.setCompletionsOptions({
        azkabanKeywords: [{ label: 'az.1.day.ago', detail: '一天前' }],
        noTestDataBase: true,
        dataBases: [{ label: 'test1DB', detail: '测试数据库1' }, { label: 'testDB2' }],
        tableReqUrl: 'http://127.0.0.1:3001/getDbTables',
      })
      break
    case 'getSelectedValue':
      alert(editorInstance.getSelectedValue())
      break
    case 'getAllSelectedValue':
      alert(editorInstance.getAllSelectedValue())
      break
  }
}
