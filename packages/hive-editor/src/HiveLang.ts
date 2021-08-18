import * as monaco from 'monaco-editor-core'
import { Keywords, FunctionKeywords } from '@lwz/hive-meta-data'

import IRichLanguageConfiguration = monaco.languages.LanguageConfiguration
import ILanguage = monaco.languages.IMonarchLanguage
import { HiveVersion } from '@lwz/hive-meta-data/lib/interface'

export const richLanguageConfiguration: IRichLanguageConfiguration = {
  // If we want to support code folding, brackets ... ( [], (), {}....), we can override some properties here
  // check the doc
  comments: { lineComment: '--', blockComment: ['/*', '*/'] },
  brackets: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')'],
    ['<', '>'],
  ],
  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],
  surroundingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],
}

export const monarchLanguage = <ILanguage>{
  // Set defaultToken to invalid to see what you do not tokenize yet
  defaultToken: 'invalid',
  tokenPostfix: '.hplsql',
  ignoreCase: true,
  brackets: [
    {
      open: '[',
      close: ']',
      token: 'delimiter.square',
    },
    {
      open: '(',
      close: ')',
      token: 'delimiter.parenthesis',
    },
    {
      open: '{',
      close: '}',
      token: 'delimiter.curly',
    },
    {
      open: '<',
      close: '>',
      token: 'delimiter.angle',
    },
  ],
  escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
  operators: ['+', '-', '/', '//', '%', '<@>', '@>', '<@', '&', '^', '~', '<', '>', '<=', '=>', '==', '!=', '<>', '='],
  builtinFunctions: FunctionKeywords.map((item) => item.name),
  keywords: [
    ...Keywords.NonReservedMap.get(HiveVersion['version_3.0.0']).map((item) => item.name),
    ...Keywords.ReservedMap.get(HiveVersion['version_3.0.0']).map((item) => item.name),
    ...FunctionKeywords.map((item) => item.name),
  ],
  builtinVariables: ['FALSE', 'NULL', 'TRUE'],
  dataTypes: [
    'ARRAY',
    'BIGINT',
    'BINARY',
    'BOOLEAN',
    'CHAR',
    'DATE',
    'DECIMAL',
    'DELIMITED',
    'DOUBLE',
    'FLOAT',
    'INT',
    'MAP',
    'RCFILE',
    'SEQUENCEFILE',
    'SERDE',
    'SMALLINT',
    'STRING',
    'STRUCT',
    'TEXTFILE',
    'TIMESTAMP',
    'TINYINT',
    'UNIONTYPE',
    'VARCHAR',
  ],
  // The main tokenizer for our languages
  tokenizer: {
    root: [
      { include: '@comments' },
      { include: '@whitespace' },
      { include: '@numbers' },
      [/[;,.]/, 'delimiter'],
      [/"([^"\\]|\\.)*$/, 'doubleString.invalid'],
      [/"/, { token: 'doubleString.quote', bracket: '@open', next: '@doubleString' }],
      [/'([^'\\]|\\.)*$/, 'singleString.invalid'],
      [/'/, { token: 'singleString.quote', bracket: '@open', next: '@singleString' }],
      [/[()]/, '@brackets'],
      [
        /[\w@#$]+/,
        {
          cases: {
            '@keywords': 'keyword',
            '@operators': 'operator',
            '@builtinVariables': 'predefined',
            '@builtinFunctions': 'predefined',
            '@dataTypes': 'predefined',
            '@default': 'identifier',
          },
        },
      ],
    ],
    whitespace: [[/\s+/, 'white']],
    comments: [
      [/--+.*/, 'comment'],
      [/\/\*/, { token: 'comment.quote', next: '@comment' }],
    ],
    comment: [
      [/[^*/]+/, 'comment'],
      [/\*\//, { token: 'comment.quote', next: '@pop' }],
      [/./, 'comment'],
    ],
    numbers: [
      [/0[xX][0-9a-fA-F]*/, 'number'],
      [/[$][+-]*\d*(\.\d*)?/, 'number'],
      [/((\d+(\.\d*)?)|(\.\d+))([eE][-+]?\d+)?/, 'number'],
    ],
    doubleString: [
      [/[^\\"]+/, 'doubleString'],
      [/@escapes/, 'doubleString.escape'],
      [/\\./, 'doubleString.escape.invalid'],
      [/"/, { token: 'doubleString.quote', bracket: '@close', next: '@pop' }],
    ],
    singleString: [
      [/[^\\']+/, 'singleString'],
      [/@escapes/, 'singleString.escape'],
      [/\\./, 'singleString.escape.invalid'],
      [/'/, { token: 'singleString.quote', bracket: '@close', next: '@pop' }],
    ],
  },
}
