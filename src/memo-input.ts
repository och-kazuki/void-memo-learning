import { z } from "zod";

export const MEMO_TITLE_MAX = 80;
export const MEMO_BODY_MAX = 4000;

export const memoWriteSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "タイトルを入力してください")
    .max(MEMO_TITLE_MAX, `タイトルは${MEMO_TITLE_MAX}文字以内です`),
  body: z
    .string()
    .trim()
    .max(MEMO_BODY_MAX, `本文は${MEMO_BODY_MAX}文字以内です`),
});

export type MemoWrite = z.infer<typeof memoWriteSchema>;

const MEMO_ID = /^[1-9]\d*$/;

export function parseMemoId(value: string | undefined): number | undefined {
  if (value === undefined || !MEMO_ID.test(value)) return undefined;
  const id = Number(value);
  if (!Number.isSafeInteger(id)) return undefined;
  return id;
}

/** A missing row and another user's row are both hidden. Callers answer 404. */
export function isOwnedBy(ownerId: string, userId: string): boolean {
  return ownerId === userId;
}
