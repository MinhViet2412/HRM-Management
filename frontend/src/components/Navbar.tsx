import { LogOut, User, Globe } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from 'react-i18next'

const Navbar = () => {
  const { user, logout } = useAuth()
  const { i18n } = useTranslation()

  const changeLang = (lng: 'en' | 'vi') => {
    i18n.changeLanguage(lng)
    localStorage.setItem('lang', lng)
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">HRM System</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-gray-500" />
              <select
                className="text-sm border border-gray-300 rounded px-2 py-1 text-gray-700 bg-white"
                defaultValue={i18n.language}
                onChange={(e)=>changeLang(e.target.value as 'en' | 'vi')}
              >
                <option value="vi">VI</option>
                <option value="en">EN</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {user?.role}
              </span>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
