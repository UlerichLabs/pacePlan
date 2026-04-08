import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Forca a leitura do .env la da raiz do monorepo
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const sql = postgres(process.env.DATABASE_URL as string, { max: 1 });

async function runMigrations() {
  console.log('Iniciando migrations...');

  await sql`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).sort();

  for (const file of files) {
    if (!file.endsWith('.sql')) continue;

    const [alreadyRun] = await sql`SELECT id FROM migrations WHERE name = ${file}`;
    
    if (!alreadyRun) {
      console.log(`Rodando migration: ${file}`);
      const query = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      await sql.begin(async (tx: any) => {
        await tx.unsafe(query);
        await tx`INSERT INTO migrations (name) VALUES (${file})`;
      });
      console.log(`[OK] ${file} executada com sucesso.`);
    } else {
      console.log(`[SKIP] ${file} ja foi executada. Pulando.`);
    }
  }

  console.log('[SUCESSO] Todas as migrations estao atualizadas!');
  await sql.end();
}

runMigrations().catch((err) => {
  console.error('[ERRO] Erro fatal nas migrations:', err);
  process.exit(1);
});