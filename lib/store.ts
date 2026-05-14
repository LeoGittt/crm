'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product, Category, Customer, Sale, Employee, TabType, Supplier, Expense, ExpenseRecord } from './types'

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

  // Suppliers
  suppliers: Supplier[]
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => void
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void
  deleteSupplier: (id: string) => void

  // Expenses
  expenses: Expense[]
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void
  updateExpense: (id: string, expense: Partial<Expense>) => void
  deleteExpense: (id: string) => void

  // Expense Records
  expenseRecords: ExpenseRecord[]
  addExpenseRecord: (record: Omit<ExpenseRecord, 'id'>) => void
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
  { id: '3', name: 'Niña', type: 'gender', color: 'var(--chart-5)' },
  { id: '4', name: 'Niño', type: 'gender', color: 'var(--chart-6)' },
  { id: '5', name: 'Bodys', type: 'garment', color: 'var(--chart-2)' },
  { id: '6', name: 'Remeras', type: 'garment', color: 'var(--chart-3)' },
  { id: '7', name: 'Pantalones', type: 'garment', color: 'var(--chart-4)' },
  { id: '8', name: 'Vestidos', type: 'garment', color: 'var(--chart-1)' },
  { id: '9', name: 'Camperas', type: 'garment', color: 'var(--chart-5)' },
  { id: '10', name: 'Buzos', type: 'garment', color: 'var(--chart-6)' },
  { id: '11', name: 'Medias', type: 'garment', color: 'var(--chart-2)' },
  { id: '12', name: 'Conjuntos', type: 'garment', color: 'var(--chart-3)' },
  { id: '13', name: 'Zapatillas', type: 'garment', color: 'var(--chart-1)' },
  { id: '14', name: 'Sandalias', type: 'garment', color: 'var(--chart-4)' },
  { id: '15', name: 'Botines', type: 'garment', color: 'var(--chart-5)' },
  { id: '16', name: 'Botas', type: 'garment', color: 'var(--chart-6)' },
]

