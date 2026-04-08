"use client"

import { useAppTheme } from "@/lib/theme-context"
import { themes } from "@/lib/themes"
import { IconSun, IconMoon, IconDeviceDesktop } from "@tabler/icons-react"

export function ThemeSwitcher() {
  const { theme, setThemeId, colorMode, setColorMode, resolvedMode } = useAppTheme()

  return (
    <div className="flex flex-col gap-6">

      {/* Mode toggle */}
      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
          Color Mode
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          {(
            [
              { mode: "light"  as const, icon: IconSun,           label: "Light"  },
              { mode: "dark"   as const, icon: IconMoon,          label: "Dark"   },
              { mode: "system" as const, icon: IconDeviceDesktop, label: "System" },
            ] as const
          ).map(({ mode, icon: Icon, label }) => {
            const active = colorMode === mode
            return (
              <button
                key={mode}
                onClick={() => setColorMode(mode)}
                aria-label={`Switch to ${label} mode`}
                className={`
                  flex flex-col items-center gap-1.5 rounded-lg border px-2 py-2.5
                  text-xs font-medium transition-all duration-150
                  ${active
                    ? "border-primary bg-primary/8 text-primary"
                    : "border-border text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground"
                  }
                `}
              >
                <Icon className="size-4" />
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Theme grid */}
      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
          Theme
        </p>
        <div className="flex flex-col gap-1.5">
          {themes.map((t) => {
            const isActive = theme.id === t.id
            const preview = resolvedMode === "dark" ? t.dark : t.light

            return (
              <button
                key={t.id}
                onClick={() => setThemeId(t.id)}
                aria-label={`Switch to ${t.name} theme`}
                className={`
                  group relative flex items-center gap-3 rounded-lg border px-3 py-2.5 w-full
                  text-left transition-all duration-150
                  ${isActive
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-border hover:bg-muted/40"
                  }
                `}
              >
                <div
                  className="relative shrink-0 size-10 rounded-md overflow-hidden border border-black/10 dark:border-white/10"
                  style={{ backgroundColor: preview.background }}
                >
                  <div
                    className="absolute inset-x-1 top-1 h-[14px] rounded-sm"
                    style={{ backgroundColor: preview.card, borderColor: preview.border, borderWidth: 1 }}
                  />
                  <div
                    className="absolute left-1 bottom-1 h-[5px] w-5 rounded-sm"
                    style={{ backgroundColor: preview.primary }}
                  />
                  <div
                    className="absolute right-1 bottom-1 h-[5px] w-3 rounded-sm"
                    style={{ backgroundColor: preview.muted }}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium truncate leading-tight ${isActive ? "text-primary" : "text-foreground"}`}>
                    {t.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5">
                    {t.description}
                  </p>
                </div>

                {isActive && (
                  <div className="shrink-0 size-2 rounded-full bg-primary" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
