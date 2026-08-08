#!/bin/sh
# Fail-on-purpose suite for all four hooks. Twenty-eight cases.
#
# Every case asserts the INTENT of the rule, never the mechanism that implements
# it. "An unverifiable claim is refused unless explicitly marked foreign" is
# intent. "Backticks exempt a SHA" is mechanism. A case written against the
# mechanism inherits whatever the mechanism gets wrong, agrees with it, and
# passes forever. Case 18 did exactly that: it took the defective escape hatch as
# its exempt token, so it agreed with the bug while the hook stayed blind.
#
# Cases that exercise one rule against clean fixtures cannot catch rules that
# interact. Where two rules can both fire on the same commit, at least one case
# must stage the files they would realistically share. F32 was invisible for
# exactly this reason.
#
# Cases are grouped, not gapped: 1-10, 17-21 and 24-28 cover commit-msg and
# pre-commit, 11-16 and 22-23 cover verify-deploy and probe. All 28 run. Do NOT
# renumber — the numbers are referenced from the findings files and from commit
# messages.
#
# Every refusal case also runs `git log --oneline` and asserts the commit is
# genuinely absent. A hook that prints a refusal and lets the commit through is
# the exact failure class this repository exists to catch, and an exit code
# alone would not see it.
#
# Each commit case gets its own throwaway repository under mktemp -d, because
# rule A looks back ten commits: a test: commit left by an earlier case would
# satisfy a later one and the suite would pass for the wrong reason.
#
# Safe to run from a repository with its own hooks wired — that is the point, since
# the people who wired them correctly are the people who need to verify them. Before
# any commit is attempted, assert_scratch proves the repo about to be committed into
# lives under mktemp and is not the caller's. The caller's git config is never read
# or written.
set -eu

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
hooks_src=$(CDPATH= cd -- "$script_dir/.." && pwd)

# The invoking repository's toplevel, used only to prove the suite is not standing
# in it. Never its config: this suite reads and writes nothing in the caller's repo.
caller_top=$(git rev-parse --show-toplevel 2>/dev/null || printf '')

tmp=$(mktemp -d)
# Physical path: on macOS mktemp hands back /var/... while git resolves /private/var/...,
# and the containment check below would compare two spellings of the same directory.
tmp=$(CDPATH= cd -- "$tmp" && pwd -P)
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

