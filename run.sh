#!/bin/bash
grunt dist-linux
./resources/node-webkit/Linux64/nw ./dist/Linux64/app.nw
