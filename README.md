<div align="center">

# vue-uniapp-skills

[![Test](https://github.com/MsNan/vue-uniapp-skills/actions/workflows/test.yml/badge.svg)](https://github.com/MsNan/vue-uniapp-skills/actions/workflows/test.yml)

**给 AI 编程助手装上“老 uni-app 开发者的经验”**

一套中文的 Vue3 + uni-app 技能包，支持 **Cursor Skills / Claude Code Skills / Trae Skills / Codex（AGENTS.md）**，一行命令装进项目。

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
npx -y github:MsNan/vue-uniapp-skills --tool cursor --global      # 装到 ~/.cursor/skills，所有项目可用
npx -y github:MsNan/vue-uniapp-skills --tool claude --global      # 装到 ~/.claude/skills，所有项目可用
npx -y github:MsNan/vue-uniapp-skills --tool trae --global        # 装到 ~/.trae/skills（国内版则为 ~/.trae-cn/skills）
npx -y github:MsNan/vue-uniapp-skills --tool trae,codex --skills uniapp-request,uniapp-login
npx -y github:MsNan/vue-uniapp-skills --list                     # 查看全部技能
```

| 工具 | 安装位置 | 生效方式 |
| --- | --- | --- |
| Cursor（`--tool cursor`） | `.cursor/skills/<name>/SKILL.md` | 按描述自动加载；源文件 `globs` 会写成官方 `paths`，只在匹配文件时出现 |
| Claude Code | `.claude/skills/<name>/SKILL.md` | 按描述自动加载 Skill |
| Trae | `.trae/skills/<name>/SKILL.md` | 按描述自动加载 Skill；加 `--global` 装到 `~/.trae/skills`（若本机只有国内版目录则用 `~/.trae-cn/skills`）。对照 [Trae 官方技能文档](https://docs.trae.ai/ide/skills)（国内版见 [docs.trae.cn](https://docs.trae.cn/ide_skills)） |
| Codex / 其他 Agent | `.agents/skills/` + `AGENTS.md` 索引 | 读取 AGENTS.md |

默认 `--tool all` **不会**再写入 `.cursor/skills`。按 [Cursor 官方文档](https://cursor.com/docs/skills)，Cursor 会兼容加载 `.claude/skills/` 和 `.agents/skills/`，再写一份 Cursor 技能会让同一套内容出现两次。只需 Cursor 时请用 `--tool cursor`（写入官方 `.cursor/skills/<name>/SKILL.md`；加 `--global` 则装到 `~/.cursor/skills`）。若仓库里同时有 `.claude/skills` 和 `.agents/skills`，Cursor 仍可能把同一技能显示两次（Claude Code 与 Codex 各自需要自己的目录，目前无法完全避免）；主要用 Cursor 时建议只装 `--tool cursor`。以前用本安装器写过 `.cursor/rules/*.mdc` 的，可以自行删掉以免和技能重复，安装器不会自动删除。以前把 Trae 技能写到 `.trae/rules/*.md` 的，也请自行删掉以免和官方 `.trae/skills` 重复，安装器同样不会自动删除。Trae 还可以在设置里开启「启用 .agents 技能目录」后加载 `.agents/skills/`；若与 `.trae/skills/` 重名，以 `.trae/skills/` 为准。

已存在的文件默认跳过，加 `--force` 覆盖；重复执行只会更新 `AGENTS.md` 中本工具自己的区块。

### 用 Cursor 插件导入（可选）

对照 [Cursor 官方插件文档](https://cursor.com/docs/reference/plugins)，仓库根目录提供了 `.cursor-plugin/plugin.json` 和 `.cursor-plugin/marketplace.json`。这是单插件仓库，`source` 为 `.`，技能仍放在 `skills/`，上面的 `npx` 安装器路径不变。

- **推荐**：继续用 `npx` 安装器，同时支持 Cursor / Claude Code / Trae / Codex。
- **Teams / Enterprise**：Dashboard → Plugins & MCPs → Add Marketplace → Import from Repo，粘贴 `https://github.com/MsNan/vue-uniapp-skills`，再在 Customize 里安装。
- 尚未提交到官方 Cursor Marketplace（提交需要官方审核，需要的话可以再做）。

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
skills/<技能名>/SKILL.md          # 唯一的源文件（YAML 头 + Markdown 正文）
.cursor-plugin/plugin.json       # Cursor 插件清单（默认发现 skills/）
.cursor-plugin/marketplace.json  # 单插件市场清单，source 为 "."
bin/cli.js                       # 安装器，零依赖
bin/check.js                     # 技能格式 + 插件清单校验
test/                            # node:test 测试（npm test，含 install.sh 离线端到端测试）
install.sh                       # curl 安装入口
```

想加技能：在 `skills/` 下新建目录写 `SKILL.md`（必须包含 `name` 和 `description`，可选 `globs`）。安装器会转换成各工具的格式：Cursor 把 `globs` 写成官方 `paths` 列表，没有 `globs` 则不写该字段（Windows 的 CRLF 换行也能识别）。提交前跑一下 `npm test`。欢迎 PR 和 Issue。

重复用 `--skills` 分批安装时，`AGENTS.md` 里的技能索引会累积合并，不会覆盖之前装过的；你自己写在 `AGENTS.md` 里的内容不会被改动。如果本工具的区块标记被删了一半或出现多次，安装会直接报错退出、一个文件都不写，请手动清理残留标记后重试（代码块里举例写的标记不受影响）。

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
