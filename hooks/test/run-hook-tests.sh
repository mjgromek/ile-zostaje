#!/bin/sh
# Fail-on-purpose suite for all four hooks. Sixteen cases.
#
# Every refusal case also runs `git log --oneline` and asserts the commit is
# genuinely absent. A hook that prints a refusal and lets the commit through is
# the exact failure class this repository exists to catch, and an exit code
# alone would not see it.
#
# Each commit case gets its own throwaway repository under mktemp -d, because
# rule A looks back ten commits: a test: commit left by an earlier case would
# satisfy a later one and the suite would pass for the wrong reason.
set -eu

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
hooks_src=$(CDPATH= cd -- "$script_dir/.." && pwd)

if [ -n "$(git config --get core.hooksPath 2>/dev/null || true)" ]; then
	printf 'REFUSED  core.hooksPath is set here (%s).\n' \
		"$(git config --get core.hooksPath)" >&2
	printf '         This suite builds its own throwaway repositories and must never run\n' >&2
	printf '         against one with hooks wired. Unset it, or run from a fresh clone.\n' >&2
	exit 2
fi

tmp=$(mktemp -d)
pids=""
cleanup() {
	[ -z "$pids" ] || kill $pids 2>/dev/null || true
	rm -rf "$tmp"
}
trap cleanup EXIT INT TERM

passed=0
failed=0

report() { # id expected actual verdict
	if [ "$4" = PASS ]; then
		passed=$((passed + 1))
	else
		failed=$((failed + 1))
	fi
	printf '%-4s %-8s  %-52s  %s\n' "$1" "$2" "$3" "$4"
}

new_repo() { # id -> path to a fresh repo with the hooks wired
	d="$tmp/repo$1"
	mkdir -p "$d/.agent"
	git -C "$d" init -q
	git -C "$d" config user.email test@example.invalid
	git -C "$d" config user.name "Hook Suite"
	git -C "$d" config commit.gpgsign false
	cp -R "$hooks_src" "$d/hooks"
	rm -rf "$d/hooks/test"
	git -C "$d" config core.hooksPath hooks
	printf '# DECISIONS\n' >"$d/.agent/DECISIONS.md"
	printf 'seed\n' >"$d/seed.txt"
	git -C "$d" add seed.txt
	git -C "$d" commit -q --no-verify -m "chore: seed"
	printf '%s' "$d"
}

stage() { # dir path content
	mkdir -p "$(dirname -- "$1/$2")"
	printf '%s\n' "$3" >"$1/$2"
	git -C "$1" add "$2"
}

did_commit() { # dir msg -> 0 when git exited zero
	git -C "$1" commit -q -m "$2" >"$tmp/out" 2>&1
}

assert_refused() { # id dir msg
	if did_commit "$2" "$3"; then
		report "$1" REFUSED "exit 0 — the commit was accepted" FAIL
		return
	fi
	if git -C "$2" log --oneline | grep -qF "$3"; then
		report "$1" REFUSED "refused, but the commit IS in git log" FAIL
	else
		report "$1" REFUSED "refused: $(head -n 1 "$tmp/out" | cut -c1-32), absent" PASS
	fi
}

assert_allowed() { # id dir msg
	if did_commit "$2" "$3"; then
		if git -C "$2" log --oneline | grep -qF "$3"; then
			report "$1" ALLOWED "committed, present in git log" PASS
		else
			report "$1" ALLOWED "exit 0 but absent from git log" FAIL
		fi
	else
		report "$1" ALLOWED "refused: $(head -n 1 "$tmp/out")" FAIL
	fi
}

assert_script() { # id expect needle cmd...
	id=$1
	expect=$2
	needle=$3
	shift 3
	if "$@" >"$tmp/out" 2>&1; then
		rc=0
	else
		rc=1
	fi
	if [ "$expect" = PASS ] && [ "$rc" -ne 0 ]; then
		report "$id" PASS "exited $rc: $(grep -m1 FAIL "$tmp/out" || true)" FAIL
	elif [ "$expect" = FAIL ] && [ "$rc" -eq 0 ]; then
		report "$id" FAIL "exited 0 — the bad deployment was accepted" FAIL
	elif grep -qF "$needle" "$tmp/out"; then
		report "$id" "$expect" "exited $rc, output names \"$needle\"" PASS
	else
		report "$id" "$expect" "exited $rc but never said \"$needle\"" FAIL
	fi
}

printf 'HOOK SUITE  16 fail-on-purpose cases\n\n'
printf 'commit-msg and pre-commit\n'

# 1  feat: with no preceding test:
d=$(new_repo 1)
stage "$d" src/a.py "def a(): pass"
assert_refused 1 "$d" "feat: add a with no test first"

# 2  test: then feat: in the same directory
d=$(new_repo 2)
stage "$d" src/test_b.py "def test_b(): assert False"
did_commit "$d" "test: failing test for b" || true
stage "$d" src/b.py "def b(): pass"
git -C "$d" add .agent/DECISIONS.md
assert_allowed 2 "$d" "feat: implement b"

