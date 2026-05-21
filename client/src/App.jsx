import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Subscribe from './pages/Subscribe'
import Dashboard from './pages/Dashboard'
import Charities from './pages/Charities'

import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminDraws from './pages/admin/AdminDraws'
import AdminCharities from './pages/admin/AdminCharities'
import AdminWinners from './pages/admin/AdminWinners'
import AdminReports from './pages/admin/AdminReports'
import { AdminLayout } from './pages/admin/AdminDashboard'


// Protected route wrapper
const ProtectedRoute = ({ children, adminOnly }) => {
  const { user, loading } = useAuth()
  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to="/login" />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" />
  return children
}

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/charities" element={<Charities />} />
        <Route path="/subscribe" element={<Subscribe />} />

        {/* User Protected */}
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />

        {/* Admin Protected */}
       <Route path="/admin" element={
  <ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>
}>
  <Route index element={<AdminDashboard />} />
  <Route path="users" element={<AdminUsers />} />
  <Route path="draws" element={<AdminDraws />} />
  <Route path="charities" element={<AdminCharities />} />
  <Route path="winners" element={<AdminWinners />} />
  <Route path="reports" element={<AdminReports />} />
</Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
