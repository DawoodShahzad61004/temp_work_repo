import { useEffect, useState } from 'react'
import Dashboard from './components/Dashboard.jsx'
import SetupForm from './components/SetupForm.jsx'
import { appendTransaction, loadBudget, saveBudget } from './lib/storage.js'

function App() {
  const [setup, setSetup] = useState(null)
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    const budget = loadBudget()
    if (!budget) return

    if (budget.setup) setSetup(budget.setup)
    if (Array.isArray(budget.transactions)) setTransactions(budget.transactions)
  }, [])

  const handleSetupSubmit = (nextSetup) => {
    saveBudget({ setup: nextSetup, transactions })
    setSetup(nextSetup)
  }

  const handleTransactionSubmit = (transaction) => {
    const budget = appendTransaction(transaction)
    setTransactions(budget.transactions)
    if (budget.setup) setSetup(budget.setup)
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold">PKR Budget Tracker</h1>
        {setup === null ? (
          <SetupForm onSubmit={handleSetupSubmit} />
        ) : (
          <Dashboard
            setup={setup}
            transactions={transactions}
            onTransactionSubmit={handleTransactionSubmit}
          />
        )}
      </div>
    </main>
  )
}

export default App
