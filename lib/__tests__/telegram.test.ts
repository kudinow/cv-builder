import { describe, it, expect } from "vitest";
import { generateAuthToken, parseStartPayload, buildDeepLink, telegramEmail } from "../telegram";

describe("generateAuthToken", () => {
  it("returns url-safe base64 string of length 43 (256-bit)", () => {
    const t = generateAuthToken();
    expect(t).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });
  it("generates unique tokens", () => {
    const a = generateAuthToken();
    const b = generateAuthToken();
    expect(a).not.toBe(b);
  });
});

describe("parseStartPayload", () => {
  it("extracts payload after /start", () => {
    expect(parseStartPayload("/start abc123")).toBe("abc123");
  });
  it("returns null for bare /start", () => {
    expect(parseStartPayload("/start")).toBeNull();
  });
  it("returns null for non-start commands", () => {
    expect(parseStartPayload("hello")).toBeNull();
    expect(parseStartPayload("/help")).toBeNull();
  });
  it("trims whitespace", () => {
    expect(parseStartPayload("/start   xyz   ")).toBe("xyz");
  });
});

describe("buildDeepLink", () => {
  it("builds t.me link with start payload", () => {
    expect(buildDeepLink("mybot", "TOKEN123")).toBe("https://t.me/mybot?start=TOKEN123");
  });
});

describe("telegramEmail", () => {
  it("formats fake email from telegram_id", () => {
    expect(telegramEmail(12345)).toBe("tg-12345@telegram.cv-builder.ru");
  });
});
