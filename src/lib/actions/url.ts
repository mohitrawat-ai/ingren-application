"use server";

import { revalidatePath } from "next/cache";
import { db as dbClient} from "@/lib/db";
import { auth } from "@/lib/auth";
import { urls } from "@/lib/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const db = await dbClient();


// Get all URLs
export async function getUrls() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return await db.select().from(urls);
}

// Create a new URL
export async function createUrl(url: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const id = crypto.createHash("md5").update(url).digest("hex");
  
  // Generate a simple summary (in a real app, this would call an API)
  const summaries = [
    "A comprehensive guide to web development best practices.",
    "An insightful article about recent market trends.",
    "A detailed product specification document with technical information.",
    "A thought-provoking blog post about industry innovations.",
    "A useful resource for implementation strategies and techniques.",
  ];
  const summary = summaries[Math.floor(Math.random() * summaries.length)];

  const [newUrl] = await db
    .insert(urls)
    .values({ id, url, summary })
    .returning();

  revalidatePath("/urls");
  return newUrl;
}

// Delete a URL
export async function deleteUrl(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await db.delete(urls).where(eq(urls.id, id));

  revalidatePath("/urls");
}