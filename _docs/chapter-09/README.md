# App Router：ストリーミング

**公開日:** 2025年11月18日

**原文:** https://nextjs.org/learn/dashboard-app/streaming

---

## 第9章

ストリーミングは、ルートを小さな「チャンク」に分割し、準備ができたらサーバーからクライアントに段階的にストリーミングできるデータ転送技術です。

ストリーミングにより、遅いデータリクエストがページ全体をブロックすることを防ぐことができます。これによってユーザーはすべてのデータが読み込まれるのを待たずに、ページの一部を見て操作できるようになります。

ストリーミングはReactのコンポーネントモデルでよく機能します。各コンポーネントはチャンクとして考えることができます。

Next.jsでストリーミングを実装するには2つの方法があります：

1. ページレベルでは、`loading.tsx`ファイルを使用します（自動的に`<Suspense>`を作成します）
2. コンポーネントレベルでは、より細かい制御のために`<Suspense>`を使用します

## `loading.tsx`でページ全体をストリーミングする

`/app/dashboard`フォルダ内に`loading.tsx`という新しいファイルを作成します：

```typescript
export default function Loading() {
  return <div>Loading...</div>;
}
```

いくつかのことが起きています：

1. `loading.tsx`はReact Suspenseの上に構築された特別なNext.jsファイルです。ページコンテンツ読み込み中に表示するフォールバックUIを作成できます
2. `<SideNav>`は静的なため、すぐに表示されます。ユーザーは動的コンテンツが読み込まれている間に`<SideNav>`と対話できます
3. ユーザーはページが読み込み完了するのを待たずにナビゲートできます（これを中断可能なナビゲーションと呼びます）

### ローディングスケルトンの追加

ローディングスケルトンはUIの簡略化されたバージョンです。多くのWebサイトはプレースホルダーとして使用して、ユーザーにコンテンツが読み込まれていることを示します。`loading.tsx`に追加するUIはファイルの静的部分として埋め込まれ、最初に送信されます。その後、残りの動的コンテンツがサーバーからクライアントにストリーミングされます。

`loading.tsx`ファイル内で`<DashboardSkeleton>`という新しいコンポーネントをインポートします：

```typescript
import DashboardSkeleton from '@/app/ui/skeletons';

export default function Loading() {
  return <DashboardSkeleton />;
}
```

### ルートグループでローディングスケルトンのバグを修正する

現在、ローディングスケルトンは請求書にも適用されます。

`loading.tsx`はファイルシステムでは`/invoices/page.tsx`と`/customers/page.tsx`より上のレベルにあるため、これらのページにも適用されます。

ルートグループでこれを変更できます。ダッシュボード内に`/(overview)`という新しいフォルダを作成します。その後、`loading.tsx`と`page.tsx`ファイルをフォルダ内に移動します。

これで、`loading.tsx`ファイルはダッシュボード概要ページにのみ適用されます。

ルートグループは、URLパス構造に影響を与えずに、ファイルを論理グループに整理できます。括弧`()`を使用して新しいフォルダを作成すると、名前がURLパスに含まれません。したがって、`/dashboard/(overview)/page.tsx`は`/dashboard`になります。

ここでは、ルートグループを使用して`loading.tsx`がダッシュボード概要ページにのみ適用されるようにしています。ただし、ルートグループを使用して、アプリケーション（例：`(marketing)`ルートと`(shop)`ルート）をセクション別に分離したり、より大きなアプリケーション用にチームごとに分離することもできます。

### コンポーネントをストリーミングする

これまで、ページ全体をストリーミングしていました。しかし、React Suspenseを使用して特定のコンポーネントをストリーミングして、より細かい制御をすることもできます。

Suspenseを使用すると、条件が満たされるまで（例：データが読み込まれた）アプリケーションの部分のレンダリングを遅延できます。動的コンポーネントをSuspenseでラップできます。その後、動的コンポーネントが読み込まれている間に表示するフォールバックコンポーネントを渡します。

