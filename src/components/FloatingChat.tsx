import React, { useState, useRef, useEffect } from 'react'
import { MessageSquare, ArrowLeft, Paperclip, Send, X } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  photo: string
  status: 'online' | 'offline'
  role: string
}

interface Message {
  id: string
  text?: string
  image?: string  
  file?: { name: string, url: string }
  sender: 'user' | 'staff'
  timestamp: Date
  keluarga_id?: string
  context?: string
}

interface KeluargaData {
  id: string
  no_kk: string
  kepala_keluarga: {
    nama: string
    nik: string
  }
  alamat: string
  jumlah_anggota: number
}

interface FloatingChatProps {
  keluargaData?: KeluargaData | null
  context?: 'keluarga' | 'warga' | 'surat' | 'general'
}

const STAFF_USERS: User[] = [
  {
    id: '1',
    name: 'Sarah Williams',
    email: 'sarah@nagari.id',
    photo: 'https://randomuser.me/api/portraits/women/68.jpg',
    status: 'online',
    role: 'Admin Kependudukan'
  },
  {
    id: '2',
    name: 'John Doe', 
    email: 'john@nagari.id',
    photo: 'https://randomuser.me/api/portraits/men/45.jpg',
    status: 'online',
    role: 'Staff Pelayanan'
  },
  {
    id: '3',
    name: 'Emily Clark',
    email: 'emily@nagari.id',
    photo: 'https://randomuser.me/api/portraits/women/21.jpg',
    status: 'offline',
    role: 'Kepala Nagari'
  },
  {
    id: '4',
    name: 'Ahmad Fauzi',
    email: 'ahmad@nagari.id',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    status: 'online',
    role: 'Sekretaris Nagari'
  }
]

