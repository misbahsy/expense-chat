"use client"

import { useState } from 'react'
import FileUpload from './components/FileUpload'
import ChatInterface from './components/ChatInterface'

export default function Home() {
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)

  return (
    <main className="min-h-screen py-8">
      <div className="chat-container px-4">
        <h1 className="text-4xl font-medium mb-8">Expense Chat</h1>
        
        <div className="space-y-6">
          {/* Upload Section */}
          <section className="border border-gray-200 rounded-lg p-6 bg-white">
            <h2 className="text-xl font-medium mb-4">Upload New Document</h2>
            <p className="text-gray-600 text-sm mb-4">
              Upload a PDF document to analyze. Processing typically takes 30-50 seconds depending on the file size.
            </p>
            <FileUpload setIsUploading={setIsUploading} />
            {isUploading && (
              <div className="mt-4 text-gray-600">
                <div className="animate-pulse">Processing your document... This may take 30-50 seconds.</div>
              </div>
            )}
          </section>

          {/* Chat Interface */}
          <ChatInterface
            selectedDocuments={selectedDocuments}
            onSelectionChange={setSelectedDocuments}
          />
        </div>
      </div>
    </main>
  )
}
