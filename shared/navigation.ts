import { Page } from '@playwright/test';
import dayjs from 'dayjs';
import { formatDMY } from "@shared/utils";

export async function login (page: Page, config: any){
  //Login
  console.log("Logging in...\r");
  await page.goto('https://digitalhub.zucchetti.it/');
  while (page.url().startsWith("https://digitalhub.zucchetti.it/fatelw/jsp/login.jsp")){
    await page.getByRole('textbox', { name: 'Username' }).fill(config.dhUsername);
    await page.getByRole('textbox', { name: 'Password' }).fill(config.dhPassword);
    await page.getByRole('button', { name: /^Accedi$|^Forza accesso$/ }).click();
    await page.waitForTimeout(2000);
  }
  await page.getByTitle('Area applicativa').click();
  //In Homepage
}

export async function logout (page: Page){
  //Logout
  console.log("Logging out...");
  await page.waitForTimeout(2000);
  await page.locator("[id$='_imgNoPhoto']").click();
  await page.locator("[id$='_imgExit']").waitFor({ state: 'visible' });
  await page.locator("[id$='_imgExit']").click();
  console.log("Done.\n");
}

export async function goToExportForm(page: Page){
  //In Homepage
  const mainFrame = page.frameLocator('iframe[name="Main"]');
  await mainFrame.locator("[id$='_imgFP']").click();
  await mainFrame.locator("[id$='_expMonth']").click();
  //In Homepage\Fatturazione Passiva\Esportazione Massiva
}

export async function fillExportForm(page: Page, cessionario: string, startDate: dayjs.Dayjs, endDate: dayjs.Dayjs){
  //In Homepage\Fatturazione Passiva\Esportazione Massiva
  //Fill the request for the current cessionario and period
  const modalFrame = page.frameLocator("[id^='spModalLayerRef_']:visible");

  await modalFrame.locator("[id$='_CEDENOM']").fill(cessionario);
  await modalFrame.locator("[id$='_p_DODATARIC_FROM']").fill(formatDMY(startDate));
  await modalFrame.locator("[id$='_p_DODATARIC_TO']").fill(formatDMY(endDate));
}

export async function exportAndDownload (page: Page, downloadPath: string){
  //In Homepage\Fatturazione Passiva\Esportazione Massiva
  //Export and check if the request yields any results
  const modalFrame = page.frameLocator("[id^='spModalLayerRef_']");
  await modalFrame.getByRole('link', { name: /^Esporta/ }).click();    
  const gestioneEsportazioniButton = modalFrame.getByRole('link', { name: 'Gestione Esportazioni ' });
  const nessunFileDialog = modalFrame.getByText('Nessun file presente per il');
  await nessunFileDialog.or(gestioneEsportazioniButton).first().waitFor({ state: 'visible', timeout: 300_000});      
  
  if (await nessunFileDialog.isVisible()){
    //If it doesn't, go back to Fatturazione Passiva
    console.log("No available invoices with the selected parameters - skipped.")
    await page.getByTitle('Close layer').click();
  }else {
    //If it does, to Gestione Esportazioni and for the export to complete
    await gestioneEsportazioniButton.click();

    const endTime = Date.now() + 300_000;
    const mainFrame = page.frameLocator('iframe[name="Main"]');
    const statusLocator = mainFrame.locator("[id$='_gridZip_0_9_viewDiv']");
    while (Date.now() < endTime) {
      // 1. Azione
      await mainFrame.getByTitle('Aggiorna').click();
      // 2. Verifica (wait + controllo testo)
      await statusLocator.waitFor({ state: 'visible', timeout: 7500 });
      if (await statusLocator.innerText() === 'Disponibile') break; // Successo, esce dal ciclo
    }

    //Download and save the export
    await statusLocator.click();
    const downloadPromise = page.waitForEvent('download');
    await mainFrame.getByRole('link', { name: /Scarica$/ }).click();
    const download = await downloadPromise;
    await download.saveAs(downloadPath);
  }
  await page.getByTitle('Area applicativa').click();
  //In Homepage
}