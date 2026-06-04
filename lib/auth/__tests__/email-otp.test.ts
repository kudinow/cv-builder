import { describe, it, expect } from "vitest";
import { isValidEmail, mapOtpError, RESEND_COOLDOWN_SECONDS } from "../email-otp";

describe("isValidEmail", () => {
  it("accepts a normal email", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
  });
  it("rejects missing @ or domain", () => {
    expect(isValidEmail("userexample.com")).toBe(false);
    expect(isValidEmail("user@")).toBe(false);
    expect(isValidEmail("user@example")).toBe(false);
  });
  it("rejects empty / whitespace", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("  ")).toBe(false);
  });
  it("trims surrounding whitespace before validating", () => {
    expect(isValidEmail("  user@example.com  ")).toBe(true);
  });
});

describe("mapOtpError", () => {
  it("returns empty string for no error", () => {
    expect(mapOtpError(null)).toBe("");
  });
  it("maps rate-limit (status 429)", () => {
    expect(mapOtpError({ status: 429 })).toBe("Слишком часто, попробуйте через минуту.");
  });
  it("maps rate-limit (code over_email_send_rate_limit)", () => {
    expect(mapOtpError({ code: "over_email_send_rate_limit" })).toBe(
      "Слишком часто, попробуйте через минуту."
    );
  });
  it("maps expired/invalid code", () => {
    expect(mapOtpError({ code: "otp_expired" })).toBe(
      "Неверный или устаревший код, запросите новый."
    );
    expect(mapOtpError({ message: "Token has expired or is invalid" })).toBe(
      "Неверный или устаревший код, запросите новый."
    );
  });
  it("falls back to a generic message", () => {
    expect(mapOtpError({ message: "boom" })).toBe("Что-то пошло не так. Попробуйте ещё раз.");
  });
});

describe("RESEND_COOLDOWN_SECONDS", () => {
  it("is 60", () => {
    expect(RESEND_COOLDOWN_SECONDS).toBe(60);
  });
});
