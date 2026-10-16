---
name: uniapp-login
description: uni-app 多端登录流程（微信小程序 wx.login + 手机号、H5 短信/微信网页授权、App 一键登录/微信登录），token 存储与登录态守卫。实现登录、退出、未登录拦截时使用。
---
# 登录流程

## 微信小程序
```ts
// 1. 拿 code（每次登录都要重新取，5 分钟有效、只能用一次）
const { code } = await uni.login({ provider: 'weixin' })
// 2. 后端用 code 调 jscode2session 换 openid/session_key，签发自己的 token
const { token, userInfo } = await api.wxLogin({ code })
```
- 手机号：`<button open-type="getPhoneNumber" @getphonenumber="e => api.bindPhone(e.detail.code)">`，后端用 code 换手机号。session_key 绝不下发前端。
- 头像昵称：用 `open-type="chooseAvatar"` + `<input type="nickname">`（getUserProfile 已不再返回真实信息）。
- 必须先展示并勾选《用户协议》《隐私政策》再允许登录。

## H5 / App
- H5：短信验证码登录；公众号内用网页授权（跳转 → 回调页拿 code）。
- App：uni 一键登录（univerify）或微信 App 登录（需开放平台 AppID），都要配置 manifest 模块。

## token 与守卫
- `uni.setStorageSync('token', t)`；放入 Pinia `useUserStore`，持久化。
- 路由守卫：`uni.addInterceptor('navigateTo', { invoke(args) { if (needLogin(args.url) && !token()) { uni.navigateTo({ url: '/pages/login/login?redirect=' + encodeURIComponent(args.url) }); return false } } })`，同时拦截 `redirectTo/reLaunch/switchTab`。
- 登录成功后按 `redirect` 返回原页面；退出登录清 store + storage 并 `reLaunch` 到首页。
- 401 处理见 `uniapp-request` 技能。
