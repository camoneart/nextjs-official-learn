# App Router：メタデータの追加

**公開日:** 2025年11月18日

**原文:** https://nextjs.org/learn/dashboard-app/adding-metadata

---

## 第15章

メタデータはSEOと共有可能性に重要です。このチャプターでは、Next.jsアプリケーションにメタデータを追加する方法を説明します。

### このチャプターで説明するトピック

- メタデータとは
- メタデータの種類
- Open Graphイメージを使用したメタデータの追加方法
- メタデータを使用したFaviconの追加方法

## メタデータとは？

Web開発では、メタデータはWebページに関する追加の詳細を提供します。メタデータはページを訪問するユーザーには表示されません。代わりに、ページの`<head>`要素内に埋め込まれて、バックグラウンドで動作します。この隠れた情報は、検索エンジンとページコンテンツをより良く理解する必要があるその他のシステムに重要です。

## メタデータが重要である理由

メタデータはWebページのSEOを強化し、共有可能性を向上させることで重要な役割を果たします。適切なメタデータは、検索エンジンがWebページを効果的にインデックスするのに役立ち、検索結果でのランキングを向上させます。さらに、Open Graphなどのメタデータはソーシャルメディア上で共有されたリンクの外観を向上させ、コンテンツをユーザーにとってより魅力的で情報を得られるようにします。

## メタデータの種類

様々なメタデータのタイプがあり、それぞれが独自の目的を果たします。一般的なタイプは次のとおりです：

**タイトルメタデータ：** ブラウザタブに表示されるWebページのタイトルを担当します。Webページが何についてかを検索エンジンが理解するのに役立つため、SEOにとって重要です。

```html
<title>Page Title</title>
```

**説明メタデータ：** このメタデータはページコンテンツの簡単な概要を提供し、検索エンジン結果に表示されることがよくあります。

```html
<meta name="description" content="A brief description of the page content." />
```

**キーワードメタデータ：** このメタデータはページコンテンツに関連するキーワードを含み、検索エンジンがページをインデックスするのに役立ちます。

```html
<meta name="keywords" content="keyword1, keyword2, keyword3" />
```

**Open Graphメタデータ：** このメタデータはソーシャルメディアプラットフォーム上でWebページが表現される方法を強化し、タイトル、説明、プレビューイメージなどの情報を提供します。

```html
<meta property="og:title" content="Title Here" />
<meta property="og:description" content="Description Here" />
<meta property="og:image" content="image_url_here" />
```

**Faviconメタデータ：** このメタデータはWebページにFavicon（小さなアイコン）をリンクし、ブラウザのアドレスバーまたはタブに表示されます。

```html
<link rel="icon" href="path/to/favicon.ico" />
```

## メタデータの追加

Next.jsはアプリケーションメタデータを定義するために使用できるMetadata APIを持っています。メタデータをアプリケーションに追加するには2つの方法があります：

- **設定ベース：** `layout.js`または`page.js`ファイルで静的な[`metadata`オブジェクト](/docs/app/api-reference/functions/generate-metadata#metadata-object)または動的な[`generateMetadata`関数](/docs/app/api-reference/functions/generate-metadata#generatemetadata-function)をエクスポートします
- **ファイルベース：** Next.jsにはメタデータ目的で使用される特別なファイルの範囲があります：
  - `favicon.ico`、`apple-icon.jpg`、`icon.jpg`：Faviconとアイコンに使用
  - `opengraph-image.jpg`と`twitter-image.jpg`：ソーシャルメディアイメージに使用
  - `robots.txt`：検索エンジンクローリングの指示を提供
  - `sitemap.xml`：Webサイトの構造に関する情報を提供

これらのファイルを使用して静的メタデータを使用するか、プロジェクト内で動的に生成するかを柔軟に選択できます。

Next.jsは自動的にページの関連する`<head>`要素を生成します。

### Faviconとパフォーマンスグラフイメージ

`/public`フォルダーに2つの画像があります：`favicon.ico`と`opengraph-image.jpg`。

これらの画像を`/app`フォルダーのルートに移動してください。

この後、Next.jsはこれらのファイルをFaviconとOG画像として自動的に識別して使用します。dev toolsのアプリケーション`<head>`要素をチェックして確認できます。

> **知っておくと良いこと：** [`ImageResponse`](/docs/app/api-reference/functions/image-response)コンストラクターを使用して動的OG画像を作成することもできます。

### ページタイトルと説明

任意の`layout.js`または`page.js`ファイルから[`metadata`オブジェクト](/docs/app/api-reference/functions/generate-metadata#metadata-fields)を含めて、タイトルと説明などのページ情報を追加できます。`layout.js`のメタデータは、それを使用するすべてのページに継承されます。

ルートレイアウトで、次のフィールドを使用して新しい`metadata`オブジェクトを作成します：

```typescript
// /app/layout.tsx

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Acme Dashboard',
  description: 'The official Next.js Course Dashboard, built with App Router.',
  metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),
};

export default function RootLayout() {
  // ...
}
```

Next.jsはアプリケーションにタイトルとメタデータを自動的に追加します。

しかし、特定のページのカスタムタイトルを追加したい場合はどうしますか？ページ自体に`metadata`オブジェクトを追加することで行えます。ネストされたページのメタデータは親のメタデータをオーバーライドします。

例えば、`/dashboard/invoices`ページでは、ページタイトルを更新できます：

```typescript
// /app/dashboard/invoices/page.tsx

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Invoices | Acme Dashboard',
};
```

これは機能しますが、すべてのページでアプリケーションのタイトルを繰り返しています。何か変わった場合（会社名など）、すべてのページで更新する必要があります。

代わりに、`metadata`オブジェクトで`title.template`フィールドを使用してページタイトルのテンプレートを定義できます。このテンプレートはページタイトルと、含めたい他の情報を含むことができます。

ルートレイアウトで、`metadata`オブジェクトを更新してテンプレートを含めます：

```typescript
// /app/layout.tsx

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Acme Dashboard',
    default: 'Acme Dashboard',
  },
  description: 'The official Next.js Learn Dashboard built with App Router.',
  metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),
};
```

テンプレートの`%s`は特定のページタイトルで置き換えられます。

次に、`/dashboard/invoices`ページで、ページタイトルを追加できます：

```typescript
// /app/dashboard/invoices/page.tsx

export const metadata: Metadata = {
  title: 'Invoices',
};
```

`/dashboard/invoices`ページに移動し、`<head>`要素をチェックします。ページタイトルは`Invoices | Acme Dashboard`になっているはずです。

## 練習：メタデータを追加する

メタデータについて学習したので、実践してみてください。他のページにタイトルを追加します：

1. `/login`ページ
2. `/dashboard/`ページ
3. `/dashboard/customers`ページ
4. `/dashboard/invoices/create`ページ
5. `/dashboard/invoices/[id]/edit`ページ

Next.js Metadata APIは強力で柔軟性があり、アプリケーションのメタデータに完全なコントロールを与えます。ここではいくつかの基本的なメタデータを追加する方法を示しましたが、`keywords`、`robots`、`canonical`など多くのフィールドを追加できます。[ドキュメント](/docs/app/api-reference/functions/generate-metadata)を自由に探索し、アプリケーションに追加したい追加のメタデータを追加してください。

## 第15章を完了しました

おめでとうございます！アプリケーションにメタデータを追加し、Metadata APIについて学習しました。

### 次に

**16：次のステップ**

Next.jsの探索を続ける

[第16章を開始](/learn/dashboard-app/next-steps)