遅いデータリクエスト`fetchRevenue()`を覚えていますか？これはページ全体を遅くしているリクエストです。ページ全体をブロックするのではなく、Suspenseを使用して、このコンポーネントのみをストリーミングし、ページの残りのUIをすぐに表示できます。

これを行うには、データフェッチをコンポーネントに移動する必要があります：

`/dashboard/(overview)/page.tsx`から`fetchRevenue()`とそのデータのすべてのインスタンスを削除します：

```typescript
import { Card } from '@/app/ui/dashboard/cards';
import RevenueChart from '@/app/ui/dashboard/revenue-chart';
import LatestInvoices from '@/app/ui/dashboard/latest-invoices';
import { lusitana } from '@/app/ui/fonts';
import { fetchLatestInvoices, fetchCardData } from '@/app/lib/data';

export default async function Page() {
  const latestInvoices = await fetchLatestInvoices();
  const {
    numberOfInvoices,
    numberOfCustomers,
    totalPaidInvoices,
    totalPendingInvoices,
  } = await fetchCardData();

  return (
    // ...
  );
}
```

その後、Reactから`<Suspense>`をインポートし、`<RevenueChart />`の周りにラップします。`<RevenueChartSkeleton>`というフォールバックコンポーネントを渡すことができます。

```typescript
import { Card } from '@/app/ui/dashboard/cards';
import RevenueChart from '@/app/ui/dashboard/revenue-chart';
import LatestInvoices from '@/app/ui/dashboard/latest-invoices';
import { lusitana } from '@/app/ui/fonts';
import { fetchLatestInvoices, fetchCardData } from '@/app/lib/data';
import { Suspense } from 'react';
import { RevenueChartSkeleton } from '@/app/ui/skeletons';

export default async function Page() {
  const latestInvoices = await fetchLatestInvoices();
  const {
    numberOfInvoices,
    numberOfCustomers,
    totalPaidInvoices,
    totalPendingInvoices,
  } = await fetchCardData();

  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Collected" value={totalPaidInvoices} type="collected" />
        <Card title="Pending" value={totalPendingInvoices} type="pending" />
        <Card title="Total Invoices" value={numberOfInvoices} type="invoices" />
        <Card
          title="Total Customers"
          value={numberOfCustomers}
          type="customers"
        />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <Suspense fallback={<RevenueChartSkeleton />}>
          <RevenueChart />
        </Suspense>
        <LatestInvoices latestInvoices={latestInvoices} />
      </div>
    </main>
  );
}
```

最後に、`<RevenueChart>`コンポーネントを更新してデータをフェッチし、渡されたpropを削除します：

```typescript
import { generateYAxis } from '@/app/lib/utils';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import { fetchRevenue } from '@/app/lib/data';

export default async function RevenueChart() {
  const revenue = await fetchRevenue();

  const chartHeight = 350;
  const { yAxisLabels, topLabel } = generateYAxis(revenue);

  if (!revenue || revenue.length === 0) {
    return <p className="mt-4 text-gray-400">No data available.</p>;
  }

  return (
    // ...
  );
}
```

### 練習：`<LatestInvoices>`をストリーミングする

あなたの番です！学習したことを実践してみましょう。`<LatestInvoices>`コンポーネントをストリーミングします。

ページから`<LatestInvoices>`コンポーネントに`fetchLatestInvoices()`を下に移動します。`<LatestInvoicesSkeleton>`というフォールバックを使用してコンポーネントをSuspense境界でラップします。

## コンポーネントのグループ化

素晴らしい！もうすぐです。今、`<Card>`コンポーネントをSuspenseでラップする必要があります。個々のカードのデータをフェッチできますが、カードが読み込まれたときに「ポップイン」効果が生じる可能性があり、ユーザーにとって視覚的にジャーリングになります。

この問題にどのように取り組みますか？

