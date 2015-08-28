#!/usr/bin/env bash
# Exit on first error and output comments
set -e
set -x

# Copy `libffmpegsumo.so` from electron to nw.js
# DEV: We previously copied from Google Chrome, however they have stopped bundling `libffmpegsumo.so`
cp node_modules/electron-prebuilt/dist/libffmpegsumo.so node_modules/nw/nwjs/libffmpegsumo.so

# Compile our React for nw.js support
npm run build
