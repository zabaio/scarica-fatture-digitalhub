import { test, expect } from '@playwright/test';
import { lightFormat as format, add, min } from 'date-fns';

const config = JSON.parse(JSON.stringify(require("../config.json")))
test.use({viewport:{width:1920,height:1080}})

//Utility formatting
function formatDMY(date: Date){ return format(date, "dd-MM-yyyy"); }
function formatYMD(date: Date){ return format(date, "yyyy-MM-dd"); }
function formatFilename(ces: string, start: Date, end: Date, cur: Date){
  return "EXP_" + ces + "_" + formatYMD(start) + "_" + formatYMD(end) + "_" + format(cur, "yyyy-MM-dd'T'HH-mm-ss") + ".zip";
}

test('download-invoices', async ({ page }) => {

  //Login
  console.log("Logging in...\r");
  await page.goto('https://digitalhub.zucchetti.it/');
  while (page.url().startsWith("https://digitalhub.zucchetti.it/fatelw/jsp/login.jsp")){
    await page.getByRole('textbox', { name: 'Username' }).fill(config.dhUsername);
    await page.getByRole('textbox', { name: 'Password' }).fill(config.dhPassword);
    await page.getByRole('button', { name: /^Accedi$|^Forza accesso$/ }).click();
    await page.waitForTimeout(2000);
  }

  //For each time period equal or shorter than config.dhExportMaxPeriod days between the last update and today
  const currentDate = new Date();
  for (let startDate = new Date(config.dhLastUpdate); startDate < currentDate;){
    let endDate = min([currentDate, add(startDate, {days: config.dhExportMaxPeriod})]);

    //For each cessionario
    for (const cessionario of config.dhCessionari){
      console.log("Exporting "+ formatFilename(cessionario, startDate, endDate, currentDate) + "...");
      
      //Go to Fatturazione Passiva -> Esportazione Massiva
      await page.locator('iframe[name="Main"]').contentFrame().getByRole('link', { name: '' }).click();
      await page.locator('iframe[name="Main"]').contentFrame().getByRole('link', { name: '' }).click();
      
      //Fill and send the request for the current cessionario and period
      await page.locator("[id^='spModalLayerRef_']").contentFrame().locator("[id$='_CEDENOM']").fill(cessionario);
      await page.locator("[id^='spModalLayerRef_']").contentFrame().locator("[id$='_p_DODATARIC_FROM']").fill(formatDMY(startDate));
      await page.locator("[id^='spModalLayerRef_']").contentFrame().locator("[id$='_p_DODATARIC_TO']").fill(formatDMY(endDate));
      await page.locator("[id^='spModalLayerRef_']").contentFrame().getByRole('link', { name: 'Esporta ' }).click();

      //Check if the request yields any results
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
        await download.saveAs(config.dhDownloadDir + formatFilename(cessionario, startDate, endDate, currentDate));
      }
      //Go back to the homepage
      await page.getByTitle('Area applicativa').click();
    }
    //Go to the next export period
    startDate = add(startDate, {days: config.dhExportMaxPeriod});
  }
  //Logout
  console.log("Logging out...");
  await page.waitForTimeout(2000);
  await page.getByRole('link', { name: '' }).click();
  await page.getByRole('link', { name: '' }).click();
  console.log("Done.\n");
});