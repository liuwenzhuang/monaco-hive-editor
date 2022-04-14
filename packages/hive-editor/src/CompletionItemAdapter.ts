import { SymbolKind } from '@lwz/hive-service/lib/language-support'
import {
  languages as Languages,
  editor as Editor,
  Uri,
  Range,
  Position,
  CancellationToken,
} from './filters/monaco-editor-core'
import { WorkerAccessor } from './index'
import { EnhanceCompletionItem } from './HiveWorker'

/**
 * 用户提供的自动补全的配置
 */
export interface UDCompletionItem extends Pick<Languages.CompletionItem, 'label' | 'detail' | 'documentation'> {
  label: string
  kind?: number
}

export interface HiveCompletionItem extends Languages.CompletionItem {
  label: string
  uri: Uri
  position: Position
  offset: number
}

export type CompletionTriggerCharacter = ' ' | '.' | '$' | '!'

export const TriggerCharacters: CompletionTriggerCharacter[] = [' ', '.', '$', '!']

export default class CompletionItemAdapter implements Languages.CompletionItemProvider {
  triggerCharacters = TriggerCharacters
  constructor(private worker: WorkerAccessor) {}

  /**
   * Provide completion items for the given position and document.
   */
  public provideCompletionItems(
    model: Editor.ITextModel,
    position: Position,
    context: Languages.CompletionContext,
    token: CancellationToken
  ): Promise<Languages.CompletionList | undefined> {
    const wordInfo = model.getWordUntilPosition(position)
    const wordRange = new Range(position.lineNumber, wordInfo.startColumn, position.lineNumber, wordInfo.endColumn)
    const uri = model.uri
    const offset = model.getOffsetAt(position)

    return this.worker(uri)
      .then((worker) => {
        return worker.getCompletionsAtPosition(uri.toString(), offset, {
          line: position.lineNumber,
          column: position.column,
        })
      })
      .then((info: EnhanceCompletionItem[]) => {
        if (!info || model.isDisposed()) {
          return
        }
        const suggestions: HiveCompletionItem[] = info.map((item) => {
          const range = wordRange
          return {
            uri,
            position,
            offset,
            range,
            ...item,
            kind: this.transferKind(item.kind),
            insertTextRules: this.transferInsertTextRules(item.kind),
          }
        })

        return {
          suggestions,
        }
      })
  }

  transferKind(kind: number) {
    switch (kind) {
      case SymbolKind.Function:
        return Languages.CompletionItemKind.Function
      case SymbolKind.Keyword:
        return Languages.CompletionItemKind.Keyword
      case SymbolKind.LanguageSnippet:
        return Languages.CompletionItemKind.Snippet
      case SymbolKind.DatabaseLiteral:
        return Languages.CompletionItemKind.Module
      case SymbolKind.TableLiteral:
        return Languages.CompletionItemKind.Class
      case SymbolKind.ColumnLiteral:
        return Languages.CompletionItemKind.Field
      default:
        return Languages.CompletionItemKind.Variable
    }
  }

  transferInsertTextRules(kind: SymbolKind) {
    switch (kind) {
      case SymbolKind.LanguageSnippet:
        return Languages.CompletionItemInsertTextRule.InsertAsSnippet
      default:
        return undefined
    }
  }
}
