import { SymbolKind } from './language-support'
import { CompletionItem } from './completion'
import { FunctionKeywords } from '@lwz/hive-meta-data'
import { ColumnsRes, DatabasesRes, TablesRes } from './interface'

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

  /**
   * 转换接口返回的库提示
   * @param res
   * @returns
   */
  databaseSuggestionsMapper(res: DatabasesRes) {
    return res.map<CompletionItem>((db) => ({
      kind: SymbolKind.DatabaseLiteral,
      label: db,
      insertText: db,
    }))
  }

  /**
   * 转换接口返回的表提示
   * @param res
   * @returns
   */
  tableSuggestionsMapper(res: TablesRes) {
    return res.map<CompletionItem>((item) => ({
      kind: SymbolKind.TableLiteral,
      label: item.name,
      insertText: item.name,
      detail: item.comment,
    }))
  }

  /**
   * 转换接口返回的列提示
   * @param res
   * @returns
   */
  columnSuggestionsMapper(res: ColumnsRes) {
    return res.map<CompletionItem>((item) => ({
      kind: SymbolKind.ColumnLiteral,
      label: item.name,
      insertText: item.name,
      detail: item.type,
      documentation: item.comment,
    }))
  }
}

export default new CompletionSupport()
