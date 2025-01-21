import { openDB } from 'idb'

const DB_NAME = 'expense-chat-db'
const DB_VERSION = 1

export async function initDB() {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('documents')) {
        db.createObjectStore('documents', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('ocrResults')) {
        db.createObjectStore('ocrResults', { keyPath: 'id' })
      }
    },
  })
  return db
}

export async function storeDocument(document: { id: string; filename: string; content: string }) {
  const db = await initDB()
  await db.put('documents', document)
}

export async function storeOCRResult(result: { id: string; documentId: string; content: string }) {
  const db = await initDB()
  await db.put('ocrResults', result)
}

export async function getDocument(id: string) {
  const db = await initDB()
  return db.get('documents', id)
}

export async function getOCRResult(id: string) {
  const db = await initDB()
  return db.get('ocrResults', id)
}

export async function getAllDocuments() {
  const db = await initDB()
  return db.getAll('documents')
}

export async function getAllOCRResults() {
  const db = await initDB()
  return db.getAll('ocrResults')
} 