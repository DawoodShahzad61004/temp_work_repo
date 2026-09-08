import { useState } from 'react'
import { loadBudget } from './lib/storage.js'

function App() {
  const [budget] = useState(() => loadBudget())

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold">PKR Budget Tracker</h1>
        <p className="mt-2 text-slate-600">
          {budget ? 'Your budget dashboard is ready.' : 'Set up your cash, bank balance, and loans to get started.'}
        </p>
      </div>
    </main>
  )
}

export default App
