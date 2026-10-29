import { HTTPException } from "hono/http-exception";
import { deleteOwnedMemo, getOwnedMemo, updateOwnedMemo } from "../../src/memo-store";
import { memoWriteSchema, parseMemoId } from "../../src/memo-input";
import { defineHandler, defineHead, type InferProps } from "void";
import { requireAuth } from "void/auth";

export type Props = InferProps<typeof loader>;

function idFrom(c: { req: { param: (name: string) => string | undefined } }): number {
  const id = parseMemoId(c.req.param("id"));
  if (id === undefined) throw new HTTPException(404, { message: "メモが見つかりません" });
  return id;
}

export const loader = defineHandler(async (c) => {
  const user = requireAuth(c);
  const memo = await getOwnedMemo(user.id, idFrom(c));
  if (!memo) throw new HTTPException(404, { message: "メモが見つかりません" });
  return { memo };
});

export const actions = {
  update: defineHandler.withValidator({
    body: memoWriteSchema,
  })(async (c, { body }) => {
    const user = requireAuth(c);
    const memo = await updateOwnedMemo(user.id, idFrom(c), body);
    if (!memo) throw new HTTPException(404, { message: "メモが見つかりません" });
  }),
  delete: defineHandler(async (c) => {
    const user = requireAuth(c);
    const removed = await deleteOwnedMemo(user.id, idFrom(c));
    if (!removed) throw new HTTPException(404, { message: "メモが見つかりません" });
    return c.redirect("/memos", 303);
  }),
};

export const head = defineHead<Props>((_c, props) => ({ title: props.memo.title }));
