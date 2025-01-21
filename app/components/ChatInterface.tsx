"use client"

import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import DocumentList from './DocumentList'

interface Message {
  role: 'user' | 'ai'
  content: string
}

interface ChatInterfaceProps {
  selectedDocuments: string[]
  onSelectionChange: (documentIds: string[]) => void
}

export default function ChatInterface({ 
  selectedDocuments, 
  onSelectionChange 
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || selectedDocuments.length === 0) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          documentIds: selectedDocuments,
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response')
      }

      setMessages(prev => [...prev, { role: 'ai', content: data.message }])
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: 'Sorry, I encountered an error processing your request.' 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <DocumentList
        selectedDocuments={selectedDocuments}
        onSelectionChange={onSelectionChange}
      />
      
      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-medium">Chat with AI</h2>
        </div>

        <div className="flex flex-col h-[600px]">
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-gray-300 text-gray-800' // lighter color for user messages
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="text-sm mb-1 opacity-75">
                    {message.role === 'user' ? 'You' : 'AI'}
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg p-4 bg-gray-100">
                  <div className="text-sm mb-1 opacity-75">AI</div>
                  <div className="animate-pulse">Thinking...</div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your expenses..."
                className="input-field"
              />
              <button
                type="submit"
                disabled={isLoading || selectedDocuments.length === 0}
                className="btn btn-primary whitespace-nowrap"
              >
                Send
              </button>
            </div>
            {selectedDocuments.length === 0 && (
              <p className="mt-2 text-sm text-gray-500">
                Please select at least one document to start chatting.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  )
} 