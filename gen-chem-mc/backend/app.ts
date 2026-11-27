import type { AuthUser } from '../shared/auth.ts'
import type { WorkerEnv } from './env.ts'
import { failure } from './http.ts'
import legacyCoach from './model.ts'
import { cleanupConversations } from './conversations/cleanup.ts'

export interface AppHandlers {
  requireUser(request: Request, env: WorkerEnv): Promise<AuthUser | Response>
  handleConversations(request: Request, env: WorkerEnv, user: AuthUser): Promise<Response>
}

// The feature PRs supply both real handlers in the composition root. Without
// them, saved-data requests fail closed, including on localhost.
export function createAppHandler(handlers?: AppHandlers) {
  return {
    async scheduled(_controller: ScheduledController, env: WorkerEnv) {
      await cleanupConversations(env)
    },
    async fetch(request: Request, env: WorkerEnv): Promise<Response> {
      const path = new URL(request.url).pathname
      if (path === '/api/coach' || path === '/api/health') return legacyCoach.fetch(request, env)
      if (path !== '/api/conversations' && !path.startsWith('/api/conversations/')) {
        return failure('NOT_FOUND', 'This endpoint does not exist.', 404)
      }
      if (env.TEAM_API_TOKEN && request.headers.get('X-Team-Token') !== env.TEAM_API_TOKEN) {
        return failure('UNAUTHORIZED', 'The team access token is missing or incorrect.', 401)
      }
      const authorization = request.headers.get('Authorization')
      if (!authorization?.startsWith('Bearer ') || !authorization.slice(7).trim()
        || (env.TEAM_API_TOKEN && authorization === `Bearer ${env.TEAM_API_TOKEN}`)) {
        return failure('UNAUTHORIZED', 'Sign in to access saved conversations.', 401)
      }
      if (!handlers) return failure('AUTH_NOT_CONFIGURED', 'Saved conversations are not available yet.', 503)
      let user: AuthUser | Response
      try {
        user = await handlers.requireUser(request, env)
      } catch {
        return failure('AUTH_UNAVAILABLE', 'Sign-in could not be checked. Please retry.', 503)
      }
      if (user instanceof Response) return user
      try {
        return await handlers.handleConversations(request, env, user)
      } catch {
        return failure('CONVERSATIONS_UNAVAILABLE', 'Saved conversations are unavailable. Please retry.', 503)
      }
    },
  }
}

export default createAppHandler()
