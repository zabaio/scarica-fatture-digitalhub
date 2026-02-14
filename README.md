# scarica-fatture-digitalhub
Package per scaricare fatture xml dalla piattaforma Zucchetti DigitalHub tramite Playwright.

![Node.js](https://img.shields.io/badge/Node.js-v20.9.0-blue)
[![Playwright Test](https://github.com/zabaio/scarica-fatture-digitalhub/actions/workflows/playwright-test.yml/badge.svg)](https://github.com/zabaio/scarica-fatture-digitalhub/actions/workflows/playwright-test.yml)

## 💻 Locale
Segui questi passi per eseguire lo script manualmente e scaricare le fatture in locale.
#### Requisiti
    Node.js v20.9.0
    
#### Installazione
    npm install scarica-fatture-digitalhub --omit=dev

#### Configurazione
1. Compila `config/config.json`
> [!TIP]
> Puoi trovare i dettagli sui parametri di configurazione validi in `config/config.schema.json`

### Uilizzo
    npm start
    
## ☁️ Remoto
Segui questi passi per eseguire giornalmente lo script e inviare le fatture scaricate ad un remote rclone.

#### Configurazione
1. In alto su questa repository, seleziona **Use this template** → **Create a new repository** → Inserisci nome e visibilità → **Create repository**
2. Compila `config/config.json`
> [!TIP]
> Puoi trovare i dettagli sui parametri di configurazione validi in `config/config.schema.json`
3. Copia il contenuto di `config/config.json` in un repository secret chiamato `CONFIG`
4. Crea un remote con **rclone** chiamato `remote-folder` che punti alla cartella dove vorrai salvare i risultati dello script.
5. Copia il contenuto del file `rclone.conf` in un repository secret chiamato `RCLONE_CONFIG`
> [!TIP]
> Per creare un repository secret seleziona **Settings** → **Secrets and variables** → **New repository secret** → Inserisci nome e contenuto

#### Utilizzo
1. Verifica che il workflow **Actions** → **Remote start** risulti attivo.
> [!IMPORTANT]
> Lo script ora è impostato per avviarsi automaticamente. Per modificare la frequenza di attivazione utilizzare il parametro `cron:` in `.github/workflows/remote-start.yml`

## Funzionalità

- [x] Fatture passive
- [x] Cessionari multipli
- [ ] Fatture attive