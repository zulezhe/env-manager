import React, { useState, useEffect } from 'react'
import { listen } from '@tauri-apps/api/event'
import EnvironmentList from './components/EnvironmentList/EnvironmentList'
import Settings from './components/Settings/Settings'
import { ToastProvider } from './components/ui/toast'
import { Button } from './components/ui/button'
import { Settings as SettingsIcon, Home } from 'lucide-react'
import { ThemeProvider } from './contexts/ThemeContext'

type Page = 'home' | 'settings'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home')

  // 监听来自托盘的导航事件
  useEffect(() => {
    // 监听来自Tauri的导航事件
    if (typeof window !== 'undefined' && window.__TAURI__ && window.__TAURI__.event) {
      const unlisten = window.__TAURI__.event.listen('navigate-to-settings', () => {
        setCurrentPage('settings');
      });
      
      return () => {
        unlisten.then(fn => fn());
      };
    }
  }, [])

  const renderPage = () => {
    switch (currentPage) {
      case 'settings':
        return <Settings />
      case 'home':
      default:
        return <EnvironmentList />
    }
  }

  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="min-h-screen bg-background">
          {/* 顶部导航 */}
          <nav className="bg-card shadow-sm border-b px-6 py-3">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-foreground">环境变量管理器</h1>
              <div className="flex space-x-2">
                <Button
                  variant={currentPage === 'home' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage('home')}
                  className="flex items-center space-x-2"
                >
                  <Home size={16} />
                  <span>主页</span>
                </Button>
                <Button
                  variant={currentPage === 'settings' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage('settings')}
                  className="flex items-center space-x-2"
                >
                  <SettingsIcon size={16} />
                  <span>设置</span>
                </Button>
              </div>
            </div>
          </nav>

          {/* 主要内容区域 */}
          <main className="p-6">
            {renderPage()}
          </main>
        </div>
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App