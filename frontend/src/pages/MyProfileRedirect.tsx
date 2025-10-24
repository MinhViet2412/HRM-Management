import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const MyProfileRedirect = () => {
  const { user } = useAuth()
  const id = user?.employee?.id
  if (!id) return <></>
  return <Navigate to={`/employees/${id}`} replace />
}

export default MyProfileRedirect





