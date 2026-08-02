$ErrorActionPreference = "Stop"

$tagName = "nitrus-before-frontend-refactor"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$rescueBranch = "rescue/nitrus-before-rollback-$timestamp"
$stashMessage = "auto-backup-before-nitrus-rollback-$timestamp"

try {
  $repoRoot = git rev-parse --show-toplevel 2>$null
} catch {
  Write-Host "Este diretório não está dentro de um repositório Git." -ForegroundColor Red
  exit 1
}

Set-Location $repoRoot

$tagExists = git tag --list $tagName
if (-not $tagExists) {
  Write-Host "A tag '$tagName' não existe neste repositório." -ForegroundColor Red
  exit 1
}

$currentBranch = git branch --show-current
$currentCommit = git rev-parse HEAD
$targetCommit = git rev-list -n 1 $tagName
$changedFiles = git status --short

Write-Host "Rollback do refactor frontend NITRUS" -ForegroundColor Cyan
Write-Host "Repositório: $repoRoot"
Write-Host "Branch atual: $currentBranch"
Write-Host "Commit atual: $currentCommit"
Write-Host "Commit de destino: $targetCommit"
Write-Host ""
Write-Host "Arquivos alterados:"
if ($changedFiles) {
  $changedFiles | ForEach-Object { Write-Host "  $_" }
} else {
  Write-Host "  Nenhum arquivo alterado."
}
Write-Host ""
Write-Host "Digite ROLLBACK para confirmar a restauração para '$tagName':" -ForegroundColor Yellow
$confirmation = Read-Host

if ($confirmation -ne "ROLLBACK") {
  Write-Host "Rollback cancelado. Nenhuma alteração destrutiva foi executada." -ForegroundColor Yellow
  exit 0
}

git branch $rescueBranch
git stash push -u -m $stashMessage
git reset --hard $tagName
git clean -fd

$restoredCommit = git rev-parse HEAD

Write-Host ""
Write-Host "Rollback concluído." -ForegroundColor Green
Write-Host "Commit restaurado: $restoredCommit"
Write-Host "Branch de resgate criada: $rescueBranch"
Write-Host "Stash criado: $stashMessage"
Write-Host ""
Write-Host "Para recuperar o estado anterior ao rollback:"
Write-Host "  git switch $rescueBranch"
Write-Host "  git stash list"
Write-Host "  git stash apply stash@{N}"
