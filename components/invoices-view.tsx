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
  Users
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

const initialInvoices: Invoice[] = [
  {
    id: 'INV-001',
    customerId: '1',
    customerName: 'Laura Pérez',
    items: [
      { productId: '1', productName: 'Vestido Floral Talla M', quantity: 1, unitPrice: 85000, subtotal: 85000 },
      { productId: '2', productName: 'Bolso de Mano', quantity: 1, unitPrice: 45000, subtotal: 45000 },
    ],
    subtotal: 120000,
    tax: 10800,
    total: 130800,
    paymentMethod: 'cash',
    status: 'paid',
    createdAt: new Date('2026-05-10'),
  },
  {
    id: 'INV-002',
    customerId: '2',
    customerName: 'Carmen Rodríguez',
    items: [
      { productId: '3', productName: 'Camisa Casual Azul', quantity: 2, unitPrice: 55000, subtotal: 110000 },
    ],
    subtotal: 110000,
    tax: 9900,
    total: 119900,
    paymentMethod: 'card',
    status: 'paid',
    createdAt: new Date('2026-05-09'),
  },
  {
    id: 'INV-003',
    customerId: '3',
    customerName: 'Andrea López',
    items: [
      { productId: '4', productName: 'Falda Plisada', quantity: 1, unitPrice: 65000, subtotal: 65000 },
      { productId: '5', productName: 'Blusa Seda', quantity: 1, unitPrice: 72000, subtotal: 72000 },
      { productId: '6', productName: 'Zapatos Casual', quantity: 1, unitPrice: 95000, subtotal: 95000 },
    ],
    subtotal: 232000,
    tax: 20880,
    total: 252880,
    paymentMethod: 'transfer',
    status: 'pending',
    createdAt: new Date('2026-05-08'),
  },
  {
    id: 'INV-004',
    customerId: '1',
    customerName: 'Laura Pérez',
    items: [
      { productId: '7', productName: 'Chaqueta Denim', quantity: 1, unitPrice: 120000, subtotal: 120000 },
    ],
    subtotal: 120000,
    tax: 10800,
    total: 130800,
    paymentMethod: 'cash',
    status: 'cancelled',
    createdAt: new Date('2026-05-07'),
  },
]

export function InvoicesView() {
  const [invoices] = useState<Invoice[]>(initialInvoices)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch = 
      inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Facturación</h1>
        <p className="text-muted-foreground">Historial de facturas y ventas</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Facturado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalRevenue.toLocaleString('es-CO')}
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
              ${pendingRevenue.toLocaleString('es-CO')}
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
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.customerName}</TableCell>
                  <TableCell>{invoice.createdAt.toLocaleDateString('es-CO')}</TableCell>
                  <TableCell className="capitalize">{invoice.paymentMethod}</TableCell>
                  <TableCell>${invoice.total.toLocaleString('es-CO')}</TableCell>
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
            <DialogTitle>Factura {selectedInvoice?.id}</DialogTitle>
            <DialogDescription>
              {selectedInvoice?.createdAt.toLocaleDateString('es-CO')}
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
                      <TableCell className="text-right">${item.unitPrice.toLocaleString('es-CO')}</TableCell>
                      <TableCell className="text-right">${item.subtotal.toLocaleString('es-CO')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${selectedInvoice.subtotal.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>IVA (9%)</span>
                  <span>${selectedInvoice.tax.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span>${selectedInvoice.total.toLocaleString('es-CO')}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}