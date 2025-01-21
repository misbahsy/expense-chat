"use client"

import { OCRResult } from '@/app/types'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface OCRResultPopupProps {
  result: OCRResult
  onClose: () => void
  isNewDocument?: boolean // Optional prop to indicate if this is a new document
}

export default function OCRResultPopup({ 
  result, 
  onClose,
  isNewDocument = false // Defaults to false for existing documents
}: OCRResultPopupProps) {
  const handleAddToList = () => {
    // Close popup and reload page
    onClose()
    window.location.reload()
  }

  return (
    <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-medium">OCR Result</h2>
          <div className="flex items-center gap-4">
            {isNewDocument && (
              <button
                onClick={handleAddToList}
                className="btn btn-primary"
              >
                Add Document to List
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div>
              <p><span className="font-medium">File Name:</span> {result.fileName}</p>
              <p><span className="font-medium">Completion Time:</span> {result.completionTime}ms</p>
            </div>
            <div>
              <p><span className="font-medium">Input Tokens:</span> {result.inputTokens}</p>
              <p><span className="font-medium">Output Tokens:</span> {result.outputTokens}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-4">Document Content</h3>
            {result.pages?.map((page, index) => (
              <div key={index} className="mb-4">
                <div className="text-sm text-gray-500 mb-2">Page {page.page}</div>
                <div className="prose max-w-none">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      table: ({ node, ...props }) => (
                        <table className="border-collapse border border-gray-200" {...props} />
                      ),
                      td: ({ node, ...props }) => (
                        <td className="border border-gray-200 px-4 py-2" {...props} />
                      ),
                      th: ({ node, ...props }) => (
                        <th className="border border-gray-200 px-4 py-2 bg-gray-50" {...props} />
                      ),
                    }}
                  >
                    {page.content || ''}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t mt-6 pt-4">
            <h3 className="text-lg font-medium mb-2">Summary</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <p><span className="font-medium">Total Pages:</span> {result.summary?.totalPages}</p>
              <p><span className="font-medium">Successful:</span> {result.summary?.successfulPages}</p>
              <p><span className="font-medium">Failed:</span> {result.summary?.failedPages}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 