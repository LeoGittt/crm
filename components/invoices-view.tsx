'use client'

import { useState } from 'react'
import { 
  FileText, 
  Search, 
  Download, 
  Eye,
  Filter,
  Calendar,
  DollarSign,
  Users,
  Printer,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useStore } from '@/lib/store'
import type { Invoice } from '@/lib/types'

const statusColors = {
  paid: 'bg-green-500',
  pending: 'bg-yellow-500',
  cancelled: 'bg-red-500',
}

const statusLabels = {
  paid: 'Pagada',
  pending: 'Pendiente',
  cancelled: 'Cancelada',
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value)
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('es-AR', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  }).format(new Date(date))
}

export function InvoicesView() {
  const { invoices, updateInvoiceStatus, customers, sales } = useStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [showNewInvoiceDialog, setShowNewInvoiceDialog] = useState(false)

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch = 
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalRevenue = invoices
    .filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + i.total, 0)
  
  const pendingRevenue = invoices
    .filter(i => i.status === 'pending')
    .reduce((sum, i) => sum + i.total, 0)

  const paidCount = invoices.filter(i => i.status === 'paid').length
  const pendingCount = invoices.filter(i => i.status === 'pending').length

  const handleStatusChange = (invoiceId: string, newStatus: 'paid' | 'pending' | 'cancelled') => {
    updateInvoiceStatus(invoiceId, newStatus)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Facturación</h1>
          <p className="text-muted-foreground">Historial de facturas y ventas</p>
        </div>
        <Button onClick={() => setShowNewInvoiceDialog(true)} className="gap-2">
          <FileText className="h-4 w-4" />
          Nueva Factura
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Facturado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Ingresos pagados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendiente</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(pendingRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Por cobrar
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagadas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paidCount}</div>
            <p className="text-xs text-muted-foreground">
              Facturas cobradas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              Por cobrar
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por ID o cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="paid">Pagadas</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="cancelled">Canceladas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.customerName}</TableCell>
                  <TableCell>{formatDate(invoice.createdAt)}</TableCell>
                  <TableCell className="capitalize">{invoice.paymentMethod}</TableCell>
                  <TableCell>{formatCurrency(invoice.total)}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[invoice.status]}>
                      {statusLabels[invoice.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedInvoice(invoice)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Factura {selectedInvoice?.invoiceNumber}</DialogTitle>
            <DialogDescription>
              {selectedInvoice && formatDate(selectedInvoice.createdAt)}
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-6">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">{selectedInvoice.customerName}</p>
                  <p className="text-sm text-muted-foreground">
                    Método de pago: {selectedInvoice.paymentMethod}
                  </p>
                </div>
                <Badge className={statusColors[selectedInvoice.status]}>
                  {statusLabels[selectedInvoice.status]}
                </Badge>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-center">Cantidad</TableHead>
                    <TableHead className="text-right">Precio Unit.</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedInvoice.items.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.subtotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>IVA (9%)</span>
                  <span>{formatCurrency(selectedInvoice.tax)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span>{formatCurrency(selectedInvoice.total)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Invoice Dialog */}
      <Dialog open={showNewInvoiceDialog} onOpenChange={setShowNewInvoiceDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nueva Factura Manual</DialogTitle>
            <DialogDescription>
              Crea una factura sin necesariamente haber hecho una venta
            </DialogDescription>
          </DialogHeader>
          <NewInvoiceForm 
            customers={customers} 
            onClose={() => setShowNewInvoiceDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface NewInvoiceFormProps {
  customers: any[]
  onClose: () => void
}

function NewInvoiceForm({ customers, onClose }: NewInvoiceFormProps) {
  const { addInvoice } = useStore()
  const [form, setForm] = useState({
    customerId: '',
    customerName: '',
    paymentMethod: 'cash' as 'cash' | 'card' | 'transfer',
  })
  const [items, setItems] = useState([
    { productName: '', quantity: 1, unitPrice: 0 }
  ])

  const addItem = () => {
    setItems([...items, { productName: '', quantity: 1, unitPrice: 0 }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: string, value: string | number) => {
    setItems(items.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  const handleSubmit = () => {
    const validItems = items.filter(i => i.productName.trim() !== '')
    if (validItems.length === 0) return

    const subtotal = validItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0)
    
    addInvoice({
      customerId: form.customerId || undefined,
      customerName: form.customerName || 'Cliente Mostrador',
      items: validItems.map(item => ({
        productId: '',
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.quantity * item.unitPrice,
      })),
      subtotal,
      paymentMethod: form.paymentMethod,
      status: 'pending',
    })
    onClose()
  }

  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0)
  const tax = subtotal * 0.09
  const total = subtotal + tax

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Cliente (opcional)</Label>
          <select
            className="w-full rounded-md border border-input bg-input px-3 py-2"
            value={form.customerId}
            onChange={(e) => {
              const customer = customers.find(c => c.id === e.target.value)
              setForm({ 
                ...form, 
                customerId: e.target.value,
                customerName: customer?.name || ''
              })
            }}
          >
            <option value="">Cliente Mostrador</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>Método de pago</Label>
          <select
            className="w-full rounded-md border border-input bg-input px-3 py-2"
            value={form.paymentMethod}
            onChange={(e) => setForm({ ...form, paymentMethod: e.target.value as any })}
          >
            <option value="cash">Efectivo</option>
            <option value="card">Tarjeta</option>
            <option value="transfer">Transferencia</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>Items</Label>
          <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1">
            <Plus className="h-3 w-3" /> Agregar
          </Button>
        </div>
        {items.map((item, index) => (
          <div key={index} className="flex gap-2 items-end">
            <Input
              placeholder="Producto"
              className="flex-1"
              value={item.productName}
              onChange={(e) => updateItem(index, 'productName', e.target.value)}
            />
            <Input
              type="number"
              placeholder="Cant"
              className="w-16"
              value={item.quantity}
              onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
            />
            <Input
              type="number"
              placeholder="Precio"
              className="w-24"
              value={item.unitPrice}
              onChange={(e) => updateItem(index, 'unitPrice', parseInt(e.target.value) || 0)}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={() => removeItem(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-secondary/50 p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>IVA (9%)</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        <div className="flex justify-between font-bold border-t pt-2">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit}>Crear Factura</Button>
      </div>
    </div>
  )
}