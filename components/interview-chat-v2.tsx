"use client"

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { INTERVIEW_LIMITS } from '@/lib/token-costs'
import { reachGoal } from '@/lib/metrika'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface InterviewChatV2Props {
  sessionId: string
  initialMessages: Array<{ role: 'user' | 'assistant'; content: string }>
  mode: 'create' | 'improve'
  initialPhase: number
  messageCount: number
}

function parseSuggestions(text: string): { cleanText: string; suggestions: string[] } {
  const match = text.match(/```suggestions\s*\n?\s*(\[[\s\S]*?\])\s*\n?\s*```/)
  if (!match) return { cleanText: text, suggestions: [] }
  const cleanText = text.replace(/```suggestions[\s\S]*?```/, '').trim()
  try {
    return { cleanText, suggestions: JSON.parse(match[1]) }
  } catch {
    return { cleanText: text, suggestions: [] }
  }
}

function parseResumeJson(text: string): string | null {
  const match = text.match(/```json_resume\s*\n?([\s\S]*?)\n?\s*```/)
  return match ? match[1].trim() : null
}

function detectPhase(text: string): number | null {
  const match = text.match(/[Фф]аза\s+([1-5])/i)
  return match ? parseInt(match[1]) : null
}

function PhaseProgressBar({ currentPhase }: { currentPhase: number }) {
  const phaseNames = ['Знакомство', 'Карьера', 'Достижения', 'Инструменты', 'Финализация']
  return (
    <div className="flex items-center gap-2 mb-4">
      {phaseNames.map((name, i) => {
        const phaseNum = i + 1
        const isActive = phaseNum === currentPhase
        const isDone = phaseNum < currentPhase
        return (
          <div key={i} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div
                className="h-2 w-2 rounded-full transition-all"
                style={{
                  background:
                    isDone || isActive
                      ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                      : '#334155',
                }}
              />
              <span
                className="text-[10px] hidden sm:block"
                style={{ color: isActive ? '#a78bfa' : '#475569' }}
              >
                {name}
              </span>
            </div>
            {i < phaseNames.length - 1 && (
              <div
                className="h-px w-6 sm:w-10"
                style={{ background: isDone ? '#6366f1' : '#334155' }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export function InterviewChatV2({
  sessionId,
  initialMessages,
  mode,
  initialPhase,
  messageCount,
}: InterviewChatV2Props) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [phase, setPhase] = useState(initialPhase)
  const [msgCount, setMsgCount] = useState(messageCount)
  const [showLimitWarning, setShowLimitWarning] = useState(false)
  const [isFinalizing, setIsFinalizing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [started, setStarted] = useState(initialMessages.length > 0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      const body = JSON.stringify({
        status: 'paused',
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      })
      navigator.sendBeacon(
        `/api/interview/sessions/${sessionId}`,
        new Blob([body], { type: 'application/json' })
      )
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [sessionId, messages])

  // Auto-start if no messages
  useEffect(() => {
    if (!started) {
      setStarted(true)
      const initMsg =
        mode === 'improve'
          ? 'Привет! Я загрузил своё резюме — проведи со мной интервью и помоги улучшить его.'
          : 'Привет! Помоги мне создать профессиональное резюме с нуля.'
      sendMessage(initMsg, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function renderMessageContent(content: string) {
    const cleaned = content
      .replace(/```suggestions[\s\S]*?```/g, '')
      .replace(/```json_resume[\s\S]*?```/g, '')
      .trim()
    const hasResume = content.includes('```json_resume')
    return (
      <>
        <div className="whitespace-pre-wrap leading-relaxed">{cleaned}</div>
        {hasResume && (
          <div
            className="mt-3 rounded-xl px-4 py-3 text-sm font-medium"
            style={{
              background: 'rgba(99,102,241,0.15)',
              color: '#a78bfa',
              border: '1px solid rgba(99,102,241,0.3)',
            }}
          >
            Резюме сгенерировано — сохраняем...
          </div>
        )}
      </>
    )
  }

  async function handleFinalize(jsonString: string) {
    setIsFinalizing(true)
    try {
      const res = await fetch('/api/interview/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, resumeJson: jsonString }),
      })
      const data = await res.json()

      if (res.status === 402) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              'Недостаточно токенов для завершения. Купите токены на странице /tokens.',
          },
        ])
        return
      }

      if (!res.ok) {
        throw new Error(data.error || 'Ошибка финализации')
      }

      reachGoal('interview_finish')
      router.push('/resume/' + data.resumeId)
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            err instanceof Error
              ? `Ошибка при сохранении резюме: ${err.message}`
              : 'Ошибка при сохранении резюме.',
        },
      ])
    } finally {
      setIsFinalizing(false)
    }
  }

  async function handleSaveAndExit() {
    if (isSaving || isFinalizing) return
    setIsSaving(true)
    try {
      const res = await fetch(`/api/interview/sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'paused',
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Ошибка сохранения')
      }
      router.push('/dashboard')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Не удалось сохранить сессию')
    } finally {
      setIsSaving(false)
    }
  }

  function handleFinishEarly() {
    if (
      confirm(
        'Завершить интервью досрочно? AI сгенерирует резюме из собранных данных.'
      )
    ) {
      sendMessage(
        'Завершай интервью — у меня больше данных нет. Сгенерируй лучшее возможное резюме из того, что есть.'
      )
    }
  }

  async function sendMessage(text: string, isInitial = false) {
    if (!text.trim() || isStreaming || isFinalizing) return

    // Client-side length validation
    if (text.length > INTERVIEW_LIMITS.MAX_MESSAGE_LENGTH) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Сообщение слишком длинное (максимум ${INTERVIEW_LIMITS.MAX_MESSAGE_LENGTH} символов).`,
        },
      ])
      return
    }

    const userMessage: Message = { role: 'user', content: text.trim() }
    const newMessages = isInitial ? [userMessage] : [...messages, userMessage]

    setMessages(newMessages)
    setInput('')
    setSuggestions([])
    setIsStreaming(true)

    const newCount = msgCount + 1
    setMsgCount(newCount)
    if (newCount >= INTERVIEW_LIMITS.SOFT_WARNING_AT_MESSAGE) {
      setShowLimitWarning(true)
    }

    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          sessionId,
        }),
      })

      if (!res.ok) {
        const errData = await res.json()
        if (errData.forceFinalize) {
          // Trigger finish early automatically
          handleFinishEarly()
          return
        }
        throw new Error(errData.error || 'Ошибка соединения')
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No stream')

      const decoder = new TextDecoder()
      let assistantContent = ''
      const assistantMsg: Message = { role: 'assistant', content: '' }
      setMessages([...newMessages, assistantMsg])

      let buffer = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data)
            if (parsed.content) {
              assistantContent += parsed.content
              setMessages((prev) => {
                const updated = [...prev]
                updated[updated.length - 1] = {
                  role: 'assistant',
                  content: assistantContent,
                }
                return updated
              })
            }
          } catch {
            // skip malformed chunks
          }
        }
      }

      // Post-stream processing
      const { suggestions: newSuggestions } = parseSuggestions(assistantContent)
      setSuggestions(newSuggestions)

      const detectedPhase = detectPhase(assistantContent)
      if (detectedPhase !== null) {
        setPhase(detectedPhase)
      }

      const resumeJson = parseResumeJson(assistantContent)
      if (resumeJson) {
        await handleFinalize(resumeJson)
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            err instanceof Error
              ? `Ошибка: ${err.message}`
              : 'Произошла ошибка. Попробуйте ещё раз.',
        },
      ])
    } finally {
      setIsStreaming(false)
    }
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: '#0f172a', color: '#f1f5f9' }}
    >
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: '#1e293b' }}
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span className="text-xs sm:text-sm font-medium truncate" style={{ color: '#94a3b8' }}>
            {mode === 'improve' ? 'Улучшение' : 'Создание'}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full shrink-0"
            style={{
              background: showLimitWarning
                ? 'rgba(251,191,36,0.15)'
                : 'rgba(99,102,241,0.1)',
              color: showLimitWarning ? '#fbbf24' : '#6366f1',
            }}
          >
            {msgCount} сообщений
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleFinishEarly}
            disabled={isStreaming || isFinalizing}
            className="text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{
              background: 'rgba(99,102,241,0.1)',
              color: '#94a3b8',
              border: '1px solid #334155',
            }}
          >
            Завершить
          </button>
          <button
            onClick={handleSaveAndExit}
            disabled={isSaving || isFinalizing}
            className="text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{ background: '#1e293b', color: '#94a3b8', border: '1px solid #334155' }}
          >
            {isSaving ? 'Сохранение...' : 'Сохранить и выйти'}
          </button>
        </div>
      </div>

      {/* Phase progress */}
      <div className="px-4 pt-3">
        <PhaseProgressBar currentPhase={phase} />
      </div>

      {/* Limit warning banner */}
      {showLimitWarning && (
        <div
          className="mx-4 mb-2 rounded-xl px-4 py-3 text-sm"
          style={{
            background: 'rgba(251,191,36,0.1)',
            border: '1px solid rgba(251,191,36,0.3)',
            color: '#fbbf24',
          }}
        >
          Вы почти достигли лимита сообщений. Рекомендуем завершить интервью и получить резюме.
        </div>
      )}

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div
                className="w-7 h-7 rounded-full flex-shrink-0 mr-2 mt-1 flex items-center justify-center text-xs font-bold"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: 'white',
                }}
              >
                AI
              </div>
            )}
            <div
              className="max-w-[80%] rounded-2xl px-4 py-3 text-sm"
              style={
                msg.role === 'user'
                  ? {
                      background:
                        'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      color: 'white',
                    }
                  : {
                      background: '#1e293b',
                      color: '#e2e8f0',
                      border: '1px solid #334155',
                    }
              }
            >
              {msg.role === 'assistant'
                ? renderMessageContent(msg.content)
                : msg.content}
            </div>
          </div>
        ))}

        {/* Streaming indicator */}
        {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex justify-start">
            <div
              className="w-7 h-7 rounded-full flex-shrink-0 mr-2 mt-1 flex items-center justify-center text-xs font-bold"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white',
              }}
            >
              AI
            </div>
            <div
              className="rounded-2xl px-4 py-3 text-sm flex items-center gap-2"
              style={{
                background: '#1e293b',
                border: '1px solid #334155',
                color: '#94a3b8',
              }}
            >
              <span className="animate-pulse">●</span>
              <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>
                ●
              </span>
              <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>
                ●
              </span>
            </div>
          </div>
        )}

        {/* Finalizing indicator */}
        {isFinalizing && (
          <div className="flex justify-center py-4">
            <div className="text-sm animate-pulse" style={{ color: '#a78bfa' }}>
              Создаём ваше резюме...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && !isStreaming && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => sendMessage(s)}
              className="text-xs px-3 py-1.5 rounded-xl text-left transition-all card-glow"
              style={{
                background: '#1e293b',
                color: '#94a3b8',
                border: '1px solid #334155',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="px-4 pb-4 pt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            sendMessage(input)
          }}
          className="flex gap-2 items-end"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage(input)
              }
            }}
            placeholder="Введите ответ или выберите вариант выше..."
            rows={2}
            disabled={isStreaming || isFinalizing}
            maxLength={2000}
            className="flex-1 resize-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-all"
            style={
              {
                background: '#1e293b',
                color: '#f1f5f9',
                border: '1px solid #334155',
                '--tw-ring-color': '#6366f1',
              } as React.CSSProperties
            }
          />
          <button
            type="submit"
            disabled={isStreaming || isFinalizing || !input.trim()}
            className="h-[56px] w-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-opacity disabled:opacity-40"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: 'white',
            }}
          >
            →
          </button>
        </form>
        <p className="text-right text-[11px] mt-1" style={{ color: '#475569' }}>
          {input.length}/2000
        </p>
      </div>
    </div>
  )
}
