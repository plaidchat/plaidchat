#!/usr/bin/env bash
# Exit on the first error
set -e

# Verify we have a Selenium jar downloaded
if ! test -e ./node_modules/nw/nwjs/selenium.jar; then
  ./node_modules/.bin/webdriver-manager update --standalone
  # e.g. node_modules/webdriver-manager/selenium/selenium-server-standalone-2.46.0.jar
  selenium_path="$(ls node_modules/webdriver-manager/selenium/selenium-*.jar)"
  # Target path: `../../../node_modules/webdriver-manager/selenium/selenium-server-standalone-2.46.0.jar`
  #   from perspective of `./node_modules/nw/nwjs/selenium.jar`
  ln -s "../../../$selenium_path" ./node_modules/nw/nwjs/selenium.jar
fi

# Verify we have nw.js' Chromedriver installed
if ! test -f ./node_modules/nw/nwjs/chromedriver; then
  # Download and extract Chromedriver
  mkdir -p tmp/
  cd tmp/
  wget http://dl.nwjs.io/v0.12.2/chromedriver-nw-v0.12.2-linux-x64.tar.gz
  tar xzf chromedriver-nw-v0.12.2-linux-x64.tar.gz

  # Copy over our Chromedriver for nw.js
  cd ../
  cp tmp/chromedriver-nw-v0.12.2-linux-x64/chromedriver node_modules/nw/nwjs/
fi
