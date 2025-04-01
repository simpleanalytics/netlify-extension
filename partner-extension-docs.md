# Partner Extension Documentation

## Extension name

Simple Analytics

## Extension description

[Simple Analytics](https://www.simpleanalytics.com/) is a privacy-friendly and simple alternative to Google Analytics. No cookies. No trackers. No consent required from your visitors. Just straightforward analytics.

## Extension logo: a high-resolution bitmap image, non-transparent PNG, minimum 320px

## A list of environment variables that your extension will interact with

- SIMPLE_ANALYTICS_DISABLED
- SIMPLE_ANALYTICS_AUTO_COLLECT_EVENTS
- SIMPLE_ANALYTICS_PROXY_ENABLED
- SIMPLE_ANALYTICS_EVENT_DATA_COLLECT
- SIMPLE_ANALYTICS_EVENT_DATA_EXTENSIONS
- SIMPLE_ANALYTICS_EVENT_DATA_USE_TITLE
- SIMPLE_ANALYTICS_EVENT_DATA_FULL_URLS
- SIMPLE_ANALYTICS_DATA_CUSTOM_DOMAIN
- SIMPLE_ANALYTICS_DATA_COLLECT_DNT
- SIMPLE_ANALYTICS_DATA_AUTO_COLLECT
- SIMPLE_ANALYTICS_DATA_IGNORE_PAGES
- SIMPLE_ANALYTICS_DATA_HOSTNAME
- SIMPLE_ANALYTICS_DATA_MODE

## A detailed description of what your extension does and how it works

The extension uses an edge function to inject the Simple Analytics script into the HTML of websites.
This is done using the WASM implementation of HTMLRewriter.
Depending on the configuration the edge function might inject different scripts.

The extension allows users to use different analytics scripts per website though environment variables.

Furthermore, the three additional edge functions (/proxy.js, /auto-events.js, /simple/*) are included to proxy requests to Simple Analytics, for scripts and sending metrics, and avoid these from being blocked by adblockers.

## Whether or not you’re migrating an existing extension to one built with the Netlify SDK

No, this is a new extension.