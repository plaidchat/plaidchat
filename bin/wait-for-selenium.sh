#!/usr/bin/env bash
# Exit on the first error
set -e

# Attempt to connect to Selenium every 100ms or fail
timeout 10s sh -c\
  "while ! curl --silent http://localhost:4444/ > /dev/null; do
    echo \"Waiting for Selenium to start...\" && sleep 0.1;
  done"\
 || exit 1
