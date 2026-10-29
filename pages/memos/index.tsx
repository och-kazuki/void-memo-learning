import { useState } from "react";
import { Form, Link, useForm } from "@void/react";
import { fetch, FetchError } from "void/client";
import { MEMO_BODY_MAX, MEMO_TITLE_MAX } from "../../src/memo-input";
import type { Props } from "./index.server";

export default function MemoListPage({ memos }: Props) {
  const form = useForm("/memos", { title: "", body: "" }, { resetOnSuccess: true });
  const [apiTitles, setApiTitles] = useState<string[] | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  return (
    <div className="stack">
      <section className="panel">
        <h1>メモ</h1>
        <Form form={form} className="stack">
          <label>
            タイトル
            <input
              name="title"
              required
              maxLength={MEMO_TITLE_MAX}
              value={form.data.title}
              onChange={(event) => form.setData("title", event.target.value)}
            />
          </label>
          {form.errors.title ? <p className="error">{form.errors.title}</p> : null}
          <label>
            本文
            <textarea
              name="body"
              rows={4}
              maxLength={MEMO_BODY_MAX}
              value={form.data.body}
              onChange={(event) => form.setData("body", event.target.value)}
            />
          </label>
          {form.errors.body ? <p className="error">{form.errors.body}</p> : null}
          {form.error ? <p className="error">{form.error.message}</p> : null}
          <button type="submit" disabled={form.pending}>
            {form.pending ? "保存しています…" : "メモを追加"}
          </button>
        </Form>
      </section>

      <section className="panel">
        <h2>保存済み</h2>
        {memos.length === 0 ? (
          <p>まだメモはありません。</p>
        ) : (
          <ul className="memo-list">
            {memos.map((memo) => (
              <li key={memo.id}>
                <Link href={`/memos/${memo.id}`}>
                  <strong>{memo.title}</strong>
                  <small>{memo.updatedAt}</small>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel">
        <h2>API</h2>
        <p className="hint">同じ一覧を <code>fetch('/api/memos')</code> で取り直します。</p>
        <button
          type="button"
          onClick={() => {
            setApiError(null);
            void fetch("/api/memos")
              .then((rows) => {
                setApiTitles(rows.map((row) => row.title));
              })
              .catch((error: unknown) => {
                if (error instanceof FetchError) setApiError(`API が ${error.status} を返しました`);
                else setApiError("API を呼び出せませんでした");
              });
          }}
        >
          API から再取得
        </button>
        {apiError ? <p className="error">{apiError}</p> : null}
        {apiTitles ? (
          apiTitles.length === 0 ? (
            <p>API の結果は空です。</p>
          ) : (
            <ul className="memo-list">
              {apiTitles.map((title, index) => (
                <li key={`${index}:${title}`}>{title}</li>
              ))}
            </ul>
          )
        ) : null}
      </section>
    </div>
  );
}
