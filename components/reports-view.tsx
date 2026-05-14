'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Download, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Package,
  ShoppingCart,
  Calculator,
  FileSpreadsheet
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/lib/store'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from 'recharts'

const COLORS = ['#8b5cf6', '#06b6d4', '#22c55e', '#f59e0b', '#ec4899', '#6366f1']

export function ReportsView() {
  const { products, sales, expenses, customers } = useStore()
  const [exportFormat, setExportFormat] = useState<'excel' | 'csv'>('excel')

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value)
  }

  const reportData = useMemo(() => {
    const totalSales = sales.reduce((acc, s) => acc + s.total, 0)
    const totalCost = sales.reduce((acc, sale) => {
      return acc + sale.items.reduce((itemAcc, item) => {
        const product = products.find(p => p.id === item.productId)
        return itemAcc + (product ? product.costPrice * item.quantity : 0)
      }, 0)
    }, 0)
    
    const monthlyExpenses = expenses
      .filter(e => e.isActive && e.frequency === 'monthly')
      .reduce((acc, e) => acc + e.amount, 0)
    
    const grossProfit = totalSales - totalCost
    const grossMargin = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0
    
    const netProfit = grossProfit - monthlyExpenses
    const netMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0

    return {
      totalSales,
      totalCost,
      grossProfit,
      grossMargin,
      monthlyExpenses,
      netProfit,
      netMargin,
      totalProducts: products.length,
      totalCustomers: customers.length,
      totalSalesCount: sales.length,
      averageTicket: sales.length > 0 ? totalSales / sales.length : 0,
    }
  }, [sales, products, expenses, customers])

  const salesByPaymentMethod = useMemo(() => {
    const methods = { cash: 0, card: 0, transfer: 0 }
    sales.forEach(s => {
      methods[s.paymentMethod] += s.total
    })
    return [
      { name: 'Efectivo', value: methods.cash, color: '#22c55e' },
      { name: 'Tarjeta', value: methods.card, color: '#3b82f6' },
      { name: 'Transferencia', value: methods.transfer, color: '#8b5cf6' },
    ]
  }, [sales])

  const topProducts = useMemo(() => {
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {}
    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { name: item.productName, quantity: 0, revenue: 0 }
        }
        productSales[item.productId].quantity += item.quantity
        productSales[item.productId].revenue += item.subtotal
      })
    })
    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
  }, [sales])

  const salesByMonth = useMemo(() => {
    const months: Record<string, number> = {}
    sales.forEach(sale => {
      const date = new Date(sale.createdAt)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      months[monthKey] = (months[monthKey] || 0) + sale.total
    })
    return Object.entries(months)
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6)
  }, [sales])

  const exportToExcel = () => {
    const wsData = [
      ['REPORTE DE RENTABILIDAD - ARCOIRIS'],
      [''],
      ['MÉTRICAS PRINCIPALES'],
      ['Total Ventas', formatCurrency(reportData.totalSales)],
      ['Costo de Ventas', formatCurrency(reportData.totalCost)],
      ['Ganancia Bruta', formatCurrency(reportData.grossProfit)],
      ['Margen Bruto', `${reportData.grossMargin.toFixed(1)}%`],
      ['Gastos Mensuales', formatCurrency(reportData.monthlyExpenses)],
      ['Ganancia Neta', formatCurrency(reportData.netProfit)],
      ['Margen Neto', `${reportData.netMargin.toFixed(1)}%`],
      [''],
      ['PRODUCTOS MÁS VENDIDOS'],
      ['Producto', 'Cantidad', 'Revenue'],
      ...topProducts.map(p => [p.name, p.quantity, formatCurrency(p.revenue)]),
      [''],
      ['VENTAS POR MÉTODO DE PAGO'],
      ['Método', 'Total'],
      ...salesByPaymentMethod.map(m => [m.name, formatCurrency(m.value)]),
      [''],
      ['RESUMEN'],
      ['Total Productos', reportData.totalProducts],
      ['Total Clientes', reportData.totalCustomers],
      ['Total Transacciones', reportData.totalSalesCount],
      ['Ticket Promedio', formatCurrency(reportData.averageTicket)],
    ]

    let csvContent = wsData.map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `reporte-arcoiris-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reportes y Rentabilidad</h1>
          <p className="text-muted-foreground">Análisis financiero y métricas clave</p>
        </div>
        <Button onClick={exportToExcel} className="gap-2 bg-green-600 hover:bg-green-700">
          <FileSpreadsheet className="h-4 w-4" />
          Exportar a Excel
        </Button>
      </div>

      {/* Profitability Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-[var(--rainbow-green)]/10 to-[var(--rainbow-green)]/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ganancia Bruta</p>
                <p className="text-2xl font-bold text-[var(--rainbow-green)]">
                  {formatCurrency(reportData.grossProfit)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Margen: {reportData.grossMargin.toFixed(1)}%
                </p>
              </div>
              <div className="rounded-full bg-[var(--rainbow-green)]/20 p-3">
                <TrendingUp className="h-6 w-6 text-[var(--rainbow-green)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={reportData.netProfit >= 0 ? 'bg-gradient-to-br from-[var(--rainbow-cyan)]/10 to-[var(--rainbow-cyan)]/5' : 'bg-gradient-to-br from-[var(--rainbow-red)]/10 to-[var(--rainbow-red)]/5'}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ganancia Neta</p>
                <p className={`text-2xl font-bold ${reportData.netProfit >= 0 ? 'text-[var(--rainbow-cyan)]' : 'text-[var(--rainbow-red)]'}`}>
                  {formatCurrency(reportData.netProfit)}
                </p>
                <p className="text-xs text-muted-foreground">
                  - Gastos: {formatCurrency(reportData.monthlyExpenses)}
                </p>
              </div>
              <div className={`rounded-full p-3 ${reportData.netProfit >= 0 ? 'bg-[var(--rainbow-cyan)]/20' : 'bg-[var(--rainbow-red)]/20'}`}>
                {reportData.netProfit >= 0 ? (
                  <TrendingUp className="h-6 w-6 text-[var(--rainbow-cyan)]" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-[var(--rainbow-red)]" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[var(--rainbow-purple)]/10 to-[var(--rainbow-purple)]/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ventas Totales</p>
                <p className="text-2xl font-bold">{formatCurrency(reportData.totalSales)}</p>
                <p className="text-xs text-muted-foreground">
                  {reportData.totalSalesCount} transacciones
                </p>
              </div>
              <div className="rounded-full bg-[var(--rainbow-purple)]/20 p-3">
                <ShoppingCart className="h-6 w-6 text-[var(--rainbow-purple)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[var(--rainbow-yellow)]/10 to-[var(--rainbow-yellow)]/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ticket Promedio</p>
                <p className="text-2xl font-bold">{formatCurrency(reportData.averageTicket)}</p>
                <p className="text-xs text-muted-foreground">
                  Por venta
                </p>
              </div>
              <div className="rounded-full bg-[var(--rainbow-yellow)]/20 p-3">
                <DollarSign className="h-6 w-6 text-[var(--rainbow-yellow)]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Sales by Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle>Ventas por Método de Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesByPaymentMethod}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                  >
                    {salesByPaymentMethod.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sales Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Evolución de Ventas</CardTitle>
            <CardDescription>Últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {salesByMonth.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesByMonth}>
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Line type="monotone" dataKey="total" stroke="var(--rainbow-cyan)" strokeWidth={2} dot={{ fill: 'var(--rainbow-cyan)' }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  Sin datos suficientes
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Productos por Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topProducts.slice(0, 10).map((product, index) => (
              <div key={index} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-center gap-3">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-secondary'
                  }`}>
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.quantity} unidades vendidas</p>
                  </div>
                </div>
                <Badge className="bg-[var(--rainbow-green)]/20 text-[var(--rainbow-green)]">
                  {formatCurrency(product.revenue)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-[var(--rainbow-purple)]/20 p-3">
                <Package className="h-6 w-6 text-[var(--rainbow-purple)]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Productos en Stock</p>
                <p className="text-2xl font-bold">{reportData.totalProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-[var(--rainbow-pink)]/20 p-3">
                <Calculator className="h-6 w-6 text-[var(--rainbow-pink)]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Clientes Registrados</p>
                <p className="text-2xl font-bold">{reportData.totalCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-[var(--rainbow-yellow)]/20 p-3">
                <TrendingUp className="h-6 w-6 text-[var(--rainbow-yellow)]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Margen de Ganancia</p>
                <p className="text-2xl font-bold">{reportData.netMargin.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}