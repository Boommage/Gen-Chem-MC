import { createContext } from 'react'
import type { AuthUser } from '../../../shared/auth'

export type AuthState =
  | { status: 'loading' }
  | { status: 'anonymous' }
  | { status: 'authenticated'; user: AuthUser }
  | { status: 'error'; message: string }

export interface AuthContextValue {
  state: AuthState
  getAccessToken(): Promise<string | null>
  signOut(): Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
