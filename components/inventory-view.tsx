'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Search, 
  Filter, 
  Package, 
  Edit2, 
  Trash2,
  Upload,
  X,
  Tag
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
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useStore } from '@/lib/store'
import type { Product } from '@/lib/types'

const garmentTypes = ['Remeras', 'Jeans', 'Camperas', 'Pantalones', 'Vestidos', 'Faldas', 'Buzos', 'Camisas']
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const colors = ['Negro', 'Blanco', 'Azul', 'Rojo', 'Verde', 'Gris', 'Beige', 'Rosa', 'Marrón', 'Amarillo']

export function InventoryView() {
  const { products, addProduct, addProducts, updateProduct, deleteProduct, categories } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !categoryFilter || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value)
  }

  const garmentCategories = categories.filter(c => c.type === 'garment')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventario</h1>
          <p className="text-muted-foreground">Gestiona tus productos y stock</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                Carga Masiva
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <BulkUploadForm onClose={() => setIsBulkDialogOpen(false)} />
            </DialogContent>
          </Dialog>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Agregar Producto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <ProductForm 
                onClose={() => setIsAddDialogOpen(false)} 
                product={null}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o SKU..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={categoryFilter === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategoryFilter(null)}
          >
            Todos
          </Button>
          {garmentTypes.slice(0, 5).map((cat) => (
            <Button
              key={cat}
              variant={categoryFilter === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategoryFilter(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {products.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-full bg-secondary p-4">
              <Package className="h-10 w-10 text-muted-foreground" />
            </div>
            <CardTitle className="mb-2">Sin productos en inventario</CardTitle>
            <CardDescription className="mb-6 max-w-md">
              Comienza agregando tu primer producto o usa la carga masiva para importar varios productos a la vez.
            </CardDescription>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsBulkDialogOpen(true)} className="gap-2">
                <Upload className="h-4 w-4" />
                Carga Masiva
              </Button>
              <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Agregar Producto
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Products Table */
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Talle</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Precio Venta</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredProducts.map((product) => (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-border"
                    >
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">
                          {product.sku}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{product.category}</Badge>
                      </TableCell>
                      <TableCell>{product.size}</TableCell>
                      <TableCell>{product.color}</TableCell>
                      <TableCell className="text-right">
                        <span className={product.stock < 5 ? 'text-[var(--rainbow-orange)] font-semibold' : ''}>
                          {product.stock}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(product.salePrice)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setEditingProduct(product)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <ProductForm 
                                onClose={() => setEditingProduct(null)} 
                                product={product}
                              />
                            </DialogContent>
                          </Dialog>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => deleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {products.length > 0 && (
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>Total: {filteredProducts.length} productos</span>
          <span>•</span>
          <span>Stock total: {filteredProducts.reduce((acc, p) => acc + p.stock, 0)} unidades</span>
          <span>•</span>
          <span>Valor: {formatCurrency(filteredProducts.reduce((acc, p) => acc + (p.salePrice * p.stock), 0))}</span>
        </div>
      )}
    </div>
  )
}

interface ProductFormProps {
  onClose: () => void
  product: Product | null
}

function ProductForm({ onClose, product }: ProductFormProps) {
  const { addProduct, updateProduct } = useStore()
  const [form, setForm] = useState({
    name: product?.name || '',
    category: product?.category || 'Remeras',
    size: product?.size || 'M',
    color: product?.color || 'Negro',
    stock: product?.stock || 10,
    costPrice: product?.costPrice || 5000,
    salePrice: product?.salePrice || 8500,
    tags: product?.tags || [],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (product) {
      updateProduct(product.id, form)
    } else {
      addProduct(form)
    }
    onClose()
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{product ? 'Editar Producto' : 'Agregar Producto'}</DialogTitle>
        <DialogDescription>
          {product ? 'Modifica los datos del producto' : 'Completa los datos para agregar un nuevo producto'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Nombre del producto</Label>
          <Input
            required
            placeholder="Ej: Remera Básica Algodón"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Categoría</Label>
            <select
              className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {garmentTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <select
              className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
            >
              {colors.map((color) => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Talle</Label>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <Badge
                key={size}
                variant={form.size === size ? 'default' : 'secondary'}
                className="cursor-pointer"
                onClick={() => setForm({ ...form, size })}
              >
                {size}
              </Badge>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Stock</Label>
            <Input
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-2">
            <Label>Costo ($)</Label>
            <Input
              type="number"
              min="0"
              value={form.costPrice}
              onChange={(e) => setForm({ ...form, costPrice: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-2">
            <Label>Venta ($)</Label>
            <Input
              type="number"
              min="0"
              value={form.salePrice}
              onChange={(e) => setForm({ ...form, salePrice: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            {product ? 'Guardar Cambios' : 'Agregar Producto'}
          </Button>
        </div>
      </form>
    </>
  )
}

function BulkUploadForm({ onClose }: { onClose: () => void }) {
  const { addProducts } = useStore()
  const [rows, setRows] = useState([
    { name: 'Remera Lisa Algodón', category: 'Remeras', size: 'M', color: 'Negro', stock: 15, costPrice: 4500, salePrice: 7990 },
    { name: 'Jean Clásico Recto', category: 'Jeans', size: 'L', color: 'Azul', stock: 10, costPrice: 8000, salePrice: 14990 },
    { name: 'Campera Impermeable', category: 'Camperas', size: 'XL', color: 'Negro', stock: 5, costPrice: 15000, salePrice: 25990 },
  ])

  const addRow = () => {
    setRows([...rows, { name: '', category: 'Remeras', size: 'M', color: 'Negro', stock: 10, costPrice: 5000, salePrice: 8500 }])
  }

  const removeRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index))
  }

  const updateRow = (index: number, field: string, value: string | number) => {
    setRows(rows.map((row, i) => i === index ? { ...row, [field]: value } : row))
  }

  const handleSubmit = () => {
    const validRows = rows.filter(r => r.name.trim() !== '')
    if (validRows.length > 0) {
      addProducts(validRows.map(r => ({ ...r, tags: ['nuevo'] })))
      onClose()
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Carga Masiva de Productos</DialogTitle>
        <DialogDescription>
          Agrega múltiples productos a la vez. Los SKUs se generan automáticamente.
        </DialogDescription>
      </DialogHeader>
      <div className="max-h-96 space-y-3 overflow-y-auto">
        {rows.map((row, index) => (
          <div key={index} className="flex items-center gap-2 rounded-lg border border-border p-3">
            <div className="grid flex-1 gap-2 sm:grid-cols-4">
              <Input
                placeholder="Nombre"
                value={row.name}
                onChange={(e) => updateRow(index, 'name', e.target.value)}
              />
              <select
                className="rounded-md border border-input bg-input px-2 py-1 text-sm"
                value={row.category}
                onChange={(e) => updateRow(index, 'category', e.target.value)}
              >
                {garmentTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <div className="flex gap-1">
                <select
                  className="w-16 rounded-md border border-input bg-input px-2 py-1 text-sm"
                  value={row.size}
                  onChange={(e) => updateRow(index, 'size', e.target.value)}
                >
                  {sizes.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                <select
                  className="flex-1 rounded-md border border-input bg-input px-2 py-1 text-sm"
                  value={row.color}
                  onChange={(e) => updateRow(index, 'color', e.target.value)}
                >
                  {colors.map((color) => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-1">
                <Input
                  type="number"
                  placeholder="Stock"
                  className="w-16"
                  value={row.stock}
                  onChange={(e) => updateRow(index, 'stock', parseInt(e.target.value) || 0)}
                />
                <Input
                  type="number"
                  placeholder="Precio"
                  value={row.salePrice}
                  onChange={(e) => updateRow(index, 'salePrice', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeRow(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between pt-4">
        <Button type="button" variant="outline" size="sm" onClick={addRow} className="gap-2">
          <Plus className="h-4 w-4" />
          Agregar Fila
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            Cargar {rows.filter(r => r.name.trim() !== '').length} Productos
          </Button>
        </div>
      </div>
    </>
  )
}
