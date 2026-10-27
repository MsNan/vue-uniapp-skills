'use strict'
const test = require('node:test')
const assert = require('node:assert')
const fs = require('fs')
const os = require('os')
const path = require('path')
const { execFileSync, spawnSync } = require('child_process')
const { parseArgs, install, listSkills, parseSkill, CliError } = require('../bin/cli')

const CLI = path.join(__dirname, '..', 'bin', 'cli.js')
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'vus-'))

test('parseArgs 解析参数，缺值/未知参数报错而不是崩溃', () => {
  const o = parseArgs(['-t', 'claude,cursor', '-s', 'uniapp-login', '-f', '-d', 'x'], '/base')
  assert.strictEqual(o.tool, 'claude,cursor')
  assert.deepStrictEqual(o.skills, ['uniapp-login'])
  assert.strictEqual(o.force, true)
  assert.strictEqual(o.dir, path.resolve('/base', 'x'))
  assert.throws(() => parseArgs(['-d']), CliError)
  assert.throws(() => parseArgs(['--skills']), CliError)
  assert.throws(() => parseArgs(['--tool', '--force']), CliError)
  assert.throws(() => parseArgs(['--nope']), CliError)
})

test('全量安装写入四种工具的文件', () => {
  const dir = tmp()
  const s = install({ tool: 'all', skills: null, dir, force: false })
  const n = listSkills().length
  assert.strictEqual(s.skipped.length, 0)
  assert.strictEqual(s.written.length, n * 4 + 1)
  const claude = fs.readFileSync(path.join(dir, '.claude/skills/uniapp-request/SKILL.md'), 'utf8')
  assert.match(claude, /^---\nname: uniapp-request\ndescription: ".+"\n---\n/)
  assert.ok(fs.existsSync(path.join(dir, '.trae/rules/uniapp-login.md')))
  assert.ok(fs.existsSync(path.join(dir, '.agents/skills/pinia-store/SKILL.md')))
})

test('Cursor 规则：globs 保持 Cursor 原生写法（不加引号、逗号分隔），没有 globs 时留空', () => {
  const dir = tmp()
  install({ tool: 'cursor', skills: ['vue3-composition', 'uniapp-login'], dir })
  const mdc = fs.readFileSync(path.join(dir, '.cursor/rules/vue3-composition.mdc'), 'utf8')
  assert.match(mdc, /^---\ndescription: ".+"\nglobs: \*\*\/\*\.vue,\*\*\/composables\/\*\*\/\*\.ts\nalwaysApply: false\n---\n/)
  const login = fs.readFileSync(path.join(dir, '.cursor/rules/uniapp-login.mdc'), 'utf8')
  assert.match(login, /\nglobs:\nalwaysApply: false\n/)
})

test('已存在文件默认跳过，--force 覆盖', () => {
  const dir = tmp()
  const f = path.join(dir, '.claude/skills/uniapp-login/SKILL.md')
  fs.mkdirSync(path.dirname(f), { recursive: true })
  fs.writeFileSync(f, 'mine')
  let s = install({ tool: 'claude', skills: ['uniapp-login'], dir, force: false })
  assert.deepStrictEqual(s.skipped, [f])
  assert.strictEqual(fs.readFileSync(f, 'utf8'), 'mine')
  install({ tool: 'claude', skills: ['uniapp-login'], dir, force: true })
  assert.notStrictEqual(fs.readFileSync(f, 'utf8'), 'mine')
})

test('-s 分批安装：AGENTS.md 保留用户内容，索引累积、去重、排序，内容不变时不重写', () => {
  const dir = tmp()
  const f = path.join(dir, 'AGENTS.md')
  fs.writeFileSync(f, '# 我的项目规则\n不要改 dist\n')
  install({ tool: 'codex', skills: ['uniapp-request'], dir })
  install({ tool: 'codex', skills: ['pinia-store'], dir })
  let txt = fs.readFileSync(f, 'utf8')
  assert.ok(txt.startsWith('# 我的项目规则\n不要改 dist\n'))
  assert.strictEqual(txt.match(/vue-uniapp-skills:start/g).length, 1)
  assert.match(txt, /`uniapp-request`/)
  assert.match(txt, /`pinia-store`/)
  fs.utimesSync(f, new Date(1000), new Date(1000))
  const s = install({ tool: 'codex', skills: ['pinia-store'], dir })
  assert.strictEqual(s.written.length, 0)
  assert.strictEqual(fs.statSync(f).mtimeMs, 1000)
  install({ tool: 'codex', skills: ['pinia-store', 'uniapp-login'], dir, force: true })
  txt = fs.readFileSync(f, 'utf8')
  const order = [...txt.matchAll(/^- `([a-z0-9-]+)`/gm)].map(m => m[1])
  assert.deepStrictEqual(order, ['pinia-store', 'uniapp-login', 'uniapp-request'])
})

