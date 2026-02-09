import * as fs from 'fs';
import * as path from 'path';
import dayjs from 'dayjs';
import { loadConfig, Config } from '@shared/schema-generator';
import { CONFIG_PATH, DOWNLOAD_DIR } from '@shared/utils';

async function downloadInvoices(config: Config): Promise<boolean> {
  try {
    // TODO: Implement your DigitalHub automation logic
    return true;
  } catch (error) {
    console.error('Error during download:', error);
    return false;
  }
}

function processDownloadedFiles(config: Config): void {
  const AdmZip = require('adm-zip');
  const { dhXmlDir, dhArchiveDir } = config;
  
  // Extract ZIPs
  fs.readdirSync(DOWNLOAD_DIR)
    .filter(f => f.endsWith('.zip'))
    .forEach(f => new AdmZip(path.join(DOWNLOAD_DIR, f)).extractAllTo(DOWNLOAD_DIR, true));
  
  // Copy XMLs (excluding *_MT_001.xml) and move ZIPs to archive
  fs.readdirSync(DOWNLOAD_DIR).forEach(f => {
    const src = path.join(DOWNLOAD_DIR, f);
    if (f.endsWith('.xml') && !f.includes('_MT_001.xml'))
      fs.copyFileSync(src, path.join(dhXmlDir, f));
    else if (f.endsWith('.zip'))
      fs.renameSync(src, path.join(dhArchiveDir, f));
  });
  
  // Delete download directory
  fs.rmSync(DOWNLOAD_DIR, { recursive: true, force: true });
}

// Update config with new date
function updateConfig(config: Config): void {
  console.log('Updating date of last update in config.');
  config.dhLastUpdate = dayjs().format('YYYY-MM-DD');
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
  console.log('Done.');
}

// Main function
async function main(): Promise<void> {
  const config = loadConfig(CONFIG_PATH);
  
  fs.rmSync(DOWNLOAD_DIR, { recursive: true, force: true });
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
  fs.mkdirSync(config.dhXmlDir, { recursive: true});
  fs.mkdirSync(config.dhArchiveDir, { recursive: true});
  
  const success = await downloadInvoices(config);
  
  if (success) {
    processDownloadedFiles(config);
    updateConfig(config);
  } else {
    console.error('The export operation has encountered a critical problem.');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});