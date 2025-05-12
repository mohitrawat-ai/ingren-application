import "@/styles/globals.css";
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "@/components/session-provider";
import { ensureAppInitialized } from "@/lib/config/appInitializer";

const fontSans = FontSans({ 
  subsets: ["latin"], 
  variable: "--font-sans" 
});

export const metadata = {
  title: "Ingren - Sales Campaign Platform",
  description: "A modern sales campaign management platform",
};


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Wait for initialization to complete
  await ensureAppInitialized();
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}