import { useState } from 'react'
import { User, Bell, Shield, Database } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import api, { API_BASE_URL } from '../services/api'
import toast from 'react-hot-toast'

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile')
  const [form, setForm] = useState<any>({})
  const { t } = useTranslation()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Get current user data
  const { data: currentUser, isLoading } = useQuery(
    'currentUser',
    async () => {
      const response = await api.get('/auth/me')
      return response.data
    },
    { enabled: !!user }
  )

  // Avatar upload mutation
  const uploadMutation = useMutation(
    async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      return api.post(`/employees/upload-avatar/${user?.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('currentUser')
        toast.success('Avatar updated successfully!')
      },
      onError: () => {
        toast.error('Failed to update avatar')
      }
    }
  )

  // Get work locations and shifts
  const { data: workLocations } = useQuery('work-locations', async () => {
    const res = await api.get('/work-locations')
    return res.data
  })

  const { data: shifts } = useQuery('shifts', async () => {
    const res = await api.get('/shifts')
    return res.data
  })

  // Profile update mutation
  const updateProfileMutation = useMutation(
    async (payload: any) => {
      return api.patch(`/employees/${currentUser?.employee?.id}`, payload)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('currentUser')
        toast.success('Profile updated successfully!')
      },
      onError: () => {
        toast.error('Failed to update profile')
      }
    }
  )

  const tabs = [
    { id: 'profile', name: t('settings.profileInfo'), icon: User },
    { id: 'notifications', name: t('settings.notifications'), icon: Bell },
    { id: 'security', name: t('settings.security'), icon: Shield },
    { id: 'system', name: t('settings.system'), icon: Database },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{t('settings.profileInfo')}</h3>
              <p className="text-sm text-gray-600">{t('settings.updatePersonal')}</p>
            </div>
            
            {/* Avatar Section */}
            <div className="flex items-center space-x-6">
              <div className="text-center">
                {currentUser?.avatar ? (
                  <img 
                    src={`${API_BASE_URL}${currentUser.avatar}`} 
                    alt="Avatar" 
                    className="w-20 h-20 rounded-full object-cover" 
                    onError={(e) => {
                      console.error('Avatar load error for:', `${API_BASE_URL}${currentUser.avatar}`);
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className={`w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center ${currentUser?.avatar ? 'hidden' : ''}`}
                  style={{ display: currentUser?.avatar ? 'none' : 'flex' }}
                >
                  <span className="text-lg font-semibold text-gray-600">
                    {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
                  </span>
                </div>
              </div>
              <div>
                <label className="btn btn-secondary cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) uploadMutation.mutate(file)
                    }}
                    disabled={uploadMutation.isLoading}
                  />
                  {uploadMutation.isLoading ? 'Uploading...' : 'Upload Avatar'}
                </label>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 10MB</p>
              </div>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault()
              const payload = {
                firstName: form.firstName || currentUser?.firstName,
                lastName: form.lastName || currentUser?.lastName,
                phone: form.phone || currentUser?.phone,
                workLocationId: form.workLocationId !== undefined ? form.workLocationId : currentUser?.employee?.workLocationId,
                shiftId: form.shiftId !== undefined ? form.shiftId : currentUser?.employee?.shiftId,
                password: form.password || undefined
              }
              updateProfileMutation.mutate(payload)
            }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('settings.firstName')}</label>
                  <input 
                    type="text" 
                    className="input mt-1" 
                    defaultValue={currentUser?.firstName || ''} 
                    onChange={(e) => setForm((f: any) => ({ ...f, firstName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('settings.lastName')}</label>
                  <input 
                    type="text" 
                    className="input mt-1" 
                    defaultValue={currentUser?.lastName || ''} 
                    onChange={(e) => setForm((f: any) => ({ ...f, lastName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" className="input mt-1" defaultValue={currentUser?.email || ''} disabled />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('settings.phone')}</label>
                  <input 
                    type="tel" 
                    className="input mt-1" 
                    defaultValue={currentUser?.phone || ''} 
                    onChange={(e) => setForm((f: any) => ({ ...f, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Work Location</label>
                  <select 
                    className="input mt-1" 
                    value={form.workLocationId !== undefined ? form.workLocationId : (currentUser?.employee?.workLocationId || '')} 
                    onChange={(e) => setForm((f: any) => ({ ...f, workLocationId: e.target.value }))}
                  >
                    <option value="">Select Work Location</option>
                    {workLocations?.map((wl: any) => (
                      <option key={wl.id} value={wl.id}>{wl.name}</option>
                    ))}
                  </select>
                  {currentUser?.employee?.workLocation && (
                    <p className="text-xs text-gray-500 mt-1">
                      {currentUser.employee.workLocation.name} • {currentUser.employee.workLocation.address}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Shift</label>
                  <select 
                    className="input mt-1" 
                    value={form.shiftId !== undefined ? form.shiftId : (currentUser?.employee?.shiftId || '')} 
                    onChange={(e) => setForm((f: any) => ({ ...f, shiftId: e.target.value }))}
                  >
                    <option value="">Select</option>
                    {shifts?.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.startTime}-{s.endTime})</option>
                    ))}
                  </select>
                  {currentUser?.employee?.shift && (
                    <p className="text-xs text-gray-500 mt-1">
                      {currentUser.employee.shift.name} • {currentUser.employee.shift.startTime}-{currentUser.employee.shift.endTime}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password (optional)</label>
                  <input 
                    type="password" 
                    className="input mt-1" 
                    placeholder="Leave blank to keep current" 
                    onChange={(e) => setForm((f: any) => ({ ...f, password: e.target.value }))}
                  />
                </div>
              </div>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={updateProfileMutation.isLoading}
              >
                {updateProfileMutation.isLoading ? 'Saving...' : t('settings.saveChanges')}
              </button>
            </form>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{t('settings.notifications')}</h3>
              <p className="text-sm text-gray-600">{t('settings.notificationsSubtitle')}</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                  <p className="text-sm text-gray-600">Receive notifications via email</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Leave Request Notifications</h4>
                  <p className="text-sm text-gray-600">Get notified about leave requests</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Payroll Notifications</h4>
                  <p className="text-sm text-gray-600">Get notified about payroll updates</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
              </div>
            </div>
            <button className="btn btn-primary">Save Preferences</button>
          </div>
        )

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{t('settings.security')}</h3>
              <p className="text-sm text-gray-600">{t('settings.securitySubtitle')}</p>
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900">{t('settings.changePassword')}</h4>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('settings.currentPassword')}</label>
                    <input type="password" className="input mt-1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('settings.newPassword')}</label>
                    <input type="password" className="input mt-1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('settings.confirmNewPassword')}</label>
                    <input type="password" className="input mt-1" />
                  </div>
                </div>
                <button className="btn btn-primary mt-4">{t('settings.updatePassword')}</button>
              </div>
            </div>
          </div>
        )

      case 'system':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{t('settings.system')}</h3>
              <p className="text-sm text-gray-600">{t('settings.systemSubtitle')}</p>
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900">{t('settings.dbBackup')}</h4>
                <p className="text-sm text-gray-600">{t('settings.systemSubtitle')}</p>
                <button className="btn btn-secondary mt-2">{t('settings.createBackup')}</button>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">{t('settings.systemLogs')}</h4>
                <p className="text-sm text-gray-600">{t('settings.systemSubtitle')}</p>
                <button className="btn btn-secondary mt-2">{t('settings.viewLogs')}</button>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">{t('settings.cacheManagement')}</h4>
                <p className="text-sm text-gray-600">{t('settings.systemSubtitle')}</p>
                <button className="btn btn-secondary mt-2">{t('settings.clearCache')}</button>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('settings.title')}</h1>
        <p className="text-gray-600">{t('settings.subtitle')}</p>
      </div>

      {isLoading ? (
        <div className="card p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-2 text-gray-600">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.name}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="lg:col-span-3">
            <div className="card p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings
