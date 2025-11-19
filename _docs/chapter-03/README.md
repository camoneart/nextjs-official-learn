# App Router：フォントと画像の最適化

**公開日:** 2025年11月18日

**原文:** https://nextjs.org/learn/dashboard-app/optimizing-fonts-images

---

## 第3章

### 概要

このチャプターではNext.jsアプリケーションにおけるフォントと画像の最適化方法を説明します。`next/font`と`next/image`コンポーネントを使用してWebパフォーマンスとユーザー体験を向上させる方法について学習します。

## なぜフォントを最適化するのか？

カスタムフォントはWebサイトのデザインに大きな影響を与えますが、フォントの取得が必要な場合、パフォーマンスに悪影響を与える可能性があります。「Cumulative Layout Shift（累積レイアウトシフト）はGoogleがWebサイトのパフォーマンスとユーザー体験を評価するために使用する指標です。」

レイアウトシフトは、ブラウザが最初にフォールバックフォントでテキストをレンダリングし、カスタムフォントが読み込まれた後に切り替わる場合に発生します。これによってテキストのサイズと間隔が変わり、周囲の要素がシフトしてしまいます。

Next.jsは`next/font`モジュールを通じてフォントを自動的に最適化します。ビルド時にフォントファイルをダウンロードして静的アセットとしてホストするため、追加のネットワークリクエストが排除されます。

### プライマリフォントの追加

`/app/ui/fonts.ts`を作成します：

```typescript
import { Inter } from 'next/font/google';

export const inter = Inter({ subsets: ['latin'] });
```

`/app/layout.tsx`に追加します：

```typescript
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

Tailwindの`antialiased`クラスはフォントレンダリングを滑らかにします。

### セカンダリフォントの追加

練習問題：`Lusitana`フォントをインポートし、特定のページ要素に適用します。フォントウェイト400と700を指定してください。

## なぜ画像を最適化するのか？

通常のHTML画像では、開発者は以下を手動で処理する必要があります：

- 異なるスクリーンサイズでのレスポンシブ動作を確保
- 異なるデバイス用にサイズを指定
- 読み込み中のレイアウトシフトを防止
- ビューポート外の画像の遅延読み込みを実装

画像最適化は専門的なWeb開発トピックです。`next/image`コンポーネントはこれらの最適化を自動化します。

### `<Image>`コンポーネント

`<Image>`コンポーネントはHTML `<img>`タグを自動最適化で拡張します：

- 画像読み込み時のレイアウトシフトを防止
- より小さいビューポートに対して画像を自動的にリサイズして、オーバーサイズのファイルを送信しないようにする
- デフォルトで画像を遅延読み込み
- サポートされている場合、WebPやAVIFなどのモダンフォーマットを提供

### デスクトップヒーロー画像の追加

`/app/page.tsx`内：

```typescript
import Image from 'next/image';

export default function Page() {
  return (
    <div className="flex items-center justify-center p-6 md:w-3/5 md:px-28 md:py-12">
      <Image
        src="/hero-desktop.png"
        width={1000}
        height={760}
        className="hidden md:block"
        alt="Screenshots of the dashboard project showing desktop version"
      />
    </div>
  );
}
```

`width`と`height`を画像のアスペクト比に合わせて設定します。これらの値は実際の画像寸法を表し、レンダリングサイズではありません。`hidden`と`md:block`クラスを使用してデスクトップスクリーンでのみ表示します。

### モバイルヒーロー画像の追加

練習問題：`hero-mobile.png`の別の`<Image>`コンポーネントを追加します。寸法は560×620ピクセルで、モバイルスクリーンでのみ表示します。

### 推奨リソース

- Image Optimization Docs（画像最適化ドキュメント）
- Font Optimization Docs（フォント最適化ドキュメント）
- Improving Web Performance with Images（MDN）
- Web Fonts（MDN）
- How Core Web Vitals Affect SEO
- How Google Handles JavaScript Throughout Indexing

### チャプター完了

「Next.jsを使用してフォントと画像を最適化する方法を学習しました。」

**次のチャプター:** Creating Layouts and Pages（レイアウトとページの作成）—「ネストされたレイアウトとページを使用してダッシュボードルートを作成します！」
