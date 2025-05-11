import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();
  
  // Redirect based on authentication status
  if (!session?.user) {
    redirect("/login");
  } else {
    redirect("/dashboard");
  }
  
  // This return statement is unreachable but needed for TypeScript
  return null;
}