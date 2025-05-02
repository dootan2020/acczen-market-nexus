
import * as React from "react"
import { Moon, Sun, CircleHelp } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/ui/theme-provider"
import { cn } from "@/lib/utils"

export function ModeToggle() {
  const { theme = "light", setTheme = () => {} } = useTheme() || {}

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Sun className={cn(
            "h-[1.2rem] w-[1.2rem] transition-all",
            theme === "light" ? "scale-100 rotate-0" : "scale-0 rotate-90"
          )} />
          <Moon className={cn(
            "absolute h-[1.2rem] w-[1.2rem] transition-all",
            theme === "dark" ? "scale-100 rotate-0" : "scale-0 rotate-90"
          )} />
          <CircleHelp className={cn(
            "absolute h-[1.2rem] w-[1.2rem] transition-all",
            theme === "system" ? "scale-100 rotate-0" : "scale-0 rotate-90"
          )} />
          <span className="sr-only">Thay đổi giao diện</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={theme === "light" ? "bg-accent" : ""}
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Sáng</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={theme === "dark" ? "bg-accent" : ""}
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Tối</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={theme === "system" ? "bg-accent" : ""}
        >
          <CircleHelp className="mr-2 h-4 w-4" />
          <span>Hệ thống</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
