plaidchat [![Build Status](https://travis-ci.org/plaidchat/plaidchat.svg?branch=master)](https://travis-ci.org/plaidchat/plaidchat)
=============

A Slack client for Linux. Uses [nw.js][].

**Features:**

- Tray icon with notifications
- Multi-team support
- Watch videos in application

![Screenshot](docs/screenshot.png)

[nw.js]: https://github.com/nwjs/nw.js

Installing
==========

1) [Install Node.js](http://nodejs.org/download/). If Node.js is already installed, please continue.

2) Install `plaidchat` via `npm`

```bash
npm install plaidchat -g
```

3) Run `plaidchat`

If you have setup correctly, the above command will install the package
somewhere in your path.

Then you can run your client from your terminal of choice.

```bash
plaidchat
```

`plaidchat` is not created by, affiliated with, or supported by Slack Technologies, Inc.

CLI options
===========
We provide various CLI options via `plaidchat --help`

```bash
$ plaidchat --help

  Usage: plaidchat [options]

  Options:

    -h, --help          output usage information
    -V, --version       output the version number
    --minimize-to-tray  When the tray icon is clicked, hide the window rather than minimize
    --close-to-tray     When the close button is clicked, minimize the app to tray instead of killing it.

    --force-device-scale-factor=[value]
                        Sets the UI scaling factor (default: 1, set to 2 for high-DPI)

```

Running and Developing
======================

#### Clone the repo

```bash
git clone git@github.com:plaidchat/plaidchat.git && cd plaidchat
```

#### Install dependencies

```bash
npm install
```

#### Run it

```bash
npm start
```

Application structure
=====================
Our application is built on top of [React][] and [Flux][]. The folders for our application are:

- app/ - Container for our application
    - css/ - CSS for our application
    - components/ - Container for different React components
    - dispatchers/ - Container for Flux dispatchers
    - js/ - JS that handle `nw.js` setup and initial loading of React
    - stores/ - Container for Flux stores
    - views/ - HTML pages loaded by `nw.js`

[React]: https://github.com/facebook/react
[Flux]: http://github.com/facebook/flux

With the [Flux][] infrastructure, all our data flows one-way; from components to dispatchers to stores to components (and repeat).

- Components manage the DOM and rendering other components
    - From the MVC perspective, it's a hybrid of controllers/views
- Dispatchers manage passing through events from components to stores
    - These are more/less global single-channel mediators
- Stores manage internal application data and emit events on change
    - These are a hybrid of models/controllers as they both save state as well as manage its updates

More information can be read in the Flux documentation:

<http://facebook.github.io/flux/>

Testing
=======
Tests can be run via the following commands:

```bash
# Start up a Selenium server for integration tests
npm run start-webdriver

# In another tab, run all our tests (unit, integration, linting)
npm test
```

The integration tests require a bit of explanation. Please see [their documentation for more info][integration-tests-docs].

[integration-tests-docs]: test/integration-tests/README.md

Issues
======
libudev.so
----------
[JBKahn](https://github.com/JBKahn) Pointed out that libudev.so differs on different
machines. If you run into

```
./resources/node-webkit/Linux64/nw: error while loading shared libraries: libudev.so.0: cannot open shared object file: No such file or directory
```

Give [Issue #1](https://github.com/plaidchat/plaidchat/issues/1) a look.

Crashing when receiving direct message
--------------------------------------
We have had multiple reports of `plaidchat` crashing when a direct message is received.

This typically is caused by installing while an older version of Google Chrome is on your machine (we use its `libffmpegsumo.so` for audio bindings).

To fix the issue, perform the following steps:

1. Update your version of Google Chrome to its latest version
    - For example, if your Google Chrome was installed via `apt`/`dpkg`, then run `apt-get install google-chrome-stable`
2. Reinstall `plaidchat` to pick up the latest version of `libffmpegsumo.so`
    - `npm uninstall -g plaidchat && npm install -g plaidchat`

Contributing
============
Interested in contributing? Great, we are always looking for more great people.

Get started by finding an issue with the "help wanted" label and submitting a pull request.

https://github.com/plaidchat/plaidchat/issues?q=label%3A%22help+wanted%22

License
=======
`plaidchat` is licensed under the [MIT license][].

Upon installation, we may copy `libffmpegsumo.so` from `/opt/google/chrome` (from [ffmpeg][]) into our repository. We are required to mention that this file is licensed under the [GPL license][ffmpeg-license].

[MIT License]: LICENSE
[ffmpeg]: http://ffmpeg.org/
[ffmpeg-license]: docs/ffmpeg-license.txt

------------

[![Analytics](https://ga-beacon.appspot.com/UA-63524506-1/slack-for-linux/read-me)](https://github.com/igrigorik/ga-beacon)
