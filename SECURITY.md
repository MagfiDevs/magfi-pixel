# Security Policy

## Supported versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |
| < 1.0   | :x:                |

Only the latest published version of the Magfi Pixel template receives
security fixes. The Magfi Pixel is distributed through the Google Tag Manager
Community Template Gallery; once a fix is released, users are expected to
update through the GTM template gallery UI.

## Reporting a vulnerability

If you believe you have found a security vulnerability in the Magfi Pixel
template, **please do not open a public GitHub issue**. Instead, report it
privately so we can investigate and ship a fix before the details become
public.

- **Email:** [security@magfiads.com](mailto:security@magfiads.com)
- **Subject line:** `[magfi-pixel security] <short description>`

Please include:

- A description of the issue and the security impact (data exposure, code
  execution in the GTM sandbox, privilege escalation, consent bypass, etc.).
- A minimal reproduction (template configuration, trigger setup, sample
  page, sample URL).
- The version of the template (commit SHA in `metadata.yaml` or version
  number in `template.tpl`).
- Your contact information for follow-up questions.

## What to expect

- **Acknowledgement:** within **3 business days** of receiving your report.
- **Triage and initial assessment:** within **7 business days**, including
  whether we consider the issue in scope and a preliminary severity rating.
- **Fix and disclosure timeline:** discussed with you in private. For
  high-severity issues we aim to ship a fix within 30 days. We will credit
  you in the [CHANGELOG](CHANGELOG.md) and the release notes unless you ask
  to remain anonymous.

## In scope

- Issues in `template.tpl` that allow data exfiltration, unauthorised
  cookie writes, consent-mode bypass, sandbox escape, or attribution
  tampering by an unprivileged web visitor.
- Issues in the `___WEB_PERMISSIONS___` block that grant the template more
  capability than required.
- Issues in `metadata.yaml` or the published gallery listing that could
  trick a GTM administrator into installing a malicious version.

## Out of scope

- Vulnerabilities in Google Tag Manager itself (please report those to
  Google).
- Vulnerabilities in the Magfi events backend (`events.magfiads.com`);
  please email [security@magfiads.com](mailto:security@magfiads.com) and we
  will route them internally.
- Privacy / consent configuration mistakes made by the site operator (the
  template respects `analytics_storage` Consent Mode v2, but the site
  operator is responsible for declaring consent state correctly).
- Reports generated solely by automated scanners with no proof of impact.
