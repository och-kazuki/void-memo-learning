import { Link, useShared } from "@void/react";

export default function HomePage() {
  const { auth: session } = useShared();
  const user = session.user;

  return (
    <section className="panel">
      <h1>自分だけのメモ</h1>
      <p>メールアドレスとパスワードで入り、メモの作成、編集、削除ができます。ほかの利用者のメモは見えません。</p>
      {user ? (
        <p>
          <Link className="button" href="/memos">
            メモを開く
          </Link>
        </p>
      ) : (
        <p className="actions">
          <Link className="button" href="/signup">
            アカウントを作成
          </Link>
          <Link className="button secondary" href="/login">
            ログイン
          </Link>
        </p>
      )}
    </section>
  );
}
