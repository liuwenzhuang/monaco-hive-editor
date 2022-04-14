import MonacoHiveEditor from '../src/index'
import { editor } from '../src/fillers/monaco-editor-core'

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
        dataBases: ['testDb1', 'testDb2', 'testDb3'],
        tableReq: {
          url: 'http://127.0.0.1:3001/getDbTables',
          method: 'post',
          dbKey: 'dbName',
          data: {
            email: 'liu1114589929@gmail.com',
          },
        },
        columnReq: {
          url: 'http://127.0.0.1:3001/getColumns',
          method: 'post',
          dbKey: 'dbName',
          tableKey: 'tableName',
          data: {
            email: 'liu1114589929@gmail.com',
            dataSourceId: 'dataSource_id_1',
          },
        },
      })
      break
    case 'setEditorOptions':
      editorInstance.setEditorOptions({
        useTabStops: true,
        tabSize: 2,
      })
      console.log(editorInstance.getEditor().getOptions().get(editor.EditorOption.fontFamily))
      break
    case 'getSelectedValue':
      alert(editorInstance.getSelectedValue())
      break
    case 'getAllSelectedValue':
      alert(editorInstance.getAllSelectedValue())
      break
  }
}
