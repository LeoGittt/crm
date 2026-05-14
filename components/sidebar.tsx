'use client'

import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart,
  UserCog,
  FileText,
  Truck,
  Receipt,
  BarChart3,
  MessageCircle,
  Settings,
  Rainbow
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/lib/store'
import type { TabType } from '@/lib/types'

const navItems: { id: TabType; label: string; icon: React.ElementType; section?: string; highlight?: boolean }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'inventory', label: 'Inventario', icon: Package },
  { id: 'customers', label: 'Clientes', icon: Users },
  { id: 'pos', label: 'Ventas', icon: ShoppingCart },
  { id: 'employees', label: 'Empleados', icon: UserCog },
  { id: 'invoices', label: 'Facturas', icon: FileText },
  { id: 'suppliers', label: 'Proveedores', icon: Truck },
  { id: 'expenses', label: 'Gastos', icon: Receipt },
  { id: 'reports', label: 'Reportes', icon: BarChart3 },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, highlight: true },
  { id: 'settings', label: 'Ajustes', icon: Settings },
]

export function Sidebar() {
  const { activeTab, setActiveTab } = useStore()

  return (
    <motion.aside 
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-sidebar"
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--rainbow-red)] via-[var(--rainbow-yellow)] to-[var(--rainbow-green)]">
            <Rainbow className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-sidebar-foreground">Arcoiris</h1>
            <p className="text-xs text-muted-foreground">Gestión de Tienda</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  item.highlight
                    ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20'
                    : isActive 
                      ? 'text-sidebar-primary-foreground' 
                      : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
                )}
              >
                {isActive && !item.highlight && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 rounded-lg bg-sidebar-primary"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <item.icon className={cn('relative z-10 h-5 w-5', item.highlight && 'text-green-600')} />
                <span className="relative z-10">{item.label}</span>
                {item.highlight && (
                  <span className="relative z-10 ml-auto flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <div className="rounded-lg bg-secondary/50 p-3">
            <p className="text-xs text-muted-foreground">
              Sistema de gestión para tienda de ropa
            </p>
          </div>
        </div>
      </div>
    </motion.aside>
  )
}
