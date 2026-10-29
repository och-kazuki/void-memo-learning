import { createMemo, listMemos } from "../../src/memo-store";
import { memoWriteSchema } from "../../src/memo-input";
import { defineHandler, defineHead, type InferProps } from "void";
import { requireAuth } from "void/auth";

export type Props = InferProps<typeof loader>;

export const loader = defineHandler(async (c) => {
  const user = requireAuth(c);
  return {
    memos: await listMemos(user.id),
  };
});

export const action = defineHandler.withValidator({
  body: memoWriteSchema,
})(async (c, { body }) => {
  const user = requireAuth(c);
  await createMemo(user.id, body);
});

export const head = defineHead(() => ({ title: "メモ一覧" }));
