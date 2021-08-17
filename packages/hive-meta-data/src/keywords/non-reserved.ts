import { HiveVersion, Keyword } from '../interface'
import { difference } from 'lodash-es'

/**
 * 关键词映射
 * @param name
 * @returns
 */
export function mapToKeyword(name: string) {
  return {
    name,
  } as Keyword
}

/**
 * 1.2.0 版本非保留关键字
 */
const HiveVersion120NonReserved = [
  'ADD',
  'ADMIN',
  'AFTER',
  'ANALYZE',
  'ARCHIVE',
  'ASC',
  'BEFORE',
  'BUCKET',
  'BUCKETS',
  'CASCADE',
  'CHANGE',
  'CLUSTER',
  'CLUSTERED',
  'CLUSTERSTATUS',
  'COLLECTION',
  'COLUMNS',
  'COMMENT',
  'COMPACT',
  'COMPACTIONS',
  'COMPUTE',
  'CONCATENATE',
  'CONTINUE',
  'DATA',
  'DATABASES',
  'DATETIME',
  'DAY',
  'DBPROPERTIES',
  'DEFERRED',
  'DEFINED',
  'DELIMITED',
  'DEPENDENCY',
  'DESC',
  'DIRECTORIES',
  'DIRECTORY',
  'DISABLE',
  'DISTRIBUTE',
  'ELEM_TYPE',
  'ENABLE',
  'ESCAPED',
  'EXCLUSIVE',
  'EXPLAIN',
  'EXPORT',
  'FIELDS',
  'FILE',
  'FILEFORMAT',
  'FIRST',
  'FORMAT',
  'FORMATTED',
  'FUNCTIONS',
  'HOLD_DDLTIME',
  'HOUR',
  'IDXPROPERTIES',
  'IGNORE',
  'INDEX',
  'INDEXES',
  'INPATH',
  'INPUTDRIVER',
  'INPUTFORMAT',
  'ITEMS',
  'JAR',
  'KEYS',
  'KEY_TYPE',
  'LIMIT',
  'LINES',
  'LOAD',
  'LOCATION',
  'LOCK',
  'LOCKS',
  'LOGICAL',
  'LONG',
  'MAPJOIN',
  'MATERIALIZED',
  'METADATA',
  'MINUS',
  'MINUTE',
  'MONTH',
  'MSCK',
  'NOSCAN',
  'NO_DROP',
  'OFFLINE',
  'OPTION',
  'OUTPUTDRIVER',
  'OUTPUTFORMAT',
  'OVERWRITE',
  'OWNER',
  'PARTITIONED',
  'PARTITIONS',
  'PLUS',
  'PRETTY',
  'PRINCIPALS',
  'PROTECTION',
  'PURGE',
  'READ',
  'READONLY',
  'REBUILD',
  'RECORDREADER',
  'RECORDWRITER',
  'REGEXP',
  'RELOAD',
  'RENAME',
  'REPAIR',
  'REPLACE',
  'REPLICATION',
  'RESTRICT',
  'REWRITE',
  'RLIKE',
  'ROLE',
  'ROLES',
  'SCHEMA',
  'SCHEMAS',
  'SECOND',
  'SEMI',
  'SERDE',
  'SERDEPROPERTIES',
  'SERVER',
  'SETS',
  'SHARED',
  'SHOW',
  'SHOW_DATABASE',
  'SKEWED',
  'SORT',
  'SORTED',
  'SSL',
  'STATISTICS',
  'STORED',
  'STREAMTABLE',
  'STRING',
  'STRUCT',
  'TABLES',
  'TBLPROPERTIES',
  'TEMPORARY',
  'TERMINATED',
  'TINYINT',
  'TOUCH',
  'TRANSACTIONS',
  'UNARCHIVE',
  'UNDO',
  'UNIONTYPE',
  'UNLOCK',
  'UNSET',
  'UNSIGNED',
  'URI',
  'USE',
  'UTC',
  'UTCTIMESTAMP',
  'VALUE_TYPE',
  'VIEW',
  'WHILE',
  'YEAR',
]

/**
 * 2.0.0 版本
 */
const HiveVersion200NonReserved = difference(HiveVersion120NonReserved, ['REGEXP', 'RLIKE']).concat([
  'AUTOCOMMIT',
  'ISOLATION',
  'LEVEL',
  'OFFSET',
  'SNAPSHOT',
  'TRANSACTION',
  'WORK',
  'WRITE',
])

/**
 * 2.1.0 版本
 */
const HiveVersion210NonReserved = HiveVersion200NonReserved.concat([
  'ABORT',
  'KEY',
  'LAST',
  'NORELY',
  'NOVALIDATE',
  'NULLS',
  'RELY',
  'VALIDATE',
])

/**
 * 2.2.0 版本
 */
const HiveVersion220NonReserved = HiveVersion210NonReserved.concat([
  'DETAIL',
  'DOW',
  'EXPRESSION',
  'OPERATOR',
  'QUARTER',
  'SUMMARY',
  'VECTORIZATION',
  'WEEK',
  'YEARS',
  'MONTHS',
  'WEEKS',
  'DAYS',
  'HOURS',
  'MINUTES',
  'SECONDS',
])

/**
 * 3.0.0 版本
 */
const HiveVersion300NonReserved = HiveVersion220NonReserved.concat(['TIMESTAMPTZ', 'ZONE'])

/**
 * 各版本对应的 Non-Reserved Keywords
 */
export const NonReservedMap = new Map<HiveVersion, Keyword[]>([
  [HiveVersion['version_1.2.0'], HiveVersion120NonReserved.map(mapToKeyword)],
  [HiveVersion['version_2.0.0'], HiveVersion200NonReserved.map(mapToKeyword)],
  [HiveVersion['version_2.1.0'], HiveVersion210NonReserved.map(mapToKeyword)],
  [HiveVersion['version_2.2.0'], HiveVersion220NonReserved.map(mapToKeyword)],
  [HiveVersion['version_3.0.0'], HiveVersion300NonReserved.map(mapToKeyword)],
])
