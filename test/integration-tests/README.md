# plaidchat integration tests
Testing a full [nw.js][] can be quite tricky. This document is here to help you get your bearings and understand the purpose of each part.

## Architecture
- `*.js` - These are tests for specific functions of `plaidchat`
- `utils/` - These are utilities used by tests (e.g. starting up an nw.js instance, finding an active window in `plaidchat`)
- `test-server/` - These are static files used to mock the internals of the Slack web client
    - We don't need the full client experience but we need to mock over how `plaidchat` interacts with it
