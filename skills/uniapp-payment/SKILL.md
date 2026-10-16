---
name: uniapp-payment
description: uni-app 支付流程（微信小程序支付、App 微信/支付宝支付、H5 支付）及订单状态确认。实现下单、支付、支付结果页时使用。
---
# 支付流程

## 统一原则
1. 前端只传 **订单 ID**，金额、商品由后端计算；签名全部在后端完成，商户密钥绝不放前端。
2. **以服务端回调为准**：前端 `success` 只代表用户操作完成，结果页要轮询后端订单状态（如 2s 一次，最多 5 次）。
3. 防重复点击：按钮 loading + 后端幂等（同一订单只发起一次预支付）。

## 小程序
```ts
const p = await api.createPrepay({ orderId }) // 后端返回 timeStamp/nonceStr/package/signType/paySign
try {
  await uni.requestPayment({ provider: 'wxpay', ...p })
  await pollOrder(orderId)
} catch (e: any) {
  if (e.errMsg?.includes('cancel')) uni.showToast({ title: '已取消支付', icon: 'none' })
  else uni.showToast({ title: '支付失败', icon: 'none' })
}
```
- 小程序需已认证、开通微信支付并与商户号关联。

## App
- manifest 勾选 Payment 模块；`uni.requestPayment({ provider: 'wxpay' | 'alipay', orderInfo })`，`orderInfo` 由后端生成。

## H5
- 微信内：JSAPI 支付（需公众号 openid）；微信外：H5 支付跳转 `mweb_url`，返回后在结果页查询订单。

## 合规
- 虚拟商品在 iOS 小程序/App 内支付受平台规则限制，提前确认；不要引导用户绕过平台支付。
