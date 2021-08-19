import { editor, MarkerSeverity, Uri } from './fillers/monaco-editor-core'
import { WorkerAccessor } from './index'
import { languageID } from './config'
import { LangError } from '@lwz/hive-parser/lib/error-listener'

export default class DiagnosticsAdapter {
  constructor(private modeId: string, private worker: WorkerAccessor) {
    const onModelAdd = (model: editor.IModel): void => {
      if (model.getModeId() !== this.modeId) {
        return
      }

      let handle: any
      model.onDidChangeContent(() => {
        // here we are Debouncing the user changes, so everytime a new change is done, we wait 500ms before validating
        // otherwise if the user is still typing, we cancel the
        clearTimeout(handle)
        handle = setTimeout(() => this.validate(model.uri), 500)
      })

      this.validate(model.uri)
    }
    editor.onDidCreateModel(onModelAdd)
    editor.getModels().forEach(onModelAdd)
  }
  private async validate(resource: Uri): Promise<void> {
    // get the worker proxy
    const worker = await this.worker(resource)
    // call the validate methode proxy from the langaueg service and get errors
    const errorMarkers = await worker.getValidation(resource.toString())
    // get the current model(editor or file) which is only one
    const model = editor.getModel(resource)
    // add the error markers and underline them with severity of Error
    editor.setModelMarkers(model, languageID, errorMarkers.map(toDiagnostics))
  }
}
function toDiagnostics(error: LangError): editor.IMarkerData {
  return {
    ...error,
    severity: MarkerSeverity.Error,
  }
}
