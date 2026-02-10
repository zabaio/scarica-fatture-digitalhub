import { Page } from '@playwright/test';
import { formatDMY, formatArchiveFilename } from "@shared/utils";
import { Config } from "@shared/schema-generator"
import * as path from 'path'
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import minMax from 'dayjs/plugin/minMax';
dayjs.extend(isSameOrBefore)
dayjs.extend(minMax)

export async function login (page: Page, config: Config){
  //Login
  console.log("Logging in...");
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
}

export async function goToExportForm(page: Page){
  //In Homepage
  console.log("Navigating to export form...");
  const mainFrame = page.frameLocator('iframe[name="Main"]');
  await mainFrame.locator("[id$='_imgFP']").click();
  await mainFrame.locator("[id$='_expMonth']").click();
  //In Homepage\Fatturazione Passiva\Esportazione Massiva
}

export async function fillExportForm(page: Page, cessionario: string, startDate: dayjs.Dayjs, endDate: dayjs.Dayjs){
  //In Homepage\Fatturazione Passiva\Esportazione Massiva
  //Fill the request for the current cessionario and period
  console.log("Filling export form...")
  const modalFrame = page.frameLocator("[id^='spModalLayerRef_']:visible");

  await modalFrame.locator("[id$='_CEDENOM']").fill(cessionario);
  await modalFrame.locator("[id$='_p_DODATARIC_FROM']").fill(formatDMY(startDate));
  await modalFrame.locator("[id$='_p_DODATARIC_TO']").fill(formatDMY(endDate));
}

export async function exportAndDownload (page: Page, downloadPath: string){
  //In Homepage\Fatturazione Passiva\Esportazione Massiva
  //Export and check if the request yields any results
  console.log("Requesting export...");
  const modalFrame = page.frameLocator("[id^='spModalLayerRef_']");
  await modalFrame.getByRole('link', { name: /^Esporta/ }).click();    
  const gestioneEsportazioniButton = modalFrame.getByRole('link', { name: /^Gestione Esportazioni/ });
  const nessunFileDialog = modalFrame.getByText('Nessun file presente per il');
  await nessunFileDialog.or(gestioneEsportazioniButton).first().waitFor({ state: 'visible', timeout: 300_000});      
  
  if (await nessunFileDialog.isVisible()){
    //If it doesn't, go back to Fatturazione Passiva
    console.log("No available invoices with the selected parameters - skipped.")
    await page.getByTitle('Close layer').click();
  }else {
    //If it does, to Gestione Esportazioni and for the export to complete
    console.log("Navigating to export manager...")
    await gestioneEsportazioniButton.click();
    console.log("Waiting for export...")
    const endTime = Date.now() + 300_000;
    const mainFrame = page.frameLocator('iframe[name="Main"]');
    const statusLocator = mainFrame.locator("[id$='_gridZip_0_9_viewDiv']");
    while (Date.now() < endTime) {
      await statusLocator.waitFor({ state: 'visible', timeout: 7500 });
      if (await statusLocator.innerText() === 'Disponibile'){
        console.log("Export ready.")
        break; // Successo, esce dal ciclo
      }
      await mainFrame.getByTitle('Aggiorna').click();
    }

    //Download and save the export
    await statusLocator.click();
    const downloadPromise = page.waitForEvent('download');
    console.log("Downloading " + downloadPath + "...");
    await mainFrame.getByRole('link', { name: /Scarica$/ }).click();
    const download = await downloadPromise;
    await download.saveAs(downloadPath);
  }
  await page.getByTitle('Area applicativa').click();
  //In Homepage
}

export async function startScraper(page: Page, config: Config, tempDir: string): Promise<dayjs.Dayjs> {
  
  //For each time period equal or shorter than config.dhMaxChunkSize days between the last update and today
  let startDate = dayjs(config.dhLastUpdate);
  let endDate: dayjs.Dayjs;
  const today = dayjs();
  await login(page, config);
  
  while (startDate.isSameOrBefore(today, "day")){
    endDate = dayjs.min(startDate.add(config.dhMaxChunkSize - 1, 'day'), today);
    console.log("\nProcessing invoices from " + startDate.format('DD-MM-YYYY') + " to " + endDate.format('DD-MM-YYYY'));
    
    //For each cessionario
    for (const cessionario of config.dhCessionari){
      const archiveFilename = formatArchiveFilename(cessionario, startDate, endDate, today);
      console.log("Processing cessionario: " + cessionario);
      let attempts = 0;
      const maxAttempts = 3;
      while (attempts < maxAttempts){
        console.log("Attempt " + (attempts + 1) + " of " + maxAttempts);
        try{
          await goToExportForm(page);
          await fillExportForm(page, cessionario, startDate, endDate);      
          await exportAndDownload(page, path.join(tempDir, archiveFilename));
          console.log("Done.\n");
          break;
        }
        catch (error) {
          console.error("Something went wrong during the scraper activity", error);
          try{
            await logout(page);
          }
          catch (error) {
            console.error("Could not logout");
          }
          finally {
            await login(page, config);
            attempts += 1;
          }
        }
      }
      if (attempts == maxAttempts){
        console.error("Max number of attempts reached, stopping execution and saving progress up to ", startDate.format("DD-MM-YYYY"));
        return startDate;
      }
    }
    //Go to the next export period
    startDate = startDate.add(config.dhMaxChunkSize, 'day');
  }
  await logout(page);
  return endDate;
}