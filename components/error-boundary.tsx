"use client"

import { Component, type ReactNode } from "react"
import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface ErrorBoundaryProps {
  children: ReactNode
  fallbackMessage?: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="rounded-xl border-destructive/20">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
            <IconAlertTriangle className="size-10 text-destructive" />
            <div className="text-center">
              <p className="font-semibold text-destructive">
                {this.props.fallbackMessage ?? "Something went wrong"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {this.state.error?.message ?? "An unexpected error occurred."}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={this.handleRetry}>
              <IconRefresh className="size-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      )
    }
    return this.props.children
  }
}
