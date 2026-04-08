"use client"

import { useEffect } from "react"
import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Dashboard error:", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center gap-6 px-4 py-20 lg:px-6">
      <Card className="w-full max-w-lg rounded-xl border-destructive/20">
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <IconAlertTriangle className="size-10 text-destructive" />
          <div className="text-center">
            <p className="text-lg font-semibold text-destructive">
              Failed to load dashboard
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {error.message || "An unexpected error occurred while loading data."}
            </p>
          </div>
          <Button variant="outline" onClick={reset}>
            <IconRefresh className="size-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