assert_scratch() { # dir — refuse to commit anywhere but our own scratch repo
	top=$(git -C "$1" rev-parse --show-toplevel)
	case "$top" in
	"$tmp"/*) ;;
	*)
		printf 'ABORT  scratch repo %s is outside %s. Nothing was run.\n' "$top" "$tmp" >&2
		exit 2
		;;
	esac
	if [ -n "$caller_top" ] && [ "$top" = "$caller_top" ]; then
		printf 'ABORT  scratch repo is the invoking repository (%s). Nothing was run.\n' \
			"$top" >&2
		exit 2
	fi
}

new_repo() { # id -> path to a fresh repo with the hooks wired
	d="$tmp/repo$1"
	mkdir -p "$d/.agent"
	git -C "$d" init -q
	git -C "$d" config user.email test@example.invalid
	git -C "$d" config user.name "Hook Suite"
	git -C "$d" config commit.gpgsign false
	# Before anything is copied, deleted or committed: the rm below is destructive,
	# so the containment proof has to come first, not merely before the commit.
	assert_scratch "$d"
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

# The subject alone, because `git log --oneline` prints only the subject and a
# multi-line message handed to grep -F becomes several patterns — one of them the
# blank line before a trailer, which matches every line of any log. That would make
# the presence/absence assertion vacuously true for exactly the trailer cases that
# need it most. Cases 26-28 carry trailers; this is what keeps their check real.
subject_of() { printf '%s\n' "$1" | head -n 1; }

assert_refused() { # id dir msg
	if did_commit "$2" "$3"; then
		report "$1" REFUSED "exit 0 — the commit was accepted" FAIL
		return
	fi
	if git -C "$2" log --oneline | grep -qF "$(subject_of "$3")"; then
		report "$1" REFUSED "refused, but the commit IS in git log" FAIL
	else
		report "$1" REFUSED "refused: $(head -n 1 "$tmp/out" | cut -c1-32), absent" PASS
	fi
}

assert_allowed() { # id dir msg
	if did_commit "$2" "$3"; then
		if git -C "$2" log --oneline | grep -qF "$(subject_of "$3")"; then
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

printf 'HOOK SUITE  28 fail-on-purpose cases\n\n'
printf 'commit-msg and pre-commit   cases 1-10, 17-21, 24-28\n'

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

# 8  an AWS access key in an added line.
#    Built from two pieces so the fixture is a real match once assembled but never
#    a literal in this file — otherwise the scanner refuses its own test suite.
#    See docs/RUN-001-FINDINGS.md, F2.
d=$(new_repo 8)
aws_key="AKIA""AAAAAAAAAAAAAAAA"
stage "$d" config.txt "key = $aws_key"
assert_refused 8 "$d" "chore: add config with an aws key"

# 9  a private key header. This silently matched nothing until grep -e was used,
#    because the pattern starts with a dash and was read as options. Keep forever.
#    Split across two pieces for the same reason as case 8.
d=$(new_repo 9)
priv_key="-----BEGIN RSA PRIVATE"" KEY-----"
stage "$d" id_rsa "$priv_key"
assert_refused 9 "$d" "chore: add a private key"

# 10  an ordinary chore: commit
d=$(new_repo 10)
stage "$d" notes.md "nothing sensitive here"
assert_allowed 10 "$d" "chore: add notes"

# 17  STATE.md citing a SHA that does not resolve. The literal is one of the four
#     an orchestrator invented in RUN-002 F15 — plausible shape, no such object.
d=$(new_repo 17)
stage "$d" .agent/STATE.md "# STATE

Phase-start SHA: ea70e08
- 17:41 — builder returned 2a: 3 commits, 9f14ff5 feat. 18/18."
assert_refused 17 "$d" "chore: state citing a commit that never existed"

# 18  STATE.md citing only SHAs that resolve, plus a LABELLED example that does not —
#     the escape hatch must exempt it, or the check is unusable. This case originally
#     used backticks as the marker; that was the F20 defect, so the label is the marker.
d=$(new_repo 18)
real_sha=$(git -C "$d" rev-parse --short HEAD)
stage "$d" .agent/STATE.md "# STATE

Phase-start SHA: $real_sha
An example deadbeefcafe of the form this check rejects, which resolves nowhere."
assert_allowed 18 "$d" "chore: state citing only real commits"

# 19  STATE.md one line over its cap. RUN-002 committed it at 122 and noticed by
#     counting afterward; a cap nothing checks is a suggestion.
d=$(new_repo 19)
mkdir -p "$d/.agent"
: >"$d/.agent/STATE.md"
i=1
while [ "$i" -le 121 ]; do
	printf 'state line %s\n' "$i" >>"$d/.agent/STATE.md"
	i=$((i + 1))
done
git -C "$d" add .agent/STATE.md
assert_refused 19 "$d" "chore: state over its line cap"

# 20  a BACKTICKED non-existent SHA. Backticks are how anyone writes a SHA in markdown,
#     so they must exempt nothing — using them as the marker hid 7 of 9 checks. F20.
d=$(new_repo 20)
stage "$d" .agent/STATE.md "# STATE

Slice landed in \`ea70e08\`, which is backticked and still a claim about this repository."
assert_refused 20 "$d" "chore: state with a backticked bad sha"

# 21  an explicitly LABELLED foreign SHA. Allowed, and the count line must say so —
#     an exemption nobody can see is the defect, not the exemption itself.
d=$(new_repo 21)
stage "$d" .agent/STATE.md "# STATE

Synced from upstream ea70e08, another repository's commit, which this one cannot resolve."
if did_commit "$d" "chore: state citing a labelled foreign sha"; then
	if ! git -C "$d" log --oneline | grep -qF "chore: state citing a labelled foreign sha"; then
		report 21 ALLOWED "exit 0 but absent from git log" FAIL
	elif grep -qF "1 exempt: 1 labelled" "$tmp/out"; then
		report 21 ALLOWED "committed; reported \"1 exempt: 1 labelled\"" PASS
	else
		report 21 ALLOWED "committed but never reported the exemption" FAIL
	fi
else
	report 21 ALLOWED "refused: $(head -n 1 "$tmp/out")" FAIL
fi

# 24  the F32 interaction. Rule B forces .agent/DECISIONS.md onto every feat: commit,
#     and the progress board puts .agent/PROGRESS.md on test: commits, so dirof()
#     matched `.agent` on both sides and rule A's overlap passed on every feat:
#     commit regardless of coverage. Neither rule is wrong in isolation, and all 21
#     earlier cases stage clean fixtures, so none of them could see it.
d=$(new_repo 24)
stage "$d" .agent/PROGRESS.md "- slice 1 open"
stage "$d" tests/x.py "def test_x(): assert False"
did_commit "$d" "test: failing test for x" || true
stage "$d" src/unrelated.py "def unrelated(): pass"
git -C "$d" add .agent/DECISIONS.md
assert_refused 24 "$d" "feat: implement unrelated, which no test covers"

# 25  the same interaction, with the code the test actually covers staged too.
#     tests/x.py and src/x.py share a stem, so a real link exists and it lands.
#     Without this case the fix could refuse everything and still look correct.
d=$(new_repo 25)
stage "$d" .agent/PROGRESS.md "- slice 1 open"
stage "$d" tests/x.py "def test_x(): assert False"
did_commit "$d" "test: failing test for x" || true
stage "$d" src/unrelated.py "def unrelated(): pass"
stage "$d" src/x.py "def x(): pass"
git -C "$d" add .agent/DECISIONS.md
assert_allowed 25 "$d" "feat: implement x, with unrelated alongside"

# 26  the case no path rule can see: tests/test_layout.py genuinely covers
#     pkg/theme.py, and neither directory nor stem says so. The Covers: trailer
#     declares it, and the hook checks the declaration against what was staged.
d=$(new_repo 26)
stage "$d" .agent/PROGRESS.md "- slice open"
stage "$d" tests/test_layout.py "def test_layout(): assert False"
did_commit "$d" "test: the layout measured in a browser" || true
stage "$d" pkg/theme.py "CSS = ''"
git -C "$d" add .agent/DECISIONS.md
assert_allowed 26 "$d" "feat: cap the body so the board scrolls

Covers: pkg/theme.py"

# 27  a trailer naming a path this commit never staged. Checked, not accepted:
#     an unchecked declaration is a wish, and would be worse than no rule at all
#     because it reads like evidence.
d=$(new_repo 27)
stage "$d" .agent/PROGRESS.md "- slice open"
stage "$d" tests/test_layout.py "def test_layout(): assert False"
did_commit "$d" "test: the layout measured in a browser" || true
stage "$d" pkg/theme.py "CSS = ''"
git -C "$d" add .agent/DECISIONS.md
assert_refused 27 "$d" "feat: cap the body so the board scrolls

Covers: pkg/never_staged.py"

# 28  no overlap and no trailer. The default stays refusal — the declaration is an
#     escape hatch to be reached for deliberately, never the path of least effort.
d=$(new_repo 28)
stage "$d" .agent/PROGRESS.md "- slice open"
stage "$d" tests/test_layout.py "def test_layout(): assert False"
did_commit "$d" "test: the layout measured in a browser" || true
stage "$d" pkg/theme.py "CSS = ''"
git -C "$d" add .agent/DECISIONS.md
assert_refused 28 "$d" "feat: cap the body, coverage undeclared"

printf '\nverify-deploy and probe     cases 11-16, 22-23\n'

# Ports come from the OS, never from a constant. A fixed port silently tests
# whatever else already holds it. See docs/RUN-001-FINDINGS.md, F6.
started_port=""

start_server() { # mode -> sets started_port to the port the OS assigned
	portfile="$tmp/port.$1.$$"
	python3 "$script_dir/fakeserver.py" "$1" 0 /api/me rev-good >"$portfile" &
	pids="$pids $!"
	tries=0
	while [ "$tries" -lt 20 ]; do
		started_port=$(tr -d '[:space:]' <"$portfile" 2>/dev/null || printf '')
		if [ -n "$started_port" ] &&
			curl --max-time 2 -sS -o /dev/null "http://127.0.0.1:$started_port/version" 2>/dev/null; then
			return 0
		fi
		sleep 1
		tries=$((tries + 1))
	done
	printf 'FATAL  the %s fake server never came up (port %s)\n' "$1" "${started_port:-unassigned}" >&2
	exit 1
}

start_server GOOD
good_port=$started_port
start_server BAD
bad_port=$started_port
start_server REDIRECT
redirect_port=$started_port

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

# 22  a wholly public application declares it has no protected route. A2 skips loudly
#     and the run passes — a gate that is red forever trains everyone to ignore it, and
#     the next genuine failure becomes indistinguishable from the expected one. R2-F20.
assert_script 22 PASS "SKIPPED  A2: the application declares no protected route" env \
	BASE_URL="http://127.0.0.1:$good_port" NO_PROTECTED_ROUTE=1 \
	sh "$hooks_src/probe.sh"

# 23  PROTECTED_PATH unset with NO declaration. Still FATAL: an omission is not a
#     declaration, or a forgotten variable silently disables the assertion.
assert_script 23 FAIL "An omission is not a declaration" env \
	BASE_URL="http://127.0.0.1:$good_port" sh "$hooks_src/probe.sh"

printf '\n%s passed, %s failed\n' "$passed" "$failed"
[ "$failed" -eq 0 ]
