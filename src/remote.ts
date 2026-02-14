import fs from 'fs';
import * as path from 'path'
import { main, configPath} from './main'
import { loadConfig } from '@shared/schema-generator';
const lastRunPath = path.join(process.cwd(), "last-run.json");

async function remoteStart (){
    const lastRun = JSON.parse(fs.readFileSync(lastRunPath, 'utf8'));
    let config = loadConfig(configPath);
    if (lastRun.dhLastDayDownloaded !== undefined) 
        config.dhLastDayDownloaded = lastRun.dhLastDayDownloaded;
    
    await main(config);

    config = loadConfig(configPath);
    fs.writeFileSync(lastRunPath, JSON.stringify({dhLastDayDownloaded: config.dhLastDayDownloaded}));
}

remoteStart();