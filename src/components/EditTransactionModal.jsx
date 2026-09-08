import { useEffect, useState } from 'react'
import { ACCOUNT_TYPES, parsePkrAmount } from '../lib/budget.js'

export default function EditTransactionModal({ transaction, onClose, onSubmit }) {
  const [amount, setAmount] = useState(String(transaction.amount ?? ''))
  const [reason, setReason] = useState(transaction.reason ?? '')
  const [source, setSource] = useState(transaction.source ?? '')
  const [timestamp, setTimestamp] = useState(() => {
    const date = new Date(transaction.timestamp)
    return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 16)
  })
  const [error, setError] = useState('')

  useEffect(() => {
    const escape = (event) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', escape)
    return () => document.removeEventListener('keydown', escape)
  }, [onClose])

  const submit = (event) => {
    event.preventDefault()
    const parsed = parsePkrAmount(amount)
    if (parsed === null) return setError('Enter a non-negative amount.')
    if (!source) return setError('Choose cash or bank as the source.')
    if (!timestamp || Number.isNaN(new Date(timestamp).getTime())) return setError('Enter a valid date and time.')
    try {
      onSubmit({ ...transaction, amount: parsed, reason: String(reason), source, timestamp: new Date(timestamp).toISOString() })
      onClose()
    } catch (submissionError) { setError(submissionError.message || 'Unable to update transaction.') }
  }

  return <div className="fixed inset-0 z-10 flex items-center justify-center bg-slate-900/50 p-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="edit-transaction-title">
      <h2 id="edit-transaction-title" className="text-xl font-semibold">Edit transaction</h2>
      <form className="mt-4 space-y-4" onSubmit={submit}>
        <label className="block text-sm font-medium">Amount (PKR)<input className="mt-1 w-full rounded border border-slate-300 p-2" type="number" min="0" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} required /></label>
        <label className="block text-sm font-medium">Reason<input className="mt-1 w-full rounded border border-slate-300 p-2" type="text" value={reason} onChange={(e) => setReason(e.target.value)} /></label>
        <fieldset><legend className="text-sm font-medium">Source</legend><div className="mt-2 flex gap-4">{Object.entries({ Cash: ACCOUNT_TYPES.CASH, Bank: ACCOUNT_TYPES.BANK }).map(([name, value]) => <label key={value} className="flex items-center gap-2"><input type="radio" name="edit-transaction-source" value={value} checked={source === value} onChange={(e) => setSource(e.target.value)} />{name}</label>)}</div></fieldset>
        <label className="block text-sm font-medium">Date and time<input className="mt-1 w-full rounded border border-slate-300 p-2" type="datetime-local" value={timestamp} onChange={(e) => setTimestamp(e.target.value)} required /></label>
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        <div className="flex justify-end gap-2"><button type="button" className="rounded border border-slate-300 px-4 py-2" onClick={onClose}>Cancel</button><button type="submit" className="rounded bg-slate-900 px-4 py-2 text-white">Save changes</button></div>
      </form>
    </div>
  </div>
}
