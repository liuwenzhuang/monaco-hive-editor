import { SymbolKind } from './language-support'
import { CompletionItem } from './completion'
import { FunctionKeywords } from '@lwz/hive-meta-data'

class CompletionSupport {
  /**
   * udf functions
   */
  get commonFunctions() {
    return FunctionKeywords.map<CompletionItem>((item) => {
      const label = item.name.toUpperCase()
      return {
        label,
        kind: SymbolKind.Function,
        insertText: `${label}()`,
        detail: item.synax,
        documentation: item.desc,
      }
    })
  }

  /**
   * common snippets
   */
  get commonSuggestions(): CompletionItem[] {
    return [
      {
        label: 'Create Table Snippets',
        kind: SymbolKind.LanguageSnippet,
        detail: 'Create Table Statement Snippets',
        insertText: [
          'CREATE TABLE IF NOT EXISTS $1 (',
          '\t`id` BIGINT(10) NOT NULL COMMENT "${2:列描述}",',
          '\t$3',
          '\tPRIMARY KEY (`id`)',
          ')',
          'COMMENT "${4:表描述}";',
          '\n$0',
        ].join('\n'),
      },
      {
        label: 'Insert Into Snippets',
        kind: SymbolKind.LanguageSnippet,
        detail: 'Insert Table Statement Snippets',
        insertText: [
          'INSERT ${1|OVERWRITE TABLE,INTO|} $2 (',
          '\t"${3:列名}"',
          ')',
          'values (',
          '\t"${4:新值}"',
          ');',
          '\n$0',
        ].join('\n'),
      },
    ]
  }
}

export default new CompletionSupport()
