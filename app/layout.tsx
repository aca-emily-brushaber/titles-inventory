import type { Metadata } from "next"
import { Inter, Geist_Mono } from "next/font/google"
import { ThemeProvider } from "@/lib/theme-context"
import { ProviderInit } from "@/lib/providers/provider-init"
import { Toaster } from "sonner"
import { themes, DEFAULT_THEME_ID } from "@/lib/themes"
import "./globals.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Titles Inventory",
  description: "ACA title file review and queue management",
}

const THEME_MAP_JSON = JSON.stringify(
  Object.fromEntries(themes.map((t) => [t.id, { light: t.light, dark: t.dark }]))
)

const themeInitScript = `
(function() {
  var themes = ${THEME_MAP_JSON};
  var defaultId = "${DEFAULT_THEME_ID}";
  var themeId = localStorage.getItem("theme-id") || defaultId;
  var colorMode = localStorage.getItem("color-mode") || "system";
  var isDark = colorMode === "dark" ||
    (colorMode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  var theme = themes[themeId] || themes[defaultId];
  var colors = isDark ? theme.dark : theme.light;
  var root = document.documentElement;
  root.classList.toggle("dark", isDark);
  root.style.colorScheme = isDark ? "dark" : "light";
  var map = {
    "--background": colors.background,
    "--foreground": colors.foreground,
    "--card": colors.card,
    "--card-foreground": colors.cardForeground,
    "--primary": colors.primary,
    "--primary-foreground": colors.primaryForeground,
    "--secondary": colors.secondary,
    "--secondary-foreground": colors.secondaryForeground,
    "--muted": colors.muted,
    "--muted-foreground": colors.mutedForeground,
    "--accent": colors.accent,
    "--accent-foreground": colors.accentForeground,
    "--border": colors.border,
    "--input": colors.input,
    "--ring": colors.ring,
    "--destructive": colors.destructive,
    "--popover": colors.card,
    "--popover-foreground": colors.cardForeground,
    "--sidebar": colors.card,
    "--sidebar-foreground": colors.foreground,
    "--sidebar-primary": colors.primary,
    "--sidebar-primary-foreground": colors.primaryForeground,
    "--sidebar-accent": colors.secondary,
    "--sidebar-accent-foreground": colors.secondaryForeground,
    "--sidebar-border": colors.border,
    "--sidebar-ring": colors.ring,
    "--chart-1": colors.primary,
    "--chart-2": colors.statusGreen,
    "--chart-3": colors.statusAmber,
    "--chart-4": colors.mutedForeground,
    "--chart-5": colors.statusRed,
    "--status-green": colors.statusGreen,
    "--status-amber": colors.statusAmber,
    "--status-red": colors.statusRed
  };
  for (var k in map) root.style.setProperty(k, map[k]);
})();
`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${inter.variable} ${geistMono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <ProviderInit>
            {children}
          </ProviderInit>
          <Toaster richColors position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
