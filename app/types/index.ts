export interface Page {
  content: string;
  page: number;
  contentLength: number;
}

export interface Summary {
  failedPages: number;
  successfulPages: number;
  totalPages: number;
}

export interface OCRResult {
  completionTime: number;
  fileName: string;
  inputTokens: number;
  outputTokens: number;
  pages: Page[];
  summary: Summary;
}

export interface Document {
  id: string;
  filename: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  ocrResult?: {
    id: string;
    content: string;
    documentId: string;
    createdAt: Date;
    updatedAt: Date;
  };
} 