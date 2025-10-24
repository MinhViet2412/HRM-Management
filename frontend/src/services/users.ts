import api from './api'

export type RoleName = 'admin' | 'hr' | 'manager' | 'employee'

export interface UserBrief {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role?: { id: string; name: RoleName }
}

export async function fetchRoles() {
  const res = await api.get(`/users/roles/list`)
  return res.data as Array<{ id: string; name: RoleName; description?: string }>
}

export async function updateUserRole(userId: string, payload: { roleName?: RoleName; roleId?: string }) {
  const res = await api.patch(`/users/${userId}/role`, payload)
  return res.data
}

export async function fetchUsers() {
  // Prefer HR profile source to ensure all accounts appear
  try {
    const res = await api.get(`/employees`)
    const arr = (res.data || []) as any[]
    return arr
      .map((e) => ({ id: e.user?.id, email: e.user?.email, firstName: e.firstName, lastName: e.lastName, role: e.user?.role }))
      .filter((u) => !!u.id) as UserBrief[]
  } catch {
    const res = await api.get(`/users`)
    return res.data as UserBrief[]
  }
}


