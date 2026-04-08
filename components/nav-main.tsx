"use client"

import Link from "next/link"
import { type Icon } from "@tabler/icons-react"
import { usePathname } from "next/navigation"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup className="pt-3">
      <SidebarGroupContent>
        <SidebarMenu className="gap-1.5">
          {items.map((item) => {
            const isActive =
              item.url === "/"
                ? pathname === "/"
                : pathname.startsWith(item.url)

            const ItemIcon = item.icon

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={false}
                  className={[
                    "transition-all duration-150 bg-transparent hover:bg-transparent hover:ring-1 hover:ring-border rounded-md",
                    isActive
                      ? "font-medium text-primary ring-1 ring-primary/60 hover:ring-primary/60"
                      : "",
                  ].join(" ")}
                >
                  <Link href={item.url}>
                    {ItemIcon && (
                      <ItemIcon
                        className={`size-4 shrink-0 ${isActive ? "text-primary" : ""}`}
                      />
                    )}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
