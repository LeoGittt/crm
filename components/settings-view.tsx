'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Tag, 
  Plus, 
  Trash2,
  Palette,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useStore } from '@/lib/store'

export function SettingsView() {
  const { categories, addCategory, deleteCategory, setFirstTime, products, customers, sales } = useStore()
  const [newCategory, setNewCategory] = useState<{ name: string; type: 'season' | 'gender' | 'garment' }>({ name: '', type: 'garment' })

  const handleAddCategory = () => {
    if (newCategory.name.trim()) {
      addCategory({
        name: newCategory.name,
        type: newCategory.type,
        color: `var(--chart-${Math.floor(Math.random() * 6) + 1})`,
      })
      setNewCategory({ name: '', type: 'garment' })
    }
  }

  const handleResetWizard = () => {
    setFirstTime(true)
  }

  const getCategoryTypeLabel = (type: string) => {
    switch (type) {
      case 'season': return 'Temporada'
      case 'gender': return 'Género'
      case 'garment': return 'Prenda'
      default: return type
    }
  }

  const getCategoryTypeColor = (type: string) => {
    switch (type) {
      case 'season': return 'var(--rainbow-cyan)'
      case 'gender': return 'var(--rainbow-pink)'
      case 'garment': return 'var(--rainbow-green)'
      default: return 'var(--rainbow-purple)'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Ajustes</h1>
        <p className="text-muted-foreground">Configura las categorías y opciones de tu tienda</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Categories Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-[var(--rainbow-green)]" />
              <CardTitle>Categorías y Etiquetas</CardTitle>
            </div>
            <CardDescription>
              Gestiona las categorías para organizar tus productos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Category */}
            <div className="flex gap-2">
              <Input
                placeholder="Nueva categoría..."
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
              />
              <select
                className="rounded-md border border-input bg-input px-3 py-2 text-sm"
                value={newCategory.type}
                onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value as 'season' | 'gender' | 'garment' })}
              >
                <option value="garment">Prenda</option>
                <option value="season">Temporada</option>
                <option value="gender">Género</option>
              </select>
              <Button onClick={handleAddCategory} className="gap-2">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Categories List */}
            <div className="space-y-2">
              {['garment', 'season', 'gender'].map((type) => {
                const typeCategories = categories.filter(c => c.type === type)
                if (typeCategories.length === 0) return null
                
                return (
                  <div key={type} className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      {getCategoryTypeLabel(type)}
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {typeCategories.map((category) => (
                        <motion.div
                          key={category.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <Badge
                            variant="secondary"
                            className="group flex items-center gap-1 pr-1"
                            style={{ 
                              backgroundColor: `color-mix(in oklch, ${getCategoryTypeColor(type)} 20%, transparent)`,
                              color: getCategoryTypeColor(type)
                            }}
                          >
                            {category.name}
                            <button
                              onClick={() => deleteCategory(category.id)}
                              className="ml-1 rounded-full p-0.5 opacity-0 transition-opacity hover:bg-destructive/20 group-hover:opacity-100"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* System Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-[var(--rainbow-purple)]" />
              <CardTitle>Información del Sistema</CardTitle>
            </div>
            <CardDescription>
              Resumen de datos y acciones del sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-secondary/50 p-4">
                <p className="text-sm text-muted-foreground">Productos</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-4">
                <p className="text-sm text-muted-foreground">Clientes</p>
                <p className="text-2xl font-bold">{customers.length}</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-4">
                <p className="text-sm text-muted-foreground">Ventas</p>
                <p className="text-2xl font-bold">{sales.length}</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-4">
                <p className="text-sm text-muted-foreground">Categorías</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={handleResetWizard}
              >
                <RefreshCw className="h-4 w-4" />
                Volver a mostrar asistente inicial
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* About */}
      <Card>
        <CardContent className="py-6">
          <div className="text-center">
            <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--rainbow-red)] via-[var(--rainbow-yellow)] to-[var(--rainbow-green)]">
              <span className="text-xl font-bold text-white">A</span>
            </div>
            <h3 className="text-lg font-semibold">Arcoiris</h3>
            <p className="text-sm text-muted-foreground">
              Sistema de Gestión de Inventario y CRM para Tiendas de Ropa
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Versión 1.0.0
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
