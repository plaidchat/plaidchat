#!/usr/bin/env sh
SOFTLINK=$(readlink `which slack-for-linux`)
$(dirname $0)/$(dirname $SOFTLINK)/webkitbuilds/slack4linux/linux64/slack4linux


