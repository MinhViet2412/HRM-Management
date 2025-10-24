import { useQuery } from 'react-query'
import { Users, Clock, Calendar, DollarSign } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import api from '../services/api'

const Dashboard = () => {
  const { t } = useTranslation()
  const { data: stats, isLoading } = useQuery('dashboard-stats', async () => {
    const [employeesRes, attendanceRes, leavesRes, payrollRes] = await Promise.all([
      api.get('/employees?active=true'),
      api.get('/attendance/date/' + new Date().toISOString().split('T')[0]),
      api.get('/leave'),
      api.get('/payroll/period/' + new Date().toISOString().slice(0, 7)),
    ])
    
    return {
      totalEmployees: employeesRes.data.length,
      todayAttendance: attendanceRes.data.length,
      pendingLeaves: leavesRes.data.filter((leave: any) => leave.status === 'pending').length,
      currentPayroll: payrollRes.data.length,
    }
  })

  const statsCards = [
    {
      title: t('dashboard.totalEmployees'),
      value: stats?.totalEmployees || 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: t('dashboard.todaysAttendance'),
      value: stats?.todayAttendance || 0,
      icon: Clock,
      color: 'bg-green-500',
    },
    {
      title: t('dashboard.pendingLeaves'),
      value: stats?.pendingLeaves || 0,
      icon: Calendar,
      color: 'bg-yellow-500',
    },
    {
      title: t('dashboard.currentPayroll'),
      value: stats?.currentPayroll || 0,
      icon: DollarSign,
      color: 'bg-purple-500',
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>
        <p className="text-gray-600">{t('dashboard.welcome')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.title} className="card p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('dashboard.recentActivities')}</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-600">{t('dashboard.checkedIn')}</span>
              <span className="text-xs text-gray-400">2 minutes ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-sm text-gray-600">{t('dashboard.newLeave')}</span>
              <span className="text-xs text-gray-400">1 hour ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span className="text-sm text-gray-600">{t('dashboard.payrollGenerated', { period: 'December' })}</span>
              <span className="text-xs text-gray-400">3 hours ago</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('dashboard.quickActions')}</h3>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
              {t('dashboard.checkInOut')}
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
              {t('dashboard.requestLeave')}
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
              {t('dashboard.viewPayroll')}
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
              {t('dashboard.generateReports')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
