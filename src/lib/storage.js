import { isValidPkrAmount, parsePkrAmount } from './budget.js'

export const STORAGE_KEY = 'pkr-budget-tracker:v1'

const emptyBudget = () => ({ setup: null, transactions: [] })

export function loadBudget(storage = globalThis.localStorage) {
  if (!storage) return null
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return null
    const value = JSON.parse(raw)
    if (!value || typeof value !== 'object') return null
    const setup = value.setup && typeof value.setup === 'object' ? value.setup : null
    const transactions = Array.isArray(value.transactions) ? value.transactions : []
    if (setup) {
      setup.cash = parsePkrAmount(setup.cash) ?? 0
      setup.bank = parsePkrAmount(setup.bank ?? setup.online) ?? 0
      setup.loans = Array.isArray(setup.loans) ? setup.loans.filter((l) => l && isValidPkrAmount(l.amount)) : []
    }
    return { setup, transactions }
  } catch {
    return null
  }
}

export function saveBudget(budget, storage = globalThis.localStorage) {
  if (!storage) return false
  const payload = { setup: budget?.setup ?? null, transactions: Array.isArray(budget?.transactions) ? budget.transactions : [] }
  storage.setItem(STORAGE_KEY, JSON.stringify(payload))
  return true
}

export function appendTransaction(transaction, storage = globalThis.localStorage) {
  const budget = loadBudget(storage) ?? emptyBudget()
  budget.transactions = [...budget.transactions, transaction]
  saveBudget(budget, storage)
  return budget
}
