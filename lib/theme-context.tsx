"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import { getThemeById, DEFAULT_THEME_ID, type AppTheme, type ThemeColors } from "./themes"

type ColorMode = "light" | "dark" | "system"

type ThemeContextValue = {
  theme: AppTheme
  setThemeId: (id: string) => void
  colorMode: ColorMode
  setColorMode: (mode: ColorMode) => void
  resolvedMode: "light" | "dark"
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function applyColors(colors: ThemeColors) {
  const root = document.documentElement
  root.style.setProperty("--background", colors.background)
  root.style.setProperty("--foreground", colors.foreground)
  root.style.setProperty("--card", colors.card)
  root.style.setProperty("--card-foreground", colors.cardForeground)
  root.style.setProperty("--primary", colors.primary)
  root.style.setProperty("--primary-foreground", colors.primaryForeground)
  root.style.setProperty("--secondary", colors.secondary)
  root.style.setProperty("--secondary-foreground", colors.secondaryForeground)
  root.style.setProperty("--muted", colors.muted)
  root.style.setProperty("--muted-foreground", colors.mutedForeground)
  root.style.setProperty("--accent", colors.accent)
  root.style.setProperty("--accent-foreground", colors.accentForeground)
  root.style.setProperty("--border", colors.border)
  root.style.setProperty("--input", colors.input)
  root.style.setProperty("--ring", colors.ring)
  root.style.setProperty("--destructive", colors.destructive)
  root.style.setProperty("--popover", colors.card)
  root.style.setProperty("--popover-foreground", colors.cardForeground)
  root.style.setProperty("--sidebar", colors.card)
  root.style.setProperty("--sidebar-foreground", colors.foreground)
  root.style.setProperty("--sidebar-primary", colors.primary)
  root.style.setProperty("--sidebar-primary-foreground", colors.primaryForeground)
  root.style.setProperty("--sidebar-accent", colors.secondary)
  root.style.setProperty("--sidebar-accent-foreground", colors.secondaryForeground)
  root.style.setProperty("--sidebar-border", colors.border)
  root.style.setProperty("--sidebar-ring", colors.ring)
  root.style.setProperty("--chart-1", colors.primary)
  root.style.setProperty("--chart-2", colors.statusGreen)
  root.style.setProperty("--chart-3", colors.statusAmber)
  root.style.setProperty("--chart-4", colors.mutedForeground)
  root.style.setProperty("--chart-5", colors.statusRed)
  root.style.setProperty("--status-green", colors.statusGreen)
  root.style.setProperty("--status-amber", colors.statusAmber)
  root.style.setProperty("--status-red", colors.statusRed)
}

function getSystemMode(): "light" | "dark" {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

function getStoredThemeId(): string {
  if (typeof window === "undefined") return DEFAULT_THEME_ID
  return localStorage.getItem("theme-id") ?? DEFAULT_THEME_ID
}

function getStoredColorMode(): ColorMode {
  if (typeof window === "undefined") return "system"
  const stored = localStorage.getItem("color-mode")
  return stored === "light" || stored === "dark" || stored === "system"
    ? stored
    : "system"
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState(getStoredThemeId)
  const [colorMode, setColorModeState] = useState<ColorMode>(getStoredColorMode)
  const [systemMode, setSystemMode] = useState<"light" | "dark">(getSystemMode)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = (e: MediaQueryListEvent) =>
      setSystemMode(e.matches ? "dark" : "light")
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  const resolvedMode = colorMode === "system" ? systemMode : colorMode
  const theme = getThemeById(themeId)

  useEffect(() => {
    const colors = resolvedMode === "dark" ? theme.dark : theme.light
    applyColors(colors)
    document.documentElement.classList.toggle("dark", resolvedMode === "dark")
    document.documentElement.style.colorScheme = resolvedMode
  }, [theme, resolvedMode])

  const setThemeId = useCallback((id: string) => {
    setThemeIdState(id)
    localStorage.setItem("theme-id", id)
  }, [])

  const setColorMode = useCallback((mode: ColorMode) => {
    setColorModeState(mode)
    localStorage.setItem("color-mode", mode)
  }, [])

  return (
    <ThemeContext.Provider
      value={{ theme, setThemeId, colorMode, setColorMode, resolvedMode }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useAppTheme must be used within ThemeProvider")
  return ctx
}
