#!/usr/bin/env bash
# Exit on the first error
set -e

# Install any missing dependencies
bin/install-webdriver-dependencies.sh

# Start our webdriver instance
export NODE_ENV=test
java -jar ./node_modules/nw/nwjs/selenium.jar -Dwebdriver.chrome.driver=./node_modules/nw/nwjs/chromedriver
