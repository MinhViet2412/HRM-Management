import { ReactNode } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { SidebarProvider } from '../contexts/SidebarContext'

interface LayoutProps {
  children: ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex min-h-[calc(100vh-64px)]">
          <Sidebar />
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default Layout
