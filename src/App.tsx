import React from 'react'
import Header from './components/Header/Header'
import EnvironmentList from './components/EnvironmentList/EnvironmentList'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <main className="flex-1 p-6">
        <EnvironmentList />
      </main>
    </div>
  )
}

export default App