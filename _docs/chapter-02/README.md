# App Router：CSSスタイリング

**公開日:** 2025年11月18日

**原文:** https://nextjs.org/learn/dashboard-app/css-styling

---

## 第2章

現在、ホームページにはスタイルがありません。Next.jsアプリケーションをスタイリングするさまざまな方法を見てみましょう。

### この章で学ぶこと...

カバーするトピックは次のとおりです

- アプリケーションにグローバルCSSファイルを追加する方法。
- スタイリングの2つの異なる方法：TailwindとCSSモジュール。
- `clsx`ユーティリティパッケージを使用して条件付きでクラス名を追加する方法。

## グローバルスタイル

`/app/ui`フォルダ内を見ると、`global.css`というファイルがあります。このファイルを使用して、アプリケーションの**すべて**のルートにCSSルールを追加できます - CSSリセットルール、リンクなどのHTML要素のサイト全体のスタイルなど。

アプリケーションの任意のコンポーネントで`global.css`をインポートできますが、通常はトップレベルのコンポーネントに追加するのが良い方法です。Next.jsでは、これは[ルートレイアウト](/docs/app/api-reference/file-conventions/layout#root-layouts)です（詳細は後ほど）。

`/app/layout.tsx`に移動して`global.css`ファイルをインポートして、アプリケーションにグローバルスタイルを追加します：

```typescript
// /app/layout.tsx
import '@/app/ui/global.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

開発サーバーがまだ実行されている状態で、変更を保存してブラウザでプレビューします。ホームページがスタイル設定されているはずです。

しかし、ちょっと待ってください。CSSルールを追加していないのに、スタイルはどこから来たのでしょうか？

`global.css`の中を見ると、いくつかの`@tailwind`ディレクティブがあることがわかります：

```css
// /app/ui/global.css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Tailwind

[Tailwind](https://tailwindcss.com/)は、Reactコード内で直接[ユーティリティクラス](https://tailwindcss.com/docs/utility-first)を素早く書くことを可能にし、開発プロセスを高速化するCSSフレームワークです。

Tailwindでは、クラス名を追加して要素をスタイル設定します。例えば、`"text-blue-500"`を追加すると、`<h1>`テキストが青になります：

```jsx
<h1 className="text-blue-500">I'm blue!</h1>
```

CSSスタイルはグローバルに共有されますが、各クラスは各要素に個別に適用されます。つまり、要素を追加または削除しても、別のスタイルシートを維持したり、スタイルの衝突を心配したり、アプリケーションがスケールするにつれてCSSバンドルのサイズが増大することを心配する必要がありません。

`create-next-app`を使用して新しいプロジェクトを開始すると、Next.jsはTailwindを使用するかどうかを尋ねます。`yes`を選択すると、Next.jsは自動的に必要なパッケージをインストールし、アプリケーションでTailwindを設定します。

`/app/page.tsx`を見ると、サンプルでTailwindクラスを使用していることがわかります。

```typescript
// /app/page.tsx
import AcmeLogo from '@/app/ui/acme-logo';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function Page() {
  return (
    // これらはTailwindクラスです：
    <main className="flex min-h-screen flex-col p-6">
      <div className="flex h-20 shrink-0 items-end rounded-lg bg-blue-500 p-4 md:h-52">
    // ...
  )
}
```

Tailwindを初めて使用する場合でも心配しないでください。時間を節約するために、使用するすべてのコンポーネントはすでにスタイル設定されています。

Tailwindで遊んでみましょう！以下のコードをコピーして、`/app/page.tsx`の`<p>`要素の上に貼り付けます：

```jsx
// /app/page.tsx
<div
  className="relative w-0 h-0 border-l-[15px] border-r-[15px] border-b-[26px] border-l-transparent border-r-transparent border-b-black"
/>
```

従来のCSSルールを書いたり、スタイルをJSXから分離したい場合は、CSSモジュールが優れた代替手段です。

## CSSモジュール

[CSSモジュール](/docs/basic-features/built-in-css-support)を使用すると、一意のクラス名を自動的に作成することでCSSをコンポーネントにスコープできるため、スタイルの衝突を心配する必要もありません。

このコースではTailwindを使い続けますが、CSSモジュールを使用して上記のクイズと同じ結果を達成する方法を見てみましょう。

`/app/ui`内に、`home.module.css`という新しいファイルを作成し、次のCSSルールを追加します：

```css
// /app/ui/home.module.css
.shape {
  height: 0;
  width: 0;
  border-bottom: 30px solid black;
  border-left: 20px solid transparent;
  border-right: 20px solid transparent;
}
```

次に、`/app/page.tsx`ファイル内でスタイルをインポートし、追加した`<div>`からTailwindクラス名を`styles.shape`に置き換えます：

```typescript
// /app/page.tsx
import AcmeLogo from '@/app/ui/acme-logo';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import styles from '@/app/ui/home.module.css';

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col p-6">
      <div className={styles.shape} />
    // ...
  )
}
```

変更を保存してブラウザでプレビューします。以前と同じ形が表示されるはずです。

TailwindとCSSモジュールは、Next.jsアプリケーションをスタイリングする最も一般的な2つの方法です。どちらを使用するかは好みの問題です - 同じアプリケーションで両方を使用することもできます！

## `clsx`ライブラリを使用してクラス名を切り替える

状態や他の条件に基づいて要素を条件付きでスタイル設定する必要がある場合があります。

[`clsx`](https://www.npmjs.com/package/clsx)は、クラス名を簡単に切り替えることができるライブラリです。詳細については[ドキュメント](https://github.com/lukeed/clsx)を参照することをお勧めしますが、基本的な使用法は次のとおりです：

- `status`を受け取る`InvoiceStatus`コンポーネントを作成するとします。ステータスは`'pending'`または`'paid'`です。
- `'paid'`の場合、色を緑にします。`'pending'`の場合、色を灰色にします。

次のように`clsx`を使用してクラスを条件付きで適用できます：

```typescript
// /app/ui/invoices/status.tsx
import clsx from 'clsx';

export default function InvoiceStatus({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-1 text-sm',
        {
          'bg-gray-100 text-gray-500': status === 'pending',
          'bg-green-500 text-white': status === 'paid',
        },
      )}
    >
    // ...
    )}
```

## その他のスタイリングソリューション

説明したアプローチに加えて、Next.jsアプリケーションを次の方法でスタイル設定することもできます：

- `.css`および`.scss`ファイルをインポートできるSass。
- [styled-jsx](https://github.com/vercel/styled-jsx)、[styled-components](https://github.com/vercel/next.js/tree/canary/examples/with-styled-components)、[emotion](https://github.com/vercel/next.js/tree/canary/examples/with-emotion)などのCSS-in-JSライブラリ。

詳細については、[CSSドキュメント](/docs/app/building-your-application/styling)をご覧ください。

## 第2章を完了しました

よくできました！Next.jsアプリケーションをスタイリングするさまざまな方法について学びました。

### 次へ

**3: フォントと画像の最適化**

ヒーロー画像とカスタムフォントを追加して、ホームページの作業を続けます。

[第3章を開始](/learn/dashboard-app/optimizing-fonts-images)
