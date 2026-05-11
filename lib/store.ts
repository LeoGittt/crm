'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product, Category, Customer, Sale, Employee, TabType } from './types'

interface StoreState {
  // Navigation
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
  
  // Setup wizard
  isFirstTime: boolean
  setFirstTime: (value: boolean) => void
  setupStep: number
  setSetupStep: (step: number) => void
  
  // Products
  products: Product[]
  addProduct: (product: Omit<Product, 'id' | 'sku' | 'createdAt' | 'updatedAt'>) => void
  addProducts: (products: Omit<Product, 'id' | 'sku' | 'createdAt' | 'updatedAt'>[]) => void
  updateProduct: (id: string, product: Partial<Product>) => void
  deleteProduct: (id: string) => void
  
  // Categories
  categories: Category[]
  addCategory: (category: Omit<Category, 'id'>) => void
  deleteCategory: (id: string) => void
  
  // Customers
  customers: Customer[]
  addCustomer: (customer: Omit<Customer, 'id' | 'totalPurchases' | 'createdAt'>) => void
  updateCustomer: (id: string, customer: Partial<Customer>) => void
  deleteCustomer: (id: string) => void
  
  // Sales
  sales: Sale[]
  addSale: (sale: Omit<Sale, 'id' | 'createdAt'>) => void
  
  // Cart for POS
  cart: { productId: string; quantity: number }[]
  addToCart: (productId: string, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateCartQuantity: (productId: string, quantity: number) => void
  clearCart: () => void

  // Employees
  employees: Employee[]
  setEmployees: (employees: Employee[]) => void
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

function generateSKU(category: string, name: string, size: string, color: string): string {
  const catCode = category.substring(0, 3).toUpperCase()
  const nameCode = name.substring(0, 2).toUpperCase()
  const sizeCode = size.toUpperCase()
  const colorCode = color.substring(0, 2).toUpperCase()
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `${catCode}-${nameCode}${sizeCode}${colorCode}-${random}`
}

const defaultCategories: Category[] = [
  { id: '1', name: 'Invierno', type: 'season', color: 'var(--chart-4)' },
  { id: '2', name: 'Verano', type: 'season', color: 'var(--chart-1)' },
  { id: '3', name: 'Hombre', type: 'gender', color: 'var(--chart-5)' },
  { id: '4', name: 'Mujer', type: 'gender', color: 'var(--chart-6)' },
  { id: '5', name: 'Remeras', type: 'garment', color: 'var(--chart-2)' },
  { id: '6', name: 'Jeans', type: 'garment', color: 'var(--chart-3)' },
  { id: '7', name: 'Camperas', type: 'garment', color: 'var(--chart-4)' },
]

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Navigation
      activeTab: 'dashboard',
      setActiveTab: (tab) => set({ activeTab: tab }),
      
      // Setup wizard
      isFirstTime: true,
      setFirstTime: (value) => set({ isFirstTime: value }),
      setupStep: 0,
      setSetupStep: (step) => set({ setupStep: step }),
      
      // Products
      products: [],
      addProduct: (product) => set((state) => ({
        products: [...state.products, {
          ...product,
          id: generateId(),
          sku: generateSKU(product.category, product.name, product.size, product.color),
          createdAt: new Date(),
          updatedAt: new Date(),
        }]
      })),
      addProducts: (products) => set((state) => ({
        products: [...state.products, ...products.map(p => ({
          ...p,
          id: generateId(),
          sku: generateSKU(p.category, p.name, p.size, p.color),
          createdAt: new Date(),
          updatedAt: new Date(),
        }))]
      })),
      updateProduct: (id, product) => set((state) => ({
        products: state.products.map(p => 
          p.id === id ? { ...p, ...product, updatedAt: new Date() } : p
        )
      })),
      deleteProduct: (id) => set((state) => ({
        products: state.products.filter(p => p.id !== id)
      })),
      
      // Categories
      categories: defaultCategories,
      addCategory: (category) => set((state) => ({
        categories: [...state.categories, { ...category, id: generateId() }]
      })),
      deleteCategory: (id) => set((state) => ({
        categories: state.categories.filter(c => c.id !== id)
      })),
      
      // Customers
      customers: [],
      addCustomer: (customer) => set((state) => ({
        customers: [...state.customers, {
          ...customer,
          id: generateId(),
          totalPurchases: 0,
          createdAt: new Date(),
        }]
      })),
      updateCustomer: (id, customer) => set((state) => ({
        customers: state.customers.map(c => 
          c.id === id ? { ...c, ...customer } : c
        )
      })),
      deleteCustomer: (id) => set((state) => ({
        customers: state.customers.filter(c => c.id !== id)
      })),
      
      // Sales
      sales: [],
      addSale: (sale) => {
        const saleId = generateId()
        const now = new Date()
        
        set((state) => {
          // Update product stock
          const updatedProducts = state.products.map(p => {
            const saleItem = sale.items.find(item => item.productId === p.id)
            if (saleItem) {
              return { ...p, stock: Math.max(0, p.stock - saleItem.quantity), updatedAt: now }
            }
            return p
          })
          
          // Update customer if exists
          const updatedCustomers = sale.customerId 
            ? state.customers.map(c => 
                c.id === sale.customerId 
                  ? { ...c, totalPurchases: c.totalPurchases + sale.total, lastPurchase: now }
                  : c
              )
            : state.customers
          
          return {
            sales: [...state.sales, { ...sale, id: saleId, createdAt: now }],
            products: updatedProducts,
            customers: updatedCustomers,
          }
        })
      },
      
      // Cart
      cart: [],
      addToCart: (productId, quantity = 1) => set((state) => {
        const existing = state.cart.find(item => item.productId === productId)
        if (existing) {
          return {
            cart: state.cart.map(item =>
              item.productId === productId
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          }
        }
        return { cart: [...state.cart, { productId, quantity }] }
      }),
      removeFromCart: (productId) => set((state) => ({
        cart: state.cart.filter(item => item.productId !== productId)
      })),
      updateCartQuantity: (productId, quantity) => set((state) => ({
        cart: state.cart.map(item =>
          item.productId === productId ? { ...item, quantity } : item
        )
      })),
      clearCart: () => set({ cart: [] }),

      // Employees
      employees: [],
      setEmployees: (employees) => set({ employees }),
    }),
    {
      name: 'arcoiris-store',
      partialize: (state) => ({
        isFirstTime: state.isFirstTime,
        products: state.products,
        categories: state.categories,
        customers: state.customers,
        sales: state.sales,
      }),
    }
  )
)
