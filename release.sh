#!/usr/bin/env bash
# Exit on first error
set -e

# Parse our parameters
version="$1"

# If a version wasn't found, complain and leave
if test -z "$version"; then
	echo "No \`version\` was provided to \`release.sh\`. Please provide one." 1>&2
	echo "Usage: ./release.sh <version>" 1>&2
	echo "  version: Can be semver, major, minor, or patch" 1>&2
	exit 1
fi

# Verify `github-changes` is installed
if ! test -f "./node_modules/.bin/github-changes"; then
	echo "Couldn't find \`github-changes\` executable. Please verify \`npm install\` has been run." 1>&2
	exit 1
fi

# Update our package and add a git commit via `npm`
npm version "$version"

# Grab our new semver
semver="$(node --eval "console.log('v' + require('./package.json').version);")"

# If we have a GITHUB_TOKEN environment variable, generate a `--token` flag for `github-changes`
token_option=""
if test -n "$GITHUB_TOKEN"; then
	token_option="--token \"$GITHUB_TOKEN\""
fi

# Generate a new CHANGELOG
# DEV: `$token_option` is multiple parameters so don't wrap it in quotes
set +e
./node_modules/.bin/github-changes --title "plaidchat changelog" \
	$token_option \
	--owner plaidchat --repository plaidchat \
	--only-pulls --use-commit-body -n "$semver"
if test "$?" != "0"; then
	echo "Failed to generate CHANGELOG. Probably due to a rate limit error." 1>&2
	echo "To repair this, please generate a GitHub API token (\`public_repo\` only) and run \`GITHUB_TOKEN={{token}} ./release.sh\`" 1>&2
	echo "Tokens can be generated here: https://github.com/settings/tokens" 1>&2
	exit 1
fi
set -e

# DEV: Add trailing newline for linter
echo >> CHANGELOG.md

# Append our CHANGELOG edit to the git commit
git add CHANGELOG.md
git commit --amend --no-edit

# Publish our changes
git push origin master
git push origin --tags
npm publish
