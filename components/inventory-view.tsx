'use client'

import { useState, useRef } from 'react'
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
  Tag,
  FileSpreadsheet,
  Download,
  UploadCloud,
  Table2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import * as XLSX from 'xlsx'

const garmentTypes = ['Bodys', 'Remeras', 'Pantalones', 'Vestidos', 'Camperas', 'Buzos', 'Conjuntos', 'Medias', 'Zapatillas', 'Sandalias', 'Botines', 'Botas']
const sizes = ['2', '4', '6', '8', '10', '12', '14', '26', '28', '30', '32', '34']
const colors = ['Rosa', 'Azul', 'Verde', 'Blanco', 'Beige', 'Gris', 'Negro', 'Amarillo', 'Marrón']

export function InventoryView() {
  const { products, addProduct, addProducts, updateProduct, deleteProduct, categories } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [sizeFilter, setSizeFilter] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !categoryFilter || product.category === categoryFilter
    const matchesSize = !sizeFilter || product.size === sizeFilter
    return matchesSearch && matchesCategory && matchesSize
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value)
  }

  const getColorHex = (color: string) => {
    const colorMap: Record<string, string> = {
      Rosa: '#ec4899',
      Azul: '#3b82f6',
      Verde: '#22c55e',
      Blanco: '#f8fafc',
      Beige: '#d4c4a8',
      Gris: '#6b7280',
      Negro: '#1f2937',
      Amarillo: '#eab308',
      Rojo: '#ef4444',
      Marrón: '#92400e',
    }
    return colorMap[color] || '#ccc'
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
            <DialogContent className="max-w-[1400px] w-[95vw] max-h-[90vh] overflow-y-auto">
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
      <div className="flex flex-col gap-4">
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
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Ropa:</span>
          <Button
            variant={categoryFilter === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategoryFilter(null)}
          >
            Todos
          </Button>
          {garmentTypes.slice(0, 8).map((cat) => (
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
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Calzado:</span>
          {garmentTypes.slice(8).map((cat) => (
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
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Talle:</span>
          <Button
            variant={sizeFilter === null ? 'secondary' : 'default'}
            size="sm"
            onClick={() => setSizeFilter(null)}
          >
            Todos
          </Button>
          {sizes.map((size) => (
            <Button
              key={size}
              variant={sizeFilter === size ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSizeFilter(size)}
            >
              {size}
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
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div 
                            className="h-4 w-4 rounded-full border border-border" 
                            style={{ backgroundColor: getColorHex(product.color) }}
                          />
                          {product.color}
                        </div>
                      </TableCell>
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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importStatus, setImportStatus] = useState<{ success: boolean; count: number; message: string } | null>(null)
  const [previewData, setPreviewData] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'excel' | 'manual'>('excel')
  const [rows, setRows] = useState([
    { name: 'Remera Lisa Algodón', category: 'Remeras', size: 'M', color: 'Negro', stock: 15, costPrice: 4500, salePrice: 7990 },
    { name: 'Jean Clásico Recto', category: 'Pantalones', size: '8', color: 'Azul', stock: 10, costPrice: 6000, salePrice: 10500 },
    { name: 'Vestido Niña', category: 'Vestidos', size: '6', color: 'Rosa', stock: 8, costPrice: 5500, salePrice: 9500 },
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

  const handleManualSubmit = () => {
    const validRows = rows.filter(r => r.name.trim() !== '')
    if (validRows.length > 0) {
      addProducts(validRows.map(r => ({ ...r, tags: ['manual'] })))
      setImportStatus({ success: true, count: validRows.length, message: 'Productos cargados correctamente' })
      setTimeout(() => onClose(), 1500)
    }
  }

  const handleExcelImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(sheet)

        const mappedProducts = jsonData.map((row: any) => ({
          name: row.Nombre || row.name || '',
          category: row.Categoría || row.category || 'Remeras',
          size: String(row.Talle || row.size || 'M'),
          color: row.Color || row.color || 'Negro',
          stock: parseInt(row.Stock || row.stock || 0) || 0,
          costPrice: parseInt(row['Costo'] || row.costPrice || 0) || 0,
          salePrice: parseInt(row['Precio'] || row.salePrice || 0) || 0,
        }))

        const validProducts = mappedProducts.filter((p: any) => p.name.trim() !== '')
        
        if (validProducts.length > 0) {
          setPreviewData(validProducts.slice(0, 5))
          setActiveTab('manual')
          setRows(validProducts)
          setImportStatus({ success: true, count: validProducts.length, message: `Se detectaron ${validProducts.length} productos en el Excel` })
        } else {
          setImportStatus({ success: false, count: 0, message: 'No se encontraron productos válidos en el Excel' })
        }
      } catch (error) {
        setImportStatus({ success: false, count: 0, message: 'Error al procesar el archivo. Verifica el formato.' })
      }
    }
    reader.readAsBinaryString(file)
    event.target.value = ''
  }

  const downloadTemplate = () => {
    const template = [
      { Nombre: 'Remera Lisa', Categoría: 'Remeras', Talle: 'M', Color: 'Negro', Stock: 10, Costo: 4500, Precio: 7990 },
      { Nombre: 'Jean Niño', Categoría: 'Pantalones', Talle: '8', Color: 'Azul', Stock: 15, Costo: 6000, Precio: 10500 },
      { Nombre: 'Vestido Niña', Categoría: 'Vestidos', Talle: '6', Color: 'Rosa', Stock: 8, Costo: 5500, Precio: 9500 },
    ]
    const ws = XLSX.utils.json_to_sheet(template)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla')
    XLSX.writeFile(wb, 'plantilla-productos-arcoiris.xlsx')
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value)
  }

  return (
    <>
      <DialogHeader className="pb-4 border-b">
        <DialogTitle className="flex items-center gap-2">
          <UploadCloud className="h-5 w-5 text-[var(--rainbow-cyan)]" />
          Carga Masiva de Productos
        </DialogTitle>
        <DialogDescription>
          Importa productos desde Excel o agrégalos manualmente
        </DialogDescription>
      </DialogHeader>

      {/* Status Message */}
      {importStatus && (
        <div className={`flex items-center gap-3 p-3 rounded-lg mb-4 ${importStatus.success ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
          {importStatus.success ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span className="text-sm font-medium">{importStatus.message}</span>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="excel" className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Importar Excel
          </TabsTrigger>
          <TabsTrigger value="manual" className="gap-2">
            <Table2 className="h-4 w-4" />
            Ingreso Manual
          </TabsTrigger>
        </TabsList>

        <TabsContent value="excel" className="space-y-4">
          {/* Excel Import Section */}
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-[var(--rainbow-cyan)]/50 transition-colors">
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-[var(--rainbow-cyan)]/10 flex items-center justify-center">
                <FileSpreadsheet className="h-8 w-8 text-[var(--rainbow-cyan)]" />
              </div>
              <div className="space-y-1">
                <p className="font-medium">Arrastra tu archivo Excel aquí</p>
                <p className="text-sm text-muted-foreground">o haz clic para seleccionar</p>
              </div>
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleExcelImport}
                  className="hidden"
                  id="excel-upload"
                />
                <Button variant="outline" onClick={() => document.getElementById('excel-upload')?.click()}>
                  Seleccionar Archivo
                </Button>
                <Button variant="ghost" onClick={downloadTemplate} className="gap-2">
                  <Download className="h-4 w-4" />
                  Plantilla
                </Button>
              </div>
            </div>
          </div>

          {/* Format Info */}
          <div className="bg-secondary/50 rounded-lg p-4">
            <p className="text-sm font-medium mb-2">Formatos aceptados:</p>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary">.xlsx</Badge>
              <Badge variant="secondary">.xls</Badge>
              <Badge variant="secondary">.csv</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Columnas: Nombre, Categoría, Talle, Color, Stock, Costo, Precio
            </p>
          </div>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          {/* Manual Entry */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {rows.filter(r => r.name.trim() !== '').length} productos listos para cargar
            </p>
            <Button variant="outline" size="sm" onClick={addRow} className="gap-2">
              <Plus className="h-4 w-4" />
              Agregar Fila
            </Button>
          </div>

          {/* Table Header */}
          <div className="grid gap-1 text-xs font-medium text-muted-foreground grid-cols-[1.5fr_110px_55px_75px_50px_70px_28px] px-1">
            <span>Nombre</span>
            <span>Categoría</span>
            <span>Talle</span>
            <span>Color</span>
            <span className="text-center">Stock</span>
            <span>Precio</span>
            <span></span>
          </div>

          {/* Table Body */}
          <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
            {rows.map((row, index) => (
              <div key={index} className="flex items-center gap-1 rounded-lg border border-border p-1.5 hover:border-[var(--rainbow-cyan)]/30 transition-colors">
                <Input
                  placeholder="Nombre del producto"
                  className="flex-1 h-7 text-sm"
                  value={row.name}
                  onChange={(e) => updateRow(index, 'name', e.target.value)}
                />
                <select
                  className="w-24 h-7 rounded-md border border-input bg-input px-1.5 text-xs"
                  value={row.category}
                  onChange={(e) => updateRow(index, 'category', e.target.value)}
                >
                  {garmentTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <select
                  className="w-12 h-7 rounded-md border border-input bg-input px-1 text-xs"
                  value={row.size}
                  onChange={(e) => updateRow(index, 'size', e.target.value)}
                >
                  {sizes.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                <select
                  className="w-16 h-7 rounded-md border border-input bg-input px-1 text-xs"
                  value={row.color}
                  onChange={(e) => updateRow(index, 'color', e.target.value)}
                >
                  {colors.map((color) => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
                <Input
                  type="number"
                  className="w-12 h-7 text-center text-sm"
                  value={row.stock}
                  onChange={(e) => updateRow(index, 'stock', parseInt(e.target.value) || 0)}
                />
                <Input
                  type="number"
                  className="w-16 h-7 text-sm"
                  value={row.salePrice}
                  onChange={(e) => updateRow(index, 'salePrice', parseInt(e.target.value) || 0)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeRow(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>

          {/* Preview if data from excel */}
          {previewData.length > 0 && (
            <div className="bg-[var(--rainbow-cyan)]/10 rounded-lg p-3">
              <p className="text-xs font-medium mb-2 text-[var(--rainbow-cyan)]">
                Preview (primeros 5 de {rows.length}):
              </p>
              <div className="space-y-1">
                {previewData.map((p, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span>{p.name}</span>
                    <span className="text-muted-foreground">{p.category} - {p.size} - Stock: {p.stock} - {formatCurrency(p.salePrice)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {activeTab === 'manual' && rows.filter(r => r.name.trim() !== '').length > 0 && (
            <>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>{rows.filter(r => r.name.trim() !== '').length} productos</span>
            </>
          )}
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleManualSubmit}
            disabled={activeTab === 'manual' && rows.filter(r => r.name.trim() !== '').length === 0}
            className="gap-2"
          >
            <UploadCloud className="h-4 w-4" />
            Cargar Productos
          </Button>
        </div>
      </div>
    </>
  )
}
