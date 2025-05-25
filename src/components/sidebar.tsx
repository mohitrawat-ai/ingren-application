// src/components/sidebar.tsx
"use client";

import { useState, useEffect } from "react";
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
  ChevronLeft,
  ChevronRight,
  Building,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Handle screen resize to update mobile state
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      // Reset sidebar to open state when transitioning from mobile to desktop
      if (window.innerWidth >= 768) {
        setIsOpen(true);
      }
    };

    // Set initial value
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      label: "Profiles",
      icon: UserCheck,
      href: "/profile-lists",
      color: "text-green-500",
    },
    {
      label: "Company Lists",
      icon: Building,
      href: "/company-lists",
      color: "text-blue-500",
    },
    {
      label: "Prospect Lists",
      icon: Users,
      href: "/prospect-lists",
      color: "text-orange-500",
    },
    {
      label: "Resource Hub",
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
      {/* Mobile menu button */}
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

      {/* Desktop collapse button */}
      <div className="hidden md:block absolute left-4 bottom-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full bg-background shadow-md"
        >
          {isOpen ? (
            <ChevronLeft className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "pb-12 bg-muted/40 border-r transition-all duration-300 h-full",
          isOpen
            ? isMobile
              ? "fixed inset-0 z-40 w-full bg-background/80 backdrop-blur-sm md:w-64 md:relative"
              : "w-64"
            : isMobile
            ? "hidden"
            : "w-20"
        )}
      >
        <div className="space-y-4 py-4">
          <div className={cn("px-4 py-2", !isOpen && "flex justify-center")}>
            <h2 className={cn("mb-2 px-2 text-xl font-semibold tracking-tight", !isOpen && "hidden md:hidden")}>
              INGREN
            </h2>
            <div className="space-y-1">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={() => isMobile && setIsOpen(false)}
                  className={cn(
                    "flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                    pathname === route.href
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-primary hover:bg-accent/50",
                    !isOpen && "justify-center px-0"
                  )}
                  title={!isOpen ? route.label : undefined}
                >
                  {route.icon && (
                    <route.icon
                      className={cn("h-5 w-5", route.color, isOpen && "mr-2")}
                    />
                  )}
                  {isOpen && route.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}