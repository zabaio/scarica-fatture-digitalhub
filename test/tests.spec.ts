import test from '@playwright/test';
import dayjs from 'dayjs';
import path from 'path';
import * as nav from '@shared/navigation';
import { formatArchiveFilename, CONFIG_PATH, DOWNLOAD_DIR } from '@shared/utils'
import { loadConfig } from '@shared/schema-generator'

test.use({viewport:{width:1920,height:1080}})
const config = loadConfig(CONFIG_PATH);

test.beforeEach(async ({page}) => {
  await nav.login(page, config);
});

test.afterEach(async ({page}) => {
  await nav.logout(page);
})

test('log-in-out', async ({page}) => {})

test('navigate-and-fill', async ({page}) =>{
  await nav.goToExportForm(page);
  await nav.fillExportForm(page, config.dhCessionari[0], dayjs(), dayjs());
  await page.getByTitle('Close layer').click();
})

test('download-invoices', async ({page}) => {

  //For each time period equal or shorter than config.dhExportMaxPeriod days between the last update and today
  const currentDate = dayjs();
  for (let startDate = dayjs(config.dhLastUpdate); startDate < currentDate;){
    let endDate = startDate.add(config.dhExportMaxPeriod, 'day');
    endDate = (endDate < currentDate) ? endDate : currentDate;

    //For each cessionario
    for (const cessionario of config.dhCessionari){
      const archiveFilename = formatArchiveFilename(cessionario, startDate, endDate, currentDate);
      console.log("Exporting "+ archiveFilename + "...");
      await nav.goToExportForm(page);
      await nav.fillExportForm(page, cessionario, startDate, endDate);      
      await nav.exportAndDownload(page, path.join(DOWNLOAD_DIR, archiveFilename));
    }
    //Go to the next export period
    startDate = startDate.add(config.dhExportMaxPeriod, 'day');
  }
});