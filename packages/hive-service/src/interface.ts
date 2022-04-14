/**
 * 列响应
 */
export type DatabasesRes = string[]

/**
 * 表响应
 */
export type TablesRes = Array<{
  name: string
  comment: string
}>

/**
 * 列响应
 */
export type ColumnsRes = Array<{
  name: string
  type: string
  comment: string
}>
