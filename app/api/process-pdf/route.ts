import { NextResponse } from 'next/server'
import { zerox } from 'zerox'
import { prisma } from '@/app/lib/db'
import path from 'path'
import fs from 'fs'
import os from 'os'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Convert File to buffer for zerox processing
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Create a temporary directory
    const tempDir = path.join(os.tmpdir(), 'expense-chat-' + Date.now())
    fs.mkdirSync(tempDir, { recursive: true })
    
    // Save to temporary file
    const tempFilePath = path.join(tempDir, file.name)
    fs.writeFileSync(tempFilePath, buffer)

    console.log('Processing PDF with Zerox...')
    // Process with Zerox
    const result = await zerox({
      filePath: tempFilePath,
      openaiAPIKey: process.env.OPENAI_API_KEY!,
      cleanup: true,
      tempDir: tempDir,
      maintainFormat: true,
      model: 'gpt-4o-mini',
      maxTesseractWorkers: 1,
      correctOrientation: true,
      trimEdges: true
    })

    console.log('Zerox result:', JSON.stringify(result, null, 2))

    if (!result || !result.pages) {
      throw new Error('Invalid OCR result format')
    }

    // Clean up temp directory
    fs.rmSync(tempDir, { recursive: true, force: true })

    // Create a properly formatted result
    const formattedResult = {
      completionTime: result.completionTime || 0,
      fileName: file.name,
      inputTokens: result.inputTokens || 0,
      outputTokens: result.outputTokens || 0,
      pages: result.pages.map(page => ({
        content: page.content || '',
        page: page.page || 1,
        contentLength: page.content?.length || 0
      })),
      summary: {
        failedPages: 0,
        successfulPages: result.pages.length,
        totalPages: result.pages.length
      }
    }

    // Save to database
    const document = await prisma.document.create({
      data: {
        filename: file.name,
        content: buffer.toString('base64'),
        ocrResult: {
          create: {
            content: JSON.stringify(formattedResult),
          },
        },
      },
      include: {
        ocrResult: true,
      },
    })

    return NextResponse.json({ success: true, document })
  } catch (error) {
    console.error('Error processing PDF:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error processing PDF' },
      { status: 500 }
    )
  }
} 