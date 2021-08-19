import * as monaco from 'monaco-editor-core'

export const languageID = 'hive'

export const languageExtensionPoint: monaco.languages.ILanguageExtensionPoint = {
  id: languageID,
  extensions: ['.hql', '.hplsql'],
  aliases: ['HqlSql', 'hplsql'],
}
