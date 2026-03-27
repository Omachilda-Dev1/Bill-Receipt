import { useAuthContext } from '../context/AuthContext'

export const useAuth = () => {
  const { user } = useAuthContext()
  return { user, loading: user === undefined }
}
