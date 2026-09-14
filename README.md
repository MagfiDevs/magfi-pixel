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

Cookies and visitor/page/referrer metadata are used only when a click ID is
available from the URL or the existing click cookie. Without one, the tag reads
only the click cookie and sends an unmatched request containing `tid`, `eid`,
`et`, `ts`, empty `cid`, and the existing optional `val`/`cur` fields. It creates
no cookies. Matched attribution and analytics consent behavior are preserved.

| Cookie | Duration | Purpose |
|---|---|---|
| `mgfcid` | 30 days | Session ID |
| `mgfcid_cid` | 30 days | Click ID persistence |
| `mgfcid_uid` | 365 days | Persistent visitor ID |
| `mgfcid_fcid` | 365 days | First-touch click ID |

## Conversion Manager testing (local GTM Preview only)

1. Update older deployed Magfi templates to this version in your local GTM
   workspace before testing; old versions do not support `testSession`.
2. Obtain a signed session token from Conversion Manager. Set **Test Session**
   (`testSession`) on **every Magfi tag being tested**, only in local GTM Preview.
   Do not publish a session token or a container containing one.
3. Trigger the real page view, purchase, lead, sign-up, add-to-cart or custom
   event. Each actual firing sends `test_session` to the existing
   `https://events.magfiads.com/gtm/api/v1/events` endpoint. No synthetic test
   event, automatic success, conversion activation, or consent bypass is added.
4. Check server-side validation/results in Conversion Manager. Pixel transport
   success is not evidence of HMAC acceptance, conversion success or activation.
5. Explicitly clear Test Session on all tested tags when finished, before any
   later publish. Expiry does **not** clear the marker or restore production
   tracking. Replace an expired token to continue testing.

While marked, the tag does not read or write cookies, query parameters, page URL
or referrer. Its payload is limited to `tid`, `eid`, `et`, `ts`, empty `cid`,
`test_session` and the existing optional `val`/`cur` fields. The browser does not
validate HMAC or expiry. Nonempty URL-safe strings (letters, digits, `-`, `_`,
`.`; at most 2048 characters) are forwarded unchanged, even when expired or
cryptographically invalid. Unsafe characters, oversized strings or non-string
configured values become the non-signed `invalid_test_session` sentinel. They
stay marked and must fail server validation, never fall back to production.
Absent/null/empty fields use normal tracking. The server must reject every
invalid marked request; these local tests do not verify server behavior.

No new global/bridge API or storage permission is required.

## Local verification

Run `node --test tests/template.test.js` with Node's built-in test runner. It
executes the actual template sandbox source with mocked GTM APIs, including the
inline scenarios. No dependencies or network are needed. GTM import, Preview
and server validation are separate integration checks, not performed by this
runner.

## License

Apache 2.0
