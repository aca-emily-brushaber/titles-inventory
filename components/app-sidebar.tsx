"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  IconSettings,
  IconPalette,
  IconUserPlus,
  IconPlug,
  IconLock,
} from "@tabler/icons-react"

import { NavQueueSystems } from "@/components/nav-queue-systems"
import { NavUser } from "@/components/nav-user"
import { ThemeSwitcher } from "@/components/theme-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getProvider } from "@/lib/data-provider"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const [user, setUser] = useState({ name: "", email: "", avatar: "" })

  useEffect(() => {
    getProvider().auth.getCurrentUser().then((currentUser) => {
      if (currentUser) {
        setUser({ name: currentUser.name, email: currentUser.email, avatar: "" })
      }
    })
  }, [])

  return (
    <Sidebar collapsible="icon" {...props}>

      <SidebarHeader className="h-16 justify-center border-b border-sidebar-border">
        <Link
          href="/"
          className="flex items-center gap-2.5 min-w-0
            transition-all duration-200 ease-linear
            px-2 mx-2
            group-data-[collapsible=icon]:mx-0 group-data-[collapsible=icon]:px-0
            group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-full
            group-data-[collapsible=icon]:gap-0"
        >
          <img
            src="/aca-emblem.png"
            alt="ACA"
            className="shrink-0 rounded-full object-contain transition-all duration-200 ease-linear
              group-data-[collapsible=icon]:!w-7 group-data-[collapsible=icon]:!h-7
              group-data-[collapsible=icon]:!min-w-7 group-data-[collapsible=icon]:!min-h-7"
            style={{ width: "2.25rem", height: "2.25rem", minWidth: "2.25rem", minHeight: "2.25rem" }}
          />
          <span className="
            font-semibold text-sm tracking-tight truncate
            overflow-hidden whitespace-nowrap
            transition-all duration-200 ease-linear
            max-w-[120px] opacity-100
            group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0
          ">
            Titles
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <NavQueueSystems />

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-3 mb-1 group-data-[collapsible=icon]:hidden">
            Settings
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">

              <SidebarMenuItem>
                <Sheet>
                  <SheetTrigger asChild>
                    <SidebarMenuButton
                      tooltip="Appearance"
                      className="bg-transparent hover:bg-transparent hover:ring-1 hover:ring-border rounded-md transition-all duration-150"
                    >
                      <IconPalette className="size-4" />
                      <span>Appearance</span>
                    </SidebarMenuButton>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-[360px] border-border flex flex-col gap-0 p-0"
                    style={{ overscrollBehavior: "contain" }}
                  >
                    <SheetHeader className="px-5 pt-5 pb-4 border-b border-border shrink-0">
                      <SheetTitle className="text-sm font-semibold tracking-tight">Appearance</SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="flex-1 min-h-0">
                      <div className="px-5 py-4 pr-6">
                        <ThemeSwitcher />
                      </div>
                    </ScrollArea>
                  </SheetContent>
                </Sheet>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Settings"
                  isActive={false}
                  className={[
                    "bg-transparent hover:bg-transparent hover:ring-1 hover:ring-border rounded-md transition-all duration-150",
                    pathname.startsWith("/admin/settings")
                      ? "font-medium text-primary ring-1 ring-primary/60 hover:ring-primary/60"
                      : "",
                  ].join(" ")}
                >
                  <Link href="/admin/settings">
                    <IconSettings className={`size-4 shrink-0 ${pathname.startsWith("/admin/settings") ? "text-primary" : ""}`} />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Manage Users"
                  isActive={false}
                  className={[
                    "bg-transparent hover:bg-transparent hover:ring-1 hover:ring-border rounded-md transition-all duration-150",
                    pathname.startsWith("/admin/users")
                      ? "font-medium text-primary ring-1 ring-primary/60 hover:ring-primary/60"
                      : "",
                  ].join(" ")}
                >
                  <Link href="/admin/users">
                    <IconUserPlus className={`size-4 shrink-0 ${pathname.startsWith("/admin/users") ? "text-primary" : ""}`} />
                    <span>Manage Users</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Integrations"
                  isActive={false}
                  className={[
                    "bg-transparent hover:bg-transparent hover:ring-1 hover:ring-border rounded-md transition-all duration-150",
                    pathname.startsWith("/admin/integrations")
                      ? "font-medium text-primary ring-1 ring-primary/60 hover:ring-primary/60"
                      : "",
                  ].join(" ")}
                >
                  <Link href="/admin/integrations">
                    <IconPlug className={`size-4 shrink-0 ${pathname.startsWith("/admin/integrations") ? "text-primary" : ""}`} />
                    <span>Integrations</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Locked titles"
                  isActive={false}
                  className={[
                    "bg-transparent hover:bg-transparent hover:ring-1 hover:ring-border rounded-md transition-all duration-150",
                    pathname.startsWith("/admin/locks")
                      ? "font-medium text-primary ring-1 ring-primary/60 hover:ring-primary/60"
                      : "",
                  ].join(" ")}
                >
                  <Link href="/admin/locks">
                    <IconLock className={`size-4 shrink-0 ${pathname.startsWith("/admin/locks") ? "text-primary" : ""}`} />
                    <span>Locked titles</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border overflow-hidden">
        <NavUser user={user} />
      </SidebarFooter>

    </Sidebar>
  )
}