test('CRLF 换行的 SKILL.md 也能解析 frontmatter，输出不带 \\r', () => {
  const src = tmp(), dir = tmp()
  fs.mkdirSync(path.join(src, 'demo-skill'))
  fs.writeFileSync(path.join(src, 'demo-skill', 'SKILL.md'), '---\r\nname: demo-skill\r\ndescription: Windows 下编辑的技能，测试时使用\r\nglobs: "**/*.vue"\r\n---\r\n正文\r\n')
  const { meta } = parseSkill(path.join(src, 'demo-skill', 'SKILL.md'))
  assert.strictEqual(meta.name, 'demo-skill')
  assert.strictEqual(meta.globs, '**/*.vue')
  install({ tool: 'claude,cursor', skills: null, dir }, { skillsDir: src })
  const out = fs.readFileSync(path.join(dir, '.claude/skills/demo-skill/SKILL.md'), 'utf8')
  assert.ok(!out.includes('\r'))
  assert.match(out, /^---\nname: demo-skill\ndescription: "Windows 下编辑的技能，测试时使用"\n---\n正文\n$/)
})

test('description 以 YAML 双引号字符串写出，含冒号、引号、# 也不破坏 frontmatter', () => {
  const src = tmp(), dir = tmp()
  fs.mkdirSync(path.join(src, 'demo-skill'))
  fs.writeFileSync(path.join(src, 'demo-skill', 'SKILL.md'), '---\nname: demo-skill\ndescription: 用法: 写 <script setup lang="ts"> #1 时使用\n---\n正文\n')
  install({ tool: 'claude,cursor', skills: null, dir }, { skillsDir: src })
  for (const f of ['.claude/skills/demo-skill/SKILL.md', '.cursor/rules/demo-skill.mdc']) {
    const line = fs.readFileSync(path.join(dir, f), 'utf8').split('\n').find(l => l.startsWith('description:'))
    assert.strictEqual(JSON.parse(line.slice('description:'.length).trim()), '用法: 写 <script setup lang="ts"> #1 时使用')
  }
})

test('--global 把 Claude 技能装到 home 目录；非法技能/工具报错', () => {
  const dir = tmp(), home = tmp()
  install({ tool: 'claude', skills: ['uniapp-login'], dir, global: true }, { home })
  assert.ok(fs.existsSync(path.join(home, '.claude/skills/uniapp-login/SKILL.md')))
  assert.ok(!fs.existsSync(path.join(dir, '.claude')))
  assert.throws(() => install({ tool: 'all', skills: ['nope'], dir: tmp() }), /不存在的技能/)
  assert.throws(() => install({ tool: 'vscode', dir: tmp() }), /不支持的工具/)
})

test('命令行：软链接调用（模拟 npx）可运行，-d 缺值时报错退出码 1', () => {
  const dir = tmp()
  const link = path.join(tmp(), 'vue-uniapp-skills')
  fs.symlinkSync(CLI, link)
  const out = execFileSync(process.execPath, [link, '-t', 'trae', '-d', dir], { encoding: 'utf8' })
  assert.match(out, /已写入 \d+ 个文件/)
  assert.ok(fs.existsSync(path.join(dir, '.trae/rules/uniapp-request.md')))
  for (const args of [['--bad'], ['-d']]) {
    const r = spawnSync(process.execPath, [CLI, ...args], { encoding: 'utf8' })
    assert.strictEqual(r.status, 1)
    assert.doesNotMatch(r.stderr, /TypeError|at /)
  }
  assert.match(execFileSync(process.execPath, [CLI, '--list'], { encoding: 'utf8' }), /uniapp-payment/)
})
