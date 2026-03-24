"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface InterviewChatProps {
  resumeText?: string;
  onResumeGenerated?: (jsonData: string) => void;
}

function parseSuggestions(text: string): {
  cleanText: string;
  suggestions: string[];
} {
  const match = text.match(/```suggestions\s*\n?\s*(\[[\s\S]*?\])\s*\n?\s*```/);
  if (!match) return { cleanText: text, suggestions: [] };

  const cleanText = text.replace(/```suggestions[\s\S]*?```/, "").trim();
  try {
    const suggestions = JSON.parse(match[1]);
    return { cleanText, suggestions };
  } catch {
    return { cleanText: text, suggestions: [] };
  }
}

function parseResumeJson(text: string): string | null {
  const match = text.match(/```json_resume\s*\n?([\s\S]*?)\n?\s*```/);
  return match ? match[1].trim() : null;
}

export function InterviewChat({
  resumeText,
  onResumeGenerated,
}: InterviewChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [started, setStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Start the interview automatically
  useEffect(() => {
    if (!started) {
      setStarted(true);
      sendMessage(
        resumeText
          ? "Привет! Я загрузил своё резюме — помоги мне его улучшить."
          : "Привет! Помоги мне создать профессиональное резюме.",
        true
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sendMessage(text: string, isInitial = false) {
    if (!text.trim() || isStreaming) return;

    const userMessage: Message = { role: "user", content: text.trim() };
    const newMessages = isInitial ? [userMessage] : [...messages, userMessage];

    setMessages(newMessages);
    setInput("");
    setSuggestions([]);
    setIsStreaming(true);

    try {
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          resumeText: resumeText || undefined,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Ошибка");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No stream");

      const decoder = new TextDecoder();
      let assistantContent = "";
      const assistantMessage: Message = { role: "assistant", content: "" };

      setMessages([...newMessages, assistantMessage]);

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              assistantContent += parsed.content;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: assistantContent,
                };
                return updated;
              });
            }
          } catch {
            // Skip
          }
        }
      }

      // Parse suggestions from the final message
      const { suggestions: newSuggestions } = parseSuggestions(assistantContent);
      setSuggestions(newSuggestions);

      // Check if resume JSON was generated
      const resumeJson = parseResumeJson(assistantContent);
      if (resumeJson && onResumeGenerated) {
        onResumeGenerated(resumeJson);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Произошла ошибка. Попробуйте ещё раз.",
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleSuggestionClick(suggestion: string) {
    sendMessage(suggestion);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function renderMessageContent(content: string) {
    // Remove suggestions block and json_resume block from display
    const cleaned = content
      .replace(/```suggestions[\s\S]*?```/g, "")
      .replace(/```json_resume[\s\S]*?```/g, "")
      .trim();

    // Check if there's a json_resume in the original
    const hasResume = content.includes("```json_resume");

    return (
      <>
        <div className="whitespace-pre-wrap">{cleaned}</div>
        {hasResume && (
          <div className="mt-3 rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-800 dark:border-green-700 dark:bg-green-950 dark:text-green-200">
            Резюме сгенерировано! Смотрите результат ниже.
          </div>
        )}
      </>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              {msg.role === "assistant"
                ? renderMessageContent(msg.content)
                : msg.content}
            </div>
          </div>
        ))}

        {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
              Думаю...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && !isStreaming && (
        <div className="flex flex-wrap gap-2 pb-3">
          {suggestions.map((suggestion, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              className="h-auto whitespace-normal text-left text-xs"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </Button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Введите ответ или нажмите на вариант выше..."
          rows={2}
          disabled={isStreaming}
          className="min-h-[60px] resize-none"
        />
        <Button
          type="submit"
          disabled={isStreaming || !input.trim()}
          className="self-end"
        >
          →
        </Button>
      </form>
    </div>
  );
}
