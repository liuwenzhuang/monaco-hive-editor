# monaco-hive-editor

## lerna 和 yarn 2+ workspace 冲突

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

原因在于依赖 `npm-package-arg/npa.js` 下的 `fromURL` 方法不能兼容 `workspace:` 的版本前缀。

## yarn 2+ 版本范围确定时不会考虑版本上的标签

具体情况可见[我的博文](http://liuwenzhuang.github.io/2021/08/27/yarn2-version-range-not-consider-version-tag.html)。
