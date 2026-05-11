'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Search, 
  Users, 
  Edit2, 
  Trash2,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  MessageCircle
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
import type { Customer } from '@/lib/types'

export function CustomersView() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.whatsapp.includes(searchQuery)
  )

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value)
  }

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Sin compras'
    return new Intl.DateTimeFormat('es-AR', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    }).format(new Date(date))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground">Gestiona tus clientes y programa de fidelización</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Agregar Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <CustomerForm 
              onClose={() => setIsAddDialogOpen(false)} 
              customer={null}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o WhatsApp..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Empty State */}
      {customers.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-full bg-secondary p-4">
              <Users className="h-10 w-10 text-muted-foreground" />
            </div>
            <CardTitle className="mb-2">Sin clientes registrados</CardTitle>
            <CardDescription className="mb-6 max-w-md">
              Registra tus clientes para llevar un historial de sus compras y crear un programa de fidelización.
            </CardDescription>
            <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Agregar Primer Cliente
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Customers Grid */
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filteredCustomers.map((customer) => (
              <motion.div
                key={customer.id}
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
                          onClick={() => setEditingCustomer(customer)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <CustomerForm 
                          onClose={() => setEditingCustomer(null)} 
                          customer={customer}
                        />
                      </DialogContent>
                    </Dialog>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteCustomer(customer.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[var(--rainbow-pink)] to-[var(--rainbow-purple)] text-lg font-semibold text-white">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <a 
                          href={`https://wa.me/${customer.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
                          title="Contactar por WhatsApp"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </a>
                      </div>
                      <div>
                        <CardTitle className="text-lg">{customer.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {customer.whatsapp}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {customer.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {customer.email}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-[var(--rainbow-green)]" />
                        <span>Total compras</span>
                      </div>
                      <span className="font-semibold text-[var(--rainbow-green)]">
                        {formatCurrency(customer.totalPurchases)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Última compra: {formatDate(customer.lastPurchase)}</span>
                    </div>

                    {customer.notes && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {customer.notes}
                      </p>
                    )}

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full gap-2 bg-green-500/10 hover:bg-green-500/20 text-green-600 border-green-500/20"
                      asChild
                    >
                      <a href={`https://wa.me/${customer.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="h-4 w-4" />
                        Contactar por WhatsApp
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Summary */}
      {customers.length > 0 && (
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>Total: {filteredCustomers.length} clientes</span>
          <span>•</span>
          <span>Compras totales: {formatCurrency(filteredCustomers.reduce((acc, c) => acc + c.totalPurchases, 0))}</span>
        </div>
      )}
    </div>
  )
}

interface CustomerFormProps {
  onClose: () => void
  customer: Customer | null
}

function CustomerForm({ onClose, customer }: CustomerFormProps) {
  const { addCustomer, updateCustomer } = useStore()
  const [form, setForm] = useState({
    name: customer?.name || '',
    whatsapp: customer?.whatsapp || '',
    email: customer?.email || '',
    notes: customer?.notes || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (customer) {
      updateCustomer(customer.id, form)
    } else {
      addCustomer(form)
    }
    onClose()
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{customer ? 'Editar Cliente' : 'Agregar Cliente'}</DialogTitle>
        <DialogDescription>
          {customer ? 'Modifica los datos del cliente' : 'Registra un nuevo cliente para fidelización'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Nombre completo</Label>
          <Input
            required
            placeholder="Ej: María García"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>WhatsApp</Label>
          <Input
            required
            placeholder="Ej: +54 11 1234-5678"
            value={form.whatsapp}
            onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Email (opcional)</Label>
          <Input
            type="email"
            placeholder="maria@email.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Notas (opcional)</Label>
          <Textarea
            placeholder="Preferencias, talles, observaciones..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            {customer ? 'Guardar Cambios' : 'Agregar Cliente'}
          </Button>
        </div>
      </form>
    </>
  )
}