const demoProducts: Product[] = [
  { id: 'p1', sku: 'BDY-NIA-02ROS', name: 'Body Manga Larga Rosa', category: 'Bodys', size: '2', color: 'Rosa', stock: 15, costPrice: 2500, salePrice: 4500, tags: ['bebé', 'recién nacido'], createdAt: new Date(), updatedAt: new Date() },
  { id: 'p2', sku: 'BDY-NIO-04AZU', name: 'Body Manga Corta Azul', category: 'Bodys', size: '4', color: 'Azul', stock: 12, costPrice: 2500, salePrice: 4500, tags: ['bebé'], createdAt: new Date(), updatedAt: new Date() },
  { id: 'p3', sku: 'REM-NIA-06BLA', name: 'Remera Estampada Blanca', category: 'Remeras', size: '6', color: 'Blanco', stock: 20, costPrice: 1800, salePrice: 3500, tags: ['niña'], createdAt: new Date(), updatedAt: new Date() },
  { id: 'p4', sku: 'REM-NIO-08VER', name: 'Remera Lisa Verde', category: 'Remeras', size: '8', color: 'Verde', stock: 18, costPrice: 1800, salePrice: 3500, tags: ['niño'], createdAt: new Date(), updatedAt: new Date() },
  { id: 'p5', sku: 'PAN-NIA-10ROS', name: 'Pantaloneta Rosa', category: 'Pantalones', size: '10', color: 'Rosa', stock: 14, costPrice: 3000, salePrice: 5500, tags: ['niña'], createdAt: new Date(), updatedAt: new Date() },
  { id: 'p6', sku: 'PAN-NIO-08AZU', name: 'Jean Slim Azul', category: 'Pantalones', size: '8', color: 'Azul', stock: 10, costPrice: 4000, salePrice: 7500, tags: ['niño'], createdAt: new Date(), updatedAt: new Date() },
  { id: 'p7', sku: 'VES-NIA-06BLA', name: 'Vestido Fiesta Blanco', category: 'Vestidos', size: '6', color: 'Blanco', stock: 8, costPrice: 4500, salePrice: 8900, tags: ['niña', 'fiesta'], createdAt: new Date(), updatedAt: new Date() },
  { id: 'p8', sku: 'VES-NIA-04ROS', name: 'Vestido diario Rosa', category: 'Vestidos', size: '4', color: 'Rosa', stock: 12, costPrice: 3500, salePrice: 6500, tags: ['niña'], createdAt: new Date(), updatedAt: new Date() },
  { id: 'p9', sku: 'CMP-NIO-10GRA', name: 'Campera Impermeable Gris', category: 'Camperas', size: '10', color: 'Gris', stock: 6, costPrice: 6000, salePrice: 12000, tags: ['invierno', 'niño'], createdAt: new Date(), updatedAt: new Date() },
  { id: 'p10', sku: 'CMP-NIA-08BEE', name: 'Campera Polar Beige', category: 'Camperas', size: '8', color: 'Beige', stock: 8, costPrice: 5500, salePrice: 10500, tags: ['invierno', 'niña'], createdAt: new Date(), updatedAt: new Date() },
  { id: 'p11', sku: 'BUZ-NIO-12AZU', name: 'Buzo Capa Azul', category: 'Buzos', size: '12', color: 'Azul', stock: 16, costPrice: 4000, salePrice: 7800, tags: ['invierno', 'niño'], createdAt: new Date(), updatedAt: new Date() },
  { id: 'p12', sku: 'BUZ-NIA-10ROS', name: 'Buzo Encantado Rosa', category: 'Buzos', size: '10', color: 'Rosa', stock: 14, costPrice: 4000, salePrice: 7800, tags: ['niña'], createdAt: new Date(), updatedAt: new Date() },
  { id: 'p13', sku: 'CON-NIA-06VER', name: 'Conjunto Verano Verde', category: 'Conjuntos', size: '6', color: 'Verde', stock: 10, costPrice: 5000, salePrice: 9500, tags: ['verano', 'set'], createdAt: new Date(), updatedAt: new Date() },
  { id: 'p14', sku: 'CON-NIO-08BLA', name: 'Conjunto Deportivo Blanco', category: 'Conjuntos', size: '8', color: 'Blanco', stock: 8, costPrice: 5500, salePrice: 10500, tags: ['deportivo'], createdAt: new Date(), updatedAt: new Date() },
  { id: 'p15', sku: 'MED-NIA-02BLA', name: 'Pack Medias Bebé Blanco', category: 'Medias', size: '2', color: 'Blanco', stock: 25, costPrice: 800, salePrice: 1500, tags: ['bebé', 'pack'], createdAt: new Date(), updatedAt: new Date() },
  { id: 'p16', sku: 'MED-NIO-04NEG', name: 'Pack Medias Niño Negro', category: 'Medias', size: '4', color: 'Negro', stock: 20, costPrice: 1000, salePrice: 2000, tags: ['pack'], createdAt: new Date(), updatedAt: new Date() },
  { id: 'p17', sku: 'ZAP-NIA-28ROS', name: 'Zapatillas Running Rosa', category: 'Zapatillas', size: '28', color: 'Rosa', stock: 8, costPrice: 8000, salePrice: 15000, tags: ['deportivo', 'niña'], createdAt: new Date(), updatedAt: new Date() },
  { id: 'p18', sku: 'ZAP-NIO-30AZU', name: 'Zapatillas Urbanas Azul', category: 'Zapatillas', size: '30', color: 'Azul', stock: 10, costPrice: 8500, salePrice: 16500, tags: ['urbano', 'niño'], createdAt: new Date(), updatedAt: new Date() },
  { id: 'p19', sku: 'ZAP-NIO-32NEG', name: 'Zapatillas Escolares Negras', category: 'Zapatillas', size: '32', color: 'Negro', stock: 15, costPrice: 9000, salePrice: 17500, tags: ['escolar', 'niño'], createdAt: new Date(), updatedAt: new Date() },
  { id: 'p20', sku: 'SAN-NIA-26BLA', name: 'Sandalias Playa Blanca', category: 'Sandalias', size: '26', color: 'Blanco', stock: 12, costPrice: 4000, salePrice: 7500, tags: ['verano', 'playa'], createdAt: new Date(), updatedAt: new Date() },
  { id: 'p21', sku: 'SAN-NIO-28ROS', name: 'Sandalias Flex Rosa', category: 'Sandalias', size: '28', color: 'Rosa', stock: 10, costPrice: 3500, salePrice: 6500, tags: ['verano', 'niña'], createdAt: new Date(), updatedAt: new Date() },
  { id: 'p22', sku: 'SAN-NIA-30VER', name: 'Sandalias Sport Verde', category: 'Sandalias', size: '30', color: 'Verde', stock: 8, costPrice: 4500, salePrice: 8500, tags: ['sport', 'verano'], createdAt: new Date(), updatedAt: new Date() },
  { id: 'p23', sku: 'BOT-NIO-32MAR', name: 'Botines Futbol Niño', category: 'Botines', size: '32', color: 'Marrón', stock: 6, costPrice: 12000, salePrice: 22000, tags: ['deporte', 'fútbol'], createdAt: new Date(), updatedAt: new Date() },
  { id: 'p24', sku: 'BOT-NIA-30NEG', name: 'Botines Plataforma Negro', category: 'Botines', size: '30', color: 'Negro', stock: 5, costPrice: 10000, salePrice: 18900, tags: ['moda', 'niña'], createdAt: new Date(), updatedAt: new Date() },
  { id: 'p25', sku: 'BTA-NIO-28MAR', name: 'Botas Invernales Marrón', category: 'Botas', size: '28', color: 'Marrón', stock: 4, costPrice: 15000, salePrice: 28000, tags: ['invierno', 'niño'], createdAt: new Date(), updatedAt: new Date() },
  { id: 'p26', sku: 'BTA-NIA-26NEG', name: 'Botas Cortas Negra', category: 'Botas', size: '26', color: 'Negro', stock: 6, costPrice: 11000, salePrice: 19900, tags: ['moda', 'invierno'], createdAt: new Date(), updatedAt: new Date() },
]

