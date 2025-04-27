# scarica-fatture-digitalhub
Script per scaricare fatture xml dalla piattaforma DigitalHub di Zucchetti tramite Playwright.

![Powershell](https://img.shields.io/badge/Powershell-5.1-blue)
![Node.js](https://img.shields.io/badge/Node.js-v22.14.0-blue)
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
        "dhLastUpdate" = <Data di inizio ricerca / ultimo aggiornamento>,
        "dhExportMaxPeriod" = <Durata massima di ciascuna esportazione>,
        "dhXmlDir" = <Cartella di destinazione delle fatture>,
        ...
    //Salva come config\config.json
    
## Uilizzo

    powershell.exe ./download-invoices.ps1 -ExecutionPolicy Bypass

## Funzionalità

- [x] Fatture passive
- [x] Cessionari multipli
- [ ] Fatture attive