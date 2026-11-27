// Test-only adapter: runs the production prepared SQL against real SQLite.
import { DatabaseSync, type SQLInputValue } from 'node:sqlite'
import { readFileSync } from 'node:fs'

export function testDatabase() {
  const sqlite = new DatabaseSync(':memory:')
  sqlite.exec('PRAGMA foreign_keys = ON')
  for (const name of ['0001_conversations', '0002_conversation_retention', '0003_chat_delivery']) {
    sqlite.exec(readFileSync(new URL(`../../migrations/${name}.sql`, import.meta.url), 'utf8'))
  }
  function prepare(sql: string, args: SQLInputValue[] = []) {
    function runSync() {
      const result = sqlite.prepare(sql).run(...args)
      return { results: [], success: true, meta: { changes: Number(result.changes) } }
    }
    return {
      bind(...values: SQLInputValue[]) { return prepare(sql, values) },
      async first() { return sqlite.prepare(sql).get(...args) ?? null },
      async all() { return { results: sqlite.prepare(sql).all(...args), success: true, meta: {} } },
      async run() { return runSync() },
      runSync,
    }
  }
  const db = {
    prepare,
    async batch(statements: { runSync(): unknown }[]) {
      sqlite.exec('BEGIN IMMEDIATE')
      try {
        const results = []
        for (const statement of statements) results.push(statement.runSync())
        sqlite.exec('COMMIT')
        return results
      } catch (error) {
        sqlite.exec('ROLLBACK')
        throw error
      }
    },
  } as unknown as D1Database
  return { sqlite, db }
}
