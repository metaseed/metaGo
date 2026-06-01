## What gets published

- `metaWord`: `src/metaWord` (extension id: `metaseed.metaWord`)
- `metaJump`: `src/metaJump` (extension id: `metaseed.metaJump`)
- `metaGo`: repo root (extension id: `metaseed.metago`)
  - `metaGo` is an **extension pack** that references `metaWord` + `metaJump`
  - `metaSelect` is **part of metaGo** (module under `src/metaSelect/`), not a standalone marketplace extension in this repo.

Publishing order matters: **members first**, then the pack. `dev/publish.ps1` enforces this (`metaWord` → `metaJump` → `metaGo`).

## One-time setup

Install `vsce` (the publish script can also auto-install it if missing):

```powershell
npm install -g @vscode/vsce
```

Install `ovsx` (optional; publish script can also use `npx ovsx` without a global install):

```powershell
npm install -g ovsx
```

## Marketplace PAT (token)

`vsce` needs a Marketplace Personal Access Token (PAT) for publisher `metaseed`.

1. Sign in to Azure DevOps:
   - org: `https://metaseed.visualstudio.com/`
   - account: `metaseed@live.com`
2. Create a PAT:
   - tokens page: `https://metaseed.visualstudio.com/_usersSettings/tokens`
   - organization: **All accessible organizations**
   - scopes: **Marketplace → Manage**
   - expiration: as desired (e.g. 90 days)
3. Provide the token to publishing in **one** of these ways:
   - pass inline: `pwsh -File .\dev\publish.ps1 -Pat <TOKEN>`
   - env var (current shell): `$env:VSCE_PAT = '<TOKEN>'`
   - repo `.env` (git-ignored): `VSCE_PAT=<TOKEN>`
   - stored login: `npm run login` (same as `vsce login metaseed`)

Ref: `https://code.visualstudio.com/api/working-with-extensions/publishing-extension#get-a-personal-access-token`

## Open VSX token (third-party marketplace)

Open VSX publishing needs an Open VSX Personal Access Token for namespace `metaseed`.

1. Sign in: `https://open-vsx.org/`
2. Create a token: `https://open-vsx.org/user-settings/tokens`
3. Provide the token in **one** of these ways:
   - pass inline: `pwsh -File .\dev\publish.ps1 -OvsxPat <TOKEN>`
   - env var (current shell): `$env:OVSX_PAT = '<TOKEN>'`
   - repo `.env` (git-ignored): `OVSX_PAT=<TOKEN>`
   - stored login: `ovsx login metaseed`

`dev/publish.ps1` validates it up front via `ovsx verify-pat metaseed` and will guide you interactively if missing/invalid.
If the namespace `metaseed` does not exist yet, the script will automatically run `ovsx create-namespace metaseed` (requires a token via `OVSX_PAT` / `-OvsxPat` / `.env`).
When publishing, the script uses `ovsx publish --skip-duplicate`, so already-published versions are treated as a warning/skip (not a hard error).

## Recommended publish flow (scripted)

### 1) Dry-run (prints commands only)

```powershell
pwsh -File .\dev\publish.ps1 -DryRun
```

### 2) Package-only (build + create `.vsix`, no upload)

```powershell
pwsh -File .\dev\publish.ps1 -PackageOnly
```

### 3) Publish

Choose the target marketplace:

- `-Marketplace all` (default): publish to **VS Marketplace + Open VSX**
- `-Marketplace vscode`: publish to **VS Marketplace only**
- `-Marketplace openVSX`: publish to **Open VSX only**

Publish all targets (members first, then pack):

```powershell
pwsh -File .\dev\publish.ps1 -Target all
```

Publish just one:

```powershell
pwsh -File .\dev\publish.ps1 -Target metaWord
pwsh -File .\dev\publish.ps1 -Target metaJump
pwsh -File .\dev\publish.ps1 -Target metaGo
```

Skip git tag + push (uses each package’s `publishOnly` script):

```powershell
pwsh -File .\dev\publish.ps1 -Target all -NoGitTag
```

Publish to VS Marketplace only:

```powershell
pwsh -File .\dev\publish.ps1 -Marketplace vscode -Target all
```

Publish to Open VSX only:

```powershell
pwsh -File .\dev\publish.ps1 -Marketplace openVSX -Target all
```

Publish with an explicit PAT (bypasses tag/push and calls `vsce publish -p`):

```powershell
pwsh -File .\dev\publish.ps1 -Target all -Pat <TOKEN>
```

Publish to Open VSX with an explicit token:

```powershell
pwsh -File .\dev\publish.ps1 -Marketplace openVSX -Target all -OvsxPat <TOKEN>
```

## Notes

- `dev/publish.ps1` validates auth up front via:
  - VS Marketplace: `vsce verify-pat metaseed`
  - Open VSX: `ovsx verify-pat metaseed`
- Each target builds **desktop + web** bundles and ships a single VSIX.
- The “full publish” npm scripts create a git tag like `<name>V<version>` and push tags; keep your working tree clean for releases.