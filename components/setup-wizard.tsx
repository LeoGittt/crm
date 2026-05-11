'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Rainbow, Sparkles, Package, Tag, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/lib/store'

const steps = [
  { id: 0, title: 'Bienvenido', description: 'Comienza a configurar tu tienda' },
  { id: 1, title: 'Categorías', description: 'Define las categorías de tus productos' },
  { id: 2, title: 'Primer Producto', description: 'Agrega tu primer producto al inventario' },
]

const garmentTypes = ['Remeras', 'Jeans', 'Camperas', 'Pantalones', 'Vestidos', 'Faldas', 'Buzos', 'Camisas']
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const colors = ['Negro', 'Blanco', 'Azul', 'Rojo', 'Verde', 'Gris', 'Beige', 'Rosa']

export function SetupWizard() {
  const { setupStep, setSetupStep, setFirstTime, addCategory, addProduct, categories } = useStore()
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Remeras',
    size: 'M',
    color: 'Negro',
    stock: 10,
    costPrice: 5000,
    salePrice: 8500,
  })

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const handleNext = () => {
    if (setupStep === 1 && selectedCategories.length > 0) {
      selectedCategories.forEach(cat => {
        if (!categories.find(c => c.name === cat)) {
          addCategory({ name: cat, type: 'garment', color: 'var(--chart-3)' })
        }
      })
    }
    if (setupStep === 2) {
      addProduct({
        name: productForm.name || 'Remera Básica',
        category: productForm.category,
        size: productForm.size,
        color: productForm.color,
        stock: productForm.stock,
        costPrice: productForm.costPrice,
        salePrice: productForm.salePrice,
        tags: ['nuevo'],
      })
      setFirstTime(false)
      return
    }
    setSetupStep(setupStep + 1)
  }

  const handleSkip = () => {
    setFirstTime(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-1/2 w-1/2 rounded-full bg-[var(--rainbow-pink)] opacity-10 blur-3xl" />
        <div className="absolute -bottom-1/4 -right-1/4 h-1/2 w-1/2 rounded-full bg-[var(--rainbow-cyan)] opacity-10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative mx-4 w-full max-w-2xl"
      >
        {/* Progress indicators */}
        <div className="mb-8 flex justify-center gap-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`h-2 w-16 rounded-full transition-colors ${
                index <= setupStep ? 'bg-primary' : 'bg-secondary'
              }`}
            />
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-2xl">
          <AnimatePresence mode="wait">
            {setupStep === 0 && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center"
              >
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--rainbow-red)] via-[var(--rainbow-yellow)] to-[var(--rainbow-green)]">
                  <Rainbow className="h-10 w-10 text-white" />
                </div>
                <h2 className="mb-2 text-2xl font-bold text-foreground">
                  Bienvenido a Arcoiris
                </h2>
                <p className="mb-8 text-muted-foreground">
                  Vamos a configurar tu tienda de ropa en solo unos pasos. 
                  Podrás gestionar tu inventario, clientes y ventas de forma sencilla.
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-[var(--rainbow-cyan)]" />
                    <span>Inventario</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-[var(--rainbow-green)]" />
                    <span>Categorías</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[var(--rainbow-pink)]" />
                    <span>Ventas</span>
                  </div>
                </div>
              </motion.div>
            )}

            {setupStep === 1 && (
              <motion.div
                key="categories"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="mb-6 text-center">
                  <Tag className="mx-auto mb-4 h-12 w-12 text-[var(--rainbow-green)]" />
                  <h2 className="mb-2 text-2xl font-bold text-foreground">
                    Selecciona tus categorías
                  </h2>
                  <p className="text-muted-foreground">
                    Elige los tipos de prendas que vendes en tu tienda
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {garmentTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => handleCategoryToggle(type)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                        selectedCategories.includes(type)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {selectedCategories.includes(type) && (
                        <Check className="mr-1 inline h-4 w-4" />
                      )}
                      {type}
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  Seleccionadas: {selectedCategories.length} categorías
                </p>
              </motion.div>
            )}

            {setupStep === 2 && (
              <motion.div
                key="product"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="mb-6 text-center">
                  <Package className="mx-auto mb-4 h-12 w-12 text-[var(--rainbow-cyan)]" />
                  <h2 className="mb-2 text-2xl font-bold text-foreground">
                    Agrega tu primer producto
                  </h2>
                  <p className="text-muted-foreground">
                    Crea un producto de ejemplo para comenzar
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Nombre del producto</Label>
                    <Input
                      placeholder="Ej: Remera Básica"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Categoría</Label>
                    <select
                      className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm"
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    >
                      {garmentTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Talle</Label>
                    <div className="flex flex-wrap gap-1">
                      {sizes.map((size) => (
                        <Badge
                          key={size}
                          variant={productForm.size === size ? 'default' : 'secondary'}
                          className="cursor-pointer"
                          onClick={() => setProductForm({ ...productForm, size })}
                        >
                          {size}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <select
                      className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm"
                      value={productForm.color}
                      onChange={(e) => setProductForm({ ...productForm, color: e.target.value })}
                    >
                      {colors.map((color) => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Stock inicial</Label>
                    <Input
                      type="number"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Precio de venta ($)</Label>
                    <Input
                      type="number"
                      value={productForm.salePrice}
                      onChange={(e) => setProductForm({ ...productForm, salePrice: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-muted-foreground"
            >
              Omitir configuración
            </Button>
            <Button onClick={handleNext} className="gap-2">
              {setupStep === 2 ? 'Comenzar' : 'Siguiente'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
