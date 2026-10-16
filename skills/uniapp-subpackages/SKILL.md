---
name: uniapp-subpackages
description: uni-app 小程序分包与包体积优化。主包超过 2MB、新增业务模块、配置 pages.json subPackages / preloadRule 时使用。
---
# 分包与包体积

- 微信小程序：主包 ≤ 2MB，总包 ≤ 20MB（以官方当前限制为准）。
- 主包只放：tabBar 页、登录页、公共组件、核心 utils；其余业务按模块分包。
```json
{
  "pages": [{ "path": "pages/index/index" }, { "path": "pages/mine/mine" }],
  "subPackages": [
    { "root": "pkg-order", "pages": [{ "path": "list/list" }, { "path": "detail/detail" }] },
    { "root": "pkg-user",  "pages": [{ "path": "setting/setting" }] }
  ],
  "preloadRule": { "pages/index/index": { "network": "all", "packages": ["pkg-order"] } }
}
```
- manifest.json → `mp-weixin.optimization.subPackages: true`，让只被分包引用的组件/JS 打进分包。
- 分包内页面跳转路径写全：`/pkg-order/detail/detail?id=1`。
- 分包不能引用其他分包的资源；公共资源放主包。
- 检查体积：微信开发者工具 → 详情 → 代码依赖分析；去掉未用的 uView/echarts 全量引入（echarts 用自定义构建或 uCharts）。
- 静态图片 > 50KB 一律上 CDN。
