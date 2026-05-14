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
  supplierId?: string
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

export interface Supplier {
  id: string
  name: string
  contact: string
  phone: string
  email?: string
  address?: string
  notes?: string
  createdAt: Date
}

export interface Expense {
  id: string
  name: string
  amount: number
  frequency: 'monthly' | 'weekly' | 'yearly'
  category: 'alquiler' | 'servicios' | 'sueldos' | 'insumos' | 'marketing' | 'otros'
  isActive: boolean
  createdAt: Date
}

export interface ExpenseRecord {
  id: string
  expenseId: string
  expenseName: string
  amount: number
  date: Date
  notes?: string
}

export type TabType = 'dashboard' | 'inventory' | 'customers' | 'pos' | 'employees' | 'invoices' | 'suppliers' | 'expenses' | 'reports' | 'whatsapp' | 'settings'
