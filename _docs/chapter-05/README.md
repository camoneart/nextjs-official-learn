# App Router：ページ間のナビゲーション

**公開日:** 2025年11月18日

**原文:** https://nextjs.org/learn/dashboard-app/navigating-between-pages

---

## 第5章

### 学習目標

このチャプターではカバーする内容：
- `next/link`コンポーネントの使用方法
- `usePathname()`フックでアクティブなリンクを表示する方法
- Next.jsでナビゲーションがどのように機能するか

## なぜナビゲーションを最適化するのか？

従来のHTML `<a>`要素は、ルート間をナビゲートするときにフルページリフレッシュを引き起こします。Next.jsはJavaScriptを通じたクライアント側ナビゲーションでより優れたエクスペリエンスを提供し、完全ページリロードのちらつきはありません。

## `<Link>`コンポーネント

Next.jsは、JavaScriptでクライアント側ナビゲーションを可能にする`<Link />`コンポーネントを提供し、従来のアンカータグを置き換えます。

### 実装

`next/link`から`Link`をインポートして使用します：

```typescript
import Link from 'next/link';

export default function NavLinks() {
  return (
    <Link href={link.href}>
      {link.name}
    </Link>
  );
}
```

`<Link>`コンポーネントは`<a>`タグと同じように機能しますが、propの名前として`href`を使用します。

### 自動コード分割とプリフェッチング

Next.jsはルートセグメントごとにコードを自動的に分割し、ページを分離するため、エラーはカスケードしません。これはブラウザのパース要件を減らし、パフォーマンスを向上させます。

本番環境では、`<Link>`コンポーネントがビューポートに入ると、Next.jsは宛先ページコードを自動的にプリフェッチするため、クリック後の遷移はほぼ瞬時になります。

## パターン：アクティブなリンクを表示する

ナビゲーションで現在のページをハイライトするパターンは一般的です。`usePathname()`フックは現在のURLパスを取得します。

### セットアップ

`nav-links.tsx`をClient Componentに変換します：

```typescript
'use client';

import { usePathname } from 'next/navigation';
```

### 使用法

```typescript
export default function NavLinks() {
  const pathname = usePathname();

  return (
    <Link
      href={link.href}
      className={clsx(
        'base-styles',
        {
          'bg-sky-100 text-blue-600': pathname === link.href,
        },
      )}
    >
      {link.name}
    </Link>
  );
}
```

`clsx`ライブラリを使用して、リンクが現在のパスと一致するときに条件付きでスタイルを適用します。

## 完了

クライアント側ナビゲーションとアクティブなリンク実装を学習しました。次のチャプターではデータベースのセットアップについて説明します。
