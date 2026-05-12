"use client"

import { Suspense } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { IconCar, IconArrowBarRight, IconPackages } from "@tabler/icons-react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { slugFromOutboundQueueId } from "@/lib/titles/outbound-queues"

const OUTBOUND_DEFAULT = `/queue?system=outbound&outbound=${slugFromOutboundQueueId("All")}`

const activeRing =
  "font-medium text-primary ring-1 ring-primary/60 hover:ring-primary/60"

function NavQueueSystemsInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const onQueue = pathname === "/queue"
  const isOutbound = searchParams.get("system") === "outbound"
  const isBatchQueue = searchParams.get("system") === "batch"
  const onBatches = pathname === "/batches" || pathname.startsWith("/batches/")

  const repoActive = onQueue && !isOutbound && !isBatchQueue
  const outboundActive = onQueue && isOutbound
  const batchesActive = onBatches || (onQueue && isBatchQueue)

  return (
    <SidebarGroup className="pt-3">
      <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-3 mb-1 group-data-[collapsible=icon]:hidden">
        Queues
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-1.5">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Repossessions"
              isActive={repoActive}
              className={[
                "transition-all duration-150 bg-transparent hover:bg-transparent hover:ring-1 hover:ring-border rounded-md",
                repoActive ? activeRing : "",
              ].join(" ")}
            >
              <Link href="/queue">
                <IconCar className={`size-4 shrink-0 ${repoActive ? "text-primary" : ""}`} />
                <span>Repossessions</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Outbound"
              isActive={outboundActive}
              className={[
                "transition-all duration-150 bg-transparent hover:bg-transparent hover:ring-1 hover:ring-border rounded-md",
                outboundActive ? activeRing : "",
              ].join(" ")}
            >
              <Link href={OUTBOUND_DEFAULT}>
                <IconArrowBarRight className={`size-4 shrink-0 ${outboundActive ? "text-primary" : ""}`} />
                <span>Outbound</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Document batches"
              isActive={batchesActive}
              className={[
                "transition-all duration-150 bg-transparent hover:bg-transparent hover:ring-1 hover:ring-border rounded-md",
                batchesActive ? activeRing : "",
              ].join(" ")}
            >
              <Link href="/batches">
                <IconPackages className={`size-4 shrink-0 ${batchesActive ? "text-primary" : ""}`} />
                <span>Document batches</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

/** SSR fallback: highlight Repossessions when path is /queue */
function NavQueueSystemsFallback() {
  const pathname = usePathname()
  const onQueue = pathname === "/queue"

  return (
    <SidebarGroup className="pt-3">
      <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-3 mb-1 group-data-[collapsible=icon]:hidden">
        Queues
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-1.5">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Repossessions"
              isActive={onQueue}
              className={[
                "transition-all duration-150 bg-transparent hover:bg-transparent hover:ring-1 hover:ring-border rounded-md",
                onQueue ? activeRing : "",
              ].join(" ")}
            >
              <Link href="/queue">
                <IconCar className={`size-4 shrink-0 ${onQueue ? "text-primary" : ""}`} />
                <span>Repossessions</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Outbound"
              isActive={false}
              className="transition-all duration-150 bg-transparent hover:bg-transparent hover:ring-1 hover:ring-border rounded-md"
            >
              <Link href={OUTBOUND_DEFAULT}>
                <IconArrowBarRight className="size-4 shrink-0" />
                <span>Outbound</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Document batches"
              isActive={false}
              className="transition-all duration-150 bg-transparent hover:bg-transparent hover:ring-1 hover:ring-border rounded-md"
            >
              <Link href="/batches">
                <IconPackages className="size-4 shrink-0" />
                <span>Document batches</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export function NavQueueSystems() {
  return (
    <Suspense fallback={<NavQueueSystemsFallback />}>
      <NavQueueSystemsInner />
    </Suspense>
  )
}
