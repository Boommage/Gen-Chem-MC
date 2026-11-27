// Reuses the Miniflare/esbuild versions installed by the locked Wrangler tooling.
import { Miniflare, Log, LogLevel, convertV4MiniflareOptions } from 'miniflare'
import { build } from 'esbuild'
import { unstable_splitSqlQuery } from 'wrangler'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

export async function startChatRuntime(persist?: string) {
  const compiled = await build({ entryPoints: [fileURLToPath(new URL('./worker.ts', import.meta.url))],
    bundle: true, format: 'esm', platform: 'browser', target: 'es2022', write: false })
  const mf = new Miniflare(convertV4MiniflareOptions({
    name: 'neocortex-local-chat-test', modules: true, script: compiled.outputFiles[0].text, compatibilityDate: '2026-10-05',
    host: '127.0.0.1', port: 0, log: new Log(LogLevel.ERROR),
    cf: false, telemetry: { enabled: false },
    d1Databases: { DB: 'neocortex-local-test-db' }, r2Buckets: { CHAT_IMAGES: 'neocortex-local-test-images' }, bindings: { CHAT_IMAGE_STORAGE_ENABLED: 'true' },
    resourcePersistencePath: persist,
    isolatedResourcePersistencePath: persist,
  }))
  try {
    const origin = await mf.ready
    const db = await mf.getD1Database('DB')
    await db.exec('CREATE TABLE IF NOT EXISTS __local_test_migrations (name TEXT PRIMARY KEY)')
    for (const name of ['0001_conversations', '0002_conversation_retention', '0003_chat_delivery']) {
      if (await db.prepare('SELECT name FROM __local_test_migrations WHERE name = ?').bind(name).first()) continue
      const sql = await readFile(new URL(`../../migrations/${name}.sql`, import.meta.url), 'utf8')
      await db.batch([...unstable_splitSqlQuery(sql).map(statement => db.prepare(statement)),
        db.prepare('INSERT INTO __local_test_migrations (name) VALUES (?)').bind(name)])
    }
    const bucket = await mf.getR2Bucket('CHAT_IMAGES') as unknown as R2Bucket
    return { mf, origin, db, bucket, close: () => mf.dispose() }
  } catch (error) {
    await mf.dispose()
    throw error
  }
}
