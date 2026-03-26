"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { InsufficientTokensModal } from '@/components/insufficient-tokens-modal'
import { reachGoal } from '@/lib/metrika'

interface InterviewEntryClientProps {
  mode: 'create' | 'improve'
  tokenBalance: number
  requiredTokens: number
  expiredError?: boolean
}

export function InterviewEntryClient({
  mode: initialMode,
  tokenBalance,
  expiredError,
}: InterviewEntryClientProps) {
  const router = useRouter()
  const [selectedMode, setSelectedMode] = useState<'create' | 'improve'>(initialMode)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [parsedResumeText, setParsedResumeText] = useState('')
  const [isParsing, setIsParsing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')
  const [parseError, setParseError] = useState('')
  const [showInsufficientModal, setShowInsufficientModal] = useState(false)
  const [insufficientNeeded, setInsufficientNeeded] = useState(0)
  const [showExpiredBanner, setShowExpiredBanner] = useState(expiredError ?? false)

  const requiredTokens = selectedMode === 'improve' ? 60 : 100
  const hasEnoughTokens = tokenBalance >= requiredTokens

  async function handlePdfSelect(file: File) {
    setPdfFile(file)
    setParseError('')
    setIsParsing(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/parse-resume', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Ошибка при разборе PDF')
      setParsedResumeText(data.text)
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Ошибка при разборе PDF')
      setPdfFile(null)
      setParsedResumeText('')
    } finally {
      setIsParsing(false)
    }
  }

  async function handleStart() {
    if (!hasEnoughTokens) return
    if (selectedMode === 'improve' && !parsedResumeText) return
    if (isCreating) return

    setIsCreating(true)
    setError('')
    try {
      const res = await fetch('/api/interview/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: selectedMode,
          uploadedResumeText: parsedResumeText || undefined,
        }),
      })

      const data = await res.json()

      if (res.status === 409) {
        // Active session exists
        const existingId = data.sessionId || data.existingSessionId
        router.push('/interview/' + existingId)
        return
      }

      if (res.status === 402) {
        setInsufficientNeeded(data.needed ?? requiredTokens)
        setShowInsufficientModal(true)
        return
      }

      if (!res.ok) {
        throw new Error(data.error || 'Ошибка создания сессии')
      }

      reachGoal('interview_start')
      router.push('/interview/' + data.session.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setIsCreating(false)
    }
  }

  const isStartDisabled =
    !hasEnoughTokens ||
    (selectedMode === 'improve' && !parsedResumeText) ||
    isCreating ||
    isParsing

  return (
    <div className="theme-premium min-h-screen" style={{ backgroundColor: '#0f172a', color: '#f1f5f9' }}>
      <div className="container mx-auto max-w-2xl py-12 px-4">

        {/* Expired session banner */}
        {showExpiredBanner && (
          <div
            className="mb-6 rounded-xl px-4 py-3 flex items-center justify-between"
            style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24' }}
          >
            <span className="text-sm">Сессия истекла (72 часа без активности). Начните новую.</span>
            <button
              onClick={() => setShowExpiredBanner(false)}
              className="ml-4 text-sm opacity-70 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        )}

        {/* Heading */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#f1f5f9' }}>
            Начните интервью
          </h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            AI-консультант проведёт структурированное интервью и создаст ваше резюме
          </p>
        </div>

        {/* Mode selector cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Create from scratch */}
          <button
            onClick={() => setSelectedMode('create')}
            className="rounded-2xl p-5 text-left transition-all"
            style={{
              background: '#1e293b',
              border: selectedMode === 'create' ? '1px solid #6366f1' : '1px solid #334155',
              boxShadow: selectedMode === 'create' ? '0 0 0 1px rgba(99,102,241,0.3), 0 4px 20px rgba(99,102,241,0.15)' : 'none',
            }}
          >
            <div className="text-2xl mb-2">✨</div>
            <div className="font-semibold mb-1" style={{ color: '#f1f5f9' }}>С нуля</div>
            <div className="text-sm mb-3" style={{ color: '#94a3b8' }}>
              AI задаст вопросы и создаст резюме с нуля
            </div>
            <div
              className="inline-block text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(99,102,241,0.15)', color: '#a78bfa' }}
            >
              100 токенов
            </div>
          </button>

          {/* Improve existing */}
          <button
            onClick={() => setSelectedMode('improve')}
            className="rounded-2xl p-5 text-left transition-all"
            style={{
              background: '#1e293b',
              border: selectedMode === 'improve' ? '1px solid #6366f1' : '1px solid #334155',
              boxShadow: selectedMode === 'improve' ? '0 0 0 1px rgba(99,102,241,0.3), 0 4px 20px rgba(99,102,241,0.15)' : 'none',
            }}
          >
            <div className="text-2xl mb-2">⚡</div>
            <div className="font-semibold mb-1" style={{ color: '#f1f5f9' }}>Улучшить резюме</div>
            <div className="text-sm mb-3" style={{ color: '#94a3b8' }}>
              Загрузите PDF — AI проведёт интервью с учётом вашего опыта
            </div>
            <div
              className="inline-block text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(99,102,241,0.15)', color: '#a78bfa' }}
            >
              80 токенов
            </div>
          </button>
        </div>

        {/* PDF upload — shown only for improve mode */}
        {selectedMode === 'improve' && (
          <div className="mb-6">
            <label
              className="block rounded-2xl p-6 text-center cursor-pointer transition-colors"
              style={{
                border: '2px dashed',
                borderColor: parsedResumeText ? '#6366f1' : '#334155',
                background: '#1e293b',
              }}
            >
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handlePdfSelect(file)
                }}
              />
              {isParsing ? (
                <div>
                  <div className="text-sm animate-pulse mb-1" style={{ color: '#94a3b8' }}>
                    Читаем PDF...
                  </div>
                </div>
              ) : parsedResumeText ? (
                <div>
                  <div className="text-sm font-medium mb-1" style={{ color: '#f1f5f9' }}>
                    {pdfFile?.name}
                  </div>
                  <div
                    className="inline-block text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(99,102,241,0.15)', color: '#a78bfa' }}
                  >
                    ✓ Готово
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-2xl mb-2">📄</div>
                  <div className="text-sm" style={{ color: '#94a3b8' }}>
                    Перетащите PDF или нажмите для выбора
                  </div>
                </div>
              )}
            </label>
            {parseError && (
              <div className="mt-2 text-sm" style={{ color: '#f87171' }}>
                {parseError}
              </div>
            )}
          </div>
        )}

        {/* Token balance warning */}
        {!hasEnoughTokens && (
          <div
            className="mb-4 rounded-xl px-4 py-3 text-sm"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}
          >
            Недостаточно токенов (у вас {tokenBalance}, нужно {requiredTokens}).{' '}
            <a href="/tokens" style={{ color: '#a78bfa', textDecoration: 'underline' }}>
              Пополнить
            </a>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div
            className="mb-4 rounded-xl px-4 py-3 text-sm"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}
          >
            {error}
          </div>
        )}

        {/* Start button */}
        <button
          onClick={handleStart}
          disabled={isStartDisabled}
          className="w-full rounded-2xl py-4 text-base font-semibold transition-opacity disabled:opacity-40"
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: 'white',
          }}
        >
          {isCreating ? 'Создаём сессию...' : 'Начать интервью'}
        </button>

        {/* Token balance display */}
        <div className="mt-4 text-center text-sm" style={{ color: '#475569' }}>
          Баланс: {tokenBalance} токенов
        </div>
      </div>

      <InsufficientTokensModal
        open={showInsufficientModal}
        onClose={() => setShowInsufficientModal(false)}
        needed={insufficientNeeded}
        balance={tokenBalance}
      />
    </div>
  )
}
