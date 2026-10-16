---
name: uniapp-ui-libs
description: uni-ui 与 uView Plus（uview-plus）组件库的安装、easycom 按需引入、主题定制与常见坑。使用 uni-ui / uView 组件时使用。
---
# uni-ui / uView Plus 使用

## uni-ui（官方，推荐优先）
- `npm i @dcloudio/uni-ui`，pages.json 配 easycom：
```json
"easycom": { "autoscan": true, "custom": { "^uni-(.*)": "@dcloudio/uni-ui/lib/uni-$1/uni-$1.vue" } }
```
- 常用：`uni-forms`（表单校验）、`uni-popup`、`uni-list`、`uni-data-select`、`uni-load-more`、`uni-icons`。
- `uni-forms` 校验：`rules` + `ref.validate()`，每个字段 `uni-forms-item` 必须带 `name`。

## uView Plus（Vue3 版 uView，`uview-plus`）
- `npm i uview-plus dayjs clipboard`；main.ts `app.use(uviewPlus)`；uni.scss `@import 'uview-plus/theme.scss'`；App.vue `<style lang="scss">@import 'uview-plus/index.scss';</style>`。
- easycom：`"^u--(.*)": "uview-plus/components/u-$1/u-$1.vue", "^up-(.*)": "uview-plus/components/u-$1/u-$1.vue", "^u-([^-].*)": "uview-plus/components/u-$1/u-$1.vue"`。
- 注意：uView 1.x/2.x 只支持 Vue2，Vue3 项目必须用 uview-plus；不要两个库的同名组件混用。

## 通用
- 只用一个主组件库，另一个只补缺；不要全量注册。
- 主题色统一放 `uni.scss` 变量；暗色模式用 CSS 变量。
- 版本以官方文档为准，升级前看 changelog。
