import { useState } from "react";
import { Link, useRouter } from "@void/react";
import { auth } from "void/client";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <section className="panel narrow">
      <h1>登録</h1>
      <form
        className="stack"
        onSubmit={(event) => {
          event.preventDefault();
          setPending(true);
          setError(null);
          void auth.signUp
            .email({ name, email, password })
            .then((result) => {
              if (result.error) {
                const message = result.error.message?.toLowerCase() ?? "";
                if (message.includes("password")) {
                  setError("パスワードは8文字以上にしてください");
                } else if (message.includes("exist") || message.includes("already")) {
                  setError("このメールアドレスは既に登録されています");
                } else {
                  setError("登録できませんでした");
                }
                return;
              }
              return router.visit("/memos");
            })
            .catch(() => {
              setError("登録できませんでした");
            })
            .finally(() => {
              setPending(false);
            });
        }}
      >
        <label>
          名前
          <input
            name="name"
            autoComplete="name"
            required
            maxLength={80}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
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
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error ? <p className="error">{error}</p> : null}
        <button type="submit" disabled={pending}>
          {pending ? "作成しています…" : "登録する"}
        </button>
      </form>
      <p className="hint">
        登録済みなら <Link href="/login">ログイン</Link>
      </p>
    </section>
  );
}
