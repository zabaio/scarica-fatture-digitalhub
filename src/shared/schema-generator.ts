import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';

export const ConfigSchema = z.object({

  dhUsername: z.string()
    .describe('Nome utente DigitalHub'),

  dhPassword: z.string()
    .describe('Password Digitalhub'),

  dhCessionari: z.array(z.string())
    .describe('Lista di Cessionari di cui esportare le fatture')
    .min(1),

  dhLastDayDownloaded: z.iso.date()
    .describe('Giorno fino a cui ignorare le fatture precedenti - yyyy-MM-dd')
    .default("2019-01-01"),

  dhMaxChunkSize: z.number()
    .describe("Durata massima in giorni di ciascuna esportazione")
    .int()
    .min(1)
    .max(60)
    .default(30),
  
  dhXmlDir: z.string()
    .describe('Percorso della cartella di destinazione delle fatture')
    .default('data/xml'),

  dhArchiveDir: z.string()
    .describe('Percorso della cartella di destinazione delle archivi esportati')
    .default('data/archives'),
});

// Infer TypeScript type from schema
export type Config = z.infer<typeof ConfigSchema>;

// Load and validate config using Zod
export function loadConfig(path: string): Config {
  try {
    return ConfigSchema.parse(JSON.parse(fs.readFileSync(path, 'utf-8')));
  } catch (error) {
    console.error('Error reading config file:', error);
    process.exit(1);
  }
}

function main(){

  const schemaPath = path.join(process.cwd(), 'config', 'config.schema.json');
  fs.writeFileSync(schemaPath, JSON.stringify(ConfigSchema.toJSONSchema(), null, 2), 'utf-8');
  console.log(`✓ JSON Schema generated at: ${schemaPath}`);
}

if (require.main === module) {
    main();
}