import { Page, test, expect } from '@playwright/test';
import dayjs from 'dayjs';
import * as utils from './utils';
import * as path from 'fs';

test.use({viewport:{width:1920,height:1080}})
var text = path.readFileSync("config/config.json");
console.log(text.toString().replace(/(.{1})/g,"$1 "));
const config = JSON.parse(JSON.stringify(require("../config/config.json")));

test.beforeEach(async ({page}) => {
  await utils.login(page, config);
});

test.afterEach(async ({page}) => {
  await utils.logout(page);
})

test('log-in-out', async ({page}) => {})

test('navigate-and-fill', async ({page}) =>{
  await utils.goToExportForm(page);
  await utils.fillExportForm(page, "Cessionario", dayjs(), dayjs());
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
      console.log("Exporting "+ utils.formatFilename(cessionario, startDate, endDate, currentDate) + "...");
      await utils.goToExportForm(page);
      await utils.fillExportForm(page, cessionario, startDate, endDate);      
      await utils.exportAndDownload(page, config.dhDownloadDir + utils.formatFilename(cessionario, startDate, endDate, currentDate));
    }
    //Go to the next export period
    startDate = startDate.add(config.dhExportMaxPeriod, 'day');
  }
});