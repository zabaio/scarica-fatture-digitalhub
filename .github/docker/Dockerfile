# Usa l'immagine base di Playwright
FROM mcr.microsoft.com/playwright:v1.52.0-jammy

# Installazione di PowerShell Core
RUN apt-get update && apt-get install -y wget apt-transport-https software-properties-common && \
    wget -q "https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb" && \
    dpkg -i packages-microsoft-prod.deb && \
    apt-get update && apt-get install -y powershell && \
    rm -rf /var/lib/apt/lists/*

# Verifica installazione (opzionale)
RUN pwsh -Command '$PSVersionTable'