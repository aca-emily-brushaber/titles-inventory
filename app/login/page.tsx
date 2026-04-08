"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { IconArrowRight } from "@tabler/icons-react"

import { getProvider } from "@/lib/data-provider"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await getProvider().auth.signIn(email, password)

      if (error) {
        toast.error(error)
        return
      }

      document.cookie = "mock-auth-session=true; path=/"
      router.push("/queue")
      router.refresh()
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-svh bg-muted/30 flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-3 mb-8">
        <Image
          src="/aca-emblem.png"
          alt="ACA Logo"
          width={56}
          height={56}
          className="size-14"
        />
        <div className="flex flex-col">
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Titles Inventory
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-primary/70">
            Operations Dashboard
          </span>
        </div>
      </div>

      <Card className="w-full max-w-md shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
          <CardDescription>Enter your credentials to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@acacceptance.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#C2002F] hover:bg-[#A30028] text-white font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
              {!isLoading && <IconArrowRight className="ml-1 size-4" />}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="mt-8 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
        ACA Acceptance &middot; Internal Use Only
      </p>
    </div>
  )
}
