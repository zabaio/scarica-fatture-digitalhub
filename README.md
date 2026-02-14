# scarica-fatture-digitalhub
Package per scaricare fatture xml dalla piattaforma Zucchetti DigitalHub tramite Playwright.

![Node.js](https://img.shields.io/badge/Node.js-v20.9.0-blue)
[![Playwright Test](https://github.com/zabaio/scarica-fatture-digitalhub/actions/workflows/playwright-test.yml/badge.svg)](https://github.com/zabaio/scarica-fatture-digitalhub/actions/workflows/playwright-test.yml)

## Locale
Segui questi passi per eseguire lo script manualmente e scaricare le fatture in locale.
### Requisiti
    Node.js v20.9.0
    
### Installazione
    npm install scarica-fatture-digitalhub --omit=dev

### Configurazione
    //Compila config/config.json
    //Dettagli sui parametri di configurazione validi in config/config.schema.json

### Uilizzo
    npm start
    
## Remoto
Segui questi passi per eseguire giornalmente lo script e inviare le fatture scaricate ad un remote rclone.

## Funzionalità

- [x] Fatture passive
- [x] Cessionari multipli
- [ ] Fatture attive