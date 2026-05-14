'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  DollarSign,
  Home,
  Zap,
  Users,
  Package,
  Megaphone,
  MoreHorizontal,
  TrendingDown,
  TrendingUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useStore } from '@/lib/store'
import type { Expense } from '@/lib/types'

const categoryIcons: Record<string, React.ElementType> = {
  alquiler: Home,
  servicios: Zap,
  sueldos: Users,
  insumos: Package,
  marketing: Megaphone,
  otros: MoreHorizontal,
}

const categoryColors: Record<string, string> = {
  alquiler: 'var(--rainbow-purple)',
  servicios: 'var(--rainbow-yellow)',
  sueldos: 'var(--rainbow-green)',
  insumos: 'var(--rainbow-cyan)',
  marketing: 'var(--rainbow-pink)',
  otros: 'var(--rainbow-gray)',
}

export function ExpensesView() {
  const { expenses, addExpense, updateExpense, deleteExpense } = useStore()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value)
  }

  const monthlyExpenses = useMemo(() => {
    return expenses
      .filter(e => e.isActive && e.frequency === 'monthly')
      .reduce((acc, e) => acc + e.amount, 0)
  }, [expenses])

  const yearlyExpenses = useMemo(() => {
    return expenses.reduce((acc, e) => {
      if (e.frequency === 'yearly') return acc + (e.amount / 12)
      return acc + e.amount
    }, 0)
  }, [expenses])

  const expensesByCategory = useMemo(() => {
    const grouped: Record<string, number> = {}
    expenses.filter(e => e.isActive).forEach(e => {
      const monthlyAmount = e.frequency === 'yearly' ? e.amount / 12 : e.amount
      grouped[e.category] = (grouped[e.category] || 0) + monthlyAmount
    })
    return Object.entries(grouped).map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / monthlyExpenses) * 100
    }))
  }, [expenses, monthlyExpenses])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gastos Fijos</h1>
          <p className="text-muted-foreground">Gestiona tus gastos operativos mensuales</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Agregar Gasto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <ExpenseForm 
              onClose={() => setIsAddDialogOpen(false)} 
              expense={null}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-[var(--rainbow-purple)]/10 to-[var(--rainbow-purple)]/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gastos Mensuales</p>
                <p className="text-2xl font-bold">{formatCurrency(monthlyExpenses)}</p>
              </div>
              <div className="rounded-full bg-[var(--rainbow-purple)]/20 p-3">
                <DollarSign className="h-6 w-6 text-[var(--rainbow-purple)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[var(--rainbow-cyan)]/10 to-[var(--rainbow-cyan)]/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gasto Promedio Diario</p>
                <p className="text-2xl font-bold">{formatCurrency(monthlyExpenses / 30)}</p>
              </div>
              <div className="rounded-full bg-[var(--rainbow-cyan)]/20 p-3">
                <TrendingDown className="h-6 w-6 text-[var(--rainbow-cyan)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[var(--rainbow-green)]/10 to-[var(--rainbow-green)]/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gasto Anual Estimado</p>
                <p className="text-2xl font-bold">{formatCurrency(yearlyExpenses * 12)}</p>
              </div>
              <div className="rounded-full bg-[var(--rainbow-green)]/20 p-3">
                <TrendingUp className="h-6 w-6 text-[var(--rainbow-green)]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Desglose por Categoría</CardTitle>
          <CardDescription>Distribución de gastos mensuales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {expensesByCategory.map(({ category, amount, percentage }) => {
              const Icon = categoryIcons[category] || MoreHorizontal
              const color = categoryColors[category] || 'var(--rainbow-gray)'
              
              return (
                <div key={category} className="flex items-center gap-4">
                  <div 
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${color}20` }}
                  >
                    <Icon className="h-5 w-5" style={{ color }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="capitalize text-sm font-medium">{category}</span>
                      <span className="text-sm">{formatCurrency(amount)}/mes</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-secondary">
                      <div 
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Gastos</CardTitle>
          <CardDescription>Gastos fijos registrados</CardDescription>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <DollarSign className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">Sin gastos registrados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense) => {
                const Icon = categoryIcons[expense.category] || MoreHorizontal
                const color = categoryColors[expense.category] || 'var(--rainbow-gray)'
                const monthlyAmount = expense.frequency === 'yearly' ? expense.amount / 12 : expense.amount
                
                return (
                  <div 
                    key={expense.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div 
                        className="flex h-10 w-10 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${color}20` }}
                      >
                        <Icon className="h-5 w-5" style={{ color }} />
                      </div>
                      <div>
                        <p className="font-medium">{expense.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {expense.category} • {expense.frequency === 'monthly' ? 'Mensual' : 'Anual'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(expense.amount)}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(monthlyAmount)}/mes
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setEditingExpense(expense)}
                            >
                              <Plus className="h-4 w-4 rotate-45" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <ExpenseForm 
                              onClose={() => setEditingExpense(null)} 
                              expense={expense}
                            />
                          </DialogContent>
                        </Dialog>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteExpense(expense.id)}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface ExpenseFormProps {
  onClose: () => void
  expense: Expense | null
}

function ExpenseForm({ onClose, expense }: ExpenseFormProps) {
  const { addExpense, updateExpense } = useStore()
  const [form, setForm] = useState({
    name: expense?.name || '',
    amount: expense?.amount || 0,
    frequency: expense?.frequency || 'monthly' as 'monthly' | 'weekly' | 'yearly',
    category: expense?.category || 'otros' as 'alquiler' | 'servicios' | 'sueldos' | 'insumos' | 'marketing' | 'otros',
    isActive: expense?.isActive ?? true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (expense) {
      updateExpense(expense.id, form)
    } else {
      addExpense(form)
    }
    onClose()
  }

  const categories = [
    { value: 'alquiler', label: 'Alquiler' },
    { value: 'servicios', label: 'Servicios (luz, agua, gas)' },
    { value: 'sueldos', label: 'Sueldos' },
    { value: 'insumos', label: 'Insumos' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'otros', label: 'Otros' },
  ]

  const frequencies = [
    { value: 'monthly', label: 'Mensual' },
    { value: 'yearly', label: 'Anual' },
  ]

  return (
    <>
      <DialogHeader>
        <DialogTitle>{expense ? 'Editar Gasto' : 'Agregar Gasto'}</DialogTitle>
        <DialogDescription>
          {expense ? 'Modifica los datos del gasto' : 'Registra un nuevo gasto fijo'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Nombre del gasto</Label>
          <Input
            required
            placeholder="Ej: Alquiler local"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Monto</Label>
          <Input
            type="number"
            required
            placeholder="Ej: 250000"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Categoría</Label>
            <select
              className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as any })}
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Frecuencia</Label>
            <select
              className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm"
              value={form.frequency}
              onChange={(e) => setForm({ ...form, frequency: e.target.value as any })}
            >
              {frequencies.map((freq) => (
                <option key={freq.value} value={freq.value}>{freq.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            {expense ? 'Guardar Cambios' : 'Agregar Gasto'}
          </Button>
        </div>
      </form>
    </>
  )
}