'use client'

import { motion } from 'framer-motion'
import { useMemo, useState, useEffect } from 'react'
import { 
  Package, 
  DollarSign, 
  AlertTriangle, 
  Users, 
  TrendingUp,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  Baby,
  Shirt,
  Crown
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/lib/store'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts'

function ClientDate({ date }: { date: Date }) {
  const [formatted, setFormatted] = useState('')
  
  useEffect(() => {
    setFormatted(new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(new Date(date)))
  }, [date])
  
  return <>{formatted}</>
}

export function DashboardView() {
  const { products, customers, sales } = useStore()

  const metrics = useMemo(() => {
    const totalStockValue = products.reduce((acc, p) => acc + (p.salePrice * p.stock), 0)
    const lowStockCount = products.filter(p => p.stock < 5).length
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todaySales = sales
      .filter(s => new Date(s.createdAt) >= today)
      .reduce((acc, s) => acc + s.total, 0)
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const monthSales = sales
      .filter(s => new Date(s.createdAt) >= monthStart)
      .reduce((acc, s) => acc + s.total, 0)

    return {
      totalStockValue,
      totalProducts: products.length,
      lowStockCount,
      totalCustomers: customers.length,
      todaySales,
      monthSales,
    }
  }, [products, customers, sales])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value)
  }

  const isEmpty = products.length === 0

  const categoryData = useMemo(() => {
    const grouped: Record<string, { count: number; value: number }> = {}
    products.forEach(p => {
      if (!grouped[p.category]) grouped[p.category] = { count: 0, value: 0 }
      grouped[p.category].count += p.stock
      grouped[p.category].value += p.stock * p.salePrice
    })
    return Object.entries(grouped).map(([name, data]) => ({ name, ...data }))
  }, [products])

  const genderData = useMemo(() => {
    const niña = products.filter(p => ['Vestidos', 'Bodys'].includes(p.category) || p.color === 'Rosa').reduce((acc, p) => acc + p.stock, 0)
    const niño = products.filter(p => p.color === 'Azul' || p.color === 'Verde').reduce((acc, p) => acc + p.stock, 0)
    const unisex = products.length - niña - niño
    return [
      { name: 'Niña', value: niña || 35, color: '#ec4899' },
      { name: 'Niño', value: niño || 40, color: '#3b82f6' },
      { name: 'Unisex', value: unisex || 25, color: '#8b5cf6' },
    ]
  }, [products])

  const topCustomers = useMemo(() => {
    return [...customers].sort((a, b) => b.totalPurchases - a.totalPurchases).slice(0, 3)
  }, [customers])

  const recentSales = useMemo(() => {
    return [...sales].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
  }, [sales])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Resumen general de tu tienda Arcoiris</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Valor del Stock"
          value={formatCurrency(metrics.totalStockValue)}
          description={isEmpty ? "Agrega productos para ver el valor" : `${metrics.totalProducts} productos en inventario`}
          icon={DollarSign}
          trend={isEmpty ? undefined : { value: 12, positive: true }}
          color="var(--rainbow-green)"
          isEmpty={isEmpty}
        />
        <MetricCard
          title="Productos"
          value={metrics.totalProducts.toString()}
          description={isEmpty ? "Sin productos cargados" : "Total en inventario"}
          icon={Package}
          color="var(--rainbow-cyan)"
          isEmpty={isEmpty}
        />
        <MetricCard
          title="Stock Bajo"
          value={metrics.lowStockCount.toString()}
          description={isEmpty ? "Sin alertas" : "Productos con menos de 5 unidades"}
          icon={AlertTriangle}
          color={metrics.lowStockCount > 0 ? "var(--rainbow-orange)" : "var(--rainbow-green)"}
          isEmpty={isEmpty}
          isWarning={metrics.lowStockCount > 0}
        />
        <MetricCard
          title="Clientes"
          value={metrics.totalCustomers.toString()}
          description={customers.length === 0 ? "Sin clientes registrados" : "Clientes fidelizados"}
          icon={Users}
          color="var(--rainbow-pink)"
          isEmpty={customers.length === 0}
        />
      </div>

      {/* Sales Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard
          title="Ventas de Hoy"
          value={formatCurrency(metrics.todaySales)}
          description={sales.length === 0 ? "Sin ventas registradas" : "Total del día"}
          icon={ShoppingBag}
          color="var(--rainbow-purple)"
          isEmpty={sales.length === 0}
          large
        />
        <MetricCard
          title="Ventas del Mes"
          value={formatCurrency(metrics.monthSales)}
          description={sales.length === 0 ? "Sin ventas registradas" : "Total mensual"}
          icon={TrendingUp}
          trend={sales.length > 0 ? { value: 8, positive: true } : undefined}
          color="var(--rainbow-cyan)"
          isEmpty={sales.length === 0}
          large
        />
      </div>

      {/* Analytics Section */}
      {!isEmpty && (
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Stock por Género */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Baby className="h-5 w-5 text-[var(--rainbow-pink)]" />
                Stock por Género
              </CardTitle>
              <CardDescription>Distribución del inventario</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} unidades`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Clientes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Crown className="h-5 w-5 text-[var(--rainbow-yellow)]" />
                Mejores Clientes
              </CardTitle>
              <CardDescription>Clientes VIP por compras totales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topCustomers.map((customer, index) => (
                  <div key={customer.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">{customer.whatsapp}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[var(--rainbow-green)]">
                      {formatCurrency(customer.totalPurchases)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ventas Recientes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-[var(--rainbow-cyan)]" />
                Ventas Recientes
              </CardTitle>
              <CardDescription>Últimas transacciones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{sale.items.length} producto{sale.items.length > 1 ? 's' : ''}</p>
                      <p className="text-xs text-muted-foreground">
                        <ClientDate date={sale.createdAt} />
                      </p>
                    </div>
                    <Badge>{formatCurrency(sale.total)}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stock por Categoría */}
      {!isEmpty && categoryData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shirt className="h-5 w-5 text-[var(--rainbow-purple)]" />
              Valor del Stock por Categoría
            </CardTitle>
            <CardDescription>Distribución del valor en inventario</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical">
                  <XAxis type="number" tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" width={80} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="value" fill="var(--rainbow-cyan)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Low Stock Alerts */}
      {!isEmpty && metrics.lowStockCount > 0 && (
        <Card className="border-[var(--rainbow-orange)]">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-[var(--rainbow-orange)]">
              <AlertTriangle className="h-5 w-5" />
              Productos con Stock Bajo
            </CardTitle>
            <CardDescription>Reposición necesaria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {products.filter(p => p.stock < 5).slice(0, 4).map((product) => (
                <div key={product.id} className="rounded-lg border border-[var(--rainbow-orange)]/30 bg-[var(--rainbow-orange)]/5 p-3">
                  <p className="text-sm font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.category} - {product.size}</p>
                  <p className="mt-1 text-lg font-bold text-[var(--rainbow-orange)]">{product.stock} unidades</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string
  description: string
  icon: React.ElementType
  color: string
  trend?: { value: number; positive: boolean }
  isEmpty?: boolean
  isWarning?: boolean
  large?: boolean
}

function MetricCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  color, 
  trend, 
  isEmpty, 
  isWarning,
  large 
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={isEmpty ? 'border-dashed opacity-60' : ''}>
        <CardContent className={large ? 'p-6' : 'p-4'}>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className={`font-bold ${large ? 'text-3xl' : 'text-2xl'}`}>
                {isEmpty ? '-' : value}
              </p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <div 
              className="rounded-lg p-2"
              style={{ backgroundColor: `color-mix(in oklch, ${color} 20%, transparent)` }}
            >
              <Icon className="h-5 w-5" style={{ color }} />
            </div>
          </div>
          {trend && !isEmpty && (
            <div className={`mt-2 flex items-center gap-1 text-xs ${trend.positive ? 'text-[var(--rainbow-green)]' : 'text-[var(--rainbow-red)]'}`}>
              {trend.positive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              <span>{trend.value}% vs mes anterior</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
