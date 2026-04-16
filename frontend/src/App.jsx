import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { isLoggedIn } from './utils/auth'
import Layout from './components/layout/Layout'
import LoginPage    from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import QAPage        from './pages/QAPage'
import MootPage      from './pages/MootPage'
import DocumentPage  from './pages/DocumentPage'
import CasesPage     from './pages/CasesPage'
import DashboardPage from './pages/DashboardPage'

function PrivateRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: "'Crimson Pro', serif",
            fontSize: 15,
            background: '#0a0a0f',
            color: '#f5e9c5',
            border: '1px solid rgba(201,168,76,0.3)',
          },
        }}
      />
      <Routes>
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={<PrivateRoute><Layout /></PrivateRoute>}
        >
          <Route index              element={<Navigate to="/qa" replace />} />
          <Route path="qa"          element={<QAPage />} />
          <Route path="moot"        element={<MootPage />} />
          <Route path="document"    element={<DocumentPage />} />
          <Route path="cases"       element={<CasesPage />} />
          <Route path="dashboard"   element={<DashboardPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
