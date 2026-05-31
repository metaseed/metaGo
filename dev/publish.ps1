<#
.SYNOPSIS
  Auto-publish metaGo and/or its packed extensions (metaJump, metaWord) to the
  VS Marketplace. Each extension ships a single VSIX that contains BOTH the
  desktop (main / node) and web (browser / webworker) bundles, so one publish
  per extension covers local + web.

.DESCRIPTION
  For each selected target this script runs the extension's own npm publish
  flow, which builds the changelog + both webpack bundles (vscode:prepublish)
  and then uploads via vsce.

  Order matters for the pack: members (metaWord, metaJump) are published before
  the metaGo pack so the pack always references already-published versions.

.PARAMETER Target
  Which extension(s) to publish: metaGo, metaJump, metaWord, or all (default).

.PARAMETER PackageOnly
  Build + package each target into a local .vsix (release/) WITHOUT uploading.
  Useful to verify both bundles are present before a real publish.

.PARAMETER NoGitTag
  Use the 'publishOnly' script (vsce publish only) instead of 'publish',
  skipping the git tag + push step.

.PARAMETER Pat
  Personal Access Token for the Marketplace. If omitted, the script falls back
  to the VSCE_PAT env var, then a VSCE_PAT=... line in the repo-root .env, then
  any stored 'vsce login' credentials. Before any publish the token is validated
  with 'vsce verify-pat'; if none works, the script prints step-by-step guidance
  for creating one and stops.

