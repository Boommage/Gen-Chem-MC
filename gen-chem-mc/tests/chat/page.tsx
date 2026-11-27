// Explicit local test entry. Not imported by the production application.
import { StrictMode, useCallback, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthContext, type AuthContextValue } from '../../src/features/auth/AuthContext'
import AppLayout from '../../src/components/AppLayout'
import Coach from '../../src/pages/Coach'
import '../../src/index.css'
import '../../src/App.css'

export default function LocalChatTest() {
  const [student, setStudent] = useState('a')
  const getAccessToken = useCallback(async () => 'local-test-' + student, [student])
  const auth: AuthContextValue = { state: { status: 'authenticated', user: { id: 'local-test-' + student, email: null } },
    getAccessToken, signOut: async () => {} }
  return <AuthContext.Provider value={auth}>
    <div style={{ padding: 12, background: '#fff3d6', fontSize: 14 }}>
      <strong>Local integration test</strong> · isolated local D1/R2 · test accounts · canned replies<br />
      <button type="button" onClick={() => setStudent('a')}>Test student A</button>{' '}
      <button type="button" onClick={() => setStudent('b')}>Test student B</button>{' '}
      <span>Current test account: {student.toUpperCase()}</span>
      <p>Start a message with [test failure] to fail its first response, then use Retry.</p>
    </div>
    <AppLayout activeRoute="/coach" onNavigate={() => {}}><Coach /></AppLayout>
  </AuthContext.Provider>
}

createRoot(document.getElementById('root')!).render(<StrictMode><LocalChatTest /></StrictMode>)
