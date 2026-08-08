#!/bin/sh
# The same assertions on a schedule, from outside the deploy platform.
# A stale build between deploys is invisible to a deploy-time check, which is
# exactly how it went unnoticed twice. Needs nothing but curl — no platform
# CLI, no platform credentials, no revision gate.
#
# Crontab example, every 10 minutes:
#   */10 * * * * BASE_URL=https://app.example.com PROTECTED_PATH=/api/me \
#     /path/to/hooks/probe.sh >> /var/log/probe.log 2>&1
set -eu

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
# shellcheck source=lib/live-assertions.sh
. "$script_dir/lib/live-assertions.sh"

stamp=$(date -u '+%Y-%m-%dT%H:%M:%SZ')

if run_live_assertions; then
	printf 'PROBE  %s  PASS (%s assertions) %s\n' "$stamp" "$LA_PASS" "${BASE_URL:-}"
	exit 0
fi

printf 'PROBE  %s  FAIL (%s of %s assertions) %s\n' \
	"$stamp" "$LA_FAIL" "$((LA_PASS + LA_FAIL))" "${BASE_URL:-}" >&2
exit 1
