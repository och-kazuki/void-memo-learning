import { memos } from "@schema";
import { db, and, desc, eq, sql } from "void/db";
import { isOwnedBy, type MemoWrite } from "./memo-input";

export async function listMemos(userId: string) {
  return db.select().from(memos).where(eq(memos.userId, userId)).orderBy(desc(memos.updatedAt), desc(memos.id));
}

export async function getOwnedMemo(userId: string, id: number) {
  const [row] = await db.select().from(memos).where(and(eq(memos.id, id), eq(memos.userId, userId)));
  if (!row || !isOwnedBy(row.userId, userId)) return undefined;
  return row;
}

export async function createMemo(userId: string, input: MemoWrite) {
  const [row] = await db
    .insert(memos)
    .values({
      userId,
      title: input.title,
      body: input.body,
    })
    .returning();
  return row;
}

export async function updateOwnedMemo(userId: string, id: number, input: MemoWrite) {
  const [row] = await db
    .update(memos)
    .set({
      title: input.title,
      body: input.body,
      updatedAt: sql`(datetime('now'))`,
    })
    .where(and(eq(memos.id, id), eq(memos.userId, userId)))
    .returning();
  if (!row || !isOwnedBy(row.userId, userId)) return undefined;
  return row;
}

export async function deleteOwnedMemo(userId: string, id: number) {
  const [row] = await db
    .delete(memos)
    .where(and(eq(memos.id, id), eq(memos.userId, userId)))
    .returning({ id: memos.id, userId: memos.userId });
  if (!row || !isOwnedBy(row.userId, userId)) return undefined;
  return row;
}