# 3  test: tests/test_auth.py then feat: src/auth.py — the stem rule, not the directory
d=$(new_repo 3)
stage "$d" tests/test_auth.py "def test_auth(): assert False"
did_commit "$d" "test: failing test for auth" || true
stage "$d" src/auth.py "def auth(): pass"
git -C "$d" add .agent/DECISIONS.md
assert_allowed 3 "$d" "feat: implement auth"

# 4  feat: with a test: but no DECISIONS.md staged — rule B
d=$(new_repo 4)
stage "$d" src/test_c.py "def test_c(): assert False"
did_commit "$d" "test: failing test for c" || true
stage "$d" src/c.py "def c(): pass"
assert_refused 4 "$d" "feat: implement c with no decision record"

# 5  fix: with no preceding test:
d=$(new_repo 5)
stage "$d" src/d.py "def d(): return 1"
assert_refused 5 "$d" "fix: correct d with no test first"

# 6  test: then fix: on an overlapping path
d=$(new_repo 6)
stage "$d" src/test_e.py "def test_e(): assert False"
did_commit "$d" "test: failing test for e" || true
stage "$d" src/e.py "def e(): return 2"
git -C "$d" add .agent/DECISIONS.md
assert_allowed 6 "$d" "fix: correct e"

# 7  fix: with a test: but no DECISIONS.md — rule B must NOT fire on fix:
d=$(new_repo 7)
stage "$d" src/test_f.py "def test_f(): assert False"
did_commit "$d" "test: failing test for f" || true
stage "$d" src/f.py "def f(): return 3"
assert_allowed 7 "$d" "fix: correct f with no decision record"

# 8  an AWS access key in an added line
d=$(new_repo 8)
stage "$d" config.txt "key = AKIAAAAAAAAAAAAAAAAA"
assert_refused 8 "$d" "chore: add config with an aws key"

# 9  a private key header. This silently matched nothing until grep -e was used,
#    because the pattern starts with a dash and was read as options. Keep forever.
d=$(new_repo 9)
stage "$d" id_rsa "-----BEGIN RSA PRIVATE KEY-----"
assert_refused 9 "$d" "chore: add a private key"

# 10  an ordinary chore: commit
d=$(new_repo 10)
stage "$d" notes.md "nothing sensitive here"
assert_allowed 10 "$d" "chore: add notes"

printf '\nverify-deploy.sh and probe.sh\n'

good_port=8731
bad_port=8732
redirect_port=8733

start_server() { # mode port
	python3 "$script_dir/fakeserver.py" "$1" "$2" /api/me rev-good &
	pids="$pids $!"
	tries=0
	while [ "$tries" -lt 20 ]; do
		if curl --max-time 2 -sS -o /dev/null "http://127.0.0.1:$2/version" 2>/dev/null; then
			return 0
		fi
		sleep 1
		tries=$((tries + 1))
	done
	printf 'FATAL  the %s fake server never came up on port %s\n' "$1" "$2" >&2
	exit 1
}

start_server GOOD "$good_port"
start_server BAD "$bad_port"
start_server REDIRECT "$redirect_port"

# 11  verify-deploy against a stale build serving the wrong revision
assert_script 11 FAIL "revision gate" env \
	BASE_URL="http://127.0.0.1:$bad_port" PROTECTED_PATH=/api/me \
	EXPECTED_REVISION=rev-good REVISION_TIMEOUT=6 sh "$hooks_src/verify-deploy.sh"

# 12  verify-deploy against a healthy deployment serving the expected revision
assert_script 12 PASS "VERIFY-DEPLOY  PASS" env \
	BASE_URL="http://127.0.0.1:$good_port" PROTECTED_PATH=/api/me \
	EXPECTED_REVISION=rev-good REVISION_TIMEOUT=6 sh "$hooks_src/verify-deploy.sh"

# 13  probe against a deployment with a 500 health check and an open protected route
assert_script 13 FAIL "A2 unauthenticated /api/me refused" env \
	BASE_URL="http://127.0.0.1:$bad_port" PROTECTED_PATH=/api/me \
	sh "$hooks_src/probe.sh"

# 14  probe against a healthy deployment
assert_script 14 PASS "PROBE" env \
	BASE_URL="http://127.0.0.1:$good_port" PROTECTED_PATH=/api/me \
	sh "$hooks_src/probe.sh"

# 15  a 302 on the protected route is not a refusal
assert_script 15 FAIL "redirect is not a refusal" env \
	BASE_URL="http://127.0.0.1:$redirect_port" PROTECTED_PATH=/api/me \
	sh "$hooks_src/probe.sh"

# 16  no BASE_URL: the run must say nothing was asserted, never pass quietly
assert_script 16 FAIL "Nothing was asserted" env \
	PROTECTED_PATH=/api/me sh "$hooks_src/probe.sh"

printf '\n%s passed, %s failed\n' "$passed" "$failed"
[ "$failed" -eq 0 ]
