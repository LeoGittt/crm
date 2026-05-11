'use client'

import { useState, useMemo } from 'react'
import { Search, MessageCircle, Send, Phone, MoreVertical } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useStore } from '@/lib/store'

interface Message {
  id: string
  text: string
  timestamp: Date
  sent: boolean
}

interface Conversation {
  customerId: string
  customerName: string
  whatsapp: string
  messages: Message[]
}

export function WhatsAppView() {
  const { customers } = useStore()
  const [selectedCustomer, setSelectedCustomer] = useState<Conversation | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [messageText, setMessageText] = useState('')

  const conversations = useMemo(() => {
    return customers.map(customer => ({
      customerId: customer.id,
      customerName: customer.name,
      whatsapp: customer.whatsapp,
      messages: [] as Message[],
    }))
  }, [customers])

  const filteredConversations = conversations.filter(conv =>
    conv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.whatsapp.includes(searchTerm)
  )

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedCustomer) return

    const whatsappNumber = selectedCustomer.whatsapp.replace(/\D/g, '')
    const encodedMessage = encodeURIComponent(messageText)
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank')
    
    setMessageText('')
  }

  const handleOpenChat = (conversation: Conversation) => {
    setSelectedCustomer(conversation)
  }

  const openWhatsAppWeb = (whatsapp: string) => {
    const number = whatsapp.replace(/\D/g, '')
    window.open(`https://web.whatsapp.com/open?phone=${number}`, '_blank')
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-6">
      {/* Contact List */}
      <Card className="w-80 flex-shrink-0 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            WhatsApp
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar contactos..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto p-0">
          <ScrollArea className="h-full">
            {filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                {customers.length === 0 
                  ? 'No hay clientes registrados' 
                  : 'No hay resultados'}
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {filteredConversations.map((conversation) => (
                  <button
                    key={conversation.customerId}
                    onClick={() => handleOpenChat(conversation)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                      selectedCustomer?.customerId === conversation.customerId
                        ? 'bg-green-500/10'
                        : 'hover:bg-accent'
                    }`}
                  >
                    <div className="relative">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white font-semibold">
                        {conversation.customerName.charAt(0).toUpperCase()}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 rounded-full border-2 border-background bg-green-500"></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate">{conversation.customerName}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.whatsapp}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col">
        {selectedCustomer ? (
          <>
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white font-semibold">
                    {selectedCustomer.customerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <CardTitle className="text-base">{selectedCustomer.customerName}</CardTitle>
                    <p className="text-sm text-muted-foreground">{selectedCustomer.whatsapp}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openWhatsAppWeb(selectedCustomer.whatsapp)}
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    WhatsApp Web
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
              <div className="flex-1 bg-green-50/50 p-6 flex items-center justify-center">
                <div className="text-center space-y-4 max-w-md">
                  <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <MessageCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium">Chat con {selectedCustomer.customerName}</h3>
                  <p className="text-sm text-muted-foreground">
                    Escribe tu mensaje y será abierto en WhatsApp para enviarlo directamente.
                  </p>
                </div>
              </div>

              <div className="p-4 border-t bg-background">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Escribe un mensaje para WhatsApp..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  El mensaje se abrirá en WhatsApp para que lo envíes
                </p>
              </div>
            </CardContent>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <MessageCircle className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-medium">Selecciona un contacto</h3>
              <p className="text-muted-foreground max-w-sm">
                Elige un cliente de la lista para iniciar una conversación de WhatsApp
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}