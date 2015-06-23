#!/usr/bin/env bash
# Exit on first error and output comments
set -e
set -x

# If there is a libffmpegsumo, copy it over
if test -f /opt/google/chrome/libffmpegsumo.so; then
	cp /opt/google/chrome/libffmpegsumo.so node_modules/nw/nwjs/libffmpegsumo.so
else
	echo "Couldn't locate libffmpegsumo.so during installation. Audio notifications will be disabled" 1>&2
	echo "To repair this, please install Google Chrome and reinstall \`plaidchat\`" 1>&2
fi

# Compile our React for nw.js support
npm run build
