"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export function DashboardShell({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 64)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
      className="h-svh overflow-hidden"
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-background focus:border focus:border-border focus:rounded-md focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg"
      >
        Skip to main content
      </a>
      <AppSidebar variant="inset" />
      <SidebarInset id="main-content" className="relative flex flex-col overflow-y-auto overflow-x-hidden">

        {/* Dot grid background */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, var(--border) 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
            opacity: 0.5,
            maskImage: "radial-gradient(ellipse 100% 60% at 60% 20%, black 20%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse 100% 60% at 60% 20%, black 20%, transparent 80%)",
          }}
        />

        {/* Primary glow */}
        <div
          className="pointer-events-none absolute"
          style={{
            width: "500px",
            height: "500px",
            top: "-150px",
            right: "-150px",
            borderRadius: "50%",
            background: "radial-gradient(circle, color-mix(in srgb, var(--primary) 3%, transparent) 0%, transparent 70%)",
          }}
        />

        <SiteHeader />
        <div className="relative flex flex-1 flex-col min-h-0">
          <div className="@container/main flex flex-1 flex-col gap-2 min-h-0">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
