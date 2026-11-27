import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { AuthContext, type AuthContextValue } from './AuthContext'
import { useAuth } from './useAuth'

afterEach(cleanup)

it('exposes the provider’s current state and session operations as it changes users', async () => {
  const getAccessToken = vi.fn().mockResolvedValue('test-only-student')
  const signOut = vi.fn().mockResolvedValue(undefined)
  let value: AuthContextValue = { state: { status: 'loading' }, getAccessToken, signOut }
  const { result, rerender } = renderHook(useAuth, { wrapper: ({ children }) => <AuthContext.Provider value={value}>{children}</AuthContext.Provider> })
  expect(result.current.state.status).toBe('loading')
  value = { ...value, state: { status: 'authenticated', user: { id: 'student-a', email: null } } }
  rerender()
  expect(result.current.state).toEqual(value.state)
  expect(await result.current.getAccessToken()).toBe('test-only-student')
  await result.current.signOut()
  expect(signOut).toHaveBeenCalledTimes(1)
  value = { ...value, state: { status: 'anonymous' } }
  rerender()
  expect(result.current.state.status).toBe('anonymous')
})

it('reports a missing provider instead of inventing an identity', () => {
  expect(() => renderHook(useAuth)).toThrow('useAuth must be used inside AuthProvider.')
})
