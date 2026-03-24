"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { InsufficientTokensModal } from "@/components/insufficient-tokens-modal"

interface WizardOption {
  id: "create" | "improve" | "adapt"
  title: string
  description: string
  cost: number
  icon: string
  href: string
}

interface WizardScreenProps {
  hasMasterResumes: boolean
  tokenBalance: number
}

export function WizardScreen({ hasMasterResumes, tokenBalance }: WizardScreenProps) {
  const router = useRouter()
  const [modalState, setModalState] = useState<{ open: boolean; needed: number }>({
    open: false,
    needed: 0,
  })

  const adaptCost = hasMasterResumes ? 40 : 80

  const options: WizardOption[] = [
    {
      id: "create",
      title: "У меня нет резюме",
      description: "AI задаст вам вопросы и создаст профессиональное резюме с нуля",
      cost: 100,
      icon: "✨",
      href: "/interview",
    },
    {
      id: "improve",
      title: "Хочу улучшить резюме",
      description: "Загрузите ваш PDF — AI проведёт интервью и перепишет резюме",
      cost: 60,
      icon: "⚡",
      href: "/interview?mode=improve",
    },
    {
      id: "adapt",
      title: "Адаптировать под вакансию",
      description: hasMasterResumes
        ? "Адаптируем ваше мастер-резюме под конкретную вакансию"
        : "Загрузите PDF и вставьте вакансию — адаптируем под неё",
      cost: adaptCost,
      icon: "🎯",
      href: "/adapt",
    },
  ]

  function handleOptionClick(option: WizardOption) {
    if (tokenBalance < option.cost) {
      setModalState({ open: true, needed: option.cost })
      return
    }
    router.push(option.href)
  }

  return (
    <div className="flex flex-col items-center">
      {/* Heading */}
      <div className="mb-10 text-center">
        <h1
          className="mb-3 text-3xl font-bold sm:text-4xl"
          style={{ color: "#f1f5f9" }}
        >
          Что вы хотите сделать?
        </h1>
        <p className="text-base" style={{ color: "#94a3b8" }}>
          Выберите сценарий — мы подберём нужный инструмент
        </p>
      </div>

      {/* Option cards */}
      <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-3">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleOptionClick(option)}
            className="card-glow group flex flex-col items-start gap-3 rounded-2xl p-6 text-left transition-all"
            style={{
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              cursor: "pointer",
            }}
          >
            {/* Icon */}
            <span className="text-3xl">{option.icon}</span>

            {/* Title */}
            <h2
              className="text-base font-semibold leading-tight"
              style={{ color: "#f1f5f9" }}
            >
              {option.title}
            </h2>

            {/* Description */}
            <p className="flex-1 text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
              {option.description}
            </p>

            {/* Cost badge */}
            <div
              className="mt-1 rounded-full px-3 py-1 text-xs font-semibold"
              style={{
                background: "rgba(99, 102, 241, 0.15)",
                color: "#a78bfa",
                border: "1px solid rgba(99, 102, 241, 0.3)",
              }}
            >
              {option.cost} токенов
            </div>
          </button>
        ))}
      </div>

      {/* Insufficient tokens modal */}
      <InsufficientTokensModal
        open={modalState.open}
        onClose={() => setModalState({ open: false, needed: 0 })}
        needed={modalState.needed}
        balance={tokenBalance}
      />
    </div>
  )
}
