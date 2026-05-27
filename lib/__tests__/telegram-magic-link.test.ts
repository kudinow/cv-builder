import { describe, it, expect } from "vitest";
import { extractTokenHash } from "../telegram-magic-link";

describe("extractTokenHash", () => {
  it("extracts token_hash from Supabase action_link", () => {
    const url = "https://abc.supabase.co/auth/v1/verify?token=XYZ&type=magiclink&redirect_to=https://cv-builder.ru/callback";
    expect(extractTokenHash(url)).toBe("XYZ");
  });
  it("accepts token_hash named param as well", () => {
    const url = "https://abc.supabase.co/auth/v1/verify?token_hash=HHH&type=magiclink";
    expect(extractTokenHash(url)).toBe("HHH");
  });
  it("throws when neither token nor token_hash present", () => {
    expect(() => extractTokenHash("https://example.com/foo")).toThrow();
  });
});
