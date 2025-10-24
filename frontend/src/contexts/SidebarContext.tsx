import { createContext, useContext, useState, ReactNode } from 'react'

interface SidebarContextType {
  isCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

interface SidebarProviderProps {
  children: ReactNode
}

export const SidebarProvider = ({ children }: SidebarProviderProps) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('sidebarCollapsed')
    return saved === 'true'
  })

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev
      localStorage.setItem('sidebarCollapsed', String(next))
      return next
    })
  }

  const setSidebarCollapsed = (collapsed: boolean) => {
    localStorage.setItem('sidebarCollapsed', String(collapsed))
    setIsCollapsed(collapsed)
  }

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar, setSidebarCollapsed }}>
      {children}
    </SidebarContext.Provider>
  )
}

export const useSidebar = () => {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}
