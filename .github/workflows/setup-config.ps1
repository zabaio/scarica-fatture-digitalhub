Set-Variable CONFIG_PATH config\config.json
Set-Variable CONFIG (Get-Content $CONFIG_PATH -Raw -ErrorAction Stop | ConvertFrom-Json)
$CONFIG.dhLastUpdate = (get-date -format yyyy-MM-dd)
Set-Content -Value ($CONFIG | ConvertTo-Json) -Path $CONFIG_PATH