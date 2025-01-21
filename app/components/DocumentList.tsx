"use client"

import { useState, useEffect } from 'react'
import { Document, OCRResult } from '@/app/types'
import OCRResultPopup from './OCRResultPopup'

interface DocumentListProps {
  selectedDocuments: string[]
  onSelectionChange: (documentIds: string[]) => void
}

export default function DocumentList({ selectedDocuments, onSelectionChange }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewingResult, setViewingResult] = useState<OCRResult | null>(null)

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents')
      if (!response.ok) {
        throw new Error('Failed to fetch documents')
      }
      const data = await response.json()
      setDocuments(data.documents)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  const toggleDocument = (documentId: string) => {
    const newSelection = selectedDocuments.includes(documentId)
      ? selectedDocuments.filter(id => id !== documentId)
      : [...selectedDocuments, documentId]
    onSelectionChange(newSelection)
  }

  const handleViewResult = async (documentId: string) => {
    try {
      const document = documents.find(doc => doc.id === documentId)
      if (document?.ocrResult) {
        const result = JSON.parse(document.ocrResult.content) as OCRResult
        setViewingResult(result)
      }
    } catch (err) {
      console.error('Error parsing OCR result:', err)
    }
  }

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete document')
      }

      if (data.success) {
        // Remove from selected documents if it was selected
        if (selectedDocuments.includes(documentId)) {
          onSelectionChange(selectedDocuments.filter(id => id !== documentId))
        }

        // Update local documents list
        setDocuments(prev => prev.filter(doc => doc.id !== documentId))
      } else {
        throw new Error('Failed to delete document')
      }
    } catch (err) {
      console.error('Error deleting document:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete document')
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000)
    }
  }

  if (isLoading) {
    return <div className="text-gray-400">Loading documents...</div>
  }

  if (error) {
    return <div className="text-red-400">Error: {error}</div>
  }

  if (documents.length === 0) {
    return <div className="text-gray-400">No documents found. Upload some PDFs first.</div>
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-medium">Selected Documents</h3>
        <button
          onClick={fetchDocuments}
          className="btn btn-secondary flex items-center gap-1"
          title="Refresh document list"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
      <div className="space-y-1">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="document-item"
          >
            <input
              type="checkbox"
              id={doc.id}
              checked={selectedDocuments.includes(doc.id)}
              onChange={() => toggleDocument(doc.id)}
              className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
            />
            <label
              htmlFor={doc.id}
              className="flex-1 text-gray-700 hover:text-black cursor-pointer"
            >
              {doc.filename}
              <span className="text-xs text-gray-500 ml-2">
                {new Date(doc.createdAt).toLocaleDateString()}
              </span>
            </label>
            <div className="document-actions">
              <button
                onClick={() => handleViewResult(doc.id)}
                className="btn btn-secondary"
                title="View OCR Result"
              >
                View
              </button>
              <button
                onClick={() => handleDelete(doc.id)}
                className="btn btn-danger"
                title="Delete Document"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {viewingResult && (
        <OCRResultPopup
          result={viewingResult}
          onClose={() => setViewingResult(null)}
          isNewDocument={false}
        />
      )}
    </div>
  )
} 