const demoCustomers: Customer[] = [
  { id: 'c1', name: 'María González', whatsapp: '+54911 5555-1234', email: 'maria.gonzalez@email.com', notes: 'Cliente frecuente, compra para su hija de 4 años', totalPurchases: 45000, lastPurchase: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) },
  { id: 'c2', name: 'Carlos Rodríguez', whatsapp: '+54911 5555-5678', email: 'carlos.rod@email.com', notes: 'Compra para mellizos (niña y niño)', totalPurchases: 78000, lastPurchase: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
  { id: 'c3', name: 'Ana Martínez', whatsapp: '+54911 5555-9012', email: 'ana.martinez@email.com', notes: 'Compradora de vestidos y conjuntos', totalPurchases: 32000, lastPurchase: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000) },
  { id: 'c4', name: 'Luis Pérez', whatsapp: '+54911 5555-3456', notes: 'Compra para su sobrino', totalPurchases: 15000, lastPurchase: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
  { id: 'c5', name: 'Sofia López', whatsapp: '+54911 5555-7890', email: 'sofia.lopez@email.com', notes: 'VIP - siempre compra en temporada', totalPurchases: 125000, lastPurchase: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) },
]

const demoEmployees: Employee[] = [
  { id: 'e1', name: 'Laura Simón', role: 'admin', email: 'laura@arcoiris.com', phone: '+54911 5555-0001', salary: 350000, hireDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), isActive: true },
  { id: 'e2', name: 'Miguel Torres', role: 'seller', email: 'miguel@arcoiris.com', phone: '+54911 5555-0002', salary: 180000, hireDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), isActive: true },
  { id: 'e3', name: 'Camila Ruiz', role: 'cashier', email: 'camila@arcoiris.com', phone: '+54911 5555-0003', salary: 160000, hireDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), isActive: true },
]

const demoSuppliers: Supplier[] = [
  { id: 'sup1', name: 'Textiles del Norte', contact: 'Carlos Gómez', phone: '+54911 5555-1001', email: 'carlos@textilesnorte.com', address: 'Av. Industrial 1234, CABA', notes: 'Proveedor principal de telas', createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) },
  { id: 'sup2', name: 'Calzados Argentos', contact: 'María López', phone: '+54911 5555-1002', email: 'maria@calzadosargentos.com', address: 'Av. del Calzado 567, Munro', notes: 'Zapatillas y calzado infantil', createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000) },
  { id: 'sup3', name: 'Accesorios Kids', contact: 'Pedro Ramírez', phone: '+54911 5555-1003', email: 'pedro@accesorioskids.com', notes: 'Botones, cierres, etiquetas', createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) },
]

const demoExpenses: Expense[] = [
  { id: 'exp1', name: 'Alquiler local', amount: 250000, frequency: 'monthly', category: 'alquiler', isActive: true, createdAt: new Date() },
  { id: 'exp2', name: 'Servicios (luz, agua, gas)', amount: 45000, frequency: 'monthly', category: 'servicios', isActive: true, createdAt: new Date() },
  { id: 'exp3', name: 'Internet y teléfono', amount: 15000, frequency: 'monthly', category: 'servicios', isActive: true, createdAt: new Date() },
  { id: 'exp4', name: 'Sueldos empleados', amount: 690000, frequency: 'monthly', category: 'sueldos', isActive: true, createdAt: new Date() },
  { id: 'exp5', name: 'Mantenimiento local', amount: 20000, frequency: 'monthly', category: 'insumos', isActive: true, createdAt: new Date() },
  { id: 'exp6', name: 'Publicidad redes sociales', amount: 30000, frequency: 'monthly', category: 'marketing', isActive: true, createdAt: new Date() },
  { id: 'exp7', name: 'Seguro local', amount: 180000, frequency: 'yearly', category: 'otros', isActive: true, createdAt: new Date() },
]

