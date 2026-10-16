---
name: uniapp-request
description: 基于 uni.request 的 TypeScript 请求封装：baseURL、拦截、统一错误、loading、401 自动刷新 token / 跳转登录、并发去重。新建或修改 api 层时使用。
---
# 请求封装（含 401 处理）

`utils/request.ts`：
```ts
import { useUserStore } from '@/stores/user'
const BASE_URL = import.meta.env.VITE_API_BASE
interface Res<T> { code: number; data: T; msg: string }
interface Opt extends Omit<UniApp.RequestOptions, 'success' | 'fail'> { loading?: boolean; retried?: boolean }

let refreshing: Promise<boolean> | null = null
async function refreshToken(): Promise<boolean> {
  const user = useUserStore()
  if (!user.refreshToken) return false
  refreshing ||= new Promise<boolean>((resolve) => {
    uni.request({
      url: BASE_URL + '/auth/refresh', method: 'POST', data: { refreshToken: user.refreshToken },
      success: (r: any) => { if (r.statusCode === 200 && r.data.code === 0) { user.setToken(r.data.data); resolve(true) } else resolve(false) },
      fail: () => resolve(false),
    })
  }).finally(() => { refreshing = null })
  return refreshing
}

let toLogin = false
function gotoLogin() {
  if (toLogin) return
  toLogin = true
  useUserStore().logout()
  const pages = getCurrentPages(); const cur = pages[pages.length - 1]
  uni.navigateTo({ url: '/pages/login/login?redirect=' + encodeURIComponent('/' + (cur?.route ?? '')), complete: () => (toLogin = false) })
}

export function request<T = unknown>(opt: Opt): Promise<T> {
  const user = useUserStore()
  if (opt.loading) uni.showLoading({ title: '加载中', mask: true })
  return new Promise<T>((resolve, reject) => {
    uni.request({
      timeout: 15000, ...opt,
      url: /^https?:/.test(opt.url) ? opt.url : BASE_URL + opt.url,
      header: { 'Content-Type': 'application/json', ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}), ...opt.header },
      success: async (res) => {
        const body = res.data as Res<T>
        if (res.statusCode === 401) {
          if (!opt.retried && (await refreshToken())) return resolve(request<T>({ ...opt, retried: true }))
          gotoLogin(); return reject(new Error('未登录'))
        }
        if (res.statusCode >= 200 && res.statusCode < 300 && body.code === 0) return resolve(body.data)
        uni.showToast({ title: body?.msg || `请求失败(${res.statusCode})`, icon: 'none' })
        reject(body)
      },
      fail: (err) => { uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' }); reject(err) },
      complete: () => opt.loading && uni.hideLoading(),
    })
  })
}
export const http = {
  get: <T>(url: string, data?: object, o?: Partial<Opt>) => request<T>({ url, data, method: 'GET', ...o }),
  post: <T>(url: string, data?: object, o?: Partial<Opt>) => request<T>({ url, data, method: 'POST', ...o }),
}
```
要点：
- 并发 401 只刷新一次（共享 `refreshing` Promise），刷新失败只跳一次登录页。
- 业务 api 按模块放 `api/order.ts`，函数返回明确类型：`export const getOrder = (id: string) => http.get<Order>(\`/order/${id}\`)`。
- 小程序需在后台配置 request 合法域名（https）；上传用 `uni.uploadFile` 单独封装。
- 不要用 axios（小程序无 XHR，除非装适配器）。
