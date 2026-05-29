#!/usr/bin/env bash
set -e

mkdir -p repos

# usage: ensure_repo <name> <git-url> <ref>
#  - name: repos 子目录名，比如 effect / some-lib
#  - git-url: 仓库地址
#  - ref: tag / 分支名 / commit hash，比如 v4.0.0 / main / 7f3a8c5...
ensure_repo() {
  local name="$name"
  name="$1"
  local url="$2"
  local ref="$3"

  local dir="repos/$name"

  if [ ! -d "$dir/.git" ]; then
    echo "⚠️  Cloning $url into $dir"
    git clone --depth 1 --single-branch "$url" "$dir"
  fi

  (
    cd "$dir"
    echo "⚠️  Updating $name to $ref"
    git fetch origin --tags
    git checkout "$ref"
  )
}

# Effect
ensure_repo "effect" "https://github.com/Effect-TS/effect.git" "main"

# TanStack Router
ensure_repo "tanstack-router" "https://github.com/TanStack/router.git" "main"

# TanStack Query
ensure_repo "tanstack-query" "https://github.com/TanStack/query.git" "main"
