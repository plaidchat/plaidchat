#!/usr/bin/env sh
# Exit upon the first error and echo commands
set -e
set -x

# Clean up our build folder
if test -d webkitbuilds/; then
  rm -r webkitbuilds/
fi

# Install app's dependencies
cd app/
npm install
cd ../

# Build our application
./node_modules/.bin/grunt nodewebkit
