# Partner Extension Documentation

## Extension name

Simple Analytics

## Extension description

[Simple Analytics](https://www.simpleanalytics.com/) is a European privacy-friendly and simple alternative to Google Analytics. No cookies. No trackers. No consent required from your visitors. Just straightforward analytics.

## Extension logo: a high-resolution bitmap image, non-transparent PNG, minimum 320px

## A list of environment variables that your extension will interact with

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

The Simple Analytics extension makes it easy to add privacy-friendly analytics to your Netlify site. It works out of the box and doesn’t use cookies or trackers, so there’s no need for cookie banners or user consent. Once enabled, it starts collecting page views and events while respecting your visitors’ privacy.

You can toggle settings directly in the Netlify UI. For example, you can turn on event tracking for things like outbound link clicks and file downloads, or use a custom domain to bypass ad blockers. There are also more advanced options like ignoring certain pages, tracking hash-based URLs, or overriding the reported domain name.

It’s flexible enough for more custom setups too. You can choose whether to track visits from users with Do Not Track enabled, decide if full URLs or just paths should be logged, and define which file extensions count as downloads. Everything is synced with environment variables so your config stays clean and consistent.

## Whether or not you’re migrating an existing extension to one built with the Netlify SDK

No, this is a new extension.
