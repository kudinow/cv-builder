import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { sendMessage, copyMessage, notifyAdmin } from "../telegram-bot";

describe("telegram-bot", () => {
  const originalEnv = { ...process.env };
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    process.env.TELEGRAM_BOT_TOKEN = "TEST_TOKEN";
    process.env.TELEGRAM_ADMIN_CHAT_ID = "999";
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllGlobals();
  });

  describe("sendMessage", () => {
    it("POSTs to sendMessage and returns message_id", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true, result: { message_id: 42 } }),
      });
      const id = await sendMessage(123, "hello");
      expect(id).toBe(42);
      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.telegram.org/botTEST_TOKEN/sendMessage",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining('"chat_id":123'),
        })
      );
    });

    it("throws on non-ok response", async () => {
      fetchMock.mockResolvedValue({ ok: false, status: 500, text: async () => "boom" });
      await expect(sendMessage(123, "x")).rejects.toThrow();
    });
  });

  describe("copyMessage", () => {
    it("POSTs to copyMessage and returns new message_id", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true, result: { message_id: 77 } }),
      });
      const id = await copyMessage(111, 222, 5);
      expect(id).toBe(77);
      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.telegram.org/botTEST_TOKEN/copyMessage",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining('"from_chat_id":111'),
        })
      );
    });
  });

  describe("notifyAdmin", () => {
    it("sends to TELEGRAM_ADMIN_CHAT_ID", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true, result: { message_id: 1 } }),
      });
      await notifyAdmin("test");
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/sendMessage"),
        expect.objectContaining({
          body: expect.stringContaining('"chat_id":999'),
        })
      );
    });

    it("is a no-op when TELEGRAM_ADMIN_CHAT_ID is missing", async () => {
      delete process.env.TELEGRAM_ADMIN_CHAT_ID;
      await notifyAdmin("test");
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("swallows errors and does not throw", async () => {
      fetchMock.mockRejectedValue(new Error("network down"));
      await expect(notifyAdmin("test")).resolves.toBeUndefined();
    });
  });
});
