
import * as React from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"

interface DepositButtonProps {
  variant?: "default" | "outline" | "ghost"
  className?: string
}

export function DepositButton({ variant = "default", className }: DepositButtonProps) {
  const { user } = useAuth()

  if (!user) return null

  return (
    <Link to="/deposit">
      <Button variant={variant} size="sm" className={cn("animate-pulse-subtle", className)}>
        Deposit
      </Button>
    </Link>
  )
}
