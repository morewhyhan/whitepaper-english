import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { databaseTestAdapter } from '../../scripts/testing/database-adapter.mjs'

export function openMigratedDatabase(databasePath: string) {
  const database = databaseTestAdapter.openFile(databasePath)
  const migrationsRoot = join(process.cwd(), 'prisma/migrations')

  for (const name of readdirSync(migrationsRoot).sort()) {
    const file = join(migrationsRoot, name, 'migration.sql')
    try {
      database.exec(readFileSync(file, 'utf8'))
    } catch {
      // migration_lock.toml and other non-migration entries have no SQL
    }
  }

  return database
}
