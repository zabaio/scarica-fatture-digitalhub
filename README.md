# scarica-fatture-digitalhub

[![npm version](https://img.shields.io/npm/v/scarica-fatture-digitalhub)](https://www.npmjs.com/package/scarica-fatture-digitalhub)
[![Playwright Test](https://github.com/zabaio/scarica-fatture-digitalhub/actions/workflows/playwright-test.yml/badge.svg)](https://github.com/zabaio/scarica-fatture-digitalhub/actions/workflows/playwright-test.yml)

Package per scaricare fatture xml dalla piattaforma Zucchetti DigitalHub tramite Playwright.

## 💻 Locale
Segui questi passi per eseguire lo script manualmente e scaricare le fatture in locale.
### Requisiti
    Node.js ≥20.9.0
    
### Installazione
    npm install scarica-fatture-digitalhub --omit=dev

### Configurazione
1. Compila `config/config.json`
> [!TIP]
> Puoi trovare i dettagli sui parametri di configurazione validi in `config/config.schema.json`

### Uilizzo
    npm start
    
## ☁️ Remoto
Per configurare questo script per l'esecuione periodica da remoto visita la [repository](https://github.com/zabaio/scarica-fatture-digitalhub).

## 📜 Funzionalità

- [x] Fatture passive
- [x] Cessionari multipli
- [ ] Fatture attive