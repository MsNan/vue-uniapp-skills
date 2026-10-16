---
name: uniapp-permissions
description: uni-app 权限申请（定位、相机、相册、录音、通知、蓝牙）及隐私协议合规。调用需要授权的 API 或处理用户拒绝授权时使用。
---
# 权限与隐私

## 小程序流程
1. 在 `manifest.json → mp-weixin.permission / requiredPrivateInfos` 声明（如 `getLocation`、`chooseLocation`），并在小程序后台完善《用户隐私保护指引》。
2. 先 `uni.getSetting` 判断，未授权再 `uni.authorize`；被拒后只能引导 `uni.openSetting`。
```ts
export async function ensureScope(scope: string, tip: string) {
  const { authSetting } = await uni.getSetting()
  if (authSetting[scope]) return true
  if (authSetting[scope] === false) {
    const { confirm } = await uni.showModal({ title: '需要授权', content: tip, confirmText: '去设置' })
    if (!confirm) return false
    const r = await uni.openSetting()
    return !!r.authSetting[scope]
  }
  try { await uni.authorize({ scope }); return true } catch { return false }
}
```
3. 隐私接口受隐私协议限制时，使用 `<button open-type="agreePrivacyAuthorization">` 或 `uni.onNeedPrivacyAuthorization` 弹窗。

## App 端
- Android 在 manifest 勾选权限，并在**首次启动弹隐私政策**、同意前不初始化任何 SDK（应用商店审核必查）。
- 申请权限前先弹“为什么需要”说明（华为/小米等商店要求），用 `plus.android.requestPermissions` 或 uni 官方权限判断方案。
- iOS 在 manifest 填写各 `NSxxxUsageDescription`，文案写清用途。

## 原则
按需申请、用到再申请；拒绝后功能降级而不是卡死；不要启动就索要全部权限。
