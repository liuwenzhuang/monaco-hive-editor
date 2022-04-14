import { editor, MarkerSeverity, IDisposable } from './filters/monaco-editor-core'
import { WorkerAccessor } from './index'
import { LangError } from '@lwz/hive-parser/lib/error-listener'
import { LanguageServiceDefaults } from './monaco.contribution'

export default class DiagnosticsAdapter {
  private disposables: IDisposable[] = []
  private listener: { [uri: string]: IDisposable } = Object.create(null)

  constructor(private modeId: string, private defaults: LanguageServiceDefaults, private worker: WorkerAccessor) {
    const onModelAdd = (model: editor.IModel): void => {
      if (model.getModeId() !== this.modeId) {
        return
      }

      let handle: number
      const changeSubscription = model.onDidChangeContent(() => {
        // here we are Debouncing the user changes, so everytime a new change is done, we wait 500ms before validating
        // otherwise if the user is still typing, we cancel the
        clearTimeout(handle)
        handle = window.setTimeout(() => this.validate(model), 500)
      })

      const visibleSubscription = model.onDidChangeAttached(() => {
        if (model.isAttachedToEditor()) {
          // this model is now attached to an editor
          // => compute diagnostics
          this.validate(model)
        } else {
          // this model is no longer attached to an editor
          // => clear existing diagnostics
          editor.setModelMarkers(model, this.modeId, [])
        }
      })

      this.listener[model.uri.toString()] = {
        dispose() {
          changeSubscription.dispose()
          visibleSubscription.dispose()
          clearTimeout(handle)
        },
      }

      this.validate(model)
    }

    const onModelRemoved = (model: editor.IModel): void => {
      editor.setModelMarkers(model, this.modeId, [])
      const key = model.uri.toString()
      if (this.listener[key]) {
        this.listener[key].dispose()
        delete this.listener[key]
      }
    }

    this.disposables.push(editor.onDidCreateModel((model) => onModelAdd(<editor.IModel>model)))
    this.disposables.push(editor.onWillDisposeModel(onModelRemoved))
    this.disposables.push(
      editor.onDidChangeModelLanguage((event) => {
        onModelRemoved(event.model)
        onModelAdd(<editor.IModel>event.model)
      })
    )

    this.disposables.push({
      dispose() {
        for (const model of editor.getModels()) {
          onModelRemoved(model)
        }
      },
    })

    const recomputeDiagostics = () => {
      // redo diagnostics when options change
      for (const model of editor.getModels()) {
        onModelRemoved(model)
        onModelAdd(<editor.IModel>model)
      }
    }
    this.disposables.push(this.defaults.onDidChange(recomputeDiagostics))

    editor.getModels().forEach((model) => onModelAdd(<editor.IModel>model))
  }

  public dispose(): void {
    this.disposables.forEach((d) => d && d.dispose())
    this.disposables = []
  }

  private async validate(model: editor.IModel): Promise<void> {
    if (model.isDisposed()) {
      return
    }
    const resource = model.uri
    // get the worker proxy
    const worker = await this.worker(resource)
    // call the validate methode proxy from the langaueg service and get errors
    const errorMarkers = await worker.getValidation(resource.toString())
    // add the error markers and underline them with severity of Error
    editor.setModelMarkers(model, this.modeId, errorMarkers.map(toDiagnostics))
  }
}
function toDiagnostics(error: LangError): editor.IMarkerData {
  return {
    ...error,
    severity: MarkerSeverity.Error,
  }
}
