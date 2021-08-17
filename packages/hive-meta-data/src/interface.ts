/**
 * 目前支持的 Hive 版本
 */
export enum HiveVersion {
  'version_1.2.0' = '1.2.0',
  'version_2.0.0' = '2.0.0',
  'version_2.1.0' = '2.1.0',
  'version_2.2.0' = '2.2.0',
  'version_3.0.0' = '3.0.0',
}

export interface Keyword {
  name: string
  desc?: string
}

export interface FunctionKeyword extends Keyword {
  returnType: string
  synax: string
}
