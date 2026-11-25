#!/usr/bin/env sh
# install.sh: link (or copy) this skill into every coding agent's skills directory found on this machine.
#
#   ./install.sh              symlink into each existing agent skills dir
#   ./install.sh --copy       copy instead of symlink (for agents or filesystems without symlink support)
#   ./install.sh --uninstall  remove the links/copies this script would create
#   ./install.sh --list       show target directories and current state, change nothing
#
# Only directories that already exist are touched; a missing agent is reported and skipped.
# Set SKILLS_DIRS="dir1 dir2" to override the target list.

set -eu

SKILL_NAME="resume-screener-loop"
MARKER_FILE=".installed-by-resume-screener-loop"
SRC="$(cd "$(dirname "$0")" && pwd)"
MODE="link"

case "${1:-}" in
  --copy) MODE="copy" ;;
  --uninstall) MODE="uninstall" ;;
  --list) MODE="list" ;;
  "" ) ;;
  *) echo "usage: $0 [--copy|--uninstall|--list]" >&2; exit 2 ;;
esac

[ -f "$SRC/SKILL.md" ] || { echo "no SKILL.md next to install.sh; run it from the skill checkout" >&2; exit 2; }

if [ -n "${SKILLS_DIRS:-}" ]; then
  # shellcheck disable=SC2086
  set -- $SKILLS_DIRS
else
  set -- \
    "$HOME/.agents/skills" \
    "$HOME/.claude/skills" \
    "$HOME/.codex/skills" \
    "$HOME/.gemini/skills" \
    "$HOME/.gemini/antigravity/skills" \
    "$HOME/.cursor/skills" \
    "$HOME/.copilot/skills" \
    "$HOME/.config/opencode/skills" \
    "$HOME/.opencode/skills" \
    "$HOME/.pi/agent/skills" \
    "$HOME/.factory/skills" \
    "$HOME/.kiro/skills" \
    "$HOME/.qwen/skills" \
    "$HOME/.cline/skills" \
    "$HOME/.roo/skills" \
    "$HOME/.trae/skills" \
    "$HOME/.continue/skills" \
    "$HOME/.openclaw/skills"
fi

linked=0; copied=0; removed=0; skipped=0
for dir in "$@"; do
  target="$dir/$SKILL_NAME"
  if [ ! -d "$dir" ]; then
    skipped=$((skipped + 1))
    [ "$MODE" = "list" ] && echo "absent   $dir"
    continue
  fi
  case "$MODE" in
    list)
      if [ -L "$target" ]; then echo "link     $target -> $(readlink "$target")"
      elif [ -d "$target" ]; then echo "copy     $target"
      else echo "missing  $target"; fi ;;
    uninstall)
      if [ -L "$target" ]; then
        if [ "$(readlink "$target")" = "$SRC" ]; then
          rm -f "$target"
          removed=$((removed + 1))
          echo "removed  $target"
        else
          echo "refused  $target (symlink points elsewhere; leaving it alone)" >&2
        fi
      elif [ -d "$target" ]; then
        if [ -f "$target/$MARKER_FILE" ]; then
          rm -rf "$target"
          removed=$((removed + 1))
          echo "removed  $target"
        else
          echo "refused  $target (not managed by install.sh; remove manually)" >&2
        fi
      fi ;;
    link)
      if [ -L "$target" ] && [ "$(readlink "$target")" = "$SRC" ]; then echo "ok       $target"; continue; fi
      if [ -e "$target" ] && [ ! -L "$target" ]; then echo "exists   $target (not a link; leaving it alone, remove it to relink)"; continue; fi
      rm -f "$target"; ln -s "$SRC" "$target"; linked=$((linked + 1)); echo "linked   $target -> $SRC" ;;
    copy)
      if [ -e "$target" ] && [ ! -L "$target" ] && [ ! -f "$target/$MARKER_FILE" ]; then
        echo "exists   $target (not managed by install.sh; leaving it alone, remove it to copy)"
        continue
      fi
      rm -rf "$target"; mkdir -p "$target"
      (cd "$SRC" && tar --exclude=.git --exclude=.claude --exclude=.remember --exclude=node_modules -cf - .) | (cd "$target" && tar -xf -)
      printf '%s\n' "$SRC" > "$target/$MARKER_FILE"
      copied=$((copied + 1)); echo "copied   $target" ;;
  esac
done

case "$MODE" in
  link) echo "done: $linked linked, $skipped agent dirs absent" ;;
  copy) echo "done: $copied copied, $skipped agent dirs absent" ;;
  uninstall) echo "done: $removed removed" ;;
  list) ;;
esac
