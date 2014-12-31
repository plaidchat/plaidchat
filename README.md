slack-for-linux [![Build Status](https://travis-ci.org/wlaurance/slack-for-linux.svg?branch=master)](https://travis-ci.org/wlaurance/slack-for-linux)
=============

Slack client for linux 64. Uses Node Webkit

If you are still on a 32 bit version of linux, it is easy to change the install
script to support your platform.

Installing
==========

[Install Node](http://nodejs.org/download/) Skip if you already have node.

```
npm install slack-for-linux -g
```

If you have setup correctly, the above command will install the package
somewhere in your path.

Then you can run your client from your terminal of choice.

```
slack-for-linux
```

Why
===

Forgot my mac charger for a trip, and only had a linux laptop.
I wanted to make an app using [node-webkit](https://github.com/rogerwang/node-webkit).

You should probably just use the chrome extension from Slack. But
if you are not a chrome user, this could be something worth while.

Running and Developing
======================

####Clone the repo

```
git clone git@github.com:wlaurance/slack-for-linux.git && cd slack-for-linux
```

####Install deps

```
npm install
```

####Run It

```
./run.js
```

Issues
======
[JBKahn](https://github.com/JBKahn) Pointed out that libudev.so differs on different
machines. If you run into

```
./resources/node-webkit/Linux64/nw: error while loading shared libraries: libudev.so.0: cannot open shared object file: No such file or directory
```

Give [Issue #1](https://github.com/wlaurance/slack-for-linux/issues/1) a look.
