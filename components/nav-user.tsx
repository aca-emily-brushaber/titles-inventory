"use client"

import { useRouter } from "next/navigation"
import { IconLogout, IconChevronUp } from "@tabler/icons-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { getProvider } from "@/lib/data-provider"

function getAvatarColor(name: string): string {
  const colors = [
    "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    "linear-gradient(135deg, #8b5cf6, #6d28d9)",
    "linear-gradient(135deg, #06b6d4, #0284c7)",
    "linear-gradient(135deg, #10b981, #059669)",
    "linear-gradient(135deg, #f59e0b, #d97706)",
    "linear-gradient(135deg, #ef4444, #dc2626)",
    "linear-gradient(135deg, #ec4899, #db2777)",
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

export function NavUser({
  user,
}: {
  user: { name: string; email: string; avatar: string }
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()

  async function handleSignOut() {
    await getProvider().auth.signOut()
    document.cookie = "mock-auth-session=; path=/; max-age=0"
    router.push("/login")
    router.refresh()
  }

  const initials = user.name
    ? user.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()
    : user.email
    ? user.email[0].toUpperCase()
    : "?"

  const avatarGradient = getAvatarColor(user.name || user.email)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              tooltip={user.name || user.email}
              className="bg-transparent hover:bg-transparent hover:ring-1 hover:ring-border data-[state=open]:ring-1 data-[state=open]:ring-border data-[state=open]:bg-transparent rounded-md overflow-hidden transition-all duration-150"
            >
              <div
                className="flex items-center justify-center size-8 rounded-lg shrink-0 text-white text-xs font-semibold select-none"
                style={{ background: avatarGradient }}
              >
                {initials}
              </div>

              <div className="grid flex-1 text-left leading-tight min-w-0">
                <span className="truncate text-sm font-medium">{user.name || user.email}</span>
                <span className="truncate text-[11px] text-muted-foreground">{user.email}</span>
              </div>

              <IconChevronUp className="ml-auto size-3.5 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-52 rounded-lg"
            side={isMobile ? "bottom" : "top"}
            align="end"
            sideOffset={6}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2.5 px-2 py-2">
                <div
                  className="flex items-center justify-center size-8 rounded-lg shrink-0 text-white text-xs font-semibold select-none"
                  style={{ background: avatarGradient }}
                >
                  {initials}
                </div>
                <div className="grid flex-1 leading-tight min-w-0">
                  <span className="truncate text-sm font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive gap-2">
              <IconLogout className="size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
