import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/db'
import { OCRResult } from '@/app/types'

const LANGFLOW_API_URL = 'https://api.langflow.astra.datastax.com/lf/0586a787-50ae-4a4e-aebe-866cf022aa5b/api/v1/run/72702e43-2772-46ab-a39d-2af8fb14c2b0'
const LANGFLOW_API_KEY = process.env.LANGFLOW_API_KEY

export async function POST(request: Request) {
  try {
    const { message, documentIds } = await request.json()

    if (!documentIds || documentIds.length === 0) {
      return NextResponse.json(
        { error: 'No documents selected' },
        { status: 400 }
      )
    }

    // Get OCR results for all selected documents
    const ocrResults = await prisma.oCRResult.findMany({
      where: {
        documentId: {
          in: documentIds
        }
      },
      include: {
        document: true
      }
    })

    if (ocrResults.length === 0) {
      return NextResponse.json(
        { error: 'No OCR results found for selected documents' },
        { status: 404 }
      )
    }

    // Combine content from all documents
    const documentContents = ocrResults.map(result => {
      const parsedResult = JSON.parse(result.content) as OCRResult
      return `Document: ${result.document.filename}\n${parsedResult.pages.map(page => page.content).join('\n\n')}`
    }).join('\n\n---\n\n')

    // Prepare the message with context
    const contextualMessage = `Context from documents:\n${documentContents}\n\nUser question: ${message}`

    console.log('Sending to Langflow:', contextualMessage)
    // Call Langflow API
    const response = await fetch(LANGFLOW_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LANGFLOW_API_KEY}`,
      },
      body: JSON.stringify({
        input_value: contextualMessage,
        output_type: 'chat',
        input_type: 'chat',
        tweaks: {},
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Langflow API error:', errorText)
      throw new Error(`Langflow API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Langflow response:', data)

    // Extract the AI message from the response
    const aiMessage = data.outputs[0].outputs[0].results.message.text

    return NextResponse.json({ message: aiMessage })
  } catch (error) {
    console.error('Error in chat:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error processing chat message' },
      { status: 500 }
    )
  }
} 