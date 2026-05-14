'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2,
  Phone,
  Mail,
  MapPin,
  Package
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useStore } from '@/lib/store'
import type { Supplier } from '@/lib/types'

export function SuppliersView() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)

  const filteredSuppliers = suppliers.filter(supplier => 
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.phone.includes(searchQuery)
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Proveedores</h1>
          <p className="text-muted-foreground">Gestiona tus proveedores y contactos</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Agregar Proveedor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <SupplierForm 
              onClose={() => setIsAddDialogOpen(false)} 
              supplier={null}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, contacto o teléfono..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {suppliers.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-full bg-secondary p-4">
              <Package className="h-10 w-10 text-muted-foreground" />
            </div>
            <CardTitle className="mb-2">Sin proveedores registrados</CardTitle>
            <CardDescription className="mb-6 max-w-md">
              Agrega tus proveedores para gestionar mejor tu cadena de suministro.
            </CardDescription>
            <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Agregar Primer Proveedor
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filteredSuppliers.map((supplier) => (
              <motion.div
                key={supplier.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="group relative overflow-hidden">
                  <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setEditingSupplier(supplier)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <SupplierForm 
                          onClose={() => setEditingSupplier(null)} 
                          supplier={supplier}
                        />
                      </DialogContent>
                    </Dialog>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteSupplier(supplier.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[var(--rainbow-cyan)] to-[var(--rainbow-blue)] text-lg font-semibold text-white">
                        {supplier.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{supplier.name}</CardTitle>
                        <CardDescription>{supplier.contact}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      {supplier.phone}
                    </div>
                    
                    {supplier.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {supplier.email}
                      </div>
                    )}
                    
                    {supplier.address && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {supplier.address}
                      </div>
                    )}

                    {supplier.notes && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {supplier.notes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {suppliers.length > 0 && (
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>Total: {filteredSuppliers.length} proveedores</span>
        </div>
      )}
    </div>
  )
}

interface SupplierFormProps {
  onClose: () => void
  supplier: Supplier | null
}

function SupplierForm({ onClose, supplier }: SupplierFormProps) {
  const { addSupplier, updateSupplier } = useStore()
  const [form, setForm] = useState({
    name: supplier?.name || '',
    contact: supplier?.contact || '',
    phone: supplier?.phone || '',
    email: supplier?.email || '',
    address: supplier?.address || '',
    notes: supplier?.notes || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (supplier) {
      updateSupplier(supplier.id, form)
    } else {
      addSupplier(form)
    }
    onClose()
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{supplier ? 'Editar Proveedor' : 'Agregar Proveedor'}</DialogTitle>
        <DialogDescription>
          {supplier ? 'Modifica los datos del proveedor' : 'Registra un nuevo proveedor'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Nombre de la empresa</Label>
          <Input
            required
            placeholder="Ej: Textiles del Norte"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Persona de contacto</Label>
          <Input
            required
            placeholder="Ej: Juan Pérez"
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Teléfono</Label>
          <Input
            required
            placeholder="+54 11 5555-1234"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Email (opcional)</Label>
          <Input
            type="email"
            placeholder="juan@empresa.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Dirección (opcional)</Label>
          <Input
            placeholder="Av. Example 123, CABA"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Notas (opcional)</Label>
          <Textarea
            placeholder="Productos que provee, condiciones..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            {supplier ? 'Guardar Cambios' : 'Agregar Proveedor'}
          </Button>
        </div>
      </form>
    </>
  )
}