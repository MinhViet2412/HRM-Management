import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Plus, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react'
import api from '../services/api'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'

const Leaves = () => {
  const [showRequestForm, setShowRequestForm] = useState(false)
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const canModerate = user?.role === 'manager' || user?.role === 'hr' || user?.role === 'admin'
  const [rejecting, setRejecting] = useState<{ id: string; reason: string } | null>(null)

  const { data: myLeaves, isLoading } = useQuery(
    'my-leaves',
    async () => {
      const response = await api.get('/leave/my-requests')
      return response.data
    }
  )

  const { data: allLeaves } = useQuery(
    'all-leaves',
    async () => {
      const response = await api.get('/leave')
      return response.data
    },
    { enabled: canModerate }
  )

  const requestLeaveMutation = useMutation(
    async (data: any) => {
      const response = await api.post('/leave/request', data)
      return response.data
    },
    {
      onSuccess: () => {
        toast.success('Leave request submitted successfully!')
        queryClient.invalidateQueries('my-leaves')
        queryClient.invalidateQueries('all-leaves')
        setShowRequestForm(false)
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to submit leave request')
      },
    }
  )

  const approveMutation = useMutation<unknown, any, string>(
    async (id) => {
      const res = await api.post(`/leave/${id}/approve`)
      return res.data
    },
    {
      onSuccess: () => {
        toast.success(t('leaves.statusApproved'))
        queryClient.invalidateQueries('all-leaves')
        queryClient.invalidateQueries('my-leaves')
      },
      onError: (error: any) => { toast.error(error.response?.data?.message || 'Approve failed') }
    }
  )

  const rejectMutation = useMutation<unknown, any, { id: string; reason: string }>(
    async ({ id, reason }) => {
      const res = await api.post(`/leave/${id}/reject`, { rejectionReason: reason })
      return res.data
    },
    {
      onSuccess: () => {
        toast.success(t('leaves.statusRejected'))
        setRejecting(null)
        queryClient.invalidateQueries('all-leaves')
        queryClient.invalidateQueries('my-leaves')
      },
      onError: (error: any) => { toast.error(error.response?.data?.message || 'Reject failed') }
    }
  )

  const handleRequestLeave = (data: any) => {
    requestLeaveMutation.mutate(data)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('leaves.title')}</h1>
          <p className="text-gray-600">{t('leaves.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowRequestForm(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>{t('leaves.requestLeave')}</span>
        </button>
      </div>

      <div className={`grid grid-cols-1 ${canModerate ? 'lg:grid-cols-2' : ''} gap-6`}>
        <div className="card p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">{t('leaves.myRequests')}</h2>
          <div className="space-y-4">
            {myLeaves?.map((leave: any) => (
              <div key={leave.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(leave.status)}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(leave.status)}`}>
                      {leave.status === 'approved' && t('leaves.statusApproved')}
                      {leave.status === 'rejected' && t('leaves.statusRejected')}
                      {leave.status === 'pending' && t('leaves.statusPending')}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 flex items-center gap-3">
                    {leave.type === 'annual' && t('leaves.typeAnnual')}
                    {leave.type === 'sick' && t('leaves.typeSick')}
                    {leave.type === 'maternity' && t('leaves.typeMaternity')}
                    {leave.type === 'unpaid' && t('leaves.typeUnpaid')}
                    {(leave.type === 'annual') && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                        {t('leaves.remainingDays', { count: leave.employee?.annualLeaveBalance ?? '-' })}
                      </span>
                    )}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-1">{t('leaves.days', { count: leave.days })}</p>
                  {leave.reason && <p className="mt-1">{leave.reason}</p>}
                </div>
              </div>
            ))}
            {myLeaves?.length === 0 && (
              <p className="text-gray-500 text-center py-4">{t('leaves.noRequests')}</p>
            )}
          </div>
        </div>

        {canModerate && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">{t('leaves.allRequests')}</h2>
          </div>
          <div className="space-y-4">
            {allLeaves?.slice(0, 5).map((leave: any) => (
              <div key={leave.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(leave.status)}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(leave.status)}`}>
                      {leave.status === 'approved' && t('leaves.statusApproved')}
                      {leave.status === 'rejected' && t('leaves.statusRejected')}
                      {leave.status === 'pending' && t('leaves.statusPending')}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {leave.type === 'annual' && t('leaves.typeAnnual')}
                    {leave.type === 'sick' && t('leaves.typeSick')}
                    {leave.type === 'maternity' && t('leaves.typeMaternity')}
                    {leave.type === 'unpaid' && t('leaves.typeUnpaid')}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="font-medium">{leave.employee?.firstName} {leave.employee?.lastName}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-1">{t('leaves.days', { count: leave.days })}</p>
                  {leave.status === 'pending' && (
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded"
                        onClick={() => approveMutation.mutate(leave.id)}
                        disabled={approveMutation.isLoading}
                      >
                        {t('common.approve') || 'Duyệt'}
                      </button>
                      <button
                        className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
                        onClick={() => setRejecting({ id: leave.id, reason: '' })}
                      >
                        {t('common.reject') || 'Từ chối'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {allLeaves?.length === 0 && (
              <p className="text-gray-500 text-center py-4">{t('leaves.noRequests')}</p>
            )}
          </div>
        </div>
        )}
      </div>

      {showRequestForm && (
        <LeaveRequestForm
          onSubmit={handleRequestLeave}
          onCancel={() => setShowRequestForm(false)}
          isLoading={requestLeaveMutation.isLoading}
        />
      )}

      {/* Reject modal */}
      {rejecting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('common.reject') || 'Từ chối yêu cầu'}</h3>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('leaves.reason')}</label>
            <textarea
              className="input w-full mb-4"
              rows={3}
              value={rejecting.reason}
              onChange={(e)=>setRejecting({ ...rejecting, reason: e.target.value })}
              placeholder={t('leaves.reason')}
            />
            <div className="flex justify-end gap-2">
              <button className="btn btn-secondary" onClick={()=>setRejecting(null)}>{t('leaves.cancel')}</button>
              <button className="btn btn-primary" disabled={rejectMutation.isLoading} onClick={()=>rejectMutation.mutate({ id: rejecting.id, reason: rejecting.reason })}>
                {rejectMutation.isLoading ? 'Đang gửi...' : (t('common.reject') || 'Từ chối')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const LeaveRequestForm = ({ onSubmit, onCancel, isLoading }: any) => {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    type: 'annual',
    startDate: '',
    endDate: '',
    reason: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('leaves.requestLeave')}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('leaves.type')}</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="input"
              required
            >
              <option value="annual">{t('leaves.typeAnnual')}</option>
              <option value="sick">{t('leaves.typeSick')}</option>
              <option value="maternity">{t('leaves.typeMaternity')}</option>
              <option value="unpaid">{t('leaves.typeUnpaid')}</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('leaves.startDate')}</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="input"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('leaves.endDate')}</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="input"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('leaves.reason')}</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="input"
              rows={3}
              placeholder="Enter reason for leave"
            />
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary flex-1"
            >
              {t('leaves.cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary flex-1"
            >
              {isLoading ? t('leaves.submitting') : t('leaves.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Leaves
