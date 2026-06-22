"use client";

import { useState, type ReactNode } from "react";
import { reachGoal } from "@/lib/metrika";
import { TESTIMONIAL_PLACEHOLDER, type SegmentData } from "@/lib/landing-segments";
import "./segment-landing.css";

const AUTH_HREF = "/auth";
const SUPPORT_HREF = "https://t.me/cvbuilder_support_bot";

/** Renders **bold** markers from config strings as <b> without dangerouslySetInnerHTML. */
function Rich({ text }: { text: string }): ReactNode {
  const parts = text.split("**");
  return (
    <>
      {parts.map((part, i) => (i % 2 === 1 ? <b key={i}>{part}</b> : <span key={i}>{part}</span>))}
    </>
  );
}

const STATIC_CHECKLIST = [
  "Регистрируешься без карты — 1 клик",
  "Проходишь AI-интервью — 15–20 минут",
  "Видишь готовое резюме на экране — бесплатно",
  "Платишь 390 ₽, только если решил скачать",
];

export function SegmentLanding({ data }: { data: SegmentData }) {
  const [line, setLine] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function onCtaClick() {
    reachGoal("lp_cta_click");
  }

  async function rewriteLine() {
    const value = line.trim();
    if (!value || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ line: value, segment: data.id }),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.result) {
        setResult(json.result);
        reachGoal("rewrite_used");
      } else {
        // Surfaced fallback (rate limit etc.) or unexpected error — never blank.
        setResult(json?.result ?? data.fallbacks[0]);
      }
    } catch {
      // Network/timeout — show a segment fallback so the block never breaks.
      setResult(data.fallbacks[0]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="lp">
      <header>
        <div className="nav">
          <div className="logo">
            CV<span>Builder</span>
          </div>
          <a className="login" href={AUTH_HREF} onClick={onCtaClick}>
            Войти
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="herosec">
        <div className="hero">
          <div className="inner">
            <span className="pill">{data.hero.pill}</span>
            <h1>
              {data.hero.h1[0]}
              <br />
              {data.hero.h1[1]}
            </h1>
            <p>{data.hero.lead}</p>
            <a className="btn btn-orange" href={AUTH_HREF} onClick={onCtaClick}>
              Собрать резюме бесплатно →
            </a>
            <p className="note">Интервью и готовое резюме — бесплатно. Платишь, только если скачиваешь.</p>
          </div>
        </div>
      </section>

      {/* PAIN */}
      <section>
        <div className="wrap">
          <h2>
            {data.pain.head[0]}
            <br />
            {data.pain.head[1]}
          </h2>
          <div className="rows">
            {data.pain.rows.map((row, i) => (
              <div className="rose" key={i}>
                <Rich text={row} />
              </div>
            ))}
          </div>
          <p className="kicker">Это чинится. И быстрее, чем ты думаешь.</p>
        </div>
      </section>

      {/* VALUE */}
      <section>
        <div className="wrap">
          <h2>
            {data.value.head.before}
            <span className="o">{data.value.head.highlight}</span>
            {data.value.head.after}
          </h2>
          <p className="sub">{data.value.sub}</p>
          <div className="g2">
            {data.value.cards.map((card, i) => (
              <div className="green" key={i}>
                <h4>{card.title}</h4>
                <ul>
                  {card.items.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTERACTIVE DEMO */}
      <section>
        <div className="wrap">
          <div className="demo">
            <h2 style={{ fontSize: 24 }}>
              Вставь одну строчку из резюме —<br />
              покажем, как она зазвучит
            </h2>
            <div className="field">
              <input
                type="text"
                value={line}
                placeholder={data.demo.placeholder}
                maxLength={200}
                onChange={(e) => setLine(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") rewriteLine();
                }}
              />
              <button className="btn btn-orange" onClick={rewriteLine} disabled={loading}>
                {loading ? "Анализирую…" : "Переписать бесплатно"}
              </button>
            </div>
            <div className={`out${result ? " show" : ""}`}>
              → <b>{result}</b>
              {result && (
                <div className="disclaimer">
                  Цифры — пример. В полном интервью подставим твои реальные.
                </div>
              )}
            </div>
            <p className="note">
              Это всего одна строчка. Представь, как зазвучит всё резюме.{" "}
              <a
                href={AUTH_HREF}
                onClick={onCtaClick}
                style={{ color: "var(--orange)", fontWeight: 700 }}
              >
                Собрать полное →
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* BEFORE / AFTER */}
      <section>
        <div className="wrap">
          <h2>Почувствуй разницу прямо сейчас</h2>
          <p className="sub">Слева — как ты пишешь сейчас. Справа — как это будет в твоём резюме.</p>
          <div className="ba">
            <div className="col bad">
              <div className="tag">✕ Было</div>
              {data.beforeAfter.bad}
            </div>
            <div className="col good">
              <div className="tag">✓ Стало</div>
              <Rich text={data.beforeAfter.good} />
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section>
        <div className="wrap">
          <h2>Как это работает</h2>
          <div className="steps">
            {data.steps.map((step, i) => (
              <div className="row" key={i}>
                <div className="num">{i + 1}</div>
                <div>
                  <h4>{step.title}</h4>
                  <p>{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARE */}
      <section>
        <div className="wrap">
          <h2>Что ты получаешь — и чего не делают другие</h2>
          <div className="cmp">
            <div className="col we">
              <h4>✓ CV Builder</h4>
              {data.compare.we.map((item, i) => (
                <div className="it" key={i}>
                  <Rich text={item} />
                </div>
              ))}
            </div>
            <div className="col them">
              <h4>✕ Альтернативы</h4>
              {data.compare.them.map((item, i) => (
                <div className="it" key={i}>
                  <Rich text={item} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* EMOTIONS */}
      <section>
        <div className="wrap">
          <h2>Куда ты придёшь</h2>
          <div className="emo">
            {data.emotions.map((emotion, i) => (
              <div className="e" key={i}>
                {emotion}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DARK CTA */}
      <section>
        <div className="wrap">
          <div className="darkcta">
            <h2>Как собрать своё резюме</h2>
            <ul className="chk">
              {STATIC_CHECKLIST.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <a className="btn btn-orange" href={AUTH_HREF} onClick={onCtaClick}>
              Собрать резюме бесплатно →
            </a>
            <p className="note" style={{ color: "rgba(255,255,255,.7)" }}>
              Без привязки карты. Сначала результат — потом оплата.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section>
        <div className="wrap">
          <h2>Частые вопросы</h2>
          {data.faq.map((item, i) => (
            <details key={i} open={i === 0}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section>
        <div className="wrap">
          <h2>{data.testimonials.heading}</h2>
          <div className="treviews">
            <div className="tgrid">
              {data.testimonials.quotes.map((quote, i) => (
                <div className="tcard" key={i}>
                  {quote}
                  <div className="ph">{TESTIMONIAL_PLACEHOLDER}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap">
          © 2026 CV Builder ·{" "}
          <a href={SUPPORT_HREF} target="_blank" rel="noopener noreferrer">
            Поддержка в Telegram
          </a>
        </div>
      </footer>
    </div>
  );
}
