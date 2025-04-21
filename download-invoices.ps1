Set-Variable CONFIG_PATH .\config.json
Set-Variable CONFIG (Get-Content $CONFIG_PATH -Raw | ConvertFrom-Json)
Set-Variable DOWNLOAD_DIR $CONFIG.dhDownloadDir

#Create the download folder if missing and clear it
New-Item ${DOWNLOAD_DIR} -ItemType Directory -Force | Out-Null
Remove-Item ${DOWNLOAD_DIR}* -Recurse -Force

Write-Output "Requesting from DigitalHub all passive invoices for cessionari"
Write-Output $CONFIG.dhCessionari 
Write-Output "from $($CONFIG.dhLastUpdate) to today."
#Exports and downloads from DigitalHub all passive invoices received since last export operation
npx playwright test tests/download-invoices.spec.ts

if ((Get-Content test-results\.last-run.json | ConvertFrom-Json).status -eq "passed"){
    
    Write-Output "Export successful. Extracting and archiving the downloaded files."
    #Extract the xml files, store away the archives and clean
    Get-ChildItem $DOWNLOAD_DIR -Filter *.zip | Expand-Archive -DestinationPath $DOWNLOAD_DIR
    robocopy $DOWNLOAD_DIR $CONFIG.dhXmlDir *.xml /xf *_MT_001.xml /xn | Out-Null
    robocopy $DOWNLOAD_DIR $CONFIG.dhArchiveDir *.zip /mov | Out-Null
    Remove-Item ${DOWNLOAD_DIR}* -Recurse -Force

    Write-Output "Updating date of last update in config."
    #Update the last export date in the config file
    $CONFIG.dhLastUpdate = (get-date -format yyyy-MM-dd)
    Set-Content -Value ($CONFIG | ConvertTo-Json) -Path $CONFIG_PATH
    Write-Output "Done."

}else {
    Write-Output "The export operation has encountered a critical problem. Open playwright-report/index.html for more info."
}