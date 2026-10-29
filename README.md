# void-memo-learning

Cloudflare の [Void](https://void.cloud/guide/)（npm パッケージ `void`）で作った、利用者ごとのメモアプリです。React のページ、ファイルベースの API、D1、Better Auth のメール + パスワード認証を同じリポジトリに置いています。Workers AI と Void Platform は使いません。

## ローカル開発

Node.js 24.21.0 以上が必要です。このリポジトリは `.nvmrc` と `.node-version` で 24.22.2 を指定しています。

```sh
nvm use
corepack enable
pnpm install
pnpm run dev
```

ブラウザで http://127.0.0.1:5173 を開きます。登録してから、メモの追加、編集、削除ができます。未ログインで `/memos` を開くと `/login` に戻ります。

`pnpm-workspace.yaml` の `allowBuilds` は Void の指定どおりです。`esbuild`、`sharp`、`workerd` は許可し、`better-sqlite3` は許可しません。Void は同梱のバイナリを使います。

よく使うコマンド:

| コマンド | 内容 |
| --- | --- |
| `pnpm run dev` | ローカルの Workers ランタイムで起動 |
| `pnpm test` | Vitest |
| `pnpm run typecheck` | `tsc --noEmit` |
| `pnpm run lint` | Vite+ の oxlint |
| `pnpm exec void db generate` | スキーマ変更後に SQL マイグレーションを生成 |

メール + パスワードのローカル開発にシークレットは不要です。本番ビルドを `pnpm run preview` で見るときだけ、`env.example` を `.env` にコピーしてください。値は例です。本物の秘密情報は入れないでください。

Void 1.3.0 はプロジェクト直下の `.env.example` や `.env.*` があると、開発サーバ、テスト、lint を起動時に止めます。プレースホルダは `env.example` に置いてあります。Void が読むのは `.env` だけです。

## 初回の手動デプロイ

Void は最初のデプロイを、1 台の手元のマシンから行うよう定めています。失敗したビルドでもリソースがアカウントに残ることがあり、`void.lock.json` を共有する前に別のマシンや CI からデプロイするとリソースが重複します。このリポジトリにはまだ `void.lock.json` がありません。

```sh
pnpm exec void deploy --platform cloudflare
```

ブラウザで Cloudflare にログインし、アカウントを選びます。Void がビルドし、D1 を作り、`db/migrations/` を適用し、URL を表示します。認証を使うアプリでは、未設定なら `BETTER_AUTH_SECRET` を Worker のシークレットとして作成します。自分で値を決める場合は、デプロイ前に次を実行します。

```sh
pnpm exec void secret put BETTER_AUTH_SECRET
```

入力した値はターミナルに残さず、リポジトリにも入れません。`.env` はデプロイされません。

成功したら生成された `void.lock.json` を確認してコミットします。中身は後述します。アカウント ID を `void.config.ts` には書いていません。トークンが複数アカウントに届く場合は、CI の `CLOUDFLARE_ACCOUNT_ID` で指定します。

## GitHub のシークレット

`main` への push で `.github/workflows/void-deploy.yml` がデプロイします。`void.lock.json` が無い間はデプロイを成功扱いでスキップし、理由をログに出します。pull request ではインストール、`void prepare`、型チェック、lint、テストだけを実行します。

リポジトリの Settings → Secrets and variables → Actions に、最低限次を登録します。

| 名前 | 内容 |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | 必須。このアプリ用の API トークン |
| `CLOUDFLARE_ACCOUNT_ID` | トークンが複数アカウントに届くとき。単一アカウントなら空でも CLI は無視する |

トークンは専用のものを作り、対象アカウントだけに限定します。Void のドキュメントが求める権限は次のとおりです。

- Workers Scripts: Edit
- バインドするリソースの読み取り
- Void が作るプロダクトの編集権限。このアプリが作るのは D1 なので、D1 の Edit

Workers AI、メール、Hyperdrive、Containers、Access はこのアプリでは使いません。それらの権限は付けません。PostgreSQL 用の `DATABASE_URL` も不要です。生成されたワークフローには、後から Access やプレビュー URL が必要になったときのための変数名が残っています。今は設定しなくて構いません。

トークンの値とアカウント ID はコード、ログ、コミットメッセージに書かないでください。

## 費用

このアプリは Cloudflare Workers と D1 だけです。どちらも無料枠があり、個人の学習用途なら $0 で収まる想定です。Workers AI は呼び出さないので、その利用料は発生しません。Void Platform（Workers for Platforms 上のチーム向けデプロイ基盤）も使いません。無料枠の上限を超えたリクエストや、有料プランが必要な機能（Sandbox、任意宛先へのメールなど）を足さない限り、追加料金は出ません。

## ECS Fargate + Terraform との違い

同じメモアプリを ECS Fargate と Terraform で置く場合、VPC、サブネット、ALB、タスク定義、RDS などの常時起動する構成と、その state が必要になります。小さなサービスでも ALB と Fargate の時間課金が残ります。

Void では Worker と D1 を、コード上の import と `void deploy` が用意します。コンテナの台数、ロードバランサ、データベースサーバは持ちません。スキーマは `db/schema.ts` とコミットした SQL が正です。

その代わり、Worker と D1 の ID は `void.lock.json` が持ちます。同じリソースを Terraform の Cloudflare プロバイダでも管理すると、次のデプロイで取り合いになります。Terraform は後述の周辺リソースに限る、という分け方にしています。

## TODO

- ステージング環境。名前付きの Cloudflare environment は Void がサポートしないので、別の Void 設定（別プロジェクト）として分ける
- Terraform（Cloudflare プロバイダ）は周辺だけにする。API トークン、DNS、Cloudflare Access。Worker 本体と D1 は Void に任せる
- 拡張の候補は R2（添付）、KV（短いキャッシュ）、cron（期限切れセッションの掃除）。いずれも今は未使用

## `void.lock.json` に入るもの

初回デプロイのあと、Void は解決済みの Cloudflare 設定を `void.lock.json` に書きます。想定されるのは Worker 名、互換性の日付、D1 の `database_id`、そして選んだアカウントの `account_id` です。Durable Object を使うようになると、そのマイグレーション履歴も追記されます。

API トークン、`BETTER_AUTH_SECRET`、`.env` の値はここには入りません。シークレットは Worker のシークレットとして残り、リポジトリには戻りません。

`account_id` と `database_id` は認証情報ではありませんが、公開リポジトリではアカウントとデータベースを特定できる識別子です。Void は CI の前にこのファイルをコミットするよう求めています。公開してよいかは、コミットする前に中身を見て判断してください。
