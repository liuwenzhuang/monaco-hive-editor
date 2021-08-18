import * as monaco from 'monaco-editor-core'

export const languageID = 'apache-hive-sql'

export const languageExtensionPoint: monaco.languages.ILanguageExtensionPoint = {
  id: languageID,
  extensions: ['.hql', '.hplsql'],
  aliases: ['HqlSql', 'hplsql'],
}
