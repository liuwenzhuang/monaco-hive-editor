import type * as mode from './HiveMode'
import { languages, Emitter, IEvent, Uri } from './fillers/monaco-editor-core'
import { languageID } from './config'
import { UDCompletionItem } from './CompletionItemAdapter'
import { CaretPosition } from '@lwz/hive-service'

export interface CompletionsOptions {
  /**
   * azkaban keywords
   */
  azkabanKeywords?: UDCompletionItem[]
  /**
   * database list
   */
  dataBases?: UDCompletionItem[]
  /**
   * get tables by db name ajax url, return data type:
   * {data: UDCompletionItem[]}
   */
  tableReqUrl?: string
  /**
   * whether support test databse grammar
   * ${!DB}.TABLE
   */
  noTestDataBase?: boolean
}

export interface DiagnosticsOptions {
  noSemanticValidation?: boolean
  noSyntaxValidation?: boolean
  noSuggestionDiagnostics?: boolean
  /**
   * Limit diagnostic computation to only visible files.
   * Defaults to false.
   */
  onlyVisible?: boolean
  diagnosticCodesToIgnore?: number[]
}

export interface WorkerOptions {
  /** A full HTTP path to a JavaScript file which adds a function `customTSWorkerFactory` to the self inside a web-worker */
  customWorkerPath?: string
}

/**
 * A linked list of formatted diagnostic messages to be used as part of a multiline message.
 * It is built from the bottom up, leaving the head to be the "main" diagnostic.
 */
interface DiagnosticMessageChain {
  messageText: string
  /** Diagnostic category: warning = 0, error = 1, suggestion = 2, message = 3 */
  category: 0 | 1 | 2 | 3
  code: number
  next?: DiagnosticMessageChain[]
}

export interface Diagnostic extends DiagnosticRelatedInformation {
  /** May store more in future. For now, this will simply be `true` to indicate when a diagnostic is an unused-identifier diagnostic. */
  reportsUnnecessary?: Record<string, any>
  reportsDeprecated?: Record<string, any>
  source?: string
  relatedInformation?: DiagnosticRelatedInformation[]
}
export interface DiagnosticRelatedInformation {
  /** Diagnostic category: warning = 0, error = 1, suggestion = 2, message = 3 */
  category: 0 | 1 | 2 | 3
  code: number
  /** TypeScriptWorker removes all but the `fileName` property to avoid serializing circular JSON structures. */
  file: { fileName: string } | undefined
  start: number | undefined
  length: number | undefined
  messageText: string | DiagnosticMessageChain
}

export interface LanguageServiceDefaults {
  /**
   * Event fired when compiler options or diagnostics options are changed.
   */
  readonly onDidChange: IEvent<void>

  readonly workerOptions: WorkerOptions

  /**
   * Get the current diagnostics options for the language service.
   */
  getDiagnosticsOptions(): DiagnosticsOptions

  /**
   * Configure whether syntactic and/or semantic validation should
   * be performed
   */
  setDiagnosticsOptions(options: DiagnosticsOptions): void

  /**
   * Get the current completions options for the language service.
   */
  getCompletionsOptions(): CompletionsOptions

  /**
   * Configure completions options
   */
  setCompletionsOptions(options: CompletionsOptions): void

  /**
   * Configure webworker options
   */
  setWorkerOptions(options: WorkerOptions): void

  /**
   * Configure if all existing models should be eagerly sync'd
   * to the worker on start or restart.
   */
  setEagerModelSync(value: boolean): void

  /**
   * Get the current setting for whether all existing models should be eagerly sync'd
   * to the worker on start or restart.
   */
  getEagerModelSync(): boolean
}

export interface HiveWorker {
  /**
   * Get validation for the given file
   */
  getValidation(fileName: string): Promise<any[] | undefined>
  /**
   * Get code completions for the given file and position.
   */
  getCompletionsAtPosition(fileName: string, position: number, rowColumn: CaretPosition): Promise<any | undefined>
}

// --- Hive configuration and defaults ---------

class LanguageServiceDefaultsImpl implements LanguageServiceDefaults {
  private _onDidChange = new Emitter<void>()
  private _eagerModelSync: boolean
  private _completionsOptions!: CompletionsOptions
  private _diagnosticsOptions!: DiagnosticsOptions
  private _workerOptions!: WorkerOptions

  constructor(
    completionsOptions: CompletionsOptions,
    diagnosticsOptions: DiagnosticsOptions,
    workerOptions: WorkerOptions
  ) {
    this._eagerModelSync = false
    this.setCompletionsOptions(completionsOptions)
    this.setDiagnosticsOptions(diagnosticsOptions)
    this.setWorkerOptions(workerOptions)
  }

  get onDidChange(): IEvent<void> {
    return this._onDidChange.event
  }

  get workerOptions(): WorkerOptions {
    return this._workerOptions
  }

  getDiagnosticsOptions(): DiagnosticsOptions {
    return this._diagnosticsOptions
  }

  setDiagnosticsOptions(options: DiagnosticsOptions): void {
    this._diagnosticsOptions = options || Object.create(null)
    this._onDidChange.fire(undefined)
  }

  getCompletionsOptions(): CompletionsOptions {
    return this._completionsOptions
  }

  setCompletionsOptions(options: CompletionsOptions): void {
    this._completionsOptions = options || Object.create(null)
    this._onDidChange.fire(undefined)
  }

  setWorkerOptions(options: WorkerOptions): void {
    this._workerOptions = options || Object.create(null)
    this._onDidChange.fire(undefined)
  }

  setEagerModelSync(value: boolean) {
    // doesn't fire an event since no
    // worker restart is required here
    this._eagerModelSync = value
  }

  getEagerModelSync() {
    return this._eagerModelSync
  }
}

export const hiveDefaults: LanguageServiceDefaults = new LanguageServiceDefaultsImpl(
  {
    azkabanKeywords: [
      { label: '${azkaban.flow.1.days.ago}', detail: '一天前' },
      { label: '${azkaban.flow.2.days.ago}' },
      { label: 'azkaban.flow.7.days.ago' },
    ],
    dataBases: [{ label: 'test1DB', detail: '测试数据库1' }, { label: 'testDB2' }],
    noTestDataBase: false,
    tableReqUrl: 'http://127.0.0.1:3001/getDbTables',
  },
  {},
  {}
)

export const getHiveWorker = (): Promise<(...uris: Uri[]) => Promise<HiveWorker>> => {
  return getMode().then((mode) => mode.getHiveWorker())
}

// export to the global based API
;(<any>languages)[languageID] = {
  hiveDefaults,
  getHiveWorker,
}

// --- Registration to monaco editor ---

function getMode(): Promise<typeof mode> {
  return import('./HiveMode')
}

languages.onLanguage(languageID, () => {
  return getMode().then((mode) => mode.setupHive(hiveDefaults))
})
