---
name: uniapp-performance
description: uni-app / Vue3 性能优化：长列表、setData 体积、图片懒加载、首屏、内存泄漏。页面卡顿、白屏久、列表滚动掉帧时使用。
---
# 性能优化清单

1. **数据量**：小程序每次渲染层通信数据要小；不要把大对象（接口原始数据）全放响应式，只保留模板用到的字段；纯展示的大数组用 `shallowRef` / `markRaw`。
2. **长列表**：分页 + `onReachBottom`；超过数百条用虚拟列表（如 `z-paging` 的虚拟列表模式）或按页分组渲染；`:key` 用 id。
3. **图片**：`lazy-load`、CDN 压缩参数（宽度、webp）、指定宽高避免抖动。
4. **首屏**：骨架屏；接口并行 `Promise.all`；非关键请求放 `onReady` 之后；分包 + 预下载。
5. **频繁事件**：scroll/input 节流防抖；`page-scroll` 少用，用 `IntersectionObserver`（`uni.createIntersectionObserver`）。
6. **计算**：模板中不调用方法计算，用 computed；`v-show` 用于频繁切换，`v-if` 用于少切换。
7. **内存**：页面卸载清定时器、`uni.$off` 事件、关闭 socket、停止音视频。
8. **App 端**：nvue / `renderjs` 处理复杂动画和图表；启动页接口不阻塞。
9. **测量**：微信开发者工具 Audits（体验评分）、Performance 面板；H5 用 Lighthouse。
