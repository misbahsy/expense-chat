"use client"

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion } from "framer-motion"
import { Input } from "./ui/input"
import { storeDocument, storeOCRResult } from "../lib/indexedDB"
import ReactMarkdown from 'react-markdown'
import { OCRResult } from '@/app/types'
import OCRResultPopup from './OCRResultPopup'

interface FileUploadProps {
  setIsUploading: (isUploading: boolean) => void
}

export default function FileUpload({ setIsUploading }: FileUploadProps) {
  const [error, setError] = useState<string | null>(null)
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setError(null)
    setIsUploading(true)
    setOcrResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/process-pdf', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to process PDF')
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error('Failed to process PDF')
      }

      // Parse and show OCR result
      if (data.document?.ocrResult?.content) {
        const result = JSON.parse(data.document.ocrResult.content)
        setOcrResult(result)
      }
    } catch (err) {
      console.error('Error uploading file:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload file')
    } finally {
      setIsUploading(false)
    }
  }, [setIsUploading])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
  })

  return (
    <div>
      <div
        {...getRootProps()}
        className={`p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-yellow-400 bg-yellow-400/10' 
            : 'border-gray-600 hover:border-green-400 hover:bg-green-100'
          }`}
      >
        <input {...getInputProps()} />
        <p className="text-gray-300">
          {isDragActive
            ? 'Drop the PDF here'
            : 'Drag & drop a PDF here, or click to select'}
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Only PDF files are accepted
        </p>
      </div>
      
      {error && (
        <div className="mt-4 text-red-400 text-sm">
          Error: {error}
        </div>
      )}

      {ocrResult && (
        <OCRResultPopup
          result={ocrResult}
          onClose={() => setOcrResult(null)}
          isNewDocument={true}
        />
      )}
    </div>
  )
} 