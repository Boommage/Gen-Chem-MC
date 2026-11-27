import type { Env } from './model.ts'

export interface WorkerEnv extends Env {
  SUPABASE_URL?: string
  SUPABASE_PUBLISHABLE_KEY?: string
  // Optional while the legacy stateless Worker and local mock remain supported.
  // Conversation handlers must check their required bindings before use.
  DB?: CloudflareBindings['DB']
  CHAT_IMAGES?: R2Bucket
  CHAT_IMAGE_STORAGE_ENABLED?: string
}
