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

# Generate a new CHANGELOG
./node_modules/.bin/github-changes --title "slack-for-linux changelog" \
	--owner slack-for-linux --repository slack-for-linux \
	--only-pulls --use-commit-body -n "$semver"

# DEV: Add trailing newline for linter
echo >> CHANGELOG.md

# Append our CHANGELOG edit to the git commit
git add CHANGELOG.md
git commit --amend --no-edit

# Publish our changes
git push origin master
git push origin --tags
npm publish
