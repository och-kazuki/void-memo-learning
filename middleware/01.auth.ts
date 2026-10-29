import type { AuthUser } from "void/auth";
import { getUser } from "void/auth";
import { defineMiddleware } from "void";

declare module "void" {
  interface CloudContextVariables {
    shared: { auth: { user: AuthUser | null } };
  }
}

function memoPage(path: string): boolean {
  return path === "/memos" || path.startsWith("/memos/");
}

export default defineMiddleware(async (c, next) => {
  const user = getUser();
  c.set("shared", { auth: { user } });

  const path = new URL(c.req.url).pathname;
  if (user && (path === "/login" || path === "/signup")) return c.redirect("/memos");
  if (!user && memoPage(path)) return c.redirect("/login");

  await next();
});
