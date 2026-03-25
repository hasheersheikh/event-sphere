import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="h-9 w-20" />

  const isDark = resolvedTheme === "dark"

  return (
    <div 
      className="relative flex items-center h-9 w-[4.5rem] bg-muted/50 rounded-full p-1 cursor-pointer border border-border/50 hover:border-primary/30 transition-colors shadow-inner"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <motion.div
        className="absolute h-7 w-7 bg-primary rounded-full flex items-center justify-center shadow-lg z-10"
        initial={false}
        animate={{
          x: isDark ? "1.75rem" : "0rem",
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30
        }}
      >
        {isDark ? (
          <Moon className="h-4 w-4 text-primary-foreground fill-current" />
        ) : (
          <Sun className="h-4 w-4 text-primary-foreground fill-current" />
        )}
      </motion.div>
      
      <div className="flex-1 flex justify-between px-2 w-full z-0 opacity-40">
        <Sun className="h-3.5 w-3.5" />
        <Moon className="h-3.5 w-3.5" />
      </div>
      <span className="sr-only">Toggle theme</span>
    </div>
  )
}
