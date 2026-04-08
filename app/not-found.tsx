import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-2xl font-semibold">Page not found</h2>
      <p className="text-sm text-muted-foreground">The page you requested does not exist.</p>
      <Button asChild variant="outline">
        <Link href="/">Return to Dashboard</Link>
      </Button>
    </div>
  )
}
