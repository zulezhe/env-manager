import React from 'react'
import EnvironmentList from './components/EnvironmentList/EnvironmentList'
import { ToastProvider } from './components/ui/toast'

function App() {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-100">
        <main className="p-6">
          <EnvironmentList />
        </main>
      </div>
    </ToastProvider>
  )
}

export default App