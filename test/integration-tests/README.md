# plaidchat integration tests
Testing a full [nw.js][] can be quite tricky. This document is here to help you get your bearings and understand the purpose of each part.

## Architecture
- `*.js` - These are tests for specific functions of `plaidchat`
- `utils/` - These are utilities used by tests (e.g. starting up an nw.js instance, finding an active window in `plaidchat`)
- `test-server/` - These are static files used to mock the internals of the Slack web client
    - We don't need the full client experience but we need to mock over how `plaidchat` interacts with it

## Debugging
In order to debug the state of a window for a failing test, we can tell `mocha` to not kill the browser instance. To do this, add a `killBrowser: false` option to `openPlaidchat`:

```js
// Allows mocha to run but doesn't clean up window after test fails
browserUtils.openPlaidchat({killBrowser: false});
```
