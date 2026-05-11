'use client'

import { useState } from 'react'
import { 
  Users, 
  Plus, 
  Search, 
  MoreHorizontal,
  Pencil,
  Trash2,
  UserPlus,
  DollarSign,
  Calendar,
  Mail,
  Phone
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useStore } from '@/lib/store'
import type { Employee } from '@/lib/types'

const roleColors = {
  admin: 'bg-red-500',
  manager: 'bg-blue-500',
  seller: 'bg-green-500',
  cashier: 'bg-yellow-500',
}

const roleLabels = {
  admin: 'Administrador',
  manager: 'Gerente',
  seller: 'Vendedor',
  cashier: 'Cajero',
}

const initialEmployees: Employee[] = [
  {
    id: '1',
    name: 'María García',
    role: 'admin',
    email: 'maria@arcoiris.com',
    phone: '+57 300 123 4567',
    salary: 2500000,
    hireDate: new Date('2023-01-15'),
    isActive: true,
  },
  {
    id: '2',
    name: 'Carlos López',
    role: 'manager',
    email: 'carlos@arcoiris.com',
    phone: '+57 300 234 5678',
    salary: 1800000,
    hireDate: new Date('2023-03-20'),
    isActive: true,
  },
  {
    id: '3',
    name: 'Ana Martínez',
    role: 'seller',
    email: 'ana@arcoiris.com',
    phone: '+57 300 345 6789',
    salary: 1200000,
    hireDate: new Date('2023-06-01'),
    isActive: true,
  },
  {
    id: '4',
    name: 'Pedro Sánchez',
    role: 'cashier',
    email: 'pedro@arcoiris.com',
    phone: '+57 300 456 7890',
    salary: 1000000,
    hireDate: new Date('2023-09-15'),
    isActive: true,
  },
]

export function EmployeesView() {
  const { employees, setEmployees } = useStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    role: 'seller' as Employee['role'],
    email: '',
    phone: '',
    salary: '',
  })

  const displayEmployees = employees.length > 0 ? employees : initialEmployees

  const filteredEmployees = displayEmployees.filter((emp) =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = () => {
    const newEmployee: Employee = {
      id: editingEmployee?.id || Date.now().toString(),
      name: formData.name,
      role: formData.role,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      salary: parseInt(formData.salary) || 0,
      hireDate: editingEmployee?.hireDate || new Date(),
      isActive: true,
    }

    if (editingEmployee) {
      setEmployees([...employees.map(e => e.id === editingEmployee.id ? newEmployee : e)])
    } else {
      setEmployees([...employees, newEmployee])
    }

    resetForm()
  }

  const resetForm = () => {
    setFormData({ name: '', role: 'seller', email: '', phone: '', salary: '' })
    setEditingEmployee(null)
    setIsAddOpen(false)
  }

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee)
    setFormData({
      name: employee.name,
      role: employee.role,
      email: employee.email || '',
      phone: employee.phone || '',
      salary: employee.salary.toString(),
    })
    setIsAddOpen(true)
  }

  const handleDelete = (id: string) => {
    setEmployees(employees.filter(e => e.id !== id))
  }

  const totalSalary = displayEmployees.reduce((sum, e) => sum + e.salary, 0)
  const activeCount = displayEmployees.filter(e => e.isActive).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Empleados</h1>
          <p className="text-muted-foreground">Gestiona tu equipo de trabajo</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Empleado
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}
              </DialogTitle>
              <DialogDescription>
                Complete la información del empleado
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Nombre</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nombre completo"
                />
              </div>
              <div className="grid gap-2">
                <Label>Rol</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value as Employee['role'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="manager">Gerente</SelectItem>
                    <SelectItem value="seller">Vendedor</SelectItem>
                    <SelectItem value="cashier">Cajero</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@ejemplo.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Teléfono</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+57 300 000 0000"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Salario</Label>
                <Input
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  placeholder="1200000"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>Cancelar</Button>
              <Button onClick={handleSubmit}>
                {editingEmployee ? 'Guardar Cambios' : 'Agregar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Empleados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayEmployees.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeCount} activos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nómina Mensual</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalSalary.toLocaleString('es-CO')}
            </div>
            <p className="text-xs text-muted-foreground">
              Salario total mensual
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio Salarial</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${Math.round(totalSalary / displayEmployees.length || 0).toLocaleString('es-CO')}
            </div>
            <p className="text-xs text-muted-foreground">
              Salario promedio
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar empleados..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEmployees.map((employee) => (
              <div
                key={employee.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-lg font-semibold">
                      {employee.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{employee.name}</span>
                      <Badge className={roleColors[employee.role]}>
                        {roleLabels[employee.role]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {employee.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {employee.email}
                        </span>
                      )}
                      {employee.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {employee.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-medium">
                      ${employee.salary.toLocaleString('es-CO')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Ingresó: {employee.hireDate.toLocaleDateString('es-CO')}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(employee)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(employee.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}