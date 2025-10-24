import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  Calendar, 
  DollarSign, 
  BarChart3, 
  Settings,
  FileText,
  Building2,
  Briefcase,
  MapPin,
  FileCheck,
  Timer,
  Menu,
  Users2,
  ClipboardCheck,
  Wallet,
  AlarmClock
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from 'react-i18next'
import { useSidebar } from '../contexts/SidebarContext'
import { useState } from 'react'

const Sidebar = () => {
  const { user } = useAuth()
  const { t } = useTranslation()
  const { isCollapsed, toggleSidebar } = useSidebar()
  const [hrOpen, setHrOpen] = useState(true)
  const [attOpen, setAttOpen] = useState(true)
  const [payOpen, setPayOpen] = useState(true)

  // Grouped navigation
  const grouped = [
    {
      label: t('common.employees'),
      icon: Users2,
      roles: ['admin', 'hr', 'manager'],
      items: [
        { name: t('employees.title'), href: '/employees', icon: Users, roles: ['admin', 'hr', 'manager'] },
        { name: t('common.positions'), href: '/positions', icon: Briefcase, roles: ['admin', 'hr'] },
        { name: t('common.departments'), href: '/departments', icon: Building2, roles: ['admin', 'hr'] },
        { name: t('contracts.title'), href: '/contracts', icon: FileCheck, roles: ['admin', 'hr', 'manager', 'employee'] },
        { name: t('contractTypes.title'), href: '/contract-types', icon: FileText, roles: ['admin', 'hr', 'manager'] },
      ],
    },
    {
      label: t('common.attendance'),
      icon: ClipboardCheck,
      roles: ['admin', 'hr', 'manager', 'employee'],
      items: [
        { name: t('common.attendanceTable'), href: '/attendance', icon: Clock, roles: ['admin', 'hr', 'manager', 'employee'] },
        { name: t('common.shifts'), href: '/shifts', icon: Timer, roles: ['admin', 'hr'] },
        { name: t('common.leaves'), href: '/leaves', icon: Calendar, roles: ['admin', 'hr', 'manager', 'employee'] },
        { name: t('overtime.title'), href: '/overtime', icon: AlarmClock, roles: ['admin', 'hr', 'manager', 'employee'] },
        { name: t('common.workLocations'), href: '/work-locations', icon: MapPin, roles: ['admin', 'hr'] },
      ],
    },
    {
      label: t('common.payroll'),
      icon: Wallet,
      roles: ['admin', 'hr', 'employee', 'manager'],
      items: [
        { name: t('common.payrollTable'), href: '/payroll', icon: DollarSign, roles: ['admin', 'hr', 'manager'] },
        { name: t('common.payslips'), href: '/payslips', icon: FileText, roles: ['admin', 'hr', 'manager', 'employee'] },
      ],
    },
  ]

  const singles = [
    { name: t('common.dashboard'), href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'hr', 'manager'] },
    { name: t('common.reports'), href: '/reports', icon: BarChart3, roles: ['admin', 'hr', 'manager'] },
    { name: t('common.settings'), href: '/settings', icon: Settings, roles: ['admin', 'hr'] },
    { name: t('employees.myProfile'), href: '/me', icon: Users, roles: ['employee'] },
  ]

  const canSee = (roles: string[]) => roles.includes(user?.role || '')

  return (
    <div className={`bg-white shadow-sm border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } flex flex-col h-screen sticky top-0`}> 
      {/* Toggle Button */}
      <div className="flex justify-end p-3 border-b border-gray-200">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          title={isCollapsed ? 'Mở rộng menu' : 'Thu nhỏ menu'}
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      <nav className="mt-6 px-3 flex-1 overflow-y-auto">
        <div className={`${isCollapsed ? 'space-y-0' : 'space-y-2'}`}>
          {/* My profile first (employees) */}
          {(() => {
            const item = singles.find(s => s.href === '/me')
            if (!item || !canSee(item.roles)) return null
            const Icon = item.icon
            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center ${isCollapsed ? 'justify-center' : ''} px-3 ${isCollapsed ? 'py-2' : 'py-2'} text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`} />
                {!isCollapsed && (
                  <span className="truncate">{item.name}</span>
                )}
              </NavLink>
            )
          })()}

          {/* Dashboard first */}
          {(() => {
            const item = singles.find(s => s.href === '/dashboard')
            if (!item || !canSee(item.roles)) return null
            const Icon = item.icon
            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center ${isCollapsed ? 'justify-center' : ''} px-3 ${isCollapsed ? 'py-2' : 'py-2'} text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`} />
                {!isCollapsed && (
                  <span className="truncate">{item.name}</span>
                )}
              </NavLink>
            )
          })()}
          {/* Group: Nhân sự (parent item with children) */}
          {canSee(grouped[0].roles) && (
            <div className={`${isCollapsed ? 'mb-0' : 'mb-2'}`}>
              <button
                className={`w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={() => setHrOpen((v) => !v)}
                title={isCollapsed ? 'Nhân sự' : undefined}
              >
                <Users className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`} />
                {!isCollapsed && (
                  <span className="flex-1 text-left">Nhân sự</span>
                )}
                {!isCollapsed && (
                  <svg className={`h-4 w-4 transition-transform ${hrOpen ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path d="M6 6l6 4-6 4V6z"/></svg>
                )}
              </button>
              {hrOpen && (
                <div className="mt-1 space-y-1">
                  {grouped[0].items.filter(item => canSee(item.roles)).map(item => {
                    const Icon = item.icon
                    return (
                      <NavLink
                        key={item.href}
                        to={item.href}
                        className={({ isActive }) =>
                          `ml-6 group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            isActive
                              ? 'bg-primary-100 text-primary-700'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`
                        }
                        title={isCollapsed ? item.name : undefined}
                      >
                        <Icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`} />
                        {!isCollapsed && (
                          <span className="truncate">{item.name}</span>
                        )}
                      </NavLink>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Group: Chấm công */}
          {canSee(grouped[1].roles) && (
            <div className={`${isCollapsed ? 'mb-0' : 'mb-2'}`}>
              <button
                className={`w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={() => setAttOpen((v) => !v)}
                title={isCollapsed ? 'Chấm công' : undefined}
              >
                <Clock className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`} />
                {!isCollapsed && (
                  <span className="flex-1 text-left">Chấm công</span>
                )}
                {!isCollapsed && (
                  <svg className={`h-4 w-4 transition-transform ${attOpen ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path d="M6 6l6 4-6 4V6z"/></svg>
                )}
              </button>
              {attOpen && (
                <div className="mt-1 space-y-1">
                  {grouped[1].items.filter(item => canSee(item.roles)).map(item => {
                    const Icon = item.icon
                    return (
                      <NavLink
                        key={item.href}
                        to={item.href}
                        className={({ isActive }) =>
                          `ml-6 group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            isActive
                              ? 'bg-primary-100 text-primary-700'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`
                        }
                        title={isCollapsed ? item.name : undefined}
                      >
                        <Icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`} />
                        {!isCollapsed && (
                          <span className="truncate">{item.name}</span>
                        )}
                      </NavLink>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Group: Lương */}
          {canSee(grouped[2].roles) && (
            <div className={`${isCollapsed ? 'mb-0' : 'mb-2'}`}>
              <button
                className={`w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={() => setPayOpen((v) => !v)}
                title={isCollapsed ? 'Lương' : undefined}
              >
                <DollarSign className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`} />
                {!isCollapsed && (
                  <span className="flex-1 text-left">Lương</span>
                )}
                {!isCollapsed && (
                  <svg className={`h-4 w-4 transition-transform ${payOpen ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path d="M6 6l6 4-6 4V6z"/></svg>
                )}
              </button>
              {payOpen && (
                <div className="mt-1 space-y-1">
                  {grouped[2].items.filter(item => canSee(item.roles)).map(item => {
                    const Icon = item.icon
                    return (
                      <NavLink
                        key={item.href}
                        to={item.href}
                        className={({ isActive }) =>
                          `ml-6 group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            isActive
                              ? 'bg-primary-100 text-primary-700'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`
                        }
                        title={isCollapsed ? item.name : undefined}
                      >
                        <Icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`} />
                        {!isCollapsed && (
                          <span className="truncate">{item.name}</span>
                        )}
                      </NavLink>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Singles */}
          {singles.filter(item => item.href !== '/dashboard' && item.href !== '/me').filter(item => canSee(item.roles)).map(item => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center ${isCollapsed ? 'justify-center' : ''} px-3 ${isCollapsed ? 'py-2' : 'py-2'} text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`} />
                {!isCollapsed && (
                  <span className="truncate">{item.name}</span>
                )}
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export default Sidebar
