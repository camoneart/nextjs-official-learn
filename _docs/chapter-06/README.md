# App Router：データベースのセットアップ

**公開日:** 2025年11月18日

**原文:** https://nextjs.org/learn/dashboard-app/setting-up-your-database

---

## 第6章

このチャプターではNext.jsダッシュボードアプリケーション用のPostgreSQLデータベースを確立し、初期データを投入する方法について説明します。

## カバーされるトピック

- プロジェクトをGitHubにプッシュする
- VercelアカウントをセットアップしてGitHubリポジトリとリンクする
- プロジェクトをPostgresデータベースにリンクして作成する
- 初期データでデータベースをシード化する

## GitHubリポジトリの作成

まず、リポジトリをGitHubにプッシュします。これはデータベースのセットアップとデプロイプロセスを容易にします。

> **注:** GitLabやBitbucketなどの別のGitプロバイダーがサポートされています。GitHubが初めての方にはGitHub Desktop Appをお勧めします。

## Vercelアカウントの作成

vercel.com/signupにアクセスして、アカウントを確立します。無料のhobbyプランを選択し、「Continue with GitHub」を選択してアカウントを接続します。

## プロジェクトを接続してデプロイする

アカウント作成後、GitHubリポジトリを選択してインポートする画面にアクセスします。プロジェクト名を付けてDeployをクリックします。完了後、プロジェクトはデプロイメントURLを受け取ります。

「GitHubリポジトリを接続することで、**main**ブランチに変更をプッシュするたびに、Vercelは追加の構成なしであなたのアプリケーションを自動的に再デプロイします。」プルリクエスト用のプレビューURLが表示され、早期にエラーを検出できます。

## Postgresデータベースの作成

プロジェクトダッシュボードのStorageタブから「Create Database」を選択します。優先するプロバイダーを選択してください（アカウント作成日に応じてNeonまたはSupabase）。

リージョンを選択してください。「すべてのVercelプロジェクトのデフォルトリージョンは**Washington D.C (iad1)**」です。レイテンシ削減に最適です。

`.env.local`タブに移動し、シークレットを表示してスニペットをコピーします。`.env.example`を`.env`に名前変更し、内容を貼り付けます。

> **重要:** `.env`が`.gitignore`ファイルに表示されていることを確認して、GitHubでデータベースシークレットが公開されないようにします。

## データベースのシード化

アクセス可能なAPIはシードスクリプトを実行して、データベースに初期データを投入します。「スクリプトは**SQL**を使用してテーブルを作成し、テーブルが作成されたら`placeholder-data.ts`ファイルからのデータで投入します。」

`pnpm run dev`を実行して`localhost:3000/seed`に移動します。完了すると「Database seeded successfully」が表示されます。その後、このファイルを削除できます。

### トラブルシューティング

- `.env`にコピーする前にデータベースシークレットが表示されていることを確認する
- スクリプトは`bcrypt`を使用します；互換性がない場合は、`bcryptjs`の使用に更新してください
- スクリプトを再実行する場合は、データベースクエリインターフェイスで`DROP TABLE tablename`を実行してください（本番環境では慎重に使用）

## クエリを実行する

`app/query/route.ts`のRouter Handlerを使用してデータベース接続をテストします。`listInvoices()`関数は以下を実行します：

```sql
SELECT invoices.amount, customers.name
FROM invoices
JOIN customers ON invoices.customer_id = customers.id
WHERE invoices.amount = 666;
```

ファイルのコメントを解除し、`Response.json()`ブロックを削除して、`localhost:3000/query`にアクセスして返された請求書データを検証します。

---

**次：** 第7章ではAPIやSQLクエリなど様々な方法を使用してデータベースからデータをフェッチについて説明します。
