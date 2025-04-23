import { Page, test, expect } from '@playwright/test';
import dayjs from 'dayjs';

//Utility formatting
function formatDMY(date: dayjs.Dayjs){ return date.format('DD-MM-YYYY'); }
function formatYMD(date: dayjs.Dayjs){ return date.format('YYYY-MM-DD'); }
export function formatFilename(ces: string, start: dayjs.Dayjs, end: dayjs.Dayjs, cur: dayjs.Dayjs){
  return "EXP_" + ces + "_" + formatYMD(start) + "_" + formatYMD(end) + "_" + cur.format('YYYY-MM-DD[T]HH-mm-ss') + ".zip";
}

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
  await page.getByRole('link', { name: '' }).click();
  await page.getByRole('link', { name: '' }).click();
  console.log("Done.\n");
}

export async function goToExportForm(page: Page){
  //In Homepage
  await page.locator('iframe[name="Main"]').contentFrame().getByRole('link', { name: '' }).click();
  await page.locator('iframe[name="Main"]').contentFrame().getByRole('link', { name: '' }).click();
  //In Homepage\Fatturazione Passiva\Esportazione Massiva
}

export async function fillExportForm(page: Page, cessionario: string, startDate: dayjs.Dayjs, endDate: dayjs.Dayjs){
  //In Homepage\Fatturazione Passiva\Esportazione Massiva
  //Fill the request for the current cessionario and period
  await page.locator("[id^='spModalLayerRef_']").contentFrame().locator("[id$='_CEDENOM']").fill(cessionario);
  await page.locator("[id^='spModalLayerRef_']").contentFrame().locator("[id$='_p_DODATARIC_FROM']").fill(formatDMY(startDate));
  await page.locator("[id^='spModalLayerRef_']").contentFrame().locator("[id$='_p_DODATARIC_TO']").fill(formatDMY(endDate));
}

export async function exportAndDownload (page: Page, downloadPath: string){
  //In Homepage\Fatturazione Passiva\Esportazione Massiva
  //Export and check if the request yields any results
  await page.locator("[id^='spModalLayerRef_']").contentFrame().getByRole('link', { name: 'Esporta ' }).click();    
  const gestioneEsportazioniButton = page.locator("[id^='spModalLayerRef_']").contentFrame().getByRole('link', { name: 'Gestione Esportazioni ' });
  const nessunFileDialog = page.locator("[id^='spModalLayerRef_']").contentFrame().getByText('Nessun file presente per il');
  await expect(nessunFileDialog.or(gestioneEsportazioniButton).first()).toBeVisible({timeout: 300_000});      
  
  if (await nessunFileDialog.isVisible()){
    //If it doesn't, go back to Fatturazione Passiva
    console.log("No available invoices with the selected parameters - skipped.")
    await page.getByTitle('Close layer').click();
  }else {
    //If it does, to Gestione Esportazioni and for the export to complete
    await gestioneEsportazioniButton.click();
    await expect(async () => {
      await page.locator('iframe[name="Main"]').contentFrame().getByTitle('Aggiorna').click();
      await expect(page.locator('iframe[name="Main"]').contentFrame().locator("[id$='_gridZip_0_9_viewDiv']")).toContainText(/^Disponibile$/);
    }).toPass({intervals: [5_000, 10_000], timeout: 300_000});

    //Download and save the export
    await page.locator('iframe[name="Main"]').contentFrame().locator("[id$='_gridZip_0_1_viewDiv']").click();
    const downloadPromise = page.waitForEvent('download');
    await page.locator('iframe[name="Main"]').contentFrame().getByRole('link', { name: ' Scarica' }).click();
    const download = await downloadPromise;
    await download.saveAs(downloadPath);
  }
  await page.getByTitle('Area applicativa').click();
  //In Homepage
}