"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, User, Menu, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useMobile } from "@/hooks/useMobile";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
interface NavItem {
  icon: React.ReactNode;
  href: string;
  label: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isMobile = useMobile();
  const [isOpen, setIsOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      icon: <Home className="h-5 w-5" />,
      href: "/dashboard",
      label: "Home",
    },
    {
      icon: <ShoppingBag className="h-5 w-5" />,
      href: "/dashboard/orders",
      label: "Orders",
    },
    {
      icon: <MessageCircle className="h-5 w-5" />,
      href: "/dashboard/chat",
      label: "Chat with a doctor",
    },
    {
      icon: <User className="h-5 w-5" />,
      href: "/dashboard/account",
      label: "Account",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="h-6 w-6 text-brand-500" />
            <h1 className="text-xl font-bold text-primary">
              Embedded Corp Wellness
            </h1>
          </div>
          {/* Desktop Navigation */}
          {!isMobile && (
            <nav>
              <ul className="flex space-x-6">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
                        pathname === item.href
                          ? "bg-brand-200 text-gray-100"
                          : "text-gray-600 hover:bg-gray-100"
                      )}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {/* Mobile Header */}
          {isMobile && (
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between py-4">
                    <h2 className="text-lg font-semibold text-primary">Menu</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <nav className="flex-1">
                    <ul className="space-y-2">
                      {navItems.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                              pathname === item.href
                                ? "bg-brand-50 text-secondary"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                            onClick={() => setIsOpen(false)}
                          >
                            {item.icon}
                            <span>{item.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 container mx-auto">{children}</main>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 z-10">
          <ul className="flex justify-around">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center p-2",
                    pathname === item.href ? "text-primary" : "text-gray-500"
                  )}
                >
                  {item.icon}
                  <span className="text-xs mt-1">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
