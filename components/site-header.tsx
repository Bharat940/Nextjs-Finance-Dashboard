"use client"

import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Moon, Sun, User } from "lucide-react"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

interface User {
  _id: string;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

const topLevelRoutes = [
  { path: "/dashboard", title: "Dashboard" },
  { path: "/transactions", title: "Transactions" },
  { path: "/wallets", title: "My Wallet" },
]

const nestedRoutes = [
  { prefix: "/settings", title: "Settings" },
  { prefix: "/invoices", title: "Invoices" },
]

export function SiteHeader() {
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/users/me", { cache: "no-store" });
        if (res.ok) {
          const data: User = await await res.json();
          setUser(data);
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    }

    fetchUser();
  }, [])

  let resolvedTitle =
    topLevelRoutes.find((r) => pathname === r.path)?.title

  if (!resolvedTitle) {
    resolvedTitle =
      nestedRoutes.find((r) => pathname.startsWith(r.prefix))?.title ||
      topLevelRoutes.find((r) => pathname.startsWith(r.path))?.title
  }

  if (pathname === "/invoices/create") {
    resolvedTitle = "New Invoice"
  }

  resolvedTitle = resolvedTitle || "App"


  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 lg:px-6 dark:bg-[#201E34] text-black dark:text-white">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4 bg-white/30"
        />
        <h1 className="text-base font-semibold">{resolvedTitle}</h1>
      </div>

      <div className="ml-auto flex items-center gap-4">
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-gray-300"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        )}

        <div className="flex items-center gap-2 rounded-md px-2 py-1 bg-primary2 dark:bg-primary4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
            <User className="h-5 w-5 text-gray-600" />
          </div>
          <div className="flex flex-col items-start">
            <span className="font-medium">{user?.name || "Guest"}</span>
            <span className="text-xs text-gray-400 hidden sm:inline">
              {user?.email || ""}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}