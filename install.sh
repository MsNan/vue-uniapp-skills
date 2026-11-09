#!/usr/bin/env bash
# 一行安装: curl -fsSL https://raw.githubusercontent.com/MsNan/vue-uniapp-skills/main/install.sh | bash -s -- --tool cursor
set -eo pipefail
command -v node >/dev/null 2>&1 || { echo "需要 Node.js >= 16" >&2; exit 1; }
NODE_MAJOR=$(node -p 'process.versions.node.split(".")[0]')
[ "$NODE_MAJOR" -ge 16 ] 2>/dev/null || { echo "需要 Node.js >= 16，当前是 $(node -v)" >&2; exit 1; }
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
URL=https://codeload.github.com/MsNan/vue-uniapp-skills/tar.gz/refs/heads/main
if ! curl -fsSL "$URL" | tar -xz -C "$TMP"; then
  echo "下载失败：$URL" >&2
  echo "可以改用 npx -y github:MsNan/vue-uniapp-skills，或检查网络/代理后重试" >&2
  exit 1
fi
node "$TMP"/vue-uniapp-skills-main/bin/cli.js "$@"
