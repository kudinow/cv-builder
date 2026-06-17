"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { PRODUCTS, type ProductId } from "@/lib/access-products"
import { reachGoal } from "@/lib/metrika"

interface PaywallModalProps {
  open: boolean
  onClose: () => void
  resumeId?: string
  /** подсветить «Доступ на 30 дней» как выгодный */
  highlightPass?: boolean
}

export function PaywallModal({ open, onClose, resumeId, highlightPass }: PaywallModalProps) {
  const [loading, setLoading] = useState<ProductId | null>(null)

  useEffect(() => { if (open) reachGoal("paywall_viewed") }, [open])

  async function buy(product: ProductId) {
    setLoading(product)
    try {
      reachGoal("purchase")
      const res = await fetch("/api/tokens/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product, resumeId }),
      })
      const data = await res.json()
      if (data.confirmationUrl) {
        window.location.href = data.confirmationUrl
      } else {
        alert(data.error ?? "Не удалось создать платёж")
        setLoading(null)
      }
    } catch {
      alert("Ошибка при создании платежа")
      setLoading(null)
    }
  }

  const gradient = "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent
        className="sm:max-w-md"
        style={{ backgroundColor: "#1e293b", border: "1px solid #334155", color: "#f1f5f9" }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: "#f1f5f9" }}>Резюме готово 🎉</DialogTitle>
          <DialogDescription style={{ color: "#94a3b8" }}>
            Чтобы скачать чистый файл без ограничений — выберите вариант:
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-2">
          {/* resume_390 — только если есть конкретное резюме */}
          {resumeId && (
            <button
              onClick={() => buy("resume_390")}
              disabled={loading !== null}
              className="rounded-xl p-4 text-left transition-opacity disabled:opacity-50"
              style={
                highlightPass
                  ? { border: "1px solid #334155", background: "#0f172a" }
                  : { border: "1px solid transparent", background: gradient, color: "#fff" }
              }
            >
              <div className="font-semibold">{PRODUCTS.resume_390.label}</div>
              <div className="text-xs mt-1" style={{ color: highlightPass ? "#94a3b8" : "rgba(255,255,255,0.85)" }}>
                {PRODUCTS.resume_390.description}
              </div>
            </button>
          )}

          {/* pass_890 */}
          <button
            onClick={() => buy("pass_890")}
            disabled={loading !== null}
            className="rounded-xl p-4 text-left transition-opacity disabled:opacity-50"
            style={
              highlightPass || !resumeId
                ? { border: "1px solid transparent", background: gradient, color: "#fff" }
                : { border: "1px solid #334155", background: "#0f172a" }
            }
          >
            <div className="font-semibold">{PRODUCTS.pass_890.label}</div>
            <div
              className="text-xs mt-1"
              style={{ color: (highlightPass || !resumeId) ? "rgba(255,255,255,0.85)" : "#94a3b8" }}
            >
              {PRODUCTS.pass_890.description}
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
