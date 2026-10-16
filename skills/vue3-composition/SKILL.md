---
name: vue3-composition
description: Vue3 组合式 API 编码规范。编写或重构 .vue / composable 文件时使用：<script setup lang="ts">、defineProps/defineEmits 类型、ref/reactive 选择、computed/watch、composable 拆分。
globs: "**/*.vue,**/composables/**/*.ts"
---
# Vue3 组合式 API 规范

## 必须
- 一律 `<script setup lang="ts">`，顺序：import → props/emits → 状态 → computed → watch → 方法 → 生命周期。
- Props 用类型声明 + `withDefaults`；Vue ≥3.5 可直接解构 props（响应式解构）。
```ts
const props = withDefaults(defineProps<{ title: string; size?: 'sm' | 'md' }>(), { size: 'md' })
const emit = defineEmits<{ change: [value: string]; close: [] }>()
const model = defineModel<string>({ default: '' }) // v-model 双向绑定
```
- 基本类型和需要整体替换的对象用 `ref`；不要解构 `reactive`（会丢响应式），需要时用 `toRefs`。
- 派生数据用 `computed`，不要用 `watch` 去同步赋值。
- `watch` 监听 props 字段要写 getter：`watch(() => props.id, load, { immediate: true })`。
- 逻辑复用抽到 `composables/useXxx.ts`，返回 ref，命名 `useXxx`，内部自己清理副作用（`onUnmounted` / `onScopeDispose`）。

## 禁止
- 混用 Options API；在模板里写复杂表达式（超过一个三元就抽 computed）。
- `v-if` 与 `v-for` 同一元素；`v-for` 不写稳定 `:key`（禁止用 index 作为可变列表的 key）。
- 直接修改 props；用 `any` 逃避类型。

## 自检清单
- [ ] 每个组件 < 300 行，超出拆子组件或 composable
- [ ] 异步函数都有 loading / error 状态
- [ ] 定时器、事件监听在卸载时清除
