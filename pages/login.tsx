import { useState } from "react";
import { Link, useRouter } from "@void/react";
import { auth } from "void/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <section className="panel narrow">
      <h1>ログイン</h1>
      <form
        className="stack"
        onSubmit={(event) => {
          event.preventDefault();
          setPending(true);
          setError(null);
          void auth.signIn
            .email({ email, password })
            .then((result) => {
              if (result.error) {
                setError("メールアドレスまたはパスワードが違います");
                return;
              }
              return router.visit("/memos");
            })
            .catch(() => {
              setError("ログインできませんでした");
            })
            .finally(() => {
              setPending(false);
            });
        }}
      >
        <label>
          メールアドレス
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label>
          パスワード
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error ? <p className="error">{error}</p> : null}
        <button type="submit" disabled={pending}>
          {pending ? "確認しています…" : "ログイン"}
        </button>
      </form>
      <p className="hint">
        アカウントがなければ <Link href="/signup">登録</Link>
      </p>
    </section>
  );
}
