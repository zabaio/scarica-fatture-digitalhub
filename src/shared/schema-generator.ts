import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';

export const ConfigSchema = z.object({

  dhUsername: z.string()
    .describe('Your DigitalHub username'),

  dhPassword: z.string()
    .describe('Your DigitalHub password'),

  dhCessionari: z.array(z.string())
    .describe('The list of Cessionari whose invoices you want to download')
    .min(1),

  dhLastDayDownloaded: z.string()
    .describe('First run: date of first invoice. After that: day of the last successful update operation. - yyyy-MM-dd')
    .date()
    .default("2019-01-01"),

  dhMaxChunkSize: z.number()
    .describe("The maximum number of days each export operation can cover")
    .int()
    .min(1)
    .max(60)
    .default(30),
  
  dhXmlDir: z.string()
    .describe('Relative path to the designated xml directory'),

  dhArchiveDir: z.string()
    .describe('Relative path to the archive directory'),
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