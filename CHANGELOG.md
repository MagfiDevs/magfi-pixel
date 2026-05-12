# Changelog

All notable changes to the **Magfi Pixel** GTM template will be documented in
this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-05-12

### Added
- Initial public release of the Magfi Pixel GTM Community Template.
- Built-in event types: `Page View`, `Purchase`, `Lead`, `Sign Up`,
  `Add to Cart`, and `Custom Event` (free-form event name).
- Click ID (`mgfclid`) parsing from URL query parameters and persistence in
  the `mgfcid_cid` cookie for subsequent page views.
- Cross-session tracking via the persistent `mgfcid_uid` visitor ID cookie
  (365-day expiry).
- First-touch attribution via the `mgfcid_fcid` cookie (never overwritten
  once set), in addition to last-touch attribution from the current click ID.
- Session ID tracking via the `mgfcid` cookie (30-day expiry by default,
  configurable in the template UI).
- Optional `Event Value` and `Currency` (ISO 4217) fields for revenue-bearing
  events such as `Purchase`.
- Google Consent Mode v2 support: the tag waits for `analytics_storage`
  consent to be granted before firing, and registers a consent listener to
  fire automatically once consent is granted later in the page lifecycle.
- Locked-down permissions:
  - `send_pixel` restricted to `https://events.magfiads.com/gtm/*`.
  - `set_cookies` restricted to the four Magfi cookie names listed above.
  - `get_cookies` restricted to the four Magfi cookie names listed above.
  - `access_consent` restricted to read-only access for `analytics_storage`.
- Unit tests (`___TESTS___` block) covering: pixel firing with expected
  parameters, consent gating, click-ID-from-URL persistence, first-visit
  user/click ID creation, and first-touch preservation across returning
  visitors.

[Unreleased]: https://github.com/MagfiDevs/magfi-pixel/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/MagfiDevs/magfi-pixel/releases/tag/v1.0.0
