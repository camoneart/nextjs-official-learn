# App Router：データのフェッチング

**公開日:** 2025年11月18日

**原文:** https://nextjs.org/learn/dashboard-app/fetching-data

---

## 第7章

### 概要

このチャプターはNext.jsアプリケーションでのデータフェッチングの異なる方法を説明し、Server Componentsを使用してダッシュボード概要ページを構築する方法を実演します。

### カバーされるトピック

- データフェッチングの方法：API、ORM、SQL など
- Server Componentsを使用してバックエンドリソースにセキュアにアクセスする
- ネットワークウォーターフォールを理解する
- JavaScriptパターンで並列データフェッチングを実装する

## データのフェッチング方法を選択する

### APIレイヤー

APIはアプリケーションコードとデータベースの間の仲介役として機能します。以下の場合に有用です：

- APIを持つサードパーティサービスを使用する場合
- データベースシークレットを保護しながらクライアント側でデータをフェッチする場合

Next.jsはRoute Handlersを通じてAPIエンドポイントをサポートします。

### データベースクエリ

フルスタックアプリケーションはデータベースインタラクションロジックが必要です。Postgresのようなリレーショナルデータベースの場合は、SQLまたはORMを使用します。

データベースクエリを書く場合：

- APIエンドポイントを作成する場合
- React Server Components（サーバー側フェッチング）を使用する場合

### Server Componentsを使用してデータをフェッチする

デフォルトでは、Next.jsアプリケーションはReact Server Componentsを使用し、以下の利点があります：

- JavaScriptのPromisesで非同期操作をサポート
- サーバー上で実行され、サーバー側で高コストな操作を保つ
- 追加のAPIレイヤーなしにデータベースに直接クエリする

### SQLの使用

ダッシュボードはいくつかの理由でpostgres.jsライブラリをSQLと共に使用します：

- 「SQLはリレーショナルデータベースをクエリするための業界標準」
- リレーショナルデータベースの基礎を理解するのに役立つ
- 特定のデータのフェッチングと操作に汎用的
- postgres.jsはSQLインジェクション保護を提供

## ダッシュボード概要ページ用のデータのフェッチング

`/app/dashboard/page.tsx`に移動します。ページはasync Server Componentであり、データフェッチングのための`await`を許可します。

3つのコンポーネントがデータを受け取ります：
- `<Card>`
- `<RevenueChart>`
- `<LatestInvoices>`

### RevenueChartデータのフェッチング

`data.ts`から`fetchRevenue`をインポートします：

```typescript
import { fetchRevenue } from '@/app/lib/data';

export default async function Page() {
  const revenue = await fetchRevenue();
}
```

その後、`<RevenueChart/>`コンポーネントのコメントを解除し、コンポーネントファイルに移動してそのコードのコメントを解除します。

### LatestInvoicesデータのフェッチング

すべての請求書をフェッチしてJavaScriptでソートするのではなく、SQLクエリを使用して最後の5つだけをフェッチします：

```sql
SELECT invoices.amount, customers.name, customers.image_url, customers.email
FROM invoices
JOIN customers ON invoices.customer_id = customers.id
ORDER BY invoices.date DESC
LIMIT 5
```

`fetchLatestInvoices`をインポートします：

```typescript
import { fetchLatestInvoices } from '@/app/lib/data';

export default async function Page() {
  const latestInvoices = await fetchLatestInvoices();
}
```

### 練習：Card Componentデータのフェッチング

カードが表示する内容：
- 請求済み請求書の合計
- 保留中の請求書の合計
- 請求書の合計数
- 顧客の合計数

クライアント側で操作するのではなく、必要なデータのみをフェッチするためSQLを使用します：

```javascript
const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
```

`fetchCardData`から値をインポートして分割代入します。

## リクエストウォーターフォールとは？

「ウォーターフォールは、前のリクエストの完了に依存するネットワークリクエストのシーケンス」を指します。各リクエストは前のリクエストが完了するのを待ちます。

シーケンシャルフェッチングの例：

```javascript
const revenue = await fetchRevenue();
const latestInvoices = await fetchLatestInvoices();
const { numberOfInvoices, numberOfCustomers, totalPaidInvoices, totalPendingInvoices } = await fetchCardData();
```

ウォーターフォールは常に問題ではありません。時にはリクエストは前のデータに依存します。ただし、意図しないウォーターフォールはパフォーマンスに悪影響を与えます。

## 並列データフェッチング

JavaScriptの`Promise.all()`または`Promise.allSettled()`を使用してウォーターフォールを回避します：

```javascript
export async function fetchCardData() {
  try {
    const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
    const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
    const invoiceStatusPromise = sql`SELECT...`;

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);
  }
}
```

利点：
- すべてのフェッチを同時に実行
- ネイティブのJavaScriptパターンで、あらゆるライブラリやフレームワークに適用可能

欠点：1つのリクエストが他より遅い場合、全体的なパフォーマンスは最も遅いリクエストに依存します。

## チャプター完了

Next.jsでのデータフェッチングの異なる方法を学習しました。次のチャプターは静的および動的レンダリングモードについて説明します。

[第8章に進む：静的および動的レンダリング](/learn/dashboard-app/static-and-dynamic-rendering)
