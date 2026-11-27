import type { ApiErrorResponse } from '../../shared/api'

export class ApiError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

function isApiError(value: unknown): value is ApiErrorResponse {
  if (!value || typeof value !== 'object' || !('error' in value)) return false
  const error = value.error
  return !!error && typeof error === 'object' && 'code' in error && typeof error.code === 'string'
    && 'message' in error && typeof error.message === 'string'
    && !!error.code.trim() && !!error.message.trim()
}

function isAbort(error: unknown) {
  return !!error && typeof error === 'object' && 'name' in error && error.name === 'AbortError'
}

export async function apiRequest<T>(path: string, accessToken: string, init: RequestInit = {}): Promise<T> {
  // Resolve against a fixed origin before adding credentials. Reject paths that
  // normalize outside /api/, including encoded traversal and backslashes.
  let decoded: string
  try {
    decoded = decodeURIComponent(path.split(/[?#]/, 1)[0])
  } catch {
    throw new ApiError(0, 'INVALID_PATH', 'Use an application API path.')
  }
  if (!path.startsWith('/api/') || decoded.includes('\\') || decoded.split('/').some(part => part === '.' || part === '..')
    || new URL(path, 'https://application.invalid').pathname !== path.split(/[?#]/, 1)[0]) {
    throw new ApiError(0, 'INVALID_PATH', 'Use an application API path.')
  }
  if (!accessToken.trim()) throw new ApiError(401, 'UNAUTHORIZED', 'Sign in to continue.')
  const headers = new Headers(init.headers)
  headers.set('Authorization', `Bearer ${accessToken}`)
  if (typeof init.body === 'string' && !headers.has('Content-Type')) {
    try {
      JSON.parse(init.body)
      headers.set('Content-Type', 'application/json')
    } catch {
      // Let fetch choose the content type for a plain text body.
    }
  }

  let response: Response
  try {
    response = await fetch(path, { ...init, headers, redirect: 'error' })
  } catch (error) {
    if (init.signal?.aborted || isAbort(error)) throw error
    throw new ApiError(0, 'NETWORK_ERROR', 'The server could not be reached. Please retry.')
  }
  if (response.status === 204) return undefined as T
  let body: unknown
  try {
    body = await response.json()
  } catch (error) {
    if (init.signal?.aborted || isAbort(error)) throw error
    throw new ApiError(response.status, 'INVALID_RESPONSE', response.ok
      ? 'The server returned an unreadable response. Please retry.'
      : `The server could not complete the request (HTTP ${response.status}). Please retry.`)
  }
  if (!response.ok) {
    if (isApiError(body)) throw new ApiError(response.status, body.error.code, body.error.message)
    throw new ApiError(response.status, 'REQUEST_FAILED', `The server could not complete the request (HTTP ${response.status}). Please retry.`)
  }
  // Feature-specific API modules validate the returned fields before use.
  return body as T
}
