# Releasing Hyper

Hyper ships as a desktop app, so "publishing a release" means creating a GitHub Release on
[`vercel/hyper`](https://github.com/vercel/hyper) with the installers attached. Nothing is published
to npm. The in-app updater reads those GitHub Releases through `releases.hyper.is`, so publishing the
GitHub Release is what actually ships the update to users.

## Channels

| Channel | Branch            | Update feed                        |
| ------- | ----------------- | ---------------------------------- |
| stable  | `master`          | `https://releases.hyper.is`        |
| canary  | `canary` (default) | `https://releases-canary.hyper.is` |

`app/updater.ts` picks the feed from the `updateChannel` config value and requests
`https://<feed>/update/<platform>/<current version>` 10 seconds after launch and then every 30
minutes. Those two hosts mirror the GitHub Releases of this repo: the stable feed skips
pre-releases (it currently answers with `v3.4.1`), the canary feed does not (it answers with
`v4.0.0-canary.5`). A release is therefore live for users as soon as its draft is published here,
and marking a canary build as a GitHub **pre-release** is what keeps it off the stable feed.

## What a release is made of

Three things have to line up, all keyed on the same version number:

1. a commit on the release branch that bumps `version` in **both** `package.json` and
   `app/package.json`;
2. a git tag `vX.Y.Z` on that commit;
3. a GitHub Release for tag `vX.Y.Z` holding the installers and the `latest*.yml` metadata that
   `electron-builder` generates.

## Steps

### 1. Bump the version

Both `package.json` and `app/package.json` are bumped in a single commit whose message is the bare
version string (`3.4.1`, `4.0.0-canary.5`, …), tagged `vX.Y.Z`. `npm version <patch|minor|major>`
produces that commit and tag for the root `package.json`; `app/package.json` has to be set to the
same version as part of it.

Do this on `master` for a stable release and on `canary` for a pre-release.

### 2. Create the draft GitHub Release

```bash
npx release        # stable
npx release pre    # canary, marks the release as a pre-release
```

[`release`](https://github.com/vercel/release) collects the commits since the previous tag, asks you
to classify them, and creates a **draft** release for the new tag. `release.js` in the repo root is
its hook: it prompts for the one-line summary that is prepended to the generated changelog.

The draft has to exist before CI reaches its publish step — see step 4 for why.

### 3. Push the branch and the tag

```bash
git push origin master --follow-tags
```

### 4. Let CI build and attach the installers

The push to `master` or `canary` triggers the `Node CI` workflow
(`.github/workflows/nodejs.yml`), which runs `pnpm run dist` (`build` + `electron-builder`) on
macOS, Windows and Ubuntu, plus two `build-linux-arm` jobs that cross-build `armv7l` and `arm64`
Linux packages on a Raspberry Pi OS runner image. macOS and Windows builds are code-signed, and
macOS builds are notarized, from the repository secrets listed below.

`electron-builder` is invoked without an explicit `--publish` flag, so it resolves its own policy:
a branch push sets no CI tag variable, so on CI the policy becomes `onTagOrDraft`. In that mode the
GitHub publisher looks for a release whose tag is `v<version from package.json>` and uploads the
artifacts into it. Concretely:

- **draft release exists** → artifacts are uploaded into it (this is the normal path);
- **no release exists** → nothing is uploaded, and the build silently produces no release;
- **release already published more than 2 hours ago** → the upload is refused (set
  `EP_GH_IGNORE_TIME=true` to override).

That is why step 2 comes before the build finishes.

### 5. Publish the draft

Add the table of per-platform download links to the top of the release notes, then publish it.
Canary releases stay marked as pre-releases.

### 6. Verify the feed

```bash
curl https://releases.hyper.is/update/darwin/<previous version>
curl https://releases-canary.hyper.is/update/darwin/<previous version>
```

Each returns the JSON the Electron updater consumes (`name`, `notes`, `pub_date`), or `204` when the
client is already up to date.

## Repository secrets used by the build

| Secret                  | Used for                                                      |
| ----------------------- | ------------------------------------------------------------- |
| `GITHUB_TOKEN`          | passed as `GH_TOKEN`, lets `electron-builder` upload artifacts |
| `MAC_CERT_P12_BASE64`   | `CSC_LINK`, macOS Developer ID certificate                     |
| `MAC_CERT_P12_PASSWORD` | `CSC_KEY_PASSWORD`                                             |
| `WIN_CERT_P12_BASE64`   | `WIN_CSC_LINK`, Windows code-signing certificate               |
| `WIN_CERT_P12_PASSWORD` | `WIN_CSC_KEY_PASSWORD`                                         |
| `APPLE_ID`              | Apple ID used for notarization                                 |
| `APPLE_PASSWORD`        | passed as `APPLE_APP_SPECIFIC_PASSWORD`, app-specific password |

Each is unset by the build step when empty, so forks build unsigned without failing.

## Gotchas

- The version in `package.json` must not start with `v`; the tag must.
- `app/package.json` is the one `electron-builder` packages. Leaving it behind produces installers
  named after the old version that the updater will never offer.
- A release whose draft was never created gets no artifacts, and the build still reports success.
- `bin/notarize.js` is an `afterSign` hook that returns early unless `APPLE_PASSWORD` is set in the
  environment. CI sets `APPLE_APP_SPECIFIC_PASSWORD` instead, which is the name `electron-builder`'s
  own notarization step reads, so the hook itself does nothing.
- A release can only be built by CI: the macOS installers need a macOS runner and the signing
  certificates, and the Windows installer needs a Windows runner. There is no supported way to cut a
  full release from a developer machine.
