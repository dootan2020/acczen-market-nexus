
import * as React from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

interface DepositButtonProps {
  variant?: "default" | "outline" | "ghost"
}

export function DepositButton({ variant = "default" }: DepositButtonProps) {
  const { user } = useAuth()

  if (!user) return null

  return (
    <Link to="/deposit">
      <Button variant={variant} size="sm" className="animate-pulse-subtle">
        Nạp tiền
      </Button>
    </Link>
  )
}
