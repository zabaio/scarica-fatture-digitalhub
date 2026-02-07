#Check validity of config file and import it
Set-Variable CONFIG_PATH config/config.json
if (!(node config/config-validate.js)){
    Write-Output "Invalid config file."
    exit 1
}
Set-Variable CONFIG (Get-Content $CONFIG_PATH -Raw -ErrorAction Stop | ConvertFrom-Json)
Set-Variable DOWNLOAD_DIR $CONFIG.dhDownloadDir

#Create the download folder if missing and clear it
New-Item ${DOWNLOAD_DIR} -ItemType Directory -Force | Out-Null
Remove-Item ${DOWNLOAD_DIR}* -Recurse -Force

#Exports and downloads from DigitalHub all passive invoices received since last export operation
Write-Output "Requesting from DigitalHub all passive invoices for cessionari"
Write-Output $CONFIG.dhCessionari 
Write-Output "from $($CONFIG.dhLastUpdate) to today."
npx playwright test -g "download-invoices"

if ((Get-Content test-results/.last-run.json | ConvertFrom-Json).status -eq "passed"){
    
    #Extract the xml files, store away the archives and clean
    Write-Output "Export successful. Extracting and archiving the downloaded files."
    Get-ChildItem $DOWNLOAD_DIR -Filter *.zip | Expand-Archive -DestinationPath $DOWNLOAD_DIR
    Get-ChildItem $DOWNLOAD_DIR *.xml -File | Where-Object Name -notlike "*_MT_001.xml" | Copy-Item -Dest $CONFIG.dhXmlDir -Force
    Get-ChildItem $DOWNLOAD_DIR *.zip -File | Move-Item -Dest $CONFIG.dhArchiveDir -Force
    Remove-Item ${DOWNLOAD_DIR}* -Recurse -Force

    #Update the last export date in the config file
    Write-Output "Updating date of last update in config."
    $CONFIG.dhLastUpdate = (get-date -format yyyy-MM-dd)
    Set-Content -Value ($CONFIG | ConvertTo-Json) -Path $CONFIG_PATH
    Write-Output "Done."

}else {
    Write-Output "The export operation has encountered a critical problem. Open playwright-report/index.html for more info."
    exit 1
}