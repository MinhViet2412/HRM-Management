import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import EmployeeProfile from './pages/EmployeeProfile'
import Departments from './pages/Departments'
import Positions from './pages/Positions'
import Attendance from './pages/Attendance'
import Leaves from './pages/Leaves'
import Payroll from './pages/Payroll'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import WorkLocations from './pages/WorkLocations'
import Shifts from './pages/Shifts'
import Contracts from './pages/Contracts'
import ContractTypes from './pages/ContractTypes'
import Layout from './components/Layout'
import LoadingSpinner from './components/LoadingSpinner'
import MyProfileRedirect from './pages/MyProfileRedirect'
import Payslips from './pages/Payslips'
import Overtime from './pages/Overtime'

function App() {
  const { user, isLoading } = useAuth()
  const defaultPath = user?.role === 'employee' ? '/attendance' : '/dashboard'

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to={defaultPath} replace />} />
        {user.role !== 'employee' && (
          <Route path="/dashboard" element={<Dashboard />} />
        )}
        <Route path="/employees" element={<Employees />} />
        <Route path="/employees/:id" element={<EmployeeProfile />} />
        <Route path="/me" element={<MyProfileRedirect />} />
        <Route path="/departments" element={<Departments />} />
        <Route path="/positions" element={<Positions />} />
        <Route path="/work-locations" element={<WorkLocations />} />
        <Route path="/shifts" element={<Shifts />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/leaves" element={<Leaves />} />
        <Route path="/overtime" element={<Overtime />} />
        {user.role !== 'employee' ? (
          <Route path="/payroll" element={<Payroll />} />
        ) : (
          <Route path="/payroll" element={<Navigate to="/payslips" replace />} />
        )}
        <Route path="/payslips" element={<Payslips />} />
        <Route path="/contracts" element={<Contracts />} />
        <Route path="/contract-types" element={<ContractTypes />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to={defaultPath} replace />} />
      </Routes>
    </Layout>
  )
}

export default App
