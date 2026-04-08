"use client"

import { useRef } from "react"
import { initializeProvider } from "./init"

export function ProviderInit({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false)
  if (!initialized.current) {
    initializeProvider()
    initialized.current = true
  }
  return <>{children}</>
}
