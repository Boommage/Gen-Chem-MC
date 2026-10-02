import type { ReactNode } from 'react'

type Route = '/dashboard' | '/study' | '/coach' | '/progress'
type IconName = 'dashboard' | 'study' | 'coach' | 'progress' | 'bell' | 'lock'

const navItems: { label: string; route: Route; icon: IconName }[] = [
  { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
  { label: 'Study', route: '/study', icon: 'study' },
  { label: 'Coach', route: '/coach', icon: 'coach' },
  { label: 'Progress', route: '/progress', icon: 'progress' },
]

export function Icon({ name }: { name: IconName }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      {name === 'dashboard' && <><rect {...common} x="4" y="4" width="16" height="16" rx="1.5" /><path {...common} d="M9.33 4v16M14.67 4v16M4 9.33h16M4 14.67h16" /></>}
      {name === 'study' && <><path {...common} d="M3.5 5.5c3.2-.7 5.9-.1 8.5 1.8v12c-2.6-1.9-5.3-2.5-8.5-1.8z" /><path {...common} d="M20.5 5.5c-3.2-.7-5.9-.1-8.5 1.8v12c2.6-1.9 5.3-2.5 8.5-1.8z" /></>}
      {name === 'coach' && <path {...common} d="M20.3 11.5a8 8 0 0 1-8.4 7.9 8.7 8.7 0 0 1-3-.7L4 20l1.4-4.2A8 8 0 1 1 20.3 11.5Z" />}
      {name === 'progress' && <><path {...common} d="M4 4v16h16" /><path {...common} d="m7 15 3.4-3.4 3 2.4 4.6-5" /></>}
      {name === 'bell' && <><path {...common} d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 8.5h18C21 15 18 15 18 8Z" /><path {...common} d="M10 20h4" /></>}
      {name === 'lock' && <><rect {...common} x="5" y="10" width="14" height="11" rx="2" /><path {...common} d="M8 10V7a4 4 0 0 1 8 0v3" /></>}
    </svg>
  )
}

interface AppLayoutProps {
  activeRoute: Route
  onNavigate: (route: Route) => void
  children: ReactNode
}

export default function AppLayout({ activeRoute, onNavigate, children }: AppLayoutProps) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand" aria-label="Neocortex">
          <span className="brand-mark">N</span>
          <span className="brand-name">Neocortex</span>
        </div>
        <nav className="nav-list" aria-label="Primary navigation">
          {navItems.map((item) => (
            <button className={`nav-link${activeRoute === item.route ? ' active' : ''}`} type="button" key={item.route} aria-current={activeRoute === item.route ? 'page' : undefined} onClick={() => onNavigate(item.route)}>
              <Icon name={item.icon} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="profile-row">
            <span className="avatar" aria-hidden="true" />
            <span>Profile / Settings</span>
          </div>
          <p className="privacy-note">Your reflections are private by default.</p>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <span className="course-label">CHEM 101 · Fall term</span>
          <div className="topbar-actions">
            <button className="notification-button" type="button" aria-label="Notifications"><Icon name="bell" /></button>
            <span className="avatar" aria-label="Profile" />
          </div>
        </header>
        <div className="page-content">{children}</div>
      </main>
    </div>
  )
}
