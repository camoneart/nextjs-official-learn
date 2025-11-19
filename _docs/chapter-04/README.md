# App Router：レイアウトとページの作成

**公開日:** 2025年11月18日

**原文:** https://nextjs.org/learn/dashboard-app/creating-layouts-and-pages

---

## 第4章

### 概要

このチャプターではApp Routerを使用してNext.jsアプリケーションで複数のルートと共有レイアウトを作成する方法を説明します。学習成果は以下の通りです：

- ファイルシステムルーティングでダッシュボードルートを作成する
- ルートセグメントにおけるフォルダとファイルの役割を理解する
- 複数のページ用のネストされたレイアウトを構築する
- Colocation（配置）、部分的なレンダリング、ルートレイアウトについて学ぶ

### ネストされたルーティング

Next.jsはファイルシステムルーティングを使用し、フォルダがネストされたルートを作成します。各フォルダはURLセグメントにマップされるルートセグメントを表します。

`page.tsx`は特別なNext.jsファイルでReactコンポーネントをエクスポートし、ルートアクセス可能にするために必要です。`layout.tsx`ファイルは複数のページ間で共有UIを作成します。

### ダッシュボードページの作成

`/app/dashboard`フォルダを作成し、`page.tsx`を追加します：

```tsx
export default function Page() {
  return <p>Dashboard Page</p>;
}
```

`http://localhost:3000/dashboard`でアクセスします。

### 練習：追加ページの作成

2つの追加ルートを構築します：

1. **Customers Page** at `/dashboard/customers` returning `<p>Customers Page</p>`
2. **Invoices Page** at `/dashboard/invoices` returning `<p>Invoices Page</p>`

### ダッシュボードレイアウトの作成

`/app/dashboard/layout.tsx`を追加します：

```tsx
import SideNav from '@/app/ui/dashboard/sidenav';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <SideNav />
      </div>
      <div className="grow p-6 md:overflow-y-auto md:p-12">{children}</div>
    </div>
  );
}
```

レイアウトはネストされたページやレイアウトを含む`children` propを受け取り、ダッシュボードページを自動的にレイアウト内にネストします。

#### 部分的なレンダリング

ページ間をナビゲートするとき、ページコンポーネントのみが更新され、レイアウトは変わりません。これは遷移中にクライアント側のReact状態を保持します。

### ルートレイアウト

`/app/layout.tsx`ファイルはすべてのNext.jsアプリケーションで必須のルートレイアウトです：

```tsx
import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
```

ルートレイアウトすべてのページに適用され、`<html>`と`<body>`タグを変更したりメタデータを追加したりできます。

### 次のステップ

第5章「ページ間のナビゲーション」に進み、`<Link>`コンポーネントについて学びます。
