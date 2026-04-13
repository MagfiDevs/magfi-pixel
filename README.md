# Magfi Pixel

Google Tag Manager (GTM) template for tracking ad clicks and conversions on your site. Sends events to the Magfi analytics backend.

## Supported Events

- Page View
- Purchase
- Lead
- Sign Up
- Add to Cart
- Custom Events

## Features

- Click ID (`mgfclid`) parsing and cookie persistence
- Cross-session tracking with persistent visitor ID
- First-touch and last-touch attribution
- Google Consent Mode v2 support

## Setup

1. Import `template.tpl` into GTM Template Editor
2. Create a new tag using the Magfi Pixel template
3. Enter your Tracking ID
4. Select the event type and configure triggers

## Cookies

| Cookie | Duration | Purpose |
|---|---|---|
| `mgfcid` | 30 days | Session ID |
| `mgfcid_cid` | 30 days | Click ID persistence |
| `mgfcid_uid` | 365 days | Persistent visitor ID |
| `mgfcid_fcid` | 365 days | First-touch click ID |

## License

Apache 2.0
