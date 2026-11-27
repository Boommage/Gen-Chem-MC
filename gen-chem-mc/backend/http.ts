import type { ApiErrorResponse } from '../shared/api.ts'

export function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
}

export function failure(code: string, message: string, status: number) {
  const body: ApiErrorResponse = { error: { code, message } }
  return json(body, status)
}
