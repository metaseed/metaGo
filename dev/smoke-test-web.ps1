param(
  [Parameter(Mandatory = $false)]
  [ValidateSet('metaGo', 'metaJump', 'metaWord', 'all')]
  [string] $Target = 'metaJump',

  [Parameter(Mandatory = $false)]
  [ValidateSet('chromium', 'firefox', 'webkit')]
  [string] $BrowserType = 'chromium',

  [Parameter(Mandatory = $false)]
  [int] $Port = 0,

  [Parameter(Mandatory = $false)]
  [switch] $SkipBuild,

  [Parameter(Mandatory = $false)]
  [switch] $NoOpen
)

$ErrorActionPreference = 'Stop'

function Invoke-Build([string] $repoRoot, [string] $target) {
  if ($SkipBuild) { return }

  if ($target -eq 'metaGo' -or $target -eq 'all') {
    Push-Location $repoRoot
    try { npm run build:prd } finally { Pop-Location }
  }

  if ($target -eq 'metaJump' -or $target -eq 'all') {
    Push-Location (Join-Path $repoRoot 'src\metaJump')
    try { npm run build:prd } finally { Pop-Location }
  }

  if ($target -eq 'metaWord' -or $target -eq 'all') {
    Push-Location (Join-Path $repoRoot 'src\metaWord')
    try { npm run build:prd } finally { Pop-Location }
  }
}

function Get-ExtensionDevPath([string] $repoRoot, [string] $target) {
  switch ($target) {
    'metaGo'   { return $repoRoot }
    'metaJump' { return (Join-Path $repoRoot 'src\metaJump') }
    'metaWord' { return (Join-Path $repoRoot 'src\metaWord') }
    default { throw "Unknown target '$target'." }
  }
}

function Get-DefaultPort([string] $target) {
  switch ($target) {
    'metaGo' { return 3000 }
    'metaJump' { return 3001 }
    'metaWord' { return 3002 }
    default { return 3000 }
  }
}

function Invoke-TestWeb([string] $extensionDevPath, [string] $browserType, [int] $port) {
  $url = "http://localhost:$port"
  $cliArgs = @(
    '--extensionDevelopmentPath', $extensionDevPath,
    '--browserType', $browserType,
    '--port', $port
  )

  Write-Host "Starting VSCode Web smoke-test:"
  Write-Host "  extensionDevelopmentPath: $extensionDevPath"
  Write-Host "  browserType: $browserType"
  Write-Host "  port: $port"
  Write-Host ""
  Write-Host "URL: $url"
  Write-Host "Press Ctrl+C here to stop the server."
  Write-Host ""

  if (-not $NoOpen) {
    try {
      Start-Process $url | Out-Null
      Write-Host "Opened: $url"
      Write-Host ""
    } catch {
      Write-Warning "Couldn't auto-open browser. Open this URL manually: $url"
      Write-Host ""
    }
  }

  $localCliCmd = Join-Path $repoRoot 'node_modules\.bin\vscode-test-web.cmd'

  Write-Host "Running:"
  if (Test-Path $localCliCmd) {
    Write-Host "  $localCliCmd $($cliArgs -join ' ')"
  } else {
    Write-Host "  npx -y @vscode/test-web $($cliArgs -join ' ')"
  }
  Write-Host ""

  # Prefer local binary to avoid npx/npm exec quirks in PowerShell terminals.
  if (Test-Path $localCliCmd) {
    & $localCliCmd @cliArgs
    return
  }

  & npx '-y' '@vscode/test-web' @cliArgs
}

$repoRoot = Split-Path -Parent $PSScriptRoot

Invoke-Build -repoRoot $repoRoot -target $Target

if ($Target -eq 'all') {
  throw "Target 'all' builds everything, but you must run one server at a time. Re-run with -Target metaGo|metaJump|metaWord."
}

$extensionDevPath = Get-ExtensionDevPath -repoRoot $repoRoot -target $Target
$resolvedPort = if ($Port -gt 0) { $Port } else { Get-DefaultPort -target $Target }

Invoke-TestWeb -extensionDevPath $extensionDevPath -browserType $BrowserType -port $resolvedPort
