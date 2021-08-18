import * as monaco from 'monaco-editor-core'
import { languageID } from './config'
import { setupLanguage } from './setup'

setupLanguage()

const container = document.getElementById('container')

const editor = monaco.editor.create(container as HTMLElement, {
  suggest: {
    showKeywords: true,
  },
  language: languageID,
  value: `use mammut_idc;
    -- set hive.execution.engine=spark;
    select count(*) from
    (select * from src) A
    left join (select * from src) B on A.key = B.key;`,
})
