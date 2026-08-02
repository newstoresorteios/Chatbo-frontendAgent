# Rollback do refactor frontend NITRUS

- Branch original: `jpedro`
- Commit do checkpoint: `4b8ae93118601d85248f6a49be10a732e7e323ff`
- Branch de backup: `backup/nitrus-before-frontend-refactor`
- Tag de rollback: `nitrus-before-frontend-refactor`

## Como executar

No Windows, execute `ROLLBACK-REFACTOR.bat` na raiz do frontend.

O script PowerShell valida se está em um repositório Git, confirma a existência da tag `nitrus-before-frontend-refactor`, mostra branch atual, commit atual, commit de destino e arquivos alterados, e só continua se você digitar exatamente:

```text
ROLLBACK
```

## Proteções antes da restauração

Antes de restaurar, o script:

- cria uma branch de resgate `rescue/nitrus-before-rollback-YYYYMMDD-HHMMSS`;
- salva alterações não commitadas em stash com arquivos não rastreados;
- executa `git reset --hard nitrus-before-frontend-refactor`;
- executa `git clean -fd`;
- mantém arquivos ignorados intactos.

O script não executa `git clean -fdx`, push forçado, exclusão de branches remotas ou exclusão de tags remotas.

## Recuperar estado anterior ao rollback

Para voltar à branch de resgate:

```bash
git switch rescue/nitrus-before-rollback-YYYYMMDD-HHMMSS
```

Para recuperar o stash:

```bash
git stash list
git stash apply stash@{N}
```

Substitua `stash@{N}` pelo item correspondente ao texto `auto-backup-before-nitrus-rollback-YYYYMMDD-HHMMSS`.

## Remover arquivos de rollback após aprovação

Depois que o refactor for aprovado e não for mais necessário manter a ferramenta local:

```bash
git rm ROLLBACK-REFACTOR.bat REFACTOR-ROLLBACK.md scripts/rollback-frontend-refactor.ps1
```

Faça commit da remoção em seguida.
