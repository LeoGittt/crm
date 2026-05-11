'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  ShoppingCart, 
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  ArrowRightLeft,
  CheckCircle,
  Package,
  User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useStore } from '@/lib/store'

type PaymentMethod = 'cash' | 'card' | 'transfer'

export function POSView() {
  const { products, customers, cart, addToCart, removeFromCart, updateCartQuantity, clearCart, addSale } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null)
  const [showCheckout, setShowCheckout] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')

  const availableProducts = products.filter(p => p.stock > 0)

  const filteredProducts = availableProducts.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const cartItems = useMemo(() => {
    return cart.map(item => {
      const product = products.find(p => p.id === item.productId)
      return product ? {
        ...item,
        product,
        subtotal: product.salePrice * item.quantity
      } : null
    }).filter(Boolean) as { productId: string; quantity: number; product: typeof products[0]; subtotal: number }[]
  }, [cart, products])

  const cartTotal = cartItems.reduce((acc, item) => acc + item.subtotal, 0)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value)
  }

  const handleAddToCart = (productId: string) => {
    const product = products.find(p => p.id === productId)
    const cartItem = cart.find(c => c.productId === productId)
    if (product && (!cartItem || cartItem.quantity < product.stock)) {
      addToCart(productId)
    }
  }

  const handleCheckout = () => {
    if (cartItems.length === 0) return
    
    addSale({
      items: cartItems.map(item => ({
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.product.salePrice,
        subtotal: item.subtotal,
      })),
      customerId: selectedCustomer || undefined,
      total: cartTotal,
      paymentMethod,
    })

    clearCart()
    setSelectedCustomer(null)
    setShowCheckout(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 2000)
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-6">
      {/* Products Section */}
      <div className="flex flex-1 flex-col space-y-4 overflow-hidden">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Punto de Venta</h1>
          <p className="text-muted-foreground">Registra ventas y actualiza el stock automáticamente</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar producto por nombre, SKU o categoría..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <Card className="flex-1 border-dashed">
            <CardContent className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-full bg-secondary p-4">
                <Package className="h-10 w-10 text-muted-foreground" />
              </div>
              <CardTitle className="mb-2">Sin productos disponibles</CardTitle>
              <CardDescription>
                Primero debes agregar productos al inventario para poder vender.
              </CardDescription>
            </CardContent>
          </Card>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="grid gap-3 pb-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => {
                const inCart = cart.find(c => c.productId === product.id)
                const isInCart = !!inCart
                
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="group"
                  >
                    <Card 
                      className={`cursor-pointer transition-all hover:border-primary/50 ${isInCart ? 'border-primary bg-primary/5' : ''}`}
                      onClick={() => handleAddToCart(product.id)}
                    >
                      <CardContent className="p-4">
                        <div className="mb-2 flex items-start justify-between">
                          <div>
                            <h3 className="font-medium">{product.name}</h3>
                            <p className="text-xs text-muted-foreground">{product.category} • {product.size} • {product.color}</p>
                          </div>
                          {isInCart && (
                            <Badge className="bg-primary">{inCart.quantity}</Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-primary">
                            {formatCurrency(product.salePrice)}
                          </span>
                          <span className={`text-xs ${product.stock < 5 ? 'text-[var(--rainbow-orange)]' : 'text-muted-foreground'}`}>
                            Stock: {product.stock}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Cart Section */}
      <Card className="flex w-96 flex-col">
        <CardHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              <CardTitle>Carrito</CardTitle>
            </div>
            {cartItems.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearCart}>
                Vaciar
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
          {/* Customer Selection */}
          <div className="border-b border-border p-4">
            <Label className="text-xs text-muted-foreground">Cliente (opcional)</Label>
            <select
              className="mt-1 w-full rounded-md border border-input bg-input px-3 py-2 text-sm"
              value={selectedCustomer || ''}
              onChange={(e) => setSelectedCustomer(e.target.value || null)}
            >
              <option value="">Sin cliente</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cartItems.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <ShoppingCart className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  El carrito está vacío
                </p>
                <p className="text-xs text-muted-foreground">
                  Haz clic en un producto para agregarlo
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {cartItems.map((item) => (
                    <motion.div
                      key={item.productId}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center gap-3 rounded-lg border border-border p-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(item.product.salePrice)} c/u
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (item.quantity > 1) {
                              updateCartQuantity(item.productId, item.quantity - 1)
                            } else {
                              removeFromCart(item.productId)
                            }
                          }}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0"
                          disabled={item.quantity >= item.product.stock}
                          onClick={(e) => {
                            e.stopPropagation()
                            if (item.quantity < item.product.stock) {
                              updateCartQuantity(item.productId, item.quantity + 1)
                            }
                          }}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFromCart(item.productId)
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Checkout */}
          <div className="border-t border-border p-4">
            <div className="mb-4 flex items-center justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(cartTotal)}</span>
            </div>
            <Button 
              className="w-full gap-2" 
              size="lg"
              disabled={cartItems.length === 0}
              onClick={() => setShowCheckout(true)}
            >
              <CreditCard className="h-4 w-4" />
              Cobrar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Checkout Dialog */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Venta</DialogTitle>
            <DialogDescription>
              Selecciona el método de pago para completar la venta
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Order Summary */}
            <div className="rounded-lg bg-secondary/50 p-4">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Productos</span>
                <span>{cartItems.length} items</span>
              </div>
              {selectedCustomer && (
                <div className="mb-3 flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{customers.find(c => c.id === selectedCustomer)?.name}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(cartTotal)}</span>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-2">
              <Label>Método de pago</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                  className="flex-col gap-1 h-auto py-3"
                  onClick={() => setPaymentMethod('cash')}
                >
                  <Banknote className="h-5 w-5" />
                  <span className="text-xs">Efectivo</span>
                </Button>
                <Button
                  variant={paymentMethod === 'card' ? 'default' : 'outline'}
                  className="flex-col gap-1 h-auto py-3"
                  onClick={() => setPaymentMethod('card')}
                >
                  <CreditCard className="h-5 w-5" />
                  <span className="text-xs">Tarjeta</span>
                </Button>
                <Button
                  variant={paymentMethod === 'transfer' ? 'default' : 'outline'}
                  className="flex-col gap-1 h-auto py-3"
                  onClick={() => setPaymentMethod('transfer')}
                >
                  <ArrowRightLeft className="h-5 w-5" />
                  <span className="text-xs">Transferencia</span>
                </Button>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowCheckout(false)}
              >
                Cancelar
              </Button>
              <Button 
                className="flex-1 gap-2"
                onClick={handleCheckout}
              >
                <CheckCircle className="h-4 w-4" />
                Confirmar Venta
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 flex items-center gap-3 rounded-lg bg-[var(--rainbow-green)] px-4 py-3 text-white shadow-lg"
          >
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Venta registrada correctamente</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
