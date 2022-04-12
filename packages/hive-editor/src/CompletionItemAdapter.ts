import { SymbolKind } from '@lwz/hive-service/lib/language-support'
import * as monaco from 'monaco-editor-core'
import { WorkerAccessor } from './index'

import Languages = monaco.languages
import Editor = monaco.editor

/**
 * 用户提供的自动补全的配置
 */
export interface UDCompletionItem extends Pick<Languages.CompletionItem, 'label' | 'detail' | 'documentation'> {
  label: string
  kind?: number
}

export interface HiveCompletionItem extends Languages.CompletionItem {
  label: string
  uri: monaco.Uri
  position: monaco.Position
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
  public async provideCompletionItems(
    model: Editor.ITextModel,
    position: monaco.Position,
    context: Languages.CompletionContext,
    token: monaco.CancellationToken
  ): Promise<Languages.CompletionList | undefined> {
    const wordInfo = model.getWordUntilPosition(position)
    const wordRange = new monaco.Range(
      position.lineNumber,
      wordInfo.startColumn,
      position.lineNumber,
      wordInfo.endColumn
    )
    const uri = model.uri
    const offset = model.getOffsetAt(position)

    const worker = await this.worker(uri)

    if (model.isDisposed()) {
      return
    }

    const info = await worker.getCompletionsAtPosition(uri.toString(), offset, {
      line: position.lineNumber,
      column: position.column,
    })

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
