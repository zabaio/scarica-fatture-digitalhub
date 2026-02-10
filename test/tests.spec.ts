import { test, expect} from '@playwright/test';
import dayjs from 'dayjs';
import * as fs from "fs";
import * as nav from 'src/shared/navigation';
import { CONFIG_PATH} from 'src/shared/utils';
import { loadConfig, Config} from 'src/shared/schema-generator';

let config: Config;

test.beforeEach(async ({}, testInfo) => {
  config = loadConfig(CONFIG_PATH);
  config.dhLastUpdate = dayjs().subtract(0, 'day').format("YYYY-MM-DD");
  config.dhXmlDir = testInfo.outputPath("data", "xml");
  config.dhArchiveDir = testInfo.outputPath("data", "archives");
  config.dhMaxChunkSize = 1;
})

test('log-in-out', async ({page}) => {
  await nav.login(page, config);
  await nav.logout(page);
})

test('navigate-and-fill', async ({page}) =>{
  await nav.login(page, config);
  await nav.goToExportForm(page);
  await nav.fillExportForm(page, config.dhCessionari[0], dayjs(), dayjs());
  await page.getByTitle('Close layer').click();
  await nav.logout(page);
})

test('download-invoices', async ({page}, testInfo) => {
  const tempDir = testInfo.outputPath("data", "temp");
  fs.mkdirSync(tempDir, { recursive: true });
  const newLastUpdate = await nav.startScraper(page, config, tempDir);
  expect(newLastUpdate.isSame(dayjs()));
});