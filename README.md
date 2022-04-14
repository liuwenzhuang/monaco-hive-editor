# monaco-hive-editor

## 开发

> 下面的操作，都只需要在根文件夹下执行。

```bash
# 安装依赖
yarn install

# 只需首次执行
yarn meta build
yarn parser build:grammar

# 如需开发 service 层，则执行：
yarn service dev
# 如不需要开发 service 层，则执行
yarn service build

# 启动 editor 网页开发环境
yarn editor dev
```

## 版本发布

### 发布前配置

由于工程使用了 yarn2+，故版本发布的方式有些不同，需要配置 [npmAuthToken](https://yarnpkg.com/configuration/yarnrc#npmAuthToken)，此时有两种方式配置，一种是配置在工程中的 [.yarnrc.yml](./.yarnrc.yml) 中配置（不推荐，不适用于多人协作），另一种方式是配置全局的 `~/.yarnrc.yml` 文件中配置（如不存在，则自建）：

```yml
npmAuthToken: ffffffff-ffff-ffff-ffff-ffffffffffff # Token
npmRegistryServer: "https://registry.npmjs.org/"

# 如果是私有域，需要配置：
npmScopes:
  lwz:
    npmAuthToken: ffffffff-ffff-ffff-ffff-ffffffffffff # Token
    npmRegistryServer: "http://lwz.test.com"

# 如果私有域是 http 协议，则必须
unsafeHttpWhitelist:
  - "*.test.com"
```

其中 Token 处需要替换为自己的，可在 `~/.npmrc` （需要先执行 npm login 或 nenpm login）中找到其中的 _authToken 的字段：

```rc
_authToken=ffffffff-ffff-ffff-ffff-ffffffffffff
//lwz.test.com/:_authToken=ffffffff-ffff-ffff-ffff-ffffffffffff
```

### 发布版本

以 [@lwz/hive-meta-data](./packages/hive-meta-data/README.md) 为例：

```bash
# 调整版本，也可直接修改 package.json 中的 version 字段
yarn meta version -i [patch | minor | major]
# 发布版本
yarn meta npm publish
```

> yarn meta 是 yarn workspace @lwz/hive-meta-data 的 alias，定义于工程根 [package.json](./package.json) 文件。其他 packages/* 中的子 package 也有类似定义。

## 一些问题

### lerna 和 yarn 2+ workspace 冲突

具体可查看 [issue](https://github.com/lerna/lerna/issues/2564) 和 对应的 [PR](https://github.com/lerna/lerna/pull/2450)

```bash
# 环境信息

yarn --version  # 3.0.0
lerna --version # 4.0.0
node --version  # 12.6.0
```

```json
// package.json
"dependencies": {
  "@lwz/hive-meta-data": "workspace:packages/hive-meta-data",
  "@lwz/hive-parser": "workspace:packages/hive-parser",
}
```

在此种情况下，lerna 命令会报错：

```bash
Lerna: ERR! Error: unsupported url type "workspace:": "workspace:*"
```

原因在于依赖 `npm-package-arg/npa.js` 下的 `fromURL` 方法不能兼容 `workspace:` 的版本前缀。目前工程内去除了 lerna，待 lerna 升级后可加回来。

## yarn 2+ 版本范围确定时不会考虑版本上的标签

具体情况可见[我的博文](http://liuwenzhuang.github.io/2021/08/27/yarn2-version-range-not-consider-version-tag.html)。
