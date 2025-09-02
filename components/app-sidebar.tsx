"use client"

import * as React from "react"
import {
  LayoutDashboard,
  List,
  FileText,
  Wallet,
  Settings,
  HelpCircle,
  LogOut,
  GalleryVerticalEnd,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import Link from "next/link"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Transactions",
      url: "/transactions",
      icon: List,
    },
    {
      title: "Invoices",
      url: "/invoices",
      icon: FileText,
    },
    {
      title: "My Wallets",
      url: "/wallets",
      icon: Wallet,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ],
  navBottom: [
    {
      title: "Help",
      url: "mailto:bdangi450@gmail.com",
      icon: HelpCircle,
    },
    {
      title: "Logout",
      url: "#",
      icon: LogOut,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="offcanvas" {...props} className="dark:bg-[#201E34] text-black dark:text-white">
      <SidebarHeader className="dark:bg-[#201E34] text-black dark:text-white">
        <SidebarMenu>
          <SidebarMenuItem className="dark:bg-[#201E34] text-black dark:text-white">
            <SidebarMenuButton asChild>
              <Link href="/dashboard" className="flex items-center gap-2 dark:bg-[#201E34] text-black dark:text-white">
                <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <span className="text-base font-semibold">Finance</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="mt-6 dark:bg-[#201E34] text-black dark:text-white">
        <nav className="flex flex-col gap-1 dark:bg-[#201E34] text-black dark:text-white">
          {data.navMain.map((item) => {
            const isActive = pathname === item.url || pathname.startsWith(item.url + "/")
            return (
              <Link
                key={item.title}
                href={item.url}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors
                  ${isActive
                    ? "bg-[#C8EE44] text-black"
                    : "text-muted-foreground hover:bg-muted dark:hover:bg-[#282541]"}
                `}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Link>
            )
          })}
        </nav>
      </SidebarContent>

      <SidebarFooter className="mb-6 dark:bg-[#201E34] text-black dark:text-white">
        <nav className="flex flex-col gap-1">
          {data.navBottom.map((item) =>
            item.title === "Logout" ? (
              <button
                key={item.title}
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted text-left cursor-pointer dark:hover:bg-[#282541]"
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </button>
            ) : (
              <Link
                key={item.title}
                href={item.url}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted dark:hover:bg-[#282541]"
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Link>
            )
          )}
        </nav>
      </SidebarFooter>
    </Sidebar>
  )
}