#!/usr/bin/env node
'use strict'
const fs = require('fs')
const path = require('path')

const SKILLS_DIR = path.join(__dirname, '..', 'skills')
const TOOLS = ['claude', 'cursor', 'trae', 'codex']
const help = `vue-uniapp-skills - 把 Vue3 + uni-app 中文技能装进你的项目

用法:
  npx github:MsNan/vue-uniapp-skills [选项]

选项:
  -t, --tool <名称>   claude | cursor | trae | codex | all（默认 all，可逗号分隔）
  -s, --skills <列表> 只安装指定技能，逗号分隔（默认全部）
  -d, --dir <路径>    目标项目目录（默认当前目录）
  -g, --global        Claude Code 安装到 ~/.claude/skills（对所有项目生效）
  -f, --force         覆盖已存在文件
  -l, --list          列出所有技能
  -h, --help          显示帮助
`

function parseArgs(argv) {
  const o = { tool: 'all', skills: null, dir: process.cwd(), global: false, force: false }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i], next = () => argv[++i]
    if (a === '-t' || a === '--tool') o.tool = next()
    else if (a === '-s' || a === '--skills') o.skills = next().split(',').map(s => s.trim()).filter(Boolean)
    else if (a === '-d' || a === '--dir') o.dir = path.resolve(next())
    else if (a === '-g' || a === '--global') o.global = true
    else if (a === '-f' || a === '--force') o.force = true
    else if (a === '-l' || a === '--list') o.list = true
    else if (a === '-h' || a === '--help') o.help = true
    else { console.error('未知参数: ' + a); process.exit(1) }
  }
  return o
}

function parse(file) {
  const raw = fs.readFileSync(file, 'utf8')
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  const meta = {}
  if (m) for (const line of m[1].split('\n')) {
    const i = line.indexOf(':'); if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^"(.*)"$/, '$1')
  }
  return { meta, body: m ? m[2] : raw }
}

function write(file, content, force, stats) {
  if (fs.existsSync(file) && !force) { stats.skipped.push(file); return }
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, content)
  stats.written.push(file)
}

function main() {
  const o = parseArgs(process.argv.slice(2))
  if (o.help) return console.log(help)
  const all = fs.readdirSync(SKILLS_DIR).filter(n => fs.existsSync(path.join(SKILLS_DIR, n, 'SKILL.md'))).sort()
  if (o.list) {
    for (const n of all) console.log(`  ${n.padEnd(26)} ${parse(path.join(SKILLS_DIR, n, 'SKILL.md')).meta.description}`)
    return
  }
  const names = o.skills || all
  const bad = names.filter(n => !all.includes(n))
  if (bad.length) { console.error('不存在的技能: ' + bad.join(', ') + '\n用 --list 查看'); process.exit(1) }
  const tools = o.tool === 'all' ? TOOLS : o.tool.split(',').map(s => s.trim())
  const badT = tools.filter(t => !TOOLS.includes(t))
  if (badT.length) { console.error('不支持的工具: ' + badT.join(', ')); process.exit(1) }

  const stats = { written: [], skipped: [] }
  const agentsSections = []
  for (const n of names) {
    const { meta, body } = parse(path.join(SKILLS_DIR, n, 'SKILL.md'))
    const desc = meta.description || n
    for (const t of tools) {
      if (t === 'claude') {
        const base = o.global ? path.join(require('os').homedir(), '.claude', 'skills') : path.join(o.dir, '.claude', 'skills')
        write(path.join(base, n, 'SKILL.md'), `---\nname: ${n}\ndescription: ${desc}\n---\n${body}`, o.force, stats)
      } else if (t === 'cursor') {
        const fm = `---\ndescription: ${desc}\nglobs: ${meta.globs || ''}\nalwaysApply: false\n---\n`
        write(path.join(o.dir, '.cursor', 'rules', `${n}.mdc`), fm + body, o.force, stats)
      } else if (t === 'trae') {
        write(path.join(o.dir, '.trae', 'rules', `${n}.md`), `<!-- ${desc} -->\n${body}`, o.force, stats)
      } else if (t === 'codex') {
        agentsSections.push(`- \`${n}\`：${desc}（详见 .agents/skills/${n}/SKILL.md）`)
        write(path.join(o.dir, '.agents', 'skills', n, 'SKILL.md'), `---\nname: ${n}\ndescription: ${desc}\n---\n${body}`, o.force, stats)
      }
    }
  }
  if (agentsSections.length) {
    const f = path.join(o.dir, 'AGENTS.md')
    const block = `<!-- vue-uniapp-skills:start -->\n## Vue3 + uni-app 技能\n按任务需要先阅读对应技能文件再编码：\n${agentsSections.join('\n')}\n<!-- vue-uniapp-skills:end -->\n`
    let cur = fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : ''
    const re = /<!-- vue-uniapp-skills:start -->[\s\S]*?<!-- vue-uniapp-skills:end -->\n?/
    cur = re.test(cur) ? cur.replace(re, block) : (cur ? cur.replace(/\n*$/, '\n\n') : '') + block
    fs.writeFileSync(f, cur); stats.written.push(f)
  }
  console.log(`✅ 已写入 ${stats.written.length} 个文件（工具: ${tools.join(', ')}，技能: ${names.length} 个）`)
  if (stats.skipped.length) console.log(`⏭️  跳过 ${stats.skipped.length} 个已存在文件，加 --force 覆盖`)
  console.log('☕ 觉得有用欢迎 Star: https://github.com/MsNan/vue-uniapp-skills')
}
main()
