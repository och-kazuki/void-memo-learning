import { HTTPException } from "hono/http-exception";
import { deleteOwnedMemo, getOwnedMemo, updateOwnedMemo } from "../../../src/memo-store";
import { memoWriteSchema, parseMemoId } from "../../../src/memo-input";
import { defineHandler } from "void";
import { requireAuth } from "void/auth";
import { z } from "zod";

const paramsSchema = z.object({
  id: z.string().regex(/^[1-9]\d*$/),
});

function memoId(value: string): number {
  const id = parseMemoId(value);
  if (id === undefined) throw new HTTPException(404, { message: "メモが見つかりません" });
  return id;
}

export const GET = defineHandler.withValidator({
  params: paramsSchema,
})(async (c, { params }) => {
  const user = requireAuth(c);
  const memo = await getOwnedMemo(user.id, memoId(params.id));
  if (!memo) throw new HTTPException(404, { message: "メモが見つかりません" });
  return memo;
});

export const PUT = defineHandler.withValidator({
  params: paramsSchema,
  body: memoWriteSchema,
})(async (c, { params, body }) => {
  const user = requireAuth(c);
  const memo = await updateOwnedMemo(user.id, memoId(params.id), body);
  if (!memo) throw new HTTPException(404, { message: "メモが見つかりません" });
  return memo;
});

export const DELETE = defineHandler.withValidator({
  params: paramsSchema,
})(async (c, { params }) => {
  const user = requireAuth(c);
  const removed = await deleteOwnedMemo(user.id, memoId(params.id));
  if (!removed) throw new HTTPException(404, { message: "メモが見つかりません" });
  return { deleted: true, id: removed.id };
});
