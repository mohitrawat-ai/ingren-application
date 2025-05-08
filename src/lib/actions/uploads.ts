// src/lib/actions/uploads.ts
"use server";

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { auth } from "@/lib/auth";
import { CSVContact } from "@/components/campaign/targeting-form/types";
import * as Papa from 'papaparse';
import fs from 'fs';

// Ensure uploads directory exists
const ensureUploadsDir = async () => {
  const dir = join(process.cwd(), 'uploads');
  try {
    await mkdir(dir, { recursive: true });
  } catch (error) {
    console.error('Error creating uploads directory:', error);
  }
  return dir;
};

export async function saveCSVFile(fileBuffer: ArrayBuffer): Promise<{ filePath: string, fileName: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const uploadsDir = await ensureUploadsDir();
  const fileName = `${session.user.id}_${uuidv4()}.csv`;
  const filePath = join(uploadsDir, fileName);

  try {
    await writeFile(filePath, Buffer.from(fileBuffer));
    return { filePath, fileName };
  } catch (error) {
    console.error('Error saving file:', error);
    throw new Error('Failed to save file');
  }
}

export async function parseCSVFile(filePath: string): Promise<CSVContact[]> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    const csvText = fs.readFileSync(filePath, 'utf8');
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          const data = results.data as CSVContact[];
          
          // Validate required fields
          const validData = data.filter(row => 
            row.name && row.title && row.company
          );
          
          resolve(validData);
        },
        error: (error: unknown) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error parsing CSV file:', error);
    throw new Error('Failed to parse CSV file');
  }
}