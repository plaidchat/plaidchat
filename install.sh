#!/usr/bin/env sh
# Exit upon the first error
set -e

# Install app's dependencies
cd app/
npm install
../node_modules/.bin/bower install
cd ../

# Build our application
./node_modules/.bin/grunt nodewebkit
