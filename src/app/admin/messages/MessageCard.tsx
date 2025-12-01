'use client'

// Mesaj Kartı Komponenti
// (Message Card Component)

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Mail, 
  MailOpen, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Trash2,
  Loader2,
  User,
  AtSign
} from 'lucide-react'

interface Message {
  id: string
  name: string
  email: string
  subject: string
  message: string
  is_read: boolean
  created_at: string
}

export default function MessageCard({ message }: { message: Message }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isRead, setIsRead] = useState(message.is_read)
  const [loading, setLoading] = useState(false)
  const [deleted, setDeleted] = useState(false)

  const handleMarkAsRead = async () => {
    if (isRead) return
    
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('contact_messages')
        .update({ is_read: true })
        .eq('id', message.id)

      if (error) throw error
      setIsRead(true)
    } catch (error) {
      console.error('Okundu işaretleme hatası:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Bu mesajı silmek istediğinize emin misiniz?')) return
    
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', message.id)

      if (error) throw error
      setDeleted(true)
    } catch (error) {
      console.error('Silme hatası:', error)
      alert('Mesaj silinemedi')
    } finally {
      setLoading(false)
    }
  }

  // Silindiyse gösterme
  if (deleted) return null

  return (
    <div 
      className={`bg-white rounded-xl border transition-all ${
        isRead ? 'border-gray-200' : 'border-blue-200 bg-blue-50/30'
      }`}
    >
      {/* Mesaj Başlığı (Message Header) */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => {
          setIsExpanded(!isExpanded)
          if (!isRead) handleMarkAsRead()
        }}
      >
        <div className="flex items-center gap-4">
          {/* Okundu/Okunmadı İkonu */}
          <div className={`p-2 rounded-lg ${isRead ? 'bg-gray-100' : 'bg-blue-100'}`}>
            {isRead ? (
              <MailOpen className="w-5 h-5 text-gray-500" />
            ) : (
              <Mail className="w-5 h-5 text-blue-600" />
            )}
          </div>

          {/* Gönderen Bilgisi */}
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`font-medium ${isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                {message.subject || 'Konu Yok'}
              </h3>
              {!isRead && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                  Yeni
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {message.name}
              </span>
              <span className="flex items-center gap-1">
                <AtSign className="w-3 h-3" />
                {message.email}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Tarih */}
          <div className="flex items-center gap-1 text-sm text-gray-400">
            <Clock className="w-4 h-4" />
            {new Date(message.created_at).toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>

          {/* Genişlet/Daralt */}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Mesaj İçeriği (Message Content) */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="pt-4">
            <p className="text-gray-700 whitespace-pre-wrap">{message.message}</p>
          </div>

          {/* Aksiyonlar (Actions) */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <a
              href={`mailto:${message.email}?subject=Re: ${message.subject}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Yanıtla
            </a>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Sil
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

