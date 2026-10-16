---
name: pinia-store
description: Pinia 状态管理规范（setup store 写法、持久化到 uni storage、storeToRefs、模块划分）。新建或修改 stores/ 时使用。
globs: "**/stores/**/*.ts"
---
# Pinia 规范

```ts
// stores/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
export const useUserStore = defineStore('user', () => {
  const token = ref(uni.getStorageSync('token') || '')
  const refreshToken = ref(uni.getStorageSync('refreshToken') || '')
  const info = ref<UserInfo | null>(null)
  const isLogin = computed(() => !!token.value)
  function setToken(t: { token: string; refreshToken?: string }) {
    token.value = t.token; uni.setStorageSync('token', t.token)
    if (t.refreshToken) { refreshToken.value = t.refreshToken; uni.setStorageSync('refreshToken', t.refreshToken) }
  }
  function logout() { token.value = ''; refreshToken.value = ''; info.value = null; uni.removeStorageSync('token'); uni.removeStorageSync('refreshToken') }
  return { token, refreshToken, info, isLogin, setToken, logout }
})
```
- 统一用 setup store；一个领域一个 store（user / cart / app），不要做一个巨型全局 store。
- 组件中解构用 `storeToRefs(store)`，方法直接从 store 取。
- 持久化：小数据手动写 `uni.setStorageSync`，或用 `pinia-plugin-persistedstate` 并把 storage 配置为 `{ getItem: uni.getStorageSync, setItem: uni.setStorageSync }`（不要用 localStorage）。
- uni-app Vue3 中在 `main.ts` 的 `createSSRApp` 里 `app.use(createPinia())`。
- store 里不要直接操作页面跳转/UI，交给调用方（logout 除外可通过事件）。
