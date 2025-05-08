// src/lib/utils/file.ts
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const stat = promisify(fs.stat);

/**
 * Checks if a file exists and is accessible
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath);
    return true;
  } catch (error: unknown) {
    console.error('Error checking file existence:', error);
    return false;
  }
}

/**
 * Gets the MIME type based on file extension
 */
export function getMimeType(filePath: string): string {
  const extension = path.extname(filePath).toLowerCase();
  
  const mimeTypes: Record<string, string> = {
    '.csv': 'text/csv',
    '.json': 'application/json',
    '.txt': 'text/plain',
    '.pdf': 'application/pdf',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.xls': 'application/vnd.ms-excel',
  };
  
  return mimeTypes[extension] || 'application/octet-stream';
}

/**
 * Reads a file and returns its contents as a Buffer
 */
export async function readFileBuffer(filePath: string): Promise<Buffer> {
  if (!(await fileExists(filePath))) {
    throw new Error(`File not found: ${filePath}`);
  }
  
  return readFile(filePath);
}

/**
 * Generates a safe filename from a potentially unsafe one
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9_.-]/g, '_') // Replace unsafe characters with underscores
    .replace(/_{2,}/g, '_'); // Replace multiple consecutive underscores with a single one
}