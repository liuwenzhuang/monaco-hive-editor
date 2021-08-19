import * as monaco from 'monaco-editor-core'
import { WorkerAccessor } from './index'

import Languages = monaco.languages
import Editor = monaco.editor

/**
 * 用户提供的自动补全的配置
 */
export interface UDCompletionItem extends Pick<Languages.CompletionItem, 'label' | 'detail' | 'documentation'> {
  label: string
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

    const info = await worker.getCompletionsAtPosition(uri.toString(), offset)

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
        kind: Languages.CompletionItemKind.Variable,
        ...item,
      }
    })

    return {
      suggestions,
    }
  }
}
