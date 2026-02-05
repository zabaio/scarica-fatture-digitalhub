function Get-LastUpdate {
    if (Test-Path ".github/workflows/lastUpdate.txt") {
        $lu = Get-Content ".github/workflows/lastUpdate.txt"
        Write-Host "Ultima esecuzione recuperata: $lu"
        return $lu
    }
    Write-Host "Nessun file trovato."
    return $null
}

function Save-LastUpdate {
    $newLu = Get-Date -Format "yyyy-MM-dd"
    $newLu | Out-File -FilePath ".github/workflows/lastUpdate.txt" -Encoding utf8
    Write-Host "Nuova ultima esecuzione salvata: $newLu"

    $token = $env:_PAT
    $repo = $env:GITHUB_REPOSITORY # Es: zabaio/scarica-fatture-digitalhub
    git remote set-url origin "https://x-access-token:${token}@://github.com${repo}.git"

    # Configurazione Git locale
    git config user.name "github-actions[bot]"
    git config user.email "github-actions[bot]@users.noreply.github.com"
    
    # Commit e Push
    git add .github/workflows/lastUpdate.txt
    git commit -m "chore: update lastUpdate $env:GITHUB_RUN_NUMBER [skip ci]"
    git push
}

function Set-LastUpdate{
    Set-Variable CONFIG_PATH config\config.json
    Set-Variable CONFIG (Get-Content $CONFIG_PATH -Raw -ErrorAction Stop | ConvertFrom-Json)
    $CONFIG.dhLastUpdate = $args[1]
    Set-Content -Value ($CONFIG | ConvertTo-Json) -Path $CONFIG_PATH
}

# Logica per gestire la chiamata da GitHub Actions
if ($args[0] -eq "getlu") { Get-LastUpdate }
elseif ($args[0] -eq "savelu") { Save-LastUpdate }
elseif ($args[0] -eq "setlu") { Set-LastUpdate }