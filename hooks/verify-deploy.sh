#!/bin/sh
# Runs after any deploy. A deploy is not done until this passes.
# Asserts against the live URL, never localhost, and waits for the new build to
# actually serve — a health check can answer from the old container.
set -eu

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
# shellcheck source=lib/live-assertions.sh
. "$script_dir/lib/live-assertions.sh"

version_path=${VERSION_PATH:-/version}
deadline=${REVISION_TIMEOUT:-120}
interval=3

# The real gate waits 120s. A shorter one is for the test suite and says so, out
# loud: a silently shortened poll would pass against a build that never arrived.
if [ "$deadline" != 120 ]; then
	printf 'SHORTENED revision gate: %ss instead of 120s\n' "$deadline"
fi

if [ -n "${EXPECTED_REVISION:-}" ]; then
	waited=0
	served=0
	while [ "$waited" -lt "$deadline" ]; do
		body=$(curl --max-time 10 -sS "${BASE_URL:-}$version_path" 2>/dev/null || printf '')
		if printf '%s' "$body" | grep -qF "$EXPECTED_REVISION"; then
			served=1
			break
		fi
		sleep "$interval"
		waited=$((waited + interval))
	done
	if [ "$served" -eq 1 ]; then
		printf 'PASS     revision gate: %s serving %s after %ss\n' \
			"$version_path" "$EXPECTED_REVISION" "$waited"
	else
		printf 'FAIL     revision gate: still serving the old build after %ss\n' "$waited" >&2
		printf 'VERIFY-DEPLOY  FAIL (1 failure: revision gate)\n' >&2
		exit 1
	fi
else
	printf 'SKIPPED  revision gate: EXPECTED_REVISION unset — a health check can answer\n'
	printf '         from the old container\n'
fi

if run_live_assertions; then
	printf 'VERIFY-DEPLOY  PASS (%s assertions)\n' "$LA_PASS"
	exit 0
fi

printf 'VERIFY-DEPLOY  FAIL (%s failures of %s assertions)\n' \
	"$LA_FAIL" "$((LA_PASS + LA_FAIL))" >&2
exit 1
