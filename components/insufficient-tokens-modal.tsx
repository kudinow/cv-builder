"use client"

import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface InsufficientTokensModalProps {
  open: boolean
  onClose: () => void
  needed: number
  balance: number
}

export function InsufficientTokensModal({
  open,
  onClose,
  needed,
  balance,
}: InsufficientTokensModalProps) {
  const shortfall = needed - balance

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent
        className="sm:max-w-sm"
        style={{ backgroundColor: "#1e293b", border: "1px solid #334155", color: "#f1f5f9" }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: "#f1f5f9" }}>
            Недостаточно токенов
          </DialogTitle>
          <DialogDescription style={{ color: "#94a3b8" }}>
            Для этого действия нужно{" "}
            <span style={{ color: "#a78bfa", fontWeight: 600 }}>{needed} токенов</span>.
            На вашем балансе{" "}
            <span style={{ color: "#f1f5f9", fontWeight: 600 }}>{balance}</span>.
            Не хватает {shortfall} токенов.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            style={{ color: "#94a3b8" }}
          >
            Отмена
          </Button>
          <Link
            href="/tokens"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-[min(var(--radius-md),12px)] px-2.5 h-7 text-[0.8rem] font-medium text-white"
            style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}
          >
            Купить токены
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
