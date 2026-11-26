#!/bin/zsh
set -euo pipefail

cd /Users/johanneumeier/yuno-2
npm run build

# Publish dist/ cleanly to the gh-pages branch
TMP_WORKTREE="/tmp/yuno2-gh-pages"
rm -rf "$TMP_WORKTREE"
mkdir -p "$TMP_WORKTREE"
cp -R dist/. "$TMP_WORKTREE/"
touch "$TMP_WORKTREE/.nojekyll"

cd "$TMP_WORKTREE"
git init -b gh-pages
git add .
git commit -m "Deploy Yuno 2.0 Web App"
git remote add origin https://github.com/JohanKapteina/yuno-2.git
git push -f origin gh-pages

rm -rf "$TMP_WORKTREE"
echo "Deployed to https://johankapteina.github.io/yuno-2/"
