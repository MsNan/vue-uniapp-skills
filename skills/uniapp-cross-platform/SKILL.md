---
name: uniapp-cross-platform
description: uni-app 跨端（H5 / 微信小程序 / App）开发与条件编译规范及常见坑。编写 uni-app 页面、组件、pages.json、manifest.json 时使用。
globs: "**/*.vue,**/pages.json,**/manifest.json"
---
# uni-app 跨端规范

## 条件编译
```vue
<!-- #ifdef MP-WEIXIN -->
<button open-type="getPhoneNumber" @getphonenumber="onPhone">手机号登录</button>
<!-- #endif -->
<!-- #ifdef H5 || APP-PLUS -->
<SmsLogin />
<!-- #endif -->
```
- JS 用 `// #ifdef`，CSS 用 `/* #ifdef */`；平台标识：`H5`、`MP-WEIXIN`、`MP-ALIPAY`、`APP-PLUS`（App，Vue3 也可用 `APP`）、`MP`（所有小程序）。
- 平台差异大时拆文件：`login.mp-weixin.vue` 不可行，应拆成 `platform/xxx.ts` 统一导出，业务层只调统一接口。

## 必知的坑
1. **只用 uni API**：`uni.request / uni.setStorageSync / uni.navigateTo`，不要用 `window`、`document`、`localStorage`、`axios`（小程序无 XHR）。
2. **标签**：用 `view/text/image`，不用 `div/span/img`；纯文本必须包在 `<text>` 中，App 端否则可能不显示。
3. **单位**：用 `rpx`（750 设计稿 1:1），1px 边框用 `1px` 不要用 rpx。
4. **样式**：小程序不支持 `*` 选择器、标签名选择器受限；组件样式穿透用 `:deep()`；`page` 代替 `body`。
5. **路由**：tabBar 页面只能 `uni.switchTab`；页面栈最多 10 层，深层跳转用 `redirectTo`；传参需 `encodeURIComponent(JSON.stringify(obj))`。
6. **生命周期**：页面级用 `onLoad/onShow/onReachBottom/onPullDownRefresh`（从 `@dcloudio/uni-app` 导入），组件里拿不到 onLoad。
7. **图片**：本地静态图放 `static/`，小程序包体 2MB 限制，大图走 CDN；`image` 默认 320×240，记得设 `mode="aspectFill"` 和宽高。
8. **安全区**：底部按钮加 `padding-bottom: env(safe-area-inset-bottom)`。
9. **H5 跨域**：开发期 `manifest.json → h5.devServer.proxy` 或 vite proxy，生产走同域/后端 CORS。
10. **v-html**：小程序用 `rich-text`，不支持事件和复杂样式。

## 输出要求
生成代码时注明哪些平台测试过，涉及平台独有能力必须加条件编译和降级方案。
