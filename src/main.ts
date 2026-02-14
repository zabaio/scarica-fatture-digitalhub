import * as fs from 'fs';
import * as path from 'path';
import dayjs from 'dayjs';
import AdmZip from 'adm-zip';
import { loadConfig, Config } from '@shared/schema-generator';
import { playConfig } from '@shared/playwright-config'
import { startScraper, login, logout } from '@shared/navigation';
import { chromium } from '@playwright/test';
export const configPath = path.join(process.cwd(), "config", "config.json");
const tempDir =  path.join(process.cwd(), "data", "temp");

function processDownloadedFiles(config: Config): void {
  const { dhXmlDir, dhArchiveDir } = config;
  // Extract ZIPs
  console.log("Extracting archives...")
  fs.readdirSync(tempDir)
    .filter(f => f.endsWith('.zip'))
    .forEach(f => new AdmZip(path.join(tempDir, f)).extractAllTo(tempDir, true));
  
  // Copy XMLs (excluding *_MT_001.xml) and move ZIPs to archive
  console.log("Saving xmls and archives...")
  fs.readdirSync(tempDir).forEach(f => {
    const src = path.join(tempDir, f);
    if (f.includes('.xml') && !f.endsWith('_MT_001.xml'))
      fs.copyFileSync(src, path.join(dhXmlDir, f));
    else if (f.endsWith('.zip'))
      fs.renameSync(src, path.join(dhArchiveDir, f));
  });
  
  // Delete temp directory
  fs.rmSync(tempDir, { recursive: true, force: true });
}

// Update config with new date
function updateConfig(config: Config, newLastUpdate: dayjs.Dayjs): void {
  console.log('Updating date of last update in config.');
  config.dhLastDayDownloaded = newLastUpdate.format("YYYY-MM-DD");
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log('Done.');
}

// Main function
export async function main(config: Config): Promise<void> {
  
  fs.rmSync(tempDir, { recursive: true, force: true });
  fs.mkdirSync(tempDir, { recursive: true });
  fs.mkdirSync(config.dhXmlDir, { recursive: true});
  fs.mkdirSync(config.dhArchiveDir, { recursive: true});
  
  const browser = await chromium.launch(playConfig.launchOptions);
  const context = await browser.newContext({ viewport: playConfig.viewport });
  context.setDefaultTimeout(playConfig.timeouts.navigation);
  const page = await context.newPage();

  let newLastUpdate: dayjs.Dayjs;
  try {
    newLastUpdate = await startScraper(page, config, tempDir);
    browser.close();
  } 
  catch (error) {
    console.error('Unhandled error:', error);
    await page.screenshot({path: "screenshot.png"})
    await browser.close();
    console.error('The export operation has encountered a critical problem.');
    process.exit(1);
  }

  processDownloadedFiles(config);
  updateConfig(config, newLastUpdate);
}

if(require.main === module){
  main(loadConfig(configPath)).catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}