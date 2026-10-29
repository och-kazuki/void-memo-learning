import { describe, expect, it } from "vitest";
import { isOwnedBy, memoWriteSchema, parseMemoId } from "./memo-input";

describe("memoWriteSchema", () => {
  it("trims title and body", () => {
    const parsed = memoWriteSchema.parse({ title: "  買い物  ", body: "  牛乳  " });
    expect(parsed).toEqual({ title: "買い物", body: "牛乳" });
  });

  it("rejects a blank title", () => {
    const result = memoWriteSchema.safeParse({ title: "   ", body: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === "title")).toBe(true);
    }
  });

  it("rejects a title longer than 80 characters", () => {
    const result = memoWriteSchema.safeParse({ title: "あ".repeat(81), body: "" });
    expect(result.success).toBe(false);
  });

  it("allows an empty body", () => {
    expect(memoWriteSchema.parse({ title: "件名のみ", body: "" }).body).toBe("");
  });
});

describe("parseMemoId", () => {
  it("accepts positive integers", () => {
    expect(parseMemoId("1")).toBe(1);
    expect(parseMemoId("42")).toBe(42);
  });

  it("rejects missing, zero, and non-numeric ids", () => {
    expect(parseMemoId(undefined)).toBeUndefined();
    expect(parseMemoId("0")).toBeUndefined();
    expect(parseMemoId("01")).toBeUndefined();
    expect(parseMemoId("1.5")).toBeUndefined();
    expect(parseMemoId("abc")).toBeUndefined();
  });
});

describe("isOwnedBy", () => {
  it("matches only the same user", () => {
    expect(isOwnedBy("user-a", "user-a")).toBe(true);
    expect(isOwnedBy("user-a", "user-b")).toBe(false);
  });
});
