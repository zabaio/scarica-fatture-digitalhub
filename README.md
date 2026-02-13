# scarica-fatture-digitalhub
Script per scaricare fatture xml dalla piattaforma DigitalHub di Zucchetti tramite Playwright.

![Node.js](https://img.shields.io/badge/Node.js-v22.9.0-blue)
[![Playwright Tests](https://github.com/zabaio/scarica-fatture-digitalhub/actions/workflows/playwright.yml/badge.svg)](https://github.com/zabaio/scarica-fatture-digitalhub/actions/workflows/playwright.yml)

## Installazione

    npm ci
    npx playwright install --with-deps chromium

## Configurazione

    //Apri config\config.empty.json
    //Compila
        ...
        "dhUsername" = <Nome utente DigitalHub>,
        "dhPassword" = <Password DigitalHub>,
        "dhCessionari" = [<Nome Cessionario 1>, ...],
        "dhLastDayDownloaded" = <Data di inizio ricerca / ultimo aggiornamento>,
        "dhMaxChunkSize" = <Durata massima in giorni di ciascuna esportazione>,
        "dhXmlDir" = <Cartella di destinazione delle fatture>,
        ...
    //Salva come config\config.json
    
## Uilizzo

    powershell.exe ./run.ps1 -ExecutionPolicy Bypass

## Funzionalità

- [x] Fatture passive
- [x] Cessionari multipli
- [ ] Fatture attive