export function FloatingChat({ keluargaData, context = 'general' }: FloatingChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentPanel, setCurrentPanel] = useState<'userList' | 'chatRoom'>('userList')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatBodyRef = useRef<HTMLDivElement>(null)

  const toggleChat = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      backToUserList()
    }
  }

  const openChatRoom = (user: User) => {
    setSelectedUser(user)
    setCurrentPanel('chatRoom')
    setMessages([])
    setMessageInput('')
    
    // Generate context-aware welcome message
    const contextMessage = generateContextMessage(user, context, keluargaData)
    
    setTimeout(() => {
      setMessages([contextMessage])
    }, 500)
  }

  const generateContextMessage = (user: User, context: string, data?: KeluargaData | null): Message => {
    let welcomeText = `Halo! Saya ${user.name} dari ${user.role}. `
    
    switch (context) {
      case 'keluarga':
        if (data) {
          welcomeText += `Saya lihat Anda sedang melihat data keluarga dengan No. KK ${data.no_kk} (${data.kepala_keluarga.nama}). Ada yang bisa saya bantu terkait data keluarga ini?`
        } else {
          welcomeText += `Ada yang bisa saya bantu terkait data kependudukan keluarga?`
        }
        break
      case 'warga':
        welcomeText += `Ada yang bisa saya bantu terkait data warga atau kependudukan?`
        break
      case 'surat':
        welcomeText += `Ada yang bisa saya bantu terkait pembuatan surat atau dokumen?`
        break
      default:
        welcomeText += `Ada yang bisa saya bantu hari ini?`
    }

    return {
      id: '1',
      text: welcomeText,
      sender: 'staff',
      timestamp: new Date(),
      keluarga_id: data?.id,
      context: context
    }
  }

  const backToUserList = () => {
    setCurrentPanel('userList')
    setSelectedUser(null)
    setMessages([])
    setMessageInput('')
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim() || !selectedUser || isLoading) return

    const newMessage: Message = {
      id: Date.now().toString(),
      text: messageInput.trim(),
      sender: 'user',
      timestamp: new Date(),
      keluarga_id: keluargaData?.id,
      context: context
    }

    setMessages(prev => [...prev, newMessage])
    setMessageInput('')
    setIsLoading(true)

    try {
      // Simulate API call to backend for context-aware response
      const response = await simulateStaffResponse(newMessage, selectedUser, context, keluargaData)
      
      setTimeout(() => {
        setMessages(prev => [...prev, response])
        setIsLoading(false)
      }, 1000 + Math.random() * 1000) // Simulate network delay
    } catch (error) {
      console.error('Error sending message:', error)
      setIsLoading(false)
    }
  }

  const simulateStaffResponse = async (
    userMessage: Message, 
    staff: User, 
    context: string, 
    data?: KeluargaData | null
  ): Promise<Message> => {
    const responses = {
      keluarga: [
        `Terkait data keluarga ${data?.kepala_keluarga.nama || 'ini'}, saya bisa membantu Anda dengan update data, penambahan anggota keluarga, atau pengecekan dokumen. Apa yang ingin Anda lakukan?`,
        `Untuk data keluarga dengan No. KK ${data?.no_kk || 'tersebut'}, apakah ada data yang perlu diperbaiki atau ditambahkan?`,
        `Saya bisa membantu Anda dengan proses administrasi keluarga. Apakah ada dokumen yang diperlukan?`
      ],
      warga: [
        `Terkait data warga, saya bisa membantu dengan pemutakhiran data, pengecekan NIK, atau penerbitan dokumen kependudukan.`,
        `Ada masalah dengan data warga yang perlu diselesaikan? Saya siap membantu.`
      ],
      surat: [
        `Untuk penerbitan surat, saya bisa membantu dengan surat keterangan, surat pengantar, atau dokumen administrasi lainnya.`,
        `Surat apa yang Anda butuhkan? Saya akan bantu proses pengurusannya.`
      ],
      general: [
        `Terima kasih atas pesannya. Saya akan membantu Anda dengan pertanyaan atau masalah yang ada.`,
        `Ada hal lain yang bisa saya bantu? Saya siap membantu dengan berbagai layanan nagari.`
      ]
    }

    const contextResponses = responses[context as keyof typeof responses] || responses.general
    const randomResponse = contextResponses[Math.floor(Math.random() * contextResponses.length)]

    return {
      id: (Date.now() + 1).toString(),
      text: randomResponse,
      sender: 'staff',
      timestamp: new Date(),
      keluarga_id: data?.id,
      context: context
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !selectedUser) return

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const newMessage: Message = {
            id: Date.now().toString(),
            image: e.target?.result as string,
            sender: 'user',
            timestamp: new Date(),
            keluarga_id: keluargaData?.id,
            context: context
          }
          setMessages(prev => [...prev, newMessage])

          // Auto reply
          setTimeout(() => {
            const reply: Message = {
              id: (Date.now() + 1).toString(),
              text: 'Terima kasih sudah mengirim gambar. Saya akan membantu memproses dokumen ini.',
              sender: 'staff',
              timestamp: new Date()
            }
            setMessages(prev => [...prev, reply])
          }, 1000)
        }
        reader.readAsDataURL(file)
      } else {
        const newMessage: Message = {
          id: Date.now().toString(),
          file: { name: file.name, url: URL.createObjectURL(file) },
          sender: 'user',
          timestamp: new Date(),
          keluarga_id: keluargaData?.id,
          context: context
        }
        setMessages(prev => [...prev, newMessage])

        // Auto reply
        setTimeout(() => {
          const reply: Message = {
            id: (Date.now() + 1).toString(),
            text: 'Dokumen sudah saya terima. Saya akan review dan berikan feedback segera.',
            sender: 'staff',
            timestamp: new Date()
          }
          setMessages(prev => [...prev, reply])
        }, 1000)
      }
    })

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div>
      {/* Floating Chat Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-5 right-5 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center z-50 group"
        aria-label="Buka chat bantuan"
      >
        <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
        {context !== 'general' && (
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">!</span>
          </div>
        )}
      </button>

      {/* Chatbox */}
      {isOpen && (
        <div 
          className="fixed bottom-24 right-5 w-[22rem] h-[500px] bg-white rounded-xl flex flex-col overflow-hidden text-sm text-gray-800 shadow-2xl z-40 border border-gray-200"
          role="region"
          aria-live="polite"
          aria-label="Chat bantuan dengan staff"
        >
          
          {/* Context Info Bar */}
          {context !== 'general' && keluargaData && (
            <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 text-xs text-blue-700">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-3 h-3" />
                <span className="font-medium">Bantuan: {context === 'keluarga' ? 'Data Keluarga' : context}</span>
              </div>
              {keluargaData && (
                <div className="mt-1 text-blue-600">
                  KK: {keluargaData.no_kk} - {keluargaData.kepala_keluarga.nama}
                </div>
              )}
            </div>
          )}
          
          {/* User List Panel */}
          {currentPanel === 'userList' && (
            <div className="panel flex flex-col h-full">
              <header className="bg-green-500 text-white font-bold text-lg select-none flex-shrink-0 flex items-center justify-between h-12 px-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>Bantuan Staff</span>
                </div>
                <button
                  onClick={toggleChat}
                  className="hover:bg-green-600 rounded-full p-1 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </header>
              <div className="flex-1 flex flex-col overflow-y-auto bg-white">
                <div className="p-3 bg-gray-50 border-b text-xs text-gray-600">
                  Pilih staff untuk mendapatkan bantuan sesuai kebutuhan Anda
                </div>
                {STAFF_USERS.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => openChatRoom(user)}
                    className="w-full grid grid-cols-[48px_1fr_auto] items-center p-3 border-b border-gray-200 cursor-pointer transition-colors duration-200 hover:bg-green-50 group"
                    role="listitem"
                    tabIndex={0}
                  >
                    <div className="relative">
                      <img 
                        src={user.photo} 
                        alt={`Foto ${user.name}`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                        user.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    </div>
                    <div className="pl-3 min-w-0">
                      <div className="font-semibold text-gray-800 truncate group-hover:text-green-700">
                        {user.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {user.role}
                      </div>
                    </div>
                    <div className="flex flex-col items-end text-xs">
                      <span className={`font-medium ${
                        user.status === 'online' ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {user.status === 'online' ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chat Room Panel */}
          {currentPanel === 'chatRoom' && selectedUser && (
            <div className="panel flex flex-col h-full">
              
              {/* Chat Header */}
              <header 
                className="bg-green-500 text-white font-bold text-lg select-none flex-shrink-0 flex items-center h-12 px-4 gap-2"
              >
                <button
                  onClick={backToUserList}
                  className="bg-none border-none text-white text-2xl cursor-pointer w-8 h-8 leading-8 select-none transition-colors duration-200 p-0 m-0 flex items-center justify-center rounded-md hover:bg-white/20"
                  aria-label="Kembali ke daftar user"
                >
                  ←
                </button>
                <img 
                  src={selectedUser.photo}
                  alt={selectedUser.name}
                  className="w-9 h-9 rounded-full object-cover border-2 border-white select-none"
                />
                <div className="font-semibold text-base whitespace-nowrap overflow-hidden text-ellipsis">
                  {selectedUser.name}
                </div>
              </header>

              {/* Chat Body */}
              <div
                ref={chatBodyRef}
                className="flex-1 bg-gray-100 overflow-y-auto flex flex-col p-3 gap-2"
                role="log"
                aria-live="polite"
                aria-relevant="additions"
              >
                {messages.length === 0 && (
                  <div className="text-gray-500 italic text-center mt-4 text-sm">
                    Mulai percakapan dengan {selectedUser.name}.
                  </div>
                )}
                
                {messages.map((message) => (
                  <div key={message.id} className={message.sender === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                    {message.text && (
                      <div className={`max-w-[75%] px-3 py-2 rounded-full text-sm leading-5 break-words whitespace-pre-wrap shadow-sm m-0 ${
                        message.sender === 'user' 
                          ? 'bg-green-100 rounded-tr-none text-green-800 font-semibold' 
                          : 'bg-white border border-gray-300 rounded-tl-none text-gray-700'
                      }`}>
                        {message.text}
                      </div>
                    )}
                    {message.image && (
                      <img 
                        src={message.image} 
                        alt="Gambar yang dikirim"
                        className="max-w-[70%] rounded-xl mb-2 shadow-sm"
                      />
                    )}
                    {message.file && (
                      <div className="flex items-center gap-2 max-w-[70%] bg-green-100 rounded-full px-3 py-2 font-semibold text-green-800">
                        <span>📄</span>
                        <span className="break-all">{message.file.name}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Chat Footer */}
              <form 
                onSubmit={sendMessage}
                className="bg-white border-t border-gray-200 flex flex-shrink-0 gap-2 p-3 items-center"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-none border-none text-xl cursor-pointer text-green-500 px-2 select-none transition-colors duration-200 rounded-full flex items-center justify-center hover:text-green-600"
                >
                  📎
                </button>
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Ketik pesan..."
                  className="flex-1 px-3 py-2 text-sm rounded-full border border-gray-300 focus:outline-green-500 focus:border-green-500"
                  autoComplete="off"
                  required
                />
                <button
                  type="submit"
                  className="bg-green-500 border-none text-white font-bold text-sm px-4 py-2 rounded-full cursor-pointer transition-colors duration-200 hover:bg-green-600"
                >
                  Kirim
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
