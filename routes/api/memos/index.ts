import { createMemo, listMemos } from "../../../src/memo-store";
import { memoWriteSchema } from "../../../src/memo-input";
import { defineHandler } from "void";
import { requireAuth } from "void/auth";

export const GET = defineHandler(async (c) => {
  const user = requireAuth(c);
  return listMemos(user.id);
});

export const POST = defineHandler.withValidator({
  body: memoWriteSchema,
})(async (c, { body }) => {
  const user = requireAuth(c);
  const created = await createMemo(user.id, body);
  if (!created) return c.json({ error: "メモを保存できませんでした" }, 500);
  return c.json(created, 201);
});
