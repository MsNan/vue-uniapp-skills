#!/usr/bin/env bash
# 一行安装: curl -fsSL https://raw.githubusercontent.com/MsNan/vue-uniapp-skills/main/install.sh | bash -s -- --tool cursor
set -e
command -v node >/dev/null 2>&1 || { echo "需要 Node.js >= 16"; exit 1; }
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
curl -fsSL https://codeload.github.com/MsNan/vue-uniapp-skills/tar.gz/refs/heads/main | tar -xz -C "$TMP"
node "$TMP"/vue-uniapp-skills-main/bin/cli.js "$@"
