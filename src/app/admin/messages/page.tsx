// Admin Messages Page
// İletişim mesajları yönetimi sayfası

import { createClient } from '@/lib/supabase/server'
import { 
  Mail, 
  MailOpen, 
  Clock, 
  CheckCircle,
  Filter,
  Inbox
} from 'lucide-react'
import MessageCard from './MessageCard'

// Sayfa parametreleri için tip
interface PageProps {
  searchParams: Promise<{ filter?: string }>
}

export default async function AdminMessagesPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const params = await searchParams
  const filter = params.filter

  // Mesajları çek (Fetch messages)
  let query = supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })

  if (filter === 'unread') {
    query = query.eq('is_read', false)
  } else if (filter === 'read') {
    query = query.eq('is_read', true)
  }

  const { data: messages } = await query

  // İstatistikler (Stats)
  const stats = {
    total: messages?.length || 0,
    unread: messages?.filter(m => !m.is_read).length || 0,
    read: messages?.filter(m => m.is_read).length || 0,
  }

  return (
    <div>
      {/* Başlık ve İstatistikler (Header and Stats) */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">İletişim Mesajları</h1>
          <p className="text-gray-500 mt-1">İletişim formundan gelen mesajları yönetin</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg">
            <Inbox className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-gray-900">{stats.total}</span>
            <span className="text-gray-500">mesaj</span>
          </div>
          {stats.unread > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <Mail className="w-5 h-5 text-blue-500" />
              <span className="font-medium text-blue-700">{stats.unread}</span>
              <span className="text-blue-600">okunmamış</span>
            </div>
          )}
        </div>
      </div>

      {/* Filtreler (Filters) */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          <Filter className="w-4 h-4 text-gray-400" />
          <a
            href="/admin/messages"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              !filter ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Tümü ({stats.total})
          </a>
          <a
            href="/admin/messages?filter=unread"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === 'unread' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Okunmamış ({stats.unread})
          </a>
          <a
            href="/admin/messages?filter=read"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === 'read' ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Okunmuş ({stats.read})
          </a>
        </div>
      </div>

      {/* Mesaj Listesi (Message List) */}
      <div className="space-y-4">
        {(messages || []).map((message) => (
          <MessageCard key={message.id} message={message} />
        ))}
      </div>

      {/* Boş durum (Empty state) */}
      {(!messages || messages.length === 0) && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {filter === 'unread' ? 'Okunmamış mesaj yok' : 'Henüz mesaj yok'}
          </p>
        </div>
      )}
    </div>
  )
}

