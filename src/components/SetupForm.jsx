import { useMemo, useState } from 'react'
import { ACCOUNT_TYPES, parsePkrAmount, totalLoans } from '../lib/budget.js'

const inputClass = 'mt-1 w-full rounded border border-slate-300 p-2'

export default function SetupForm({ onSubmit }) {
  const [cash, setCash] = useState('')
  const [bank, setBank] = useState('')
  const [loans, setLoans] = useState([])
  const [errors, setErrors] = useState({})

  const loanTotal = useMemo(() => totalLoans(loans), [loans])

  const addLoan = () => {
    setLoans((current) => [...current, { id: `${Date.now()}-${Math.random()}`, name: '', amount: '', source: '' }])
    setErrors((current) => ({ ...current, loans: '' }))
  }

  const updateLoan = (id, field, value) => {
    setLoans((current) => current.map((loan) => (loan.id === id ? { ...loan, [field]: value } : loan)))
    setErrors((current) => ({ ...current, [id]: { ...current[id], [field]: '' } }))
  }

  const removeLoan = (id) => {
    setLoans((current) => current.filter((loan) => loan.id !== id))
    setErrors((current) => {
      const next = { ...current }
      delete next[id]
      return next
    })
  }

  const submit = (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (parsePkrAmount(cash) === null) nextErrors.cash = 'Enter a non-negative cash amount.'
    if (parsePkrAmount(bank) === null) nextErrors.bank = 'Enter a non-negative bank amount.'

    loans.forEach((loan) => {
      const loanErrors = {}
      if (!loan.name.trim()) loanErrors.name = 'Loan name is required.'
      if (parsePkrAmount(loan.amount) === null) loanErrors.amount = 'Enter a non-negative amount.'
      if (![ACCOUNT_TYPES.CASH, ACCOUNT_TYPES.BANK].includes(loan.source)) loanErrors.source = 'Choose cash or bank.'
      if (Object.keys(loanErrors).length) nextErrors[loan.id] = loanErrors
    })

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    const setup = {
      cash: parsePkrAmount(cash),
      bank: parsePkrAmount(bank),
      loans: loans.map(({ name, amount, source }) => ({ name: name.trim(), amount: parsePkrAmount(amount), source })),
    }
    onSubmit?.(setup)
  }

  return (
    <section className="mt-8 rounded-lg bg-white p-6 shadow" aria-label="Initial budget setup">
      <h2 className="text-xl font-semibold">Set up your budget</h2>
      <form className="mt-5 space-y-6" onSubmit={submit} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">Initial cash (PKR)
            <input className={inputClass} type="number" min="0" step="any" value={cash} onChange={(event) => setCash(event.target.value)} aria-invalid={Boolean(errors.cash)} aria-describedby={errors.cash ? 'cash-error' : undefined} required />
            {errors.cash && <span id="cash-error" className="mt-1 block text-sm text-red-600" role="alert">{errors.cash}</span>}
          </label>
          <label className="block text-sm font-medium">Initial bank (PKR)
            <input className={inputClass} type="number" min="0" step="any" value={bank} onChange={(event) => setBank(event.target.value)} aria-invalid={Boolean(errors.bank)} aria-describedby={errors.bank ? 'bank-error' : undefined} required />
            {errors.bank && <span id="bank-error" className="mt-1 block text-sm text-red-600" role="alert">{errors.bank}</span>}
          </label>
        </div>

        <div>
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">Loans and credits</h3>
            <button type="button" className="rounded border border-slate-300 px-3 py-2 text-sm" onClick={addLoan}>Add Loan</button>
          </div>
          {errors.loans && <p className="mt-2 text-sm text-red-600" role="alert">{errors.loans}</p>}
          {loans.length === 0 ? <p className="mt-3 text-sm text-slate-600">No loans added.</p> : <div className="mt-3 space-y-4">
            {loans.map((loan, index) => {
              const loanError = errors[loan.id] || {}
              return <div key={loan.id} className="rounded border border-slate-200 p-4">
                <div className="flex items-center justify-between"><h4 className="font-medium">Loan {index + 1}</h4><button type="button" className="text-sm text-red-600" onClick={() => removeLoan(loan.id)}>Remove</button></div>
                <label className="mt-3 block text-sm font-medium">Name
                  <input className={inputClass} type="text" value={loan.name} onChange={(event) => updateLoan(loan.id, 'name', event.target.value)} aria-invalid={Boolean(loanError.name)} required />
                  {loanError.name && <span className="mt-1 block text-sm text-red-600" role="alert">{loanError.name}</span>}
                </label>
                <label className="mt-3 block text-sm font-medium">Amount (PKR)
                  <input className={inputClass} type="number" min="0" step="any" value={loan.amount} onChange={(event) => updateLoan(loan.id, 'amount', event.target.value)} aria-invalid={Boolean(loanError.amount)} required />
                  {loanError.amount && <span className="mt-1 block text-sm text-red-600" role="alert">{loanError.amount}</span>}
                </label>
                <fieldset className="mt-3"><legend className="text-sm font-medium">Source</legend><div className="mt-2 flex gap-4">
                  {[["Cash", ACCOUNT_TYPES.CASH], ["Bank", ACCOUNT_TYPES.BANK]].map(([label, value]) => <label key={value} className="flex items-center gap-2 text-sm"><input type="radio" name={`loan-source-${loan.id}`} value={value} checked={loan.source === value} onChange={() => updateLoan(loan.id, 'source', value)} />{label}</label>)}
                </div>{loanError.source && <p className="mt-1 text-sm text-red-600" role="alert">{loanError.source}</p>}</fieldset>
              </div>
            })}
          </div>}
          <p className="mt-3 text-sm font-medium">Total loans: PKR {loanTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
        </div>
        <button type="submit" className="rounded bg-slate-900 px-4 py-2 text-white">Save Setup</button>
      </form>
    </section>
  )
}
