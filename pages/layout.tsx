import type { ReactNode } from "react";
import { Link, useRouter, useShared } from "@void/react";
import { auth } from "void/client";
import "./style.css";

export default function Layout({ children }: { children: ReactNode }) {
  const { auth: session } = useShared();
  const user = session.user;
  const router = useRouter();

  return (
    <div className="app">
      <header className="topbar">
        <Link className="brand" href="/">
          メモ
        </Link>
        <nav className="nav">
          {user ? (
            <>
              <span className="who">{user.name}</span>
              <Link href="/memos">一覧</Link>
              <button
                type="button"
                onClick={() => {
                  void auth.signOut().then(() => router.visit("/"));
                }}
              >
                ログアウト
              </button>
            </>
          ) : (
            <>
              <Link href="/login">ログイン</Link>
              <Link href="/signup">登録</Link>
            </>
          )}
        </nav>
      </header>
      <main className="content">{children}</main>
    </div>
  );
}
