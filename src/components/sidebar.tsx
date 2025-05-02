"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  MailPlus,
  Users,
  Settings,
  Mail,
  Link as LinkIcon,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      color: "text-sky-500",
    },
    {
      label: "Campaigns",
      icon: MailPlus,
      href: "/campaigns",
      color: "text-violet-500",
    },
    {
      label: "Emails",
      icon: Mail,
      href: "/mailbox",
      color: "text-pink-700",
    },
    {
      label: "Contacts",
      icon: Users,
      href: "/contacts",
      color: "text-orange-500",
    },
    {
      label: "URLs",
      icon: LinkIcon,
      href: "/urls",
      color: "text-emerald-500",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings",
    },
  ];

  return (
    <>
      <div className="md:hidden block absolute left-4 top-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>
      <div
        className={cn(
          "pb-12 w-64 bg-muted/40 border-r md:block transition-all duration-300",
          isOpen ? "block fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" : "hidden"
        )}
      >
        <div className="space-y-4 py-4">
          <div className="px-4 py-2">
            <h2 className="mb-2 px-2 text-xl font-semibold tracking-tight">
              INGREN
            </h2>
            <div className="space-y-1">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                    pathname === route.href
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-primary hover:bg-accent/50"
                  )}
                >
                  {route.icon && (
                    <route.icon
                      className={cn("mr-2 h-4 w-4", route.color)}
                    />
                  )}
                  {route.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}