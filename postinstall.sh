#!/usr/bin/env bash
# Exit on first error and output comments
set -e
set -x

# Copy `libffmpegsumo.so` from electron to nw.js
# DEV: We previously copied from Google Chrome, however they have stopped bundling `libffmpegsumo.so`
# Example: `node_modules/electron-prebuilt/dist/libffmpegsumo.so`
libffmpegsumo_src_path="$(node --eval "console.log(require.resolve('electron-prebuilt/dist/libffmpegsumo.so'))")"
# Example: `node_modules/nwjs/libffmpegsumo.so`
libffmpegsumo_target_path="$(node --eval "console.log(require('path').normalize(require.resolve('nw/nwjs/nw') + '/../libffmpegsumo.so'))")"
cp "$libffmpegsumo_src_path" "$libffmpegsumo_target_path"

# Compile our React for nw.js support
npm run build
