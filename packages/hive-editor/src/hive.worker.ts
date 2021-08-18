import * as worker from 'monaco-editor-core/esm/vs/editor/editor.worker'
import { HiveCreateData, HiveWorker } from './HiveWorker'

self.onmessage = () => {
  worker.initialize((ctx: worker.IWorkerContext, createData: HiveCreateData) => {
    return new HiveWorker(ctx, createData)
  })
}
