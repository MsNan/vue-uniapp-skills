'use strict'
// install.sh（curl | bash 入口）的端到端测试：用 PATH 里的假 curl 返回本地仓库打包的 tarball，
// 不联网，验证参数透传、文件写入、临时目录清理、下载失败时非零退出。
const test = require('node:test')
const assert = require('node:assert')
const fs = require('fs')
const os = require('os')
const path = require('path')
const { spawnSync, execFileSync } = require('child_process')

const ROOT = path.join(__dirname, '..')
const SCRIPT = path.join(ROOT, 'install.sh')
const hasBash = spawnSync('bash', ['-c', 'command -v tar'], { encoding: 'utf8' }).status === 0
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'vus-sh-'))

// 模拟 codeload 的 tarball：顶层目录 vue-uniapp-skills-main/
function makeTarball() {
  const stage = tmp()
  const top = path.join(stage, 'vue-uniapp-skills-main')
  fs.mkdirSync(top)
  for (const p of ['bin', 'skills', 'package.json']) fs.cpSync(path.join(ROOT, p), path.join(top, p), { recursive: true })
  const tgz = path.join(stage, 'main.tar.gz')
  execFileSync('tar', ['-czf', tgz, '-C', stage, 'vue-uniapp-skills-main'])
  return tgz
}

// 假 curl：记录参数，按 MODE 输出 tarball 或失败
function fakeBin(tgz, mode) {
  const bin = tmp()
  const log = path.join(bin, 'curl.log')
  fs.writeFileSync(path.join(bin, 'curl'),
    `#!/usr/bin/env bash\necho "$@" >> "${log}"\n` +
    (mode === 'fail' ? 'echo "curl: (22) 404" >&2\nexit 22\n' : `cat "${tgz}"\n`))
  fs.chmodSync(path.join(bin, 'curl'), 0o755)
  return { bin, log }
}

function run(args, { mode = 'ok', cwd } = {}) {
  const { bin, log } = fakeBin(makeTarball(), mode)
  const tmpRoot = tmp() // 让 mktemp 落在这里，便于检查是否清理
  const r = spawnSync('bash', [SCRIPT, ...args], {
    cwd, encoding: 'utf8',
    env: { ...process.env, PATH: bin + path.delimiter + process.env.PATH, TMPDIR: tmpRoot }
  })
  return { ...r, log: fs.existsSync(log) ? fs.readFileSync(log, 'utf8') : '', tmpRoot }
}

test('install.sh：下载 main 分支 tarball 并把参数透传给 cli，结束后清理临时目录', { skip: !hasBash && '无 bash/tar' }, () => {
  const proj = tmp()
  const r = run(['--tool', 'cursor', '--skills', 'uniapp-login'], { cwd: proj })
  assert.strictEqual(r.status, 0, r.stderr)
  assert.match(r.log, /codeload\.github\.com\/MsNan\/vue-uniapp-skills\/tar\.gz\/refs\/heads\/main/)
  assert.ok(fs.existsSync(path.join(proj, '.cursor/rules/uniapp-login.mdc')))
  assert.ok(!fs.existsSync(path.join(proj, '.claude')), '只装 cursor 时不应写 claude 目录')
  assert.deepStrictEqual(fs.readdirSync(r.tmpRoot), [], '临时目录应被 trap 清理')
})

test('install.sh：不带参数时与 npx 默认一致（四种工具全装）', { skip: !hasBash && '无 bash/tar' }, () => {
  const proj = tmp()
  const r = run([], { cwd: proj })
  assert.strictEqual(r.status, 0, r.stderr)
  for (const p of ['.cursor/rules', '.claude/skills', '.trae/rules', '.agents/skills'])
    assert.ok(fs.existsSync(path.join(proj, p)), p)
})

test('install.sh：下载失败时非零退出、不写任何文件', { skip: !hasBash && '无 bash/tar' }, () => {
  const proj = tmp()
  const r = run(['--tool', 'cursor'], { mode: 'fail', cwd: proj })
  assert.notStrictEqual(r.status, 0)
  assert.match(r.stderr, /下载失败/)
  assert.deepStrictEqual(fs.readdirSync(proj), [])
})

test('install.sh：cli 参数错误时把非零退出码传出来', { skip: !hasBash && '无 bash/tar' }, () => {
  const r = run(['--nope'], { cwd: tmp() })
  assert.notStrictEqual(r.status, 0)
  assert.match(r.stderr + r.stdout, /未知参数/)
})