const demoExpenseRecords: ExpenseRecord[] = [
  { id: 'er1', expenseId: 'exp1', expenseName: 'Alquiler local', amount: 250000, date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
  { id: 'er2', expenseId: 'exp2', expenseName: 'Servicios (luz, agua, gas)', amount: 42000, date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
  { id: 'er3', expenseId: 'exp3', expenseName: 'Internet y teléfono', amount: 15000, date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
  { id: 'er4', expenseId: 'exp4', expenseName: 'Sueldos empleados', amount: 690000, date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
]

const demoSales: Sale[] = [
  { id: 's1', items: [{ productId: 'p1', productName: 'Body Manga Larga Rosa', quantity: 2, unitPrice: 4500, subtotal: 9000 }, { productId: 'p3', productName: 'Remera Estampada Blanca', quantity: 3, unitPrice: 3500, subtotal: 10500 }], customerId: 'c1', total: 19500, paymentMethod: 'transfer', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
  { id: 's2', items: [{ productId: 'p6', productName: 'Jean Slim Azul', quantity: 1, unitPrice: 7500, subtotal: 7500 }, { productId: 'p11', productName: 'Buzo Capa Azul', quantity: 2, unitPrice: 7800, subtotal: 15600 }], customerId: 'c2', total: 23100, paymentMethod: 'card', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
  { id: 's3', items: [{ productId: 'p7', productName: 'Vestido Fiesta Blanco', quantity: 1, unitPrice: 8900, subtotal: 8900 }], customerId: 'c5', total: 8900, paymentMethod: 'cash', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
  { id: 's4', items: [{ productId: 'p15', productName: 'Pack Medias Bebé Blanco', quantity: 3, unitPrice: 1500, subtotal: 4500 }], customerId: 'c3', total: 4500, paymentMethod: 'cash', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
  { id: 's5', items: [{ productId: 'p9', productName: 'Campera Impermeable Gris', quantity: 1, unitPrice: 12000, subtotal: 12000 }], customerId: 'c2', total: 12000, paymentMethod: 'transfer', createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
]

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Navigation
      activeTab: 'dashboard',
      setActiveTab: (tab) => set({ activeTab: tab }),
      
      // Setup wizard
      isFirstTime: false,
      setFirstTime: (value) => set({ isFirstTime: value }),
      setupStep: 0,
      setSetupStep: (step) => set({ setupStep: step }),
      
      // Products
      products: demoProducts,
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
      customers: demoCustomers,
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
      sales: demoSales,
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
      employees: demoEmployees,
      setEmployees: (employees) => set({ employees }),

      // Suppliers
      suppliers: demoSuppliers,
      addSupplier: (supplier) => set((state) => ({
        suppliers: [...state.suppliers, { ...supplier, id: generateId(), createdAt: new Date() }]
      })),
      updateSupplier: (id, supplier) => set((state) => ({
        suppliers: state.suppliers.map(s => s.id === id ? { ...s, ...supplier } : s)
      })),
      deleteSupplier: (id) => set((state) => ({
        suppliers: state.suppliers.filter(s => s.id !== id)
      })),

      // Expenses
      expenses: demoExpenses,
      addExpense: (expense) => set((state) => ({
        expenses: [...state.expenses, { ...expense, id: generateId(), createdAt: new Date() }]
      })),
      updateExpense: (id, expense) => set((state) => ({
        expenses: state.expenses.map(e => e.id === id ? { ...e, ...expense } : e)
      })),
      deleteExpense: (id) => set((state) => ({
        expenses: state.expenses.filter(e => e.id !== id)
      })),

      // Expense Records
      expenseRecords: demoExpenseRecords,
      addExpenseRecord: (record) => set((state) => ({
        expenseRecords: [...state.expenseRecords, { ...record, id: generateId() }]
      })),
    }),
    {
      name: 'arcoiris-store-v3',
      partialize: (state) => ({
        isFirstTime: state.isFirstTime,
        products: state.products,
        categories: state.categories,
        customers: state.customers,
        sales: state.sales,
        employees: state.employees,
        suppliers: state.suppliers,
        expenses: state.expenses,
        expenseRecords: state.expenseRecords,
      }),
    }
  )
)
