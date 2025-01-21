import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/db'

interface RouteParams {
  params: {
    id: string
  }
}

export async function DELETE(
  request: Request,
  { params }: RouteParams
) {
  if (!params?.id) {
    return NextResponse.json(
      { error: 'Document ID is required' },
      { status: 400 }
    )
  }

  try {
    // First delete the OCR result
    await prisma.oCRResult.deleteMany({
      where: {
        documentId: params.id
      }
    })

    // Then delete the document
    await prisma.document.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    )
  }
} 