export const ACCOUNT_TYPES = Object.freeze({ CASH: 'cash', BANK: 'bank' })
export const TRANSACTION_TYPES = Object.freeze({ EXPENSE: 'expense', INCOME: 'income' })

export function parsePkrAmount(value) {
  if (typeof value === 'number') return Number.isFinite(value) && value >= 0 ? value : null
  if (typeof value !== 'string' || value.trim() === '') return null
  const amount = Number(value)
  return Number.isFinite(amount) && amount >= 0 ? amount : null
}

export function isValidPkrAmount(value) {
  return parsePkrAmount(value) !== null
}

export function totalLoans(loans = []) {
  return loans.reduce((sum, loan) => sum + (parsePkrAmount(loan?.amount) ?? 0), 0)
}

export const calculateTotalLoans = totalLoans

export function effectiveBalances(setup = {}, transactions = []) {
  const balances = {
    cash: parsePkrAmount(setup.cash) ?? 0,
    bank: parsePkrAmount(setup.bank ?? setup.online) ?? 0,
  }
  for (const loan of setup.loans ?? []) {
    const account = loan?.source === ACCOUNT_TYPES.BANK ? 'bank' : 'cash'
    balances[account] -= parsePkrAmount(loan?.amount) ?? 0
  }
  for (const tx of transactions) {
    const account = tx?.source === ACCOUNT_TYPES.BANK ? 'bank' : 'cash'
    const amount = parsePkrAmount(tx?.amount) ?? 0
    balances[account] += tx?.type === TRANSACTION_TYPES.INCOME || tx?.type === 'earned' ? amount : -amount
  }
  return balances
}

export const calculateEffectiveBalances = effectiveBalances

export function generateTransactionTimestamp(date = new Date()) {
  return (date instanceof Date ? date : new Date(date)).toISOString()
}

export function createTransaction({ type, amount, source, reason = '', timestamp } = {}) {
  const parsed = parsePkrAmount(amount)
  if (parsed === null) throw new Error('Amount must be a non-negative PKR number')
  if (![TRANSACTION_TYPES.EXPENSE, TRANSACTION_TYPES.INCOME].includes(type)) throw new Error('Invalid transaction type')
  if (![ACCOUNT_TYPES.CASH, ACCOUNT_TYPES.BANK].includes(source)) throw new Error('Invalid account source')
  const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
  return { id, type, amount: parsed, source, reason: String(reason), timestamp: timestamp || generateTransactionTimestamp() }
}
