'use client'

import { motion } from 'framer-motion'
import { 
  Package, 
  DollarSign, 
  AlertTriangle, 
  Users, 
  TrendingUp,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useStore } from '@/lib/store'
import { useMemo } from 'react'

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

      {/* Recent Activity / Empty State */}
      {isEmpty ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-secondary p-4">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="mb-2">Sin datos todavía</CardTitle>
            <CardDescription className="max-w-sm">
              Comienza agregando productos a tu inventario para ver las métricas y estadísticas de tu tienda.
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Productos Más Cargados</CardTitle>
              <CardDescription>Por cantidad en stock</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {products
                  .sort((a, b) => b.stock - a.stock)
                  .slice(0, 5)
                  .map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-xs font-medium">
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.category} - {product.size}</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold">{product.stock} uds</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Alertas de Stock</CardTitle>
              <CardDescription>Productos que necesitan reposición</CardDescription>
            </CardHeader>
            <CardContent>
              {metrics.lowStockCount === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="mb-2 rounded-full bg-[var(--rainbow-green)]/20 p-2">
                    <Package className="h-5 w-5 text-[var(--rainbow-green)]" />
                  </div>
                  <p className="text-sm text-muted-foreground">Todo el stock está bien</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {products
                    .filter(p => p.stock < 5)
                    .slice(0, 5)
                    .map((product) => (
                      <div key={product.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-[var(--rainbow-orange)]/20 p-1.5">
                            <AlertTriangle className="h-4 w-4 text-[var(--rainbow-orange)]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.category}</p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-[var(--rainbow-orange)]">
                          {product.stock} uds
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
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
