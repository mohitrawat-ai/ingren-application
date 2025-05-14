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

// src/lib/actions/uploads.ts (parseCSVFile function)

const expectedColumns = ["first_name","last_name","job_title","department","tenure_months","notable_achievement","company_name","industry","employee_count","annual_revenue","funding_stage","growth_signals","recent_news","technography","description","name","title","company","email","city","state","country"]
function getDefaultValue(column: string) {
  if(column === "tenure_months") {
    return 0
  }
  return ""
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
        dynamicTyping: function(columnName) {
          return columnName !== "employee_count"; // all except this one are typed
        },
        complete: (results) => {
          const data = results.data as CSVContact[];
          
          // Validate that we have at least minimal info to identify contacts
          const validData = data.filter(row => {
            // Check if we have either name or first_name & last_name
            const hasName = row.name || (row.first_name && row.last_name);

            // Check if we have email
            const hasEmail = row.email;
            
            return hasName && hasEmail;
          });

          const resolvedData = validData.map(row => {
          const newRow = { ...row };
          for (const col of expectedColumns) {
            if (!(col in newRow) || newRow[col] === undefined || newRow[col] === null) {
              newRow[col] = getDefaultValue(col);
            }
          }
            return newRow;
           });
          
          resolve(resolvedData);
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