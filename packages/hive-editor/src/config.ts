import { languages } from './filters/monaco-editor-core'

export const languageID = 'hive'

export const languageExtensionPoint: languages.ILanguageExtensionPoint = {
  id: languageID,
  extensions: ['.hql', '.hplsql'],
  aliases: ['HqlSql', 'hplsql'],
}
