import { useEffect, useState } from 'react'
import { XCircle } from 'lucide-react'
import { fetchRoles, updateUserRole, RoleName } from '../services/users'
import toast from 'react-hot-toast'

type Props = {
  userId: string
  currentRole?: RoleName
  onClose: () => void
  onSuccess?: () => void
}

export default function SetUserRoleModal({ userId, currentRole, onClose, onSuccess }: Props) {
  const [roles, setRoles] = useState<Array<{ id: string; name: RoleName }>>([])
  const [selected, setSelected] = useState<RoleName | ''>(currentRole || 'employee')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchRoles()
      .then((rs) => {
        // Only keep 3 roles for selection and sort by importance
        const allowed: RoleName[] = ['admin', 'manager', 'employee']
        setRoles(rs.filter((r) => allowed.includes(r.name)).sort((a, b) => allowed.indexOf(a.name) - allowed.indexOf(b.name)))
      })
      .catch(() => toast.error('Không tải được danh sách quyền'))
  }, [])

  const handleSave = async () => {
    if (!selected) {
      toast.error('Vui lòng chọn quyền')
      return
    }
    try {
      setLoading(true)
      await updateUserRole(userId, { roleName: selected })
      toast.success('Cập nhật quyền thành công')
      onClose()
      onSuccess?.()
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Cập nhật quyền thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-lg font-semibold">Thiết lập quyền</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quyền</label>
            <select
              className="input w-full"
              value={selected}
              onChange={(e) => setSelected(e.target.value as RoleName)}
            >
              <option value="">Chọn quyền</option>
              {roles.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name === 'admin' ? 'Quyền admin' : r.name === 'manager' ? 'Quyền quản lý' : 'Quyền nhân viên'}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="px-5 py-4 border-t bg-gray-50 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 border rounded-md">Hủy</button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  )
}


