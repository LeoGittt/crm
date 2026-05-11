export interface Product {
  id: string
  sku: string
  name: string
  category: string
  size: string
  color: string
  stock: number
  costPrice: number
  salePrice: number
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  type: 'season' | 'gender' | 'garment'
  color: string
}

export interface Customer {
  id: string
  name: string
  whatsapp: string
  email?: string
  notes?: string
  totalPurchases: number
  lastPurchase?: Date
  createdAt: Date
}

export interface Sale {
  id: string
  items: SaleItem[]
  customerId?: string
  total: number
  paymentMethod: 'cash' | 'card' | 'transfer'
  createdAt: Date
}

export interface SaleItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface DashboardMetrics {
  totalStockValue: number
  totalProducts: number
  lowStockCount: number
  totalCustomers: number
  todaySales: number
  monthSales: number
}

export interface Employee {
  id: string
  name: string
  role: 'admin' | 'manager' | 'seller' | 'cashier'
  email?: string
  phone?: string
  salary: number
  hireDate: Date
  isActive: boolean
}

export interface Invoice {
  id: string
  customerId?: string
  customerName: string
  items: SaleItem[]
  subtotal: number
  tax: number
  total: number
  paymentMethod: 'cash' | 'card' | 'transfer'
  status: 'paid' | 'pending' | 'cancelled'
  createdAt: Date
}

export type TabType = 'dashboard' | 'inventory' | 'customers' | 'pos' | 'employees' | 'invoices' | 'whatsapp' | 'settings'
