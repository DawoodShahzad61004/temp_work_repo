import { useEffect, useState } from 'react'
import Dashboard from './components/Dashboard.jsx'
import SetupForm from './components/SetupForm.jsx'
import { appendTransaction, loadBudget, saveBudget } from './lib/storage.js'

function App() {
  const [setup, setSetup] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  useEffect(() => {
    const budget = loadBudget()
    if (!budget) return

    if (budget.setup) setSetup(budget.setup)
    if (Array.isArray(budget.transactions)) setTransactions(budget.transactions)
    if (budget.dateRange) setDateRange(budget.dateRange)
  }, [])

  const handleSetupSubmit = (nextSetup) => {
    saveBudget({ setup: nextSetup, transactions, dateRange })
    setSetup(nextSetup)
  }

  const handleTransactionSubmit = (transaction) => {
    const budget = appendTransaction(transaction)
    setTransactions(budget.transactions)
    if (budget.setup) setSetup(budget.setup)
  }

  const handleTransactionUpdate = (updated) => {
    const next = transactions.map((item) => item.id === updated.id ? updated : item)
    saveBudget({ setup, transactions: next, dateRange })
    setTransactions(next)
  }

  const handleTransactionDelete = (id) => {
    const next = transactions.filter((item) => item.id !== id)
    saveBudget({ setup, transactions: next, dateRange })
    setTransactions(next)
  }

  const handleDateRangeChange = (nextRange) => {
    setDateRange(nextRange)
    saveBudget({ setup, transactions, dateRange: nextRange })
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
            onTransactionUpdate={handleTransactionUpdate}
            onTransactionDelete={handleTransactionDelete}
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
          />
        )}
      </div>
    </main>
  )
}

export default App
