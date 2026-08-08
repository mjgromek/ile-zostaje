#!/bin/sh
# Live assertions against a running deployment. Sourced, never executed.
# One copy, used by verify-deploy.sh and probe.sh: two copies drift.
#
# Environment:
#   BASE_URL        required, no default
#   PROTECTED_PATH  required, unless NO_PROTECTED_ROUTE=1 is declared
#   NO_PROTECTED_ROUTE=1   the application has no authenticated route at all, so A2
#                   skips loudly instead of failing forever. An explicit declaration,
#                   never an omission: a forgotten variable must not disable an
#                   assertion. See R2-F20.
#   HEALTH_PATH     default /health
#   RESOURCE_PATH   optional, enables A4
#   TEST_USER, TEST_PASS, LOGIN_PATH   optional, enable A3 and A4
set -eu

LA_PASS=0
LA_FAIL=0
LA_SKIP=0
LA_SKIP_WHY=""

la_code() {
	# $1 url, remaining args passed to curl. Connection failure reads as 000.
	url=$1
	shift
	curl --max-time 10 -sS -o /dev/null -w '%{http_code}' "$@" "$url" 2>/dev/null || printf '000'
}

la_pass() {
	LA_PASS=$((LA_PASS + 1))
	printf 'PASS     %s (got %s)\n' "$1" "$2"
}

la_fail() {
	LA_FAIL=$((LA_FAIL + 1))
	printf 'FAIL     %s (got %s)%s\n' "$1" "$2" "${3:-}" >&2
}

la_skip() {
	la_skip_msg "$1" "$2 unset"
}

la_skip_msg() { # $1 assertion, $2 reason in full
	LA_SKIP=$((LA_SKIP + 1))
	LA_SKIP_WHY="${LA_SKIP_WHY}${LA_SKIP_WHY:+; }$1 $2"
	printf 'SKIPPED  %s: %s\n' "$1" "$2"
}

run_live_assertions() {
	LA_PASS=0
	LA_FAIL=0

	if [ -z "${BASE_URL:-}" ]; then
		printf 'FATAL    BASE_URL is unset. Nothing was asserted.\n' >&2
		return 2
	fi
	# An omission is not a declaration: PROTECTED_PATH missing is still FATAL unless the
	# application explicitly declares it has no authenticated route.
	if [ -z "${PROTECTED_PATH:-}" ] && [ "${NO_PROTECTED_ROUTE:-}" != 1 ]; then
		printf 'FATAL    PROTECTED_PATH is unset and NO_PROTECTED_ROUTE is not declared.\n' >&2
		printf '         An omission is not a declaration. Nothing was asserted.\n' >&2
		return 2
	fi
	health_path=${HEALTH_PATH:-/health}

	# A1 health
	code=$(la_code "$BASE_URL$health_path")
	case "$code" in
	200) la_pass "A1 health $health_path returns 200" "$code" ;;
	*) la_fail "A1 health $health_path returns 200" "$code" ;;
	esac

	# A2 protected route refused without a credential
	if [ -z "${PROTECTED_PATH:-}" ]; then
		la_skip_msg "A2" "the application declares no protected route"
	else
		code=$(la_code "$BASE_URL$PROTECTED_PATH")
		case "$code" in
		401 | 403) la_pass "A2 unauthenticated $PROTECTED_PATH refused" "$code" ;;
		3??) la_fail "A2 unauthenticated $PROTECTED_PATH refused" "$code" \
			" — redirect is not a refusal" ;;
		200) la_fail "A2 unauthenticated $PROTECTED_PATH refused" "$code" \
			" — route is open" ;;
		*) la_fail "A2 unauthenticated $PROTECTED_PATH refused" "$code" ;;
		esac
	fi

	# A3 login with real credentials
	if [ -z "${TEST_USER:-}" ] || [ -z "${TEST_PASS:-}" ]; then
		la_skip "A3 login" "TEST_USER/TEST_PASS"
	elif [ -z "${LOGIN_PATH:-}" ]; then
		la_skip "A3 login" "LOGIN_PATH"
	else
		code=$(la_code "$BASE_URL$LOGIN_PATH" -X POST -u "$TEST_USER:$TEST_PASS")
		case "$code" in
		2??) la_pass "A3 login at $LOGIN_PATH returns 2xx" "$code" ;;
		*) la_fail "A3 login at $LOGIN_PATH returns 2xx" "$code" ;;
		esac
	fi

	# A4 a known resource, present with the credential and absent without it
	if [ -z "${RESOURCE_PATH:-}" ]; then
		la_skip "A4 resource" "RESOURCE_PATH"
	elif [ -z "${TEST_USER:-}" ] || [ -z "${TEST_PASS:-}" ]; then
		la_skip "A4 resource" "TEST_USER/TEST_PASS"
	else
		with=$(la_code "$BASE_URL$RESOURCE_PATH" -u "$TEST_USER:$TEST_PASS")
		without=$(la_code "$BASE_URL$RESOURCE_PATH")
		if [ "$with" = "200" ] && [ "$without" != "200" ]; then
			la_pass "A4 $RESOURCE_PATH 200 with credential, not without" "$with/$without"
		else
			la_fail "A4 $RESOURCE_PATH 200 with credential, not without" "$with/$without"
		fi
	fi

	# The skip count is always printed. A run with two skips must never read the same as
	# a run with none — that is how a disabled assertion hides inside a green summary.
	if [ "$LA_SKIP" -gt 0 ]; then
		printf 'ASSERTIONS  %s passed, %s failed, %s skipped (%s)\n' \
			"$LA_PASS" "$LA_FAIL" "$LA_SKIP" "$LA_SKIP_WHY"
	else
		printf 'ASSERTIONS  %s passed, %s failed, 0 skipped\n' "$LA_PASS" "$LA_FAIL"
	fi
	[ "$LA_FAIL" -eq 0 ]
}
