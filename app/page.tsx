'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import { Sidebar } from '@/components/sidebar'
import { SetupWizard } from '@/components/setup-wizard'
import { DashboardView } from '@/components/dashboard-view'
import { InventoryView } from '@/components/inventory-view'
import { CustomersView } from '@/components/customers-view'
import { POSView } from '@/components/pos-view'
import { EmployeesView } from '@/components/employees-view'
import { InvoicesView } from '@/components/invoices-view'
import { WhatsAppView } from '@/components/whatsapp-view'
import { SettingsView } from '@/components/settings-view'

export default function Home() {
  const { isFirstTime, activeTab } = useStore()

  if (isFirstTime) {
    return <SetupWizard />
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="pl-64">
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && <DashboardView />}
              {activeTab === 'inventory' && <InventoryView />}
              {activeTab === 'customers' && <CustomersView />}
              {activeTab === 'pos' && <POSView />}
              {activeTab === 'employees' && <EmployeesView />}
              {activeTab === 'invoices' && <InvoicesView />}
              {activeTab === 'whatsapp' && <WhatsAppView />}
              {activeTab === 'settings' && <SettingsView />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
