import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import { UserProfileProvider } from './context/UserProfileContext'
import { AppRouter } from './router/AppRouter'
import { ToastContainer } from './components/organisms/Toast'

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <UserProfileProvider>
          <AppRouter />
          <ToastContainer />
        </UserProfileProvider>
      </NotificationProvider>
    </AuthProvider>
  )
}
