import { useEffect, useMemo, useState } from 'react'
import {
  ACCOUNT_TYPES,
  TRANSACTION_TYPES,
  createTransaction,
  effectiveBalances,
  generateTransactionTimestamp,
  parsePkrAmount,
} from '../lib/budget.js'

const money = (value) => `PKR ${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
const localDateTime = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Unknown date' : date.toLocaleString()
}

function TransactionModal({ type, onClose, onSubmit }) {
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [source, setSource] = useState('')
  const [timestamp] = useState(() => generateTransactionTimestamp())
  const [error, setError] = useState('')
  const label = type === TRANSACTION_TYPES.INCOME ? 'Money Earned' : 'Money Used'

  useEffect(() => {
    const handleKeyDown = (event) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const submit = (event) => {
    event.preventDefault()
    if (parsePkrAmount(amount) === null) return setError('Enter a non-negative amount.')
    if (!source) return setError('Choose cash or bank as the source.')
    try {
      onSubmit(createTransaction({ type, amount, reason, source, timestamp }))
      onClose()
    } catch (submissionError) {
      setError(submissionError.message || 'Unable to add transaction.')
    }
  }

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-slate-900/50 p-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="transaction-title">
        <h2 id="transaction-title" className="text-xl font-semibold">Add {label}</h2>
        <form className="mt-4 space-y-4" onSubmit={submit}>
          <label className="block text-sm font-medium">Amount (PKR)
            <input className="mt-1 w-full rounded border border-slate-300 p-2" type="number" min="0" step="any" value={amount} onChange={(event) => setAmount(event.target.value)} required aria-invalid={Boolean(error && parsePkrAmount(amount) === null)} />
          </label>
          <label className="block text-sm font-medium">Reason <span className="font-normal text-slate-500">(optional)</span>
            <input className="mt-1 w-full rounded border border-slate-300 p-2" type="text" value={reason} onChange={(event) => setReason(event.target.value)} />
          </label>
          <fieldset>
            <legend className="text-sm font-medium">Source</legend>
            <div className="mt-2 flex gap-4">
              {Object.entries({ Cash: ACCOUNT_TYPES.CASH, Bank: ACCOUNT_TYPES.BANK }).map(([name, value]) => (
                <label key={value} className="flex items-center gap-2"><input type="radio" name="transaction-source" value={value} checked={source === value} onChange={(event) => setSource(event.target.value)} />{name}</label>
              ))}
            </div>
          </fieldset>
          <p className="text-sm text-slate-600">Date and time: <time dateTime={timestamp}>{localDateTime(timestamp)}</time></p>
          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" className="rounded border border-slate-300 px-4 py-2" onClick={onClose}>Cancel</button>
            <button type="submit" className="rounded bg-slate-900 px-4 py-2 text-white">Add {label}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Dashboard({ setup = {}, transactions = [], onTransactionSubmit, onAddTransaction }) {
  const [modalType, setModalType] = useState(null)
  const balances = useMemo(() => effectiveBalances(setup, transactions), [setup, transactions])
  const submitTransaction = onTransactionSubmit || onAddTransaction || (() => {})
  const history = [...transactions].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  const loans = Array.isArray(setup.loans) ? setup.loans : []

  return (
    <section className="mt-8 space-y-6" aria-label="Budget dashboard">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-white p-5 shadow"><p className="text-sm text-slate-600">Cash balance</p><p className="text-2xl font-bold">{money(balances.cash)}</p></div>
        <div className="rounded-lg bg-white p-5 shadow"><p className="text-sm text-slate-600">Bank balance</p><p className="text-2xl font-bold">{money(balances.bank)}</p></div>
      </div>
      <div className="rounded-lg bg-white p-5 shadow">
        <h2 className="text-lg font-semibold">Setup and loans</h2>
        <p className="mt-2 text-sm text-slate-600">Starting cash: {money(setup.cash)} · Starting bank: {money(setup.bank ?? setup.online)}</p>
        <p className="text-sm text-slate-600">Loans: {money(loans.reduce((sum, loan) => sum + (parsePkrAmount(loan.amount) ?? 0), 0))}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button className="rounded bg-slate-900 px-4 py-2 text-white" onClick={() => setModalType(TRANSACTION_TYPES.EXPENSE)}>Add Money Used</button>
        <button className="rounded bg-emerald-700 px-4 py-2 text-white" onClick={() => setModalType(TRANSACTION_TYPES.INCOME)}>Add Money Earned</button>
      </div>
      <div className="rounded-lg bg-white p-5 shadow">
        <h2 className="text-lg font-semibold">Transaction history</h2>
        {history.length === 0 ? <p className="mt-3 text-slate-600">No transactions yet.</p> : <ul className="mt-3 divide-y divide-slate-200">{history.map((transaction) => <li key={transaction.id || `${transaction.timestamp}-${transaction.amount}`} className="py-3"><div className="flex flex-wrap items-baseline justify-between gap-2"><span className="font-medium">{money(transaction.amount)} · {transaction.type === TRANSACTION_TYPES.INCOME || transaction.type === 'earned' ? 'Earned' : 'Used'}</span><time className="text-sm text-slate-500" dateTime={transaction.timestamp}>{localDateTime(transaction.timestamp)}</time></div><p className="text-sm text-slate-600">{transaction.source === ACCOUNT_TYPES.BANK ? 'Bank' : 'Cash'}{transaction.reason ? ` · ${transaction.reason}` : ''}</p></li>)}</ul>}
      </div>
      {modalType && <TransactionModal type={modalType} onClose={() => setModalType(null)} onSubmit={submitTransaction} />}
    </section>
  )
}

