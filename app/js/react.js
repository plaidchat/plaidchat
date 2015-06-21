// TODO: Instead of doing this, maybe set up a repo for building new versions of React
// Load in React and override it to allow `nw.js` HTML attributes
var HTMLDOMPropertyConfig = require('react/lib/HTMLDOMPropertyConfig');
HTMLDOMPropertyConfig.Properties.nwdisable = null;
HTMLDOMPropertyConfig.Properties.nwfaketop = null;
HTMLDOMPropertyConfig.Properties.nwUserAgent = null;

// Expose React to the window scope
window.React = require('react');
