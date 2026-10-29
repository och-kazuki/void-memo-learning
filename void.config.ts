import { defineConfig } from "void/config";

export default defineConfig({
  auth: {
    providers: ["email"],
  },
  head: {
    title: "メモ",
    htmlAttrs: { lang: "ja" },
    meta: [{ name: "viewport", content: "width=device-width, initial-scale=1" }],
  },
  worker: {
    compatibility_date: "2026-02-24",
    compatibility_flags: ["nodejs_compat"],
  },
  cloudflare: {
    name: "void-memo-learning",
  },
});
