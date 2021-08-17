import { HiveVersion, Keyword } from '../interface'
import { difference } from 'lodash-es'
import { mapToKeyword } from './non-reserved'

/**
 * 1.2.0 版本非保留关键字
 */
const HiveVersion120Reserved = [
  'ALL',
  'ALTER',
  'AND',
  'ARRAY',
  'AS',
  'AUTHORIZATION',
  'BETWEEN',
  'BIGINT',
  'BINARY',
  'BOOLEAN',
  'BOTH',
  'BY',
  'CASE',
  'CAST',
  'CHAR',
  'COLUMN',
  'CONF',
  'CREATE',
  'CROSS',
  'CUBE',
  'CURRENT',
  'CURRENT_DATE',
  'CURRENT_TIMESTAMP',
  'CURSOR',
  'DATABASE',
  'DATE',
  'DECIMAL',
  'DELETE',
  'DESCRIBE',
  'DISTINCT',
  'DOUBLE',
  'DROP',
  'ELSE',
  'END',
  'EXCHANGE',
  'EXISTS',
  'EXTENDED',
  'EXTERNAL',
  'FALSE',
  'FETCH',
  'FLOAT',
  'FOLLOWING',
  'FOR',
  'FROM',
  'FULL',
  'FUNCTION',
  'GRANT',
  'GROUP',
  'GROUPING',
  'HAVING',
  'IF',
  'IMPORT',
  'IN',
  'INNER',
  'INSERT',
  'INT',
  'INTERSECT',
  'INTERVAL',
  'INTO',
  'IS',
  'JOIN',
  'LATERAL',
  'LEFT',
  'LESS',
  'LIKE',
  'LOCAL',
  'MACRO',
  'MAP',
  'MORE',
  'NONE',
  'NOT',
  'NULL',
  'OF',
  'ON',
  'OR',
  'ORDER',
  'OUT',
  'OUTER',
  'OVER',
  'PARTIALSCAN',
  'PARTITION',
  'PERCENT',
  'PRECEDING',
  'PRESERVE',
  'PROCEDURE',
  'RANGE',
  'READS',
  'REDUCE',
  'REVOKE',
  'RIGHT',
  'ROLLUP',
  'ROW',
  'ROWS',
  'SELECT',
  'SET',
  'SMALLINT',
  'TABLE',
  'TABLESAMPLE',
  'THEN',
  'TIMESTAMP',
  'TO',
  'TRANSFORM',
  'TRIGGER',
  'TRUE',
  'TRUNCATE',
  'UNBOUNDED',
  'UNION',
  'UNIQUEJOIN',
  'UPDATE',
  'USER',
  'USING',
  'UTC_TMESTAMP',
  'VALUES',
  'VARCHAR',
  'WHEN',
  'WHERE',
  'WINDOW',
  'WITH',
]

/**
 * 2.0.0 版本
 */
const HiveVersion200Reserved = difference(HiveVersion120Reserved, ['REGEXP', 'RLIKE']).concat([
  'COMMIT',
  'ONLY',
  'REGEXP',
  'RLIKE',
  'ROLLBACK',
  'START',
])

/**
 * 2.1.0 版本
 */
const HiveVersion210Reserved = HiveVersion200Reserved.concat([
  'CACHE',
  'CONSTRAINT',
  'FOREIGN',
  'PRIMARY',
  'REFERENCES',
])

/**
 * 2.2.0 版本
 */
const HiveVersion220Reserved = HiveVersion210Reserved.concat([
  'DAYOFWEEK',
  'EXTRACT',
  'FLOOR',
  'INTEGER',
  'PRECISION',
  'VIEWS',
])

/**
 * 3.0.0 版本
 */
const HiveVersion300Reserved = HiveVersion220Reserved.concat(['TIME', 'NUMERIC', 'SYNC'])

/**
 * 各版本对应的 Non-Reserved Keywords
 */
export const ReservedMap = new Map<HiveVersion, Keyword[]>([
  [HiveVersion['version_1.2.0'], HiveVersion120Reserved.map(mapToKeyword)],
  [HiveVersion['version_2.0.0'], HiveVersion200Reserved.map(mapToKeyword)],
  [HiveVersion['version_2.1.0'], HiveVersion210Reserved.map(mapToKeyword)],
  [HiveVersion['version_2.2.0'], HiveVersion220Reserved.map(mapToKeyword)],
  [HiveVersion['version_3.0.0'], HiveVersion300Reserved.map(mapToKeyword)],
])
