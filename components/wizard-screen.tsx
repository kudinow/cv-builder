"use client"

import { useRouter } from "next/navigation"

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
}

export function WizardScreen({ hasMasterResumes }: WizardScreenProps) {
  const router = useRouter()

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
      cost: 80,
      icon: "⚡",
      href: "/interview?mode=improve",
    },
    {
      id: "adapt",
      title: "Адаптировать под вакансию",
      description: "Загрузите PDF и вставьте вакансию — адаптируем под неё",
      cost: 50,
      icon: "🎯",
      href: "/adapt",
    },
  ]

  function handleOptionClick(option: WizardOption) {
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

          </button>
        ))}
      </div>

    </div>
  )
}
