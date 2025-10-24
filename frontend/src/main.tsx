import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import App from './App.tsx'
import './index.css'
import './i18n'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
          <Toaster position="top-right" />
          <EventBridge />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)

function EventBridge() {
  React.useEffect(() => {
    const handler = (e: any) => {
      const detail = e.detail || {}
      const message = detail.message || 'Error'
      if (detail.type === 'error') {
        // eslint-disable-next-line no-undef
        import('react-hot-toast').then(({ default: toast }) => toast.error(message))
      } else {
        import('react-hot-toast').then(({ default: toast }) => toast(message))
      }
    }
    window.addEventListener('toast', handler as any)
    return () => window.removeEventListener('toast', handler as any)
  }, [])
  return null
}
