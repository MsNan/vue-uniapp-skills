---
name: uniapp-project-structure
description: Vue3 + Vite + TypeScript 的 uni-app 项目目录结构、命名规范、环境变量与 ESLint 约定。新建项目、新建页面/模块或整理目录时使用。
---
# 项目结构

```
src/
  api/            # 按业务模块：user.ts order.ts
  components/     # 全局通用组件（easycom 自动注册：components/xx/xx.vue）
  composables/    # useXxx.ts
  pages/          # 主包页面（tabBar、登录）
  pkg-*/          # 分包
  static/         # 小体积静态资源
  stores/         # Pinia
  styles/         # 变量、mixins
  types/          # 全局类型
  utils/          # request.ts、platform.ts、format.ts
  App.vue  main.ts  pages.json  manifest.json  uni.scss
.env.development / .env.production   # VITE_API_BASE=...
```
- 页面目录 kebab-case：`pages/order-detail/order-detail.vue`；组件 PascalCase 或 easycom 规则命名。
- 创建：`npx degit dcloudio/uni-preset-vue#vite-ts my-app`。
- 运行：`npm run dev:h5` / `dev:mp-weixin` / App 用 HBuilderX。
- 类型：`@dcloudio/types`、`@uni-helper/uni-app-types`（组件类型提示）。
- 平台差异统一放 `utils/platform.ts`，业务代码中尽量少出现条件编译。
