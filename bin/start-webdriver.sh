#!/usr/bin/env bash
# Exit on the first error
set -e

# Install any missing dependencies
bin/install-webdriver-dependencies.sh

# Start our webdriver instance
export NODE_ENV=test
./node_modules/.bin/webdriver-manager start
