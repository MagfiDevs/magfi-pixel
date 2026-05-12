# Contributing to Magfi Pixel

Thanks for taking the time to contribute! This document describes how to
report issues, propose changes, and set up a local development workflow for
the Magfi Pixel Google Tag Manager template.

## Code of Conduct

This project and everyone participating in it is governed by our
[Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to
uphold this code. Please report unacceptable behavior to
[devs@magfiads.com](mailto:devs@magfiads.com).

## How can I contribute?

### Reporting bugs

Before opening a bug report:

1. Search [existing issues](https://github.com/MagfiDevs/magfi-pixel/issues)
   to make sure the bug has not already been reported.
2. Confirm you are running the latest published version of the template
   (see the [Changelog](CHANGELOG.md)).
3. Reproduce the issue in **GTM Preview / Debug Mode** so you can capture
   the request payload and any console errors.

When you open the issue, use the **Bug report** issue template and include
as much of the following as you can:

- GTM container version and template version.
- Browser, browser version, and operating system.
- A minimal reproduction (a public test page or a description of the
  trigger/variable configuration).
- The exact event configuration in the template UI (event type, tracking ID
  placeholder, optional fields).
- The expected behaviour, the observed behaviour, and any console / network
  errors.

### Requesting a feature

Open an issue using the **Feature request** template and describe:

- The marketing / analytics use case the feature should enable.
- The alternatives you have considered.
- Whether the feature would require any new permissions or external endpoints
  (these have heavy implications for Community Template Gallery review).

### Asking a question

For usage questions, please email
[support@magfiads.com](mailto:support@magfiads.com) or post in the
[GitHub Discussions](https://github.com/MagfiDevs/magfi-pixel/discussions)
section when it is enabled. Keep the issue tracker focused on bugs and
feature requests.

## Pull requests

1. Fork the repository and create a feature branch from `master`:
   `git checkout -b feat/short-description`.
2. Make your changes in `template.tpl` (and matching tests in the
   `___TESTS___` block at the bottom of the file).
3. Update [CHANGELOG.md](CHANGELOG.md) under `## [Unreleased]`.
4. Update [README.md](README.md) when behaviour, fields, or permissions
   change.
5. Open the PR against `master` using the PR template. Link any related
   issues.

PRs that change permissions, add new endpoints, or add new cookies need
extra reviewer attention because they affect the Google Community Template
Gallery review. Please call those changes out explicitly in the PR
description.

## Development setup

The Magfi Pixel is a single-file GTM template (`template.tpl`). There is no
build step, no package manager, and no JavaScript runtime outside the GTM
sandbox.

### Editing the template

1. Open the [GTM Template Editor](https://tagmanager.google.com/) in a
   workspace you own (a personal sandbox container is fine).
2. Create a new **Tag template** and use the **Import** action in the editor
   menu to load `template.tpl`.
3. Make your changes in the editor. The editor enforces the sandboxed JS
   subset that GTM accepts (no DOM access, no globals, no `eval`, etc.).
4. Use the editor's **Export** action to save the file back to your local
   clone, overwriting `template.tpl`.
5. Run the **Tests** tab in the editor to make sure all scenarios in the
   `___TESTS___` block still pass.

### Testing in a real container

1. Create a new GTM tag using the Magfi Pixel template.
2. Configure a `Page View` trigger and a placeholder Tracking ID.
3. Use GTM **Preview** mode to load a page with `?mgfclid=mgf.1.100.200.300.1670000000000.98765432100000`
   appended to verify click ID parsing, cookie persistence, and the outgoing
   pixel request to `events.magfiads.com`.

### Code style

The sandboxed JS inside `___SANDBOXED_JS_FOR_WEB_TEMPLATE___` follows these
conventions:

- Use `const` for imports and configuration, `var` for mutable locals (GTM
  sandbox does not support `let` in older container versions reliably).
- Prefer early returns over deeply nested branches.
- Always feature-detect permissions with `queryPermission(...)` before
  calling APIs that need them.
- Never log to the console in production code paths.
- Keep helper functions at the bottom of the file, below the main
  `executeTag()` flow.
- Add or update a `___TESTS___` scenario for every behavioural change.

## Commit messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add support for refund event type
fix: respect existing first-touch click ID on consent re-grant
docs: clarify permissions justification in README
chore: bump template version to 2
test: cover currency parameter in pixel URL
```

## Releasing

Releases are cut by maintainers:

1. Update `## [Unreleased]` in `CHANGELOG.md` to a versioned section.
2. Bump the `version` field in the `___INFO___` block of `template.tpl`
   when the change is user-visible.
3. Tag the release: `git tag -a vX.Y.Z -m "vX.Y.Z"` and push tags.
4. Update `metadata.yaml` with the new version's commit SHA and
   `changeNotes`.
5. Publish a GitHub Release using the changelog entry as the body.

## License

By contributing to Magfi Pixel, you agree that your contributions will be
licensed under the [Apache License 2.0](LICENSE).
