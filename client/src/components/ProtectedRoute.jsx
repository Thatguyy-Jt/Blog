import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Spinner from './Spinner.jsx'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <div className="flex justify-center pt-20"><Spinner /></div>
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  return children
}