.PARAMETER SkipVsceInstall
  Do NOT auto-install vsce when it is missing. By default, if no vsce CLI is
  found (neither globally on PATH nor locally in a target's node_modules), the
  script installs it globally via 'npm install -g @vscode/vsce'.

.PARAMETER DryRun
  Print the commands that would run without executing them.

.EXAMPLE
  ./dev/publish.ps1
  Publish all three extensions (members first, then the pack), with git tags.

.EXAMPLE
  ./dev/publish.ps1 -Target metaGo -NoGitTag
  Publish only metaGo via vsce, skipping the git tag + push.

.EXAMPLE
  ./dev/publish.ps1 -PackageOnly
  Produce local .vsix files for all targets without uploading.
#>
param(
  [Parameter(Mandatory = $false)]
  [ValidateSet('metaGo', 'metaJump', 'metaWord', 'all')]
  [string] $Target = 'all',

  [Parameter(Mandatory = $false)]
  [switch] $PackageOnly,

  [Parameter(Mandatory = $false)]
  [switch] $NoGitTag,

  [Parameter(Mandatory = $false)]
  [string] $Pat,

  [Parameter(Mandatory = $false)]
  [switch] $SkipVsceInstall,

  [Parameter(Mandatory = $false)]
  [switch] $DryRun
)
$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot

# Fail fast if the repo has uncommitted changes. The full-publish path bumps the
# changelog, creates a git tag and pushes, so a dirty tree would tag/publish an
# unexpected state. Honored only for tagging modes; DryRun warns instead.
function Assert-CleanWorkingTree {
  $status = & git -C $repoRoot status --porcelain
  if ($LASTEXITCODE -ne 0) {
    throw "Failed to read git status (is '$repoRoot' a git repo?)."
  }
  if ($status) {
    if ($DryRun) {
      Write-Host "  DRY RUN: working directory is not clean (would fail):" -ForegroundColor Magenta
      $status | ForEach-Object { Write-Host "    $_" -ForegroundColor Magenta }
      return
    }
    Write-Host ""
    Write-Host "Working directory is not clean. Commit or stash these changes first:" -ForegroundColor Red
    $status | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
    throw "Working directory is not clean."
  }
}

function Get-ExtensionDir([string] $repoRoot, [string] $target) {
  switch ($target) {
    'metaGo'   { return $repoRoot }
    'metaJump' { return (Join-Path $repoRoot 'src\metaJump') }
    'metaWord' { return (Join-Path $repoRoot 'src\metaWord') }
    default { throw "Unknown target '$target'." }
  }
}

# Publish order: pack members first, then the metaGo pack last.
function Get-Targets([string] $target) {
  if ($target -eq 'all') {
    return @('metaWord', 'metaJump', 'metaGo')
  }
  return @($target)
}

function Invoke-InDir([string] $dir, [scriptblock] $action) {
  Push-Location $dir
  try { & $action } finally { Pop-Location }
}

# On Windows the bare 'npm' shim mangles splatted args in PowerShell; prefer
# the platform launcher (npm.cmd / npx.cmd) when present.
function Resolve-Launcher([string] $name) {
  $cmd = Get-Command "$name.cmd" -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  return $name
}

$script:NpmCmd = Resolve-Launcher 'npm'
$script:NpxCmd = Resolve-Launcher 'npx'
$script:Publisher = 'metaseed'

function Test-CommandExists([string] $name) {
  return [bool](Get-Command $name -ErrorAction SilentlyContinue)
}

# Locate a vsce binary inside a given extension dir's node_modules/.bin.
function Get-LocalVsceBin([string] $dir) {
  foreach ($f in @('vsce.cmd', 'vsce.ps1', 'vsce')) {
    $p = Join-Path $dir (Join-Path 'node_modules\.bin' $f)
    if (Test-Path $p) { return $p }
  }
  return $null
}

# Resolve a concrete vsce command for this script's own direct calls: prefer a
# global vsce on PATH, then a local one in the current/repo dir, else fall back
# to 'npx -y @vscode/vsce'.
function Resolve-VsceCommand {
  $g = Get-Command 'vsce' -ErrorAction SilentlyContinue
  if ($g) { return $g.Source }
  $local = Get-LocalVsceBin (Get-Location).Path
  if (-not $local) { $local = Get-LocalVsceBin $repoRoot }
  return $local
}

function Invoke-Vsce([string[]] $vsceArgs) {
  $cmd = Resolve-VsceCommand
  if ($cmd) {
    & $cmd @vsceArgs
  } else {
    & $script:NpxCmd '-y' '@vscode/vsce' @vsceArgs
  }
}

# Make sure a vsce CLI is available for BOTH the npm scripts (which call a bare
# 'vsce') and this script's direct calls. npm resolves 'vsce' from either a
# global install on PATH or the extension's local node_modules/.bin, so we are
# fine if vsce is global OR present locally in every target. Otherwise we
# auto-install it globally (unless -SkipVsceInstall).
function Ensure-Vsce([string[]] $targetDirs) {
  Write-Host ""
  Write-Host "Checking vsce availability..." -ForegroundColor White

  if (Test-CommandExists 'vsce') {
    Write-Host "  vsce: found on PATH (global)" -ForegroundColor Green
    return
  }

  $missingLocal = @($targetDirs | Where-Object { -not (Get-LocalVsceBin $_) })
  if ($missingLocal.Count -eq 0) {
    Write-Host "  vsce: found locally in each target's node_modules" -ForegroundColor Green
    return
  }

  Write-Host "  vsce: not on PATH and missing a local install in:" -ForegroundColor Yellow
  $missingLocal | ForEach-Object { Write-Host "        $_" }

  if ($SkipVsceInstall) {
    throw "vsce is not available. Install it (npm install -g @vscode/vsce), run 'npm install' in each target, or drop -SkipVsceInstall to auto-install."
  }

  Write-Host "  installing vsce globally: npm install -g @vscode/vsce" -ForegroundColor Yellow
  if (-not $DryRun) {
    & $script:NpmCmd install -g '@vscode/vsce'
    if ($LASTEXITCODE -ne 0) {
      throw "Failed to auto-install vsce. Install manually: npm install -g @vscode/vsce"
    }
    if (-not (Test-CommandExists 'vsce')) {
      throw "vsce installed but not found on PATH. Restart your shell so PATH updates take effect, then re-run."
    }
  }
  Write-Host "  vsce: installed" -ForegroundColor Green
}

# Resolve a PAT from (in priority order): -Pat param, VSCE_PAT env var, or a
# VSCE_PAT=... line in the repo-root .env (see dev/publish.md).
function Get-ResolvedPat {
  if ($Pat) { return $Pat }
  if ($env:VSCE_PAT) { return $env:VSCE_PAT }

  $envFile = Join-Path $repoRoot '.env'
  if (Test-Path $envFile) {
    $match = Select-String -Path $envFile -Pattern '^\s*VSCE_PAT\s*=\s*(.+?)\s*$' |
      Select-Object -First 1
    if ($match) {
      return $match.Matches[0].Groups[1].Value.Trim().Trim('"').Trim("'")
    }
  }
  return $null
}

function Show-PatGuidance {
  Write-Host ""
  Write-Host "============================================================" -ForegroundColor Yellow
  Write-Host " No valid Marketplace Personal Access Token (PAT) found." -ForegroundColor Yellow
  Write-Host "============================================================" -ForegroundColor Yellow
  Write-Host ""
  Write-Host "vsce needs a PAT for publisher '$script:Publisher' to publish."
  Write-Host "How to get one:" -ForegroundColor White
  Write-Host "  1. Sign in to Azure DevOps (account: metaseed@live.com):"
  Write-Host "       https://metaseed.visualstudio.com/"
  Write-Host "  2. Create a Personal Access Token:"
  Write-Host "       https://metaseed.visualstudio.com/_usersSettings/tokens"
  Write-Host "     - Organization: All accessible organizations"
  Write-Host "     - Scopes: Custom defined -> Marketplace -> Manage"
  Write-Host "     - Expiration: as desired (e.g. 90 days)"
  Write-Host "  3. Provide the token to this script in ONE of these ways:"
  Write-Host "       a) Pass it inline:        ./dev/publish.ps1 -Pat <TOKEN>"
  Write-Host "       b) Set an env var:        `$env:VSCE_PAT = '<TOKEN>'"
  Write-Host "       c) Add to repo .env:      VSCE_PAT=<TOKEN>   (.env is git-ignored)"
  Write-Host "       d) Or log in once:        npm run login   (== vsce login $script:Publisher)"
  Write-Host ""
  Write-Host "Docs: https://code.visualstudio.com/api/working-with-extensions/publishing-extension#get-a-personal-access-token"
  Write-Host ""
}

# Prompt the user to paste a PAT (input hidden). Returns the trimmed token, or
# $null if nothing was entered.
function Read-PatInteractive {
  $secure = Read-Host -Prompt "Paste your Marketplace PAT (input hidden, Enter to cancel)" -AsSecureString
  if (-not $secure -or $secure.Length -eq 0) { return $null }

  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try {
    $plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
  }

  if ([string]::IsNullOrWhiteSpace($plain)) { return $null }
  return $plain.Trim()
}

# Make sure '.env' is git-ignored before we write secrets into it.
function Ensure-EnvGitignored {
  $gitignore = Join-Path $repoRoot '.gitignore'
  $ignored = $false
  if (Test-Path $gitignore) {
    $ignored = [bool](Select-String -Path $gitignore -Pattern '^\s*\.env\s*$' -Quiet)
  }
  if (-not $ignored) {
    Add-Content -Path $gitignore -Value ".env"
    Write-Host "  added '.env' to .gitignore" -ForegroundColor DarkGray
  }
}

# Persist VSCE_PAT into the repo-root .env (create or update the line).
function Save-PatToEnvFile([string] $pat) {
  Ensure-EnvGitignored
  $envFile = Join-Path $repoRoot '.env'

  if (Test-Path $envFile) {
    $lines = @(Get-Content $envFile)
    if ($lines -match '^\s*VSCE_PAT\s*=') {
      $lines = $lines | ForEach-Object {
        if ($_ -match '^\s*VSCE_PAT\s*=') { "VSCE_PAT=$pat" } else { $_ }
      }
    } else {
      $lines += "VSCE_PAT=$pat"
    }
  } else {
    $lines = @("VSCE_PAT=$pat")
  }

  Set-Content -Path $envFile -Value $lines -Encoding UTF8
  Write-Host "  saved PAT to $envFile (git-ignored)" -ForegroundColor Green
}

# Ask where to persist the freshly entered PAT.
function Read-StorageChoice {
  Write-Host ""
  Write-Host "Store this PAT for next time?" -ForegroundColor White
  Write-Host "  [1] repo .env file  (VSCE_PAT=..., git-ignored)   [recommended]"
  Write-Host "  [2] persistent user environment variable (VSCE_PAT)"
  Write-Host "  [3] don't store - use for this run only"
  do {
    $choice = (Read-Host "Choose 1/2/3").Trim()
  } while ($choice -notin @('1', '2', '3'))
  return $choice
}

# Full interactive recovery: guidance -> paste PAT -> validate -> choose storage.
# Returns a valid PAT, or throws if it can't obtain one.
function Resolve-PatInteractively {
  Show-PatGuidance

  if (-not [Environment]::UserInteractive) {
    throw "No valid PAT and the session is non-interactive. Supply one via -Pat, VSCE_PAT, or .env (see guidance above)."
  }

  $maxTries = 3
  for ($i = 1; $i -le $maxTries; $i++) {
    Write-Host ""
    $entered = Read-PatInteractive
    if (-not $entered) {
      throw "No PAT entered. Aborting."
    }

    Write-Host "  validating PAT..." -ForegroundColor DarkGray
    if (Test-VsceAuth -pat $entered) {
      Write-Host "  PAT is valid." -ForegroundColor Green

      switch (Read-StorageChoice) {
        '1' { Save-PatToEnvFile $entered }
        '2' {
          [Environment]::SetEnvironmentVariable('VSCE_PAT', $entered, 'User')
          Write-Host "  saved as persistent user env var VSCE_PAT (new shells will see it)" -ForegroundColor Green
        }
        '3' { Write-Host "  not stored - using for this run only" -ForegroundColor Yellow }
      }

      $env:VSCE_PAT = $entered
      return $entered
    }

    Write-Host "  that PAT did not validate ($i/$maxTries)." -ForegroundColor Yellow
  }

  throw "Could not obtain a valid PAT after $maxTries attempts."
}

# Returns $true if vsce can authenticate for the publisher (valid PAT or stored
# login). Uses 'vsce verify-pat', which checks the token without publishing.
function Test-VsceAuth([string] $pat) {
  Write-Host "  > vsce verify-pat $script:Publisher" -ForegroundColor DarkGray
  if ($DryRun) { return $true }

  $verifyArgs = @('verify-pat', $script:Publisher)
  if ($pat) { $verifyArgs += @('-p', $pat) }

  Invoke-Vsce $verifyArgs 2>&1 | Out-Null
  return ($LASTEXITCODE -eq 0)
}

function Run-Npm([string[]] $npmArgs) {
  Write-Host "  > npm $($npmArgs -join ' ')" -ForegroundColor DarkGray
  if ($DryRun) { return }
  & $script:NpmCmd @npmArgs
  if ($LASTEXITCODE -ne 0) {
    throw "npm $($npmArgs -join ' ') failed with exit code $LASTEXITCODE."
  }
}

function Publish-Extension([string] $target) {
  $dir = Get-ExtensionDir -repoRoot $repoRoot -target $target

  Write-Host ""
  Write-Host "==> $target" -ForegroundColor Cyan
  Write-Host "    dir: $dir"

  Invoke-InDir $dir {
    if ($PackageOnly) {
      Write-Host "    mode: package only (no upload)" -ForegroundColor Yellow
      Run-Npm @('run', 'package')
      return
    }

    if ($Pat) {
      # Bypass the npm scripts' tag/push and call vsce directly with the PAT.
      # vsce:prepublish still runs (changelog + production build of both bundles).
      Write-Host "    mode: vsce publish with PAT" -ForegroundColor Yellow
      Run-Npm @('run', 'build:prd')
      Write-Host "  > vsce publish -p ****" -ForegroundColor DarkGray
      if (-not $DryRun) {
        Invoke-Vsce @('publish', '-p', $Pat)
        if ($LASTEXITCODE -ne 0) { throw "vsce publish failed with exit code $LASTEXITCODE." }
      }
      return
    }

    if ($NoGitTag) {
      Write-Host "    mode: vsce publish (no git tag)" -ForegroundColor Yellow
      Run-Npm @('run', 'publishOnly')
      return
    }

    Write-Host "    mode: full publish (changelog + git tag + push + vsce publish)" -ForegroundColor Yellow
    Run-Npm @('run', 'publish')
  }

  Write-Host "    done: $target" -ForegroundColor Green
}

$targets = Get-Targets -Target $Target

Write-Host "Auto-publish plan:" -ForegroundColor White
Write-Host "  repo:     $repoRoot"
Write-Host "  targets:  $($targets -join ', ')"
Write-Host "  mode:     $(if ($PackageOnly) { 'package-only' } elseif ($Pat) { 'pat-publish' } elseif ($NoGitTag) { 'publish (no tag)' } else { 'full publish' })"
if ($DryRun) { Write-Host "  DRY RUN:  no commands will be executed" -ForegroundColor Magenta }

# The full-publish path (no -PackageOnly/-NoGitTag/-Pat) tags and pushes, so the
# working tree must be clean before we start.
if (-not $PackageOnly -and -not $NoGitTag -and -not $Pat) {
  Assert-CleanWorkingTree
}

# vsce is required by every mode (package + publish). Ensure it's available,
# auto-installing globally if missing (unless -SkipVsceInstall).
$targetDirs = @($targets | ForEach-Object { Get-ExtensionDir -repoRoot $repoRoot -target $_ })
Ensure-Vsce -targetDirs $targetDirs

# Pre-flight auth check (publishing modes only). Resolve a PAT and verify it; if
# we can't authenticate, guide the user to create/supply one and stop early.
if (-not $PackageOnly) {
  $resolvedPat = Get-ResolvedPat
  # Export so the npm 'publish'/'publishOnly' scripts (vsce publish, no -p) use it.
  if ($resolvedPat) { $env:VSCE_PAT = $resolvedPat }

  Write-Host ""
  Write-Host "Checking Marketplace auth for publisher '$script:Publisher'..." -ForegroundColor White
  if (-not (Test-VsceAuth -pat $resolvedPat)) {
    # Guide the user, let them paste a PAT, validate it, and choose where to store it.
    $resolvedPat = Resolve-PatInteractively
  }
  Write-Host "  auth: OK" -ForegroundColor Green
}

foreach ($t in $targets) {
  Publish-Extension -target $t
}

Write-Host ""
Write-Host "All targets processed." -ForegroundColor Green
