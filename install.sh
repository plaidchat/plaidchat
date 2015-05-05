#!/usr/bin/env sh
# Exit upon the first error and echo commands
set -e
set -x

# Override our environment to consider all `npm` installs to be local
npm_config_global=""

# Install app's dependencies
cd app/
npm install
../node_modules/.bin/bower install
cd ../

# Build our application
./node_modules/.bin/grunt nodewebkit
