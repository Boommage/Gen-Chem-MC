import { useEffect, useState } from 'react'
import AppLayout from './components/AppLayout'
import Coach from './pages/Coach'
import Dashboard from './pages/Dashboard'
import Progress from './pages/Progress'
import Study from './pages/Study'
import './App.css'

const routes = {
  '/dashboard': Dashboard,
  '/study': Study,
  '/coach': Coach,
  '/progress': Progress,
} as const

type Route = keyof typeof routes

function getRoute(pathname: string): Route {
  return pathname in routes ? (pathname as Route) : '/dashboard'
}

function App() {
  const [route, setRoute] = useState<Route>(() => getRoute(window.location.pathname))

  useEffect(() => {
    if (!(window.location.pathname in routes)) {
      window.history.replaceState({}, '', '/dashboard')
    }
    const handlePopState = () => setRoute(getRoute(window.location.pathname))
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = (nextRoute: Route) => {
    if (nextRoute === route) return
    window.history.pushState({}, '', nextRoute)
    setRoute(nextRoute)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const Page = routes[route]

  return (
    <AppLayout activeRoute={route} onNavigate={navigate}>
      <Page />
    </AppLayout>
  )
}

export default App
