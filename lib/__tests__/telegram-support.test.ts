import { describe, it, expect, beforeEach, vi } from "vitest";
import { relayUserToAdmin, relayAdminToUser } from "../telegram-support";

type FromTg = { id: number; username?: string; first_name?: string };

function makeAdmin(profile: { telegram_id?: number | null; full_name?: string | null; tokens?: number | null } | null) {
  const maybeSingle = vi.fn().mockResolvedValue({ data: profile, error: null });
  const eq = vi.fn().mockReturnValue({ maybeSingle });
  const select = vi.fn().mockReturnValue({ eq });
  const insert = vi.fn().mockResolvedValue({ error: null });
  const from = vi.fn().mockImplementation((table: string) => {
    if (table === "profiles") return { select };
    if (table === "telegram_support_messages") return { select: () => ({ eq: () => ({ maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }) }) }), insert };
    return {};
  });
  return { client: { from }, insert };
}

describe("relayUserToAdmin", () => {
  let bot: { sendMessage: ReturnType<typeof vi.fn>; copyMessage: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    bot = {
      sendMessage: vi.fn().mockResolvedValue(100),
      copyMessage: vi.fn().mockResolvedValue(101),
    };
  });

  it("sends a card with profile data, copies the message, writes two inbound rows", async () => {
    const admin = makeAdmin({ telegram_id: 12345, full_name: "Nikolay", tokens: 320 });
    const from: FromTg = { id: 12345, username: "kudinow", first_name: "Nikolay" };

    await relayUserToAdmin(
      { fromChatId: 12345, messageId: 5, from },
      { adminChatId: 999, admin: admin.client as never, bot: bot as never }
    );

    expect(bot.sendMessage).toHaveBeenCalledWith(
      999,
      expect.stringContaining("@kudinow")
    );
    const card = bot.sendMessage.mock.calls[0][1];
    expect(card).toContain("Nikolay");
    expect(card).toContain("12345");
    expect(card).toContain("320");

    expect(bot.copyMessage).toHaveBeenCalledWith(12345, 999, 5);

    expect(admin.insert).toHaveBeenCalledTimes(2);
    expect(admin.insert).toHaveBeenNthCalledWith(1, expect.objectContaining({
      admin_message_id: 100, user_chat_id: 12345, user_telegram_id: 12345, direction: "inbound",
    }));
    expect(admin.insert).toHaveBeenNthCalledWith(2, expect.objectContaining({
      admin_message_id: 101, user_chat_id: 12345, user_telegram_id: 12345, direction: "inbound",
    }));
  });

  it("omits balance line when profile is missing", async () => {
    const admin = makeAdmin(null);
    const from: FromTg = { id: 999, username: "unknown" };

    await relayUserToAdmin(
      { fromChatId: 999, messageId: 1, from },
      { adminChatId: 999, admin: admin.client as never, bot: bot as never }
    );

    const card = bot.sendMessage.mock.calls[0][1];
    expect(card).not.toMatch(/Баланс/);
    expect(card).toContain("@unknown");
  });
});

describe("relayAdminToUser", () => {
  let bot: { sendMessage: ReturnType<typeof vi.fn>; copyMessage: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    bot = {
      sendMessage: vi.fn().mockResolvedValue(200),
      copyMessage: vi.fn().mockResolvedValue(201),
    };
  });

  function makeAdminClient(mapping: { user_chat_id: number; user_telegram_id: number } | null) {
    const maybeSingle = vi.fn().mockResolvedValue({ data: mapping, error: null });
    const eq = vi.fn().mockReturnValue({ maybeSingle });
    const select = vi.fn().mockReturnValue({ eq });
    const insert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn().mockImplementation((table: string) => {
      if (table === "telegram_support_messages") return { select, insert };
      return {};
    });
    return { client: { from }, insert };
  }

  it("copies the admin reply to the user chat and logs outbound", async () => {
    const admin = makeAdminClient({ user_chat_id: 12345, user_telegram_id: 12345 });

    await relayAdminToUser(
      { adminChatId: 999, replyMessageId: 100, adminReplyMessageId: 50 },
      { admin: admin.client as never, bot: bot as never }
    );

    expect(bot.copyMessage).toHaveBeenCalledWith(999, 12345, 50);
    expect(admin.insert).toHaveBeenCalledWith(expect.objectContaining({
      admin_message_id: 50, user_chat_id: 12345, direction: "outbound",
    }));
    expect(bot.sendMessage).not.toHaveBeenCalled();
  });

  it("tells admin when no mapping exists", async () => {
    const admin = makeAdminClient(null);

    await relayAdminToUser(
      { adminChatId: 999, replyMessageId: 7777, adminReplyMessageId: 50 },
      { admin: admin.client as never, bot: bot as never }
    );

    expect(bot.copyMessage).not.toHaveBeenCalled();
    expect(bot.sendMessage).toHaveBeenCalledWith(999, expect.stringContaining("Не нашёл"));
  });
});
