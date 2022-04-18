/* eslint-disable @typescript-eslint/no-var-requires */
const Koa = require('koa')
const Router = require('@koa/router')
const cors = require('@koa/cors')
const koaBodyparser = require('koa-bodyparser')
const { spawn } = require('child_process')
const path = require('path')

const HTTP_PORT = 3001
const app = new Koa()
const router = new Router()

router.post('/getDbTables', (ctx, next) => {
  const body = ctx.request.body
  const db = body.dbName
  ctx.status = 200
  ctx.headers['content-type'] = 'application/json'
  ctx.body = {
    data: [
      {
        name: `${db}_table_${Math.random()}`.replace('.', ''),
        comment: '测试表格1',
      },
      {
        name: `${db}_table_${Math.random()}`.replace('.', ''),
        comment: '测试表格2',
      },
    ],
  }
  next()
})

router.post('/getColumns', (ctx, next) => {
  const body = ctx.request.body
  const db = body.dbName
  const table = body.tableName
  ctx.status = 200
  ctx.headers['content-type'] = 'application/json'
  ctx.body = {
    data: [
      {
        name: `${db}_${table}_${Math.random().toString().slice(2, 5)}`,
        type: 'array<string>',
        comment: '测试列1',
      },
      {
        name: `${db}_${table}_${Math.random().toString().slice(2, 5)}`,
        type: 'bigint(10)',
        comment: '测试列2',
      },
    ],
  }
  next()
})

router.get('/getDbTables', (ctx, next) => {
  const query = ctx.request.query
  const db = query.db
  ctx.status = 200
  ctx.headers['content-type'] = 'application/json'
  ctx.body = {
    data: [
      {
        name: `${db}_table_${Math.random()}`.replace('.', ''),
        comment: '测试表格1',
      },
      {
        name: `${db}_table_${Math.random()}`.replace('.', ''),
        comment: '测试表格2',
      },
    ],
  }
  next()
})

router.get('/getColumns', (ctx, next) => {
  const query = ctx.request.query
  const db = query.db
  const table = query.table
  ctx.status = 200
  ctx.body = {
    data: [
      {
        name: `${db}_${table}_${Math.random().toString().slice(2, 5)}`,
        type: 'array<string>',
        comment: '测试列1',
      },
      {
        name: `${db}_${table}_${Math.random().toString().slice(2, 5)}`,
        type: 'bigint(10)',
        comment: '测试列2',
      },
    ],
  }
  next()
})

app.use(koaBodyparser()).use(cors()).use(router.routes()).use(router.allowedMethods())

app.listen(HTTP_PORT, () => {
  console.log(`local test server running at: http://127.0.0.1:${HTTP_PORT}`)
})

spawn(
  path.join(__dirname, '../../../../node_modules/.bin/webpack-dev-server'),
  ['--config', path.join(__dirname, '../webpack.config.js'), '--env', 'development'],
  {
    shell: true,
    stdio: 'inherit',
    cwd: path.join(__dirname, '../'),
  }
)
  .on('message', console.log)
  .on('error', console.error)
