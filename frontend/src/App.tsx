import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom'

function InviteRequestRedirect() {
  const [searchParams] = useSearchParams()
  const invite = searchParams.get('invite')
  const to = invite ? `/?invite=${encodeURIComponent(invite)}` : '/'
  return <Navigate to={to} replace />
}
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from './components/Layout'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Onboarding } from './pages/Onboarding'
import { Dashboard } from './pages/Dashboard'
import { Matches } from './pages/Matches'
import { Refer } from './pages/Refer'
import { Events } from './pages/Events'
import { Messages } from './pages/Messages'
import { Admin } from './pages/Admin'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/invite-request" element={<InviteRequestRedirect />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/app" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<Navigate to="/onboarding" replace />} />
            <Route path="matches" element={<Matches />} />
            <Route path="events" element={<Events />} />
            <Route path="messages" element={<Messages />} />
            <Route path="refer" element={<Refer />} />
            <Route path="admin" element={<Admin />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
