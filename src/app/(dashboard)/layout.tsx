import { Sidebar } from "@/components/sidebar";
import { DashboardHeader } from "@/components/dashboard-header"
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { QueryProvider } from "@/providers/query-provider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={session.user} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          <QueryProvider>
            {children}
          </QueryProvider>
        </main>
      </div>
    </div>
  );
}