より「段階的な」効果を作成するために、ラッパーコンポーネントを使用してカードをグループ化できます。つまり、静的な`<SideNav/>`が最初に表示され、その後カードなどが表示されます。

`page.tsx`ファイルで：

1. `<Card>`コンポーネントを削除する
2. `fetchCardData()`関数を削除する
3. `<CardWrapper />`という新しい**ラッパー**コンポーネントをインポートする
4. `<CardsSkeleton />`という新しい**スケルトン**コンポーネントをインポートする
5. `<CardWrapper />`をSuspenseでラップする

```typescript
import CardWrapper from '@/app/ui/dashboard/cards';
import {
  RevenueChartSkeleton,
  LatestInvoicesSkeleton,
  CardsSkeleton,
} from '@/app/ui/skeletons';

export default async function Page() {
  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<CardsSkeleton />}>
          <CardWrapper />
        </Suspense>
      </div>
      // ...
    </main>
  );
}
```

その後、`/app/ui/dashboard/cards.tsx`ファイルに移動し、`fetchCardData()`関数をインポートして、`<CardWrapper/>`コンポーネント内で呼び出します。このコンポーネント内の必要なコードのコメントを外すようにしてください。

```typescript
import { fetchCardData } from '@/app/lib/data';

export default async function CardWrapper() {
  const {
    numberOfInvoices,
    numberOfCustomers,
    totalPaidInvoices,
    totalPendingInvoices,
  } = await fetchCardData();

  return (
    <>
      <Card title="Collected" value={totalPaidInvoices} type="collected" />
      <Card title="Pending" value={totalPendingInvoices} type="pending" />
      <Card title="Total Invoices" value={numberOfInvoices} type="invoices" />
      <Card
        title="Total Customers"
        value={numberOfCustomers}
        type="customers"
      />
    </>
  );
}
```

ページをリフレッシュすると、すべてのカードが同時に読み込まれているはずです。複数のコンポーネントを同時に読み込みたい場合に使用できるパターンです。

## Suspense境界を配置する場所を決定する

Suspense境界を配置する場所は、いくつかのことに依存します：

1. ユーザーがページをストリーミングされる方法をどのように体験したいか
2. どのコンテンツを優先したい
3. コンポーネントがデータフェッチングに依存しているかどうか

ダッシュボードページを見てください。別のやり方がありますか？

心配しないでください。正しい答えはありません。

- **ページ全体**をストリーミングできます（`loading.tsx`のように）...しかし、コンポーネントの1つが遅いデータフェッチを持つ場合、読み込み時間が長くなる可能性があります
- **すべてのコンポーネント**を個別にストリーミングできます...しかし、UIが準備ができたら「ポップイン」する可能性があります
- また、**ページセクション**をストリーミングして「段階的な」効果を作成することもできます。ただし、ラッパーコンポーネントを作成する必要があります

アプリケーション要件に応じて、Suspense境界の配置は変わります。一般的には、データフェッチを必要とするコンポーネントにデータフェッチを下に移動し、それらのコンポーネントをSuspenseでラップすることが良い慣行です。ただし、セクションまたはページ全体をストリーミングする場合、アプリケーション要件が必要とする場合は問題ありません。

Suspenseの実験を恐れず、最適に機能するものを見つけてください。強力なAPIで、より楽しいユーザー体験を作成するのに役立ちます。

## 次のステップ

ストリーミングとServer Componentsは、データフェッチングと読み込み状態を処理する新しい方法を提供し、最終的には最終ユーザー体験を向上させることが目標です。

次のチャプターでは、Next.js APIを使用してダッシュボードアプリケーションに検索とページネーションを追加する方法を学びます。

---

**第9章を完了しました**

Suspenseとローディングスケルトンを使用してコンポーネントをストリーミングする方法を学習しました。

**次：第10章 - 検索とページネーションの追加**

Next.js APIを使用してダッシュボードアプリケーションに検索とページネーション機能を追加します。
