#!/usr/bin/env bash
# Exit on the first error
set -e

# Install our Selenium and nw specific Chromedriver
webdriver-manager update --standalone true --chrome false --chromedriver-nw true
