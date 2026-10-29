import { Form, Link, useForm } from "@void/react";
import { MEMO_BODY_MAX, MEMO_TITLE_MAX } from "../../src/memo-input";
import type { Props } from "./[id].server";

export default function MemoEditPage({ memo }: Props) {
  const id = String(memo.id);
  const updateForm = useForm(
    "/memos/:id?update",
    { title: memo.title, body: memo.body },
    { params: { id } },
  );
  const deleteForm = useForm("/memos/:id?delete", {}, { params: { id } });

  return (
    <section className="panel">
      <p>
        <Link href="/memos">一覧へ戻る</Link>
      </p>
      <h1>メモを編集</h1>
      <Form form={updateForm} method="put" className="stack">
        <label>
          タイトル
          <input
            name="title"
            required
            maxLength={MEMO_TITLE_MAX}
            value={updateForm.data.title}
            onChange={(event) => updateForm.setData("title", event.target.value)}
          />
        </label>
        {updateForm.errors.title ? <p className="error">{updateForm.errors.title}</p> : null}
        <label>
          本文
          <textarea
            name="body"
            rows={8}
            maxLength={MEMO_BODY_MAX}
            value={updateForm.data.body}
            onChange={(event) => updateForm.setData("body", event.target.value)}
          />
        </label>
        {updateForm.errors.body ? <p className="error">{updateForm.errors.body}</p> : null}
        {updateForm.error ? <p className="error">{updateForm.error.message}</p> : null}
        {updateForm.recentlySuccessful ? <p className="ok">保存しました</p> : null}
        <button type="submit" disabled={updateForm.pending}>
          {updateForm.pending ? "保存しています…" : "保存"}
        </button>
      </Form>
      <Form form={deleteForm} method="delete" className="danger-row">
        {deleteForm.error ? <p className="error">{deleteForm.error.message}</p> : null}
        <button type="submit" className="danger" disabled={deleteForm.pending}>
          {deleteForm.pending ? "削除しています…" : "削除"}
        </button>
      </Form>
      <p className="hint">
        作成 {memo.createdAt} / 更新 {memo.updatedAt}
      </p>
    </section>
  );
}
