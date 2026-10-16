<div align="center">

# vue-uniapp-skills

**给 AI 编程助手装上“老 uni-app 开发者的经验”**

一套中文的 Vue3 + uni-app 技能包，支持 **Cursor Rules / Claude Code Skills / Trae Rules / Codex（AGENTS.md）**，一行命令装进项目。

![license](https://img.shields.io/badge/license-MIT-green) ![skills](https://img.shields.io/badge/skills-12-blue) ![node](https://img.shields.io/badge/node-%3E%3D16-brightgreen)

</div>

## 为什么需要它

AI 写 uni-app 代码经常踩这些坑：

- 用 `axios`、`localStorage`、`div`，到小程序里直接报错
- 忘了条件编译，H5 能跑、小程序白屏
- 401 处理一团乱，并发请求一起跳登录页
- 主包超过 2MB 传不上去，不知道怎么分包
- 提交审核才发现隐私协议、类目、权限没处理

这个技能包把这些规范和流程写成 AI 能读懂的规则，让它**一开始就写对**。

## 一行安装

在你的 uni-app 项目根目录执行：

```bash
# 推荐：npx（需要 Node.js >= 16）
npx -y github:MsNan/vue-uniapp-skills

# 或者 curl
curl -fsSL https://raw.githubusercontent.com/MsNan/vue-uniapp-skills/main/install.sh | bash
```

只装给某个工具，或只装部分技能：

```bash
npx -y github:MsNan/vue-uniapp-skills --tool cursor
npx -y github:MsNan/vue-uniapp-skills --tool claude --global      # 装到 ~/.claude/skills，所有项目可用
npx -y github:MsNan/vue-uniapp-skills --tool trae,codex --skills uniapp-request,uniapp-login
npx -y github:MsNan/vue-uniapp-skills --list                     # 查看全部技能
```

| 工具 | 安装位置 | 生效方式 |
| --- | --- | --- |
| Cursor | `.cursor/rules/*.mdc` | 按描述 / 文件匹配自动引用 |
| Claude Code | `.claude/skills/<name>/SKILL.md` | 按描述自动加载 Skill |
| Trae | `.trae/rules/*.md` | 项目规则 |
| Codex / 其他 Agent | `.agents/skills/` + `AGENTS.md` 索引 | 读取 AGENTS.md |

已存在的文件默认跳过，加 `--force` 覆盖；重复执行只会更新 `AGENTS.md` 中本工具自己的区块。

## 技能列表

| 技能 | 内容 |
| --- | --- |
| `vue3-composition` | `<script setup>` + TS 规范、defineProps/defineModel、ref/reactive、composable |
| `uniapp-cross-platform` | H5 / 小程序 / App 条件编译、10 个最常见跨端坑 |
| `uniapp-project-structure` | 目录结构、命名、环境变量、类型提示 |
| `uniapp-request` | uni.request 封装：统一错误、loading、**401 自动刷新 token + 并发去重** |
| `pinia-store` | setup store、持久化到 uni storage、storeToRefs |
| `uniapp-login` | 小程序 code 登录 + 手机号、H5、App 一键登录、登录拦截与回跳 |
| `uniapp-payment` | 小程序 / App / H5 支付、以服务端结果为准、防重复 |
| `uniapp-permissions` | 定位、相机等授权，被拒引导，隐私协议与 App 商店合规 |
| `uniapp-subpackages` | 分包、预下载、包体积优化 |
| `uniapp-ui-libs` | uni-ui / uView Plus 的 easycom 配置与坑 |
| `uniapp-performance` | 长列表、数据体积、图片、首屏、内存泄漏 |
| `release-checklist` | 小程序 / App 发版与审核自查、常见驳回原因 |

## 效果示例

装好后，对 AI 说：

> 帮我写一个请求封装，token 过期要自动刷新

**没装技能时**，AI 往往给你：`axios.create(...)` + `localStorage.getItem('token')`，到小程序里直接报错。

**装了技能后**，AI 会按 `uniapp-request` 来写：基于 `uni.request`、token 放在 Pinia 和 `uni.setStorageSync`、并发 401 只刷新一次、刷新失败跳登录页并带 `redirect` 回跳。

再比如：

> 加一个“附近门店”页面

AI 会自动参考 `uniapp-permissions`：在 manifest 里声明 `getLocation`，先 `getSetting` 再 `authorize`，用户拒绝时引导去设置页；并把页面放进分包。

## 目录结构

```
skills/<技能名>/SKILL.md   # 唯一的源文件（YAML 头 + Markdown 正文）
bin/cli.js                 # 安装器，零依赖
install.sh                 # curl 安装入口
```

想加技能：在 `skills/` 下新建目录写 `SKILL.md`（必须包含 `name` 和 `description`，可选 `globs`），安装器会自动转换成各工具的格式。欢迎 PR 和 Issue。

## 作者

**Theo（涛哥）**：2018 年开始做前端，主要写 Vue3、uni-app 和 Node。

- 博客：[msnan.github.io](https://msnan.github.io)
- 公众号：程序员项目库

## License

[MIT](./LICENSE)

## ☕ 打赏支持

如果这个项目帮你少踩了坑，欢迎请我喝杯咖啡，也欢迎点个 ⭐ Star。

<table>
  <tr>
    <td align="center"><img src="docs/donate/wechat.jpg" width="220" alt="微信赞赏"><br>微信</td>
    <td align="center"><img src="docs/donate/alipay.jpg" width="220" alt="支付宝"><br>支付宝</td>
  </tr>
</table>
