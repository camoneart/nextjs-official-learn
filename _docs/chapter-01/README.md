# App Router：はじめに

**公開日:** 2025年11月18日

**原文:** https://nextjs.org/learn/dashboard-app/getting-started

---

## 第1章

### 新しいプロジェクトの作成

パッケージマネージャーとして[`pnpm`](https://pnpm.io/)を使用することをお勧めします。`npm`や`yarn`よりも高速で効率的です。`pnpm`がインストールされていない場合は、次のコマンドを実行してグローバルにインストールできます：

```bash
npm install -g pnpm
```

Next.jsアプリを作成するには、ターミナルを開き、プロジェクトを保存したいフォルダに[`cd`](https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Understanding_client-side_tools/Command_line#basic_built-in_terminal_commands)して、次のコマンドを実行します：

```bash
npx create-next-app@latest nextjs-dashboard --example "https://github.com/vercel/next-learn/tree/main/dashboard/starter-example" --use-pnpm
```

このコマンドは、Next.jsアプリケーションをセットアップするコマンドラインインターフェイス（CLI）ツールである[`create-next-app`](/docs/app/api-reference/create-next-app)を使用します。上記のコマンドでは、このコース用の[スターターサンプル](https://github.com/vercel/next-learn/tree/main/dashboard/starter-example)と共に`--example`フラグも使用しています。

### プロジェクトの探索

ゼロからコードを書くチュートリアルとは異なり、このコースのコードの多くはすでに書かれています。これは、既存のコードベースで作業する可能性が高い実際の開発をよりよく反映しています。

私たちの目標は、_すべての_アプリケーションコードを書くことなく、Next.jsの主要な機能の学習に集中できるようにすることです。

インストール後、コードエディタでプロジェクトを開き、`nextjs-dashboard`に移動します。

```bash
cd nextjs-dashboard
```

プロジェクトを探索する時間を取りましょう。

#### フォルダ構造

プロジェクトには次のフォルダ構造があることがわかります：

![ダッシュボードプロジェクトのフォルダ構造。主要なフォルダとファイル：app、public、および設定ファイルを表示。](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/learn/light/learn-folder-structure.png)

![ダッシュボードプロジェクトのフォルダ構造。主要なフォルダとファイル：app、public、および設定ファイルを表示。](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/learn/dark/learn-folder-structure.png)

- **`/app`**: アプリケーションのすべてのルート、コンポーネント、ロジックが含まれています。主にここで作業します。
- **`/app/lib`**: アプリケーションで使用される関数が含まれています。再利用可能なユーティリティ関数やデータフェッチング関数など。
- **`/app/ui`**: アプリケーションのすべてのUIコンポーネントが含まれています。カード、テーブル、フォームなど。時間を節約するために、これらのコンポーネントは事前にスタイル設定されています。
- **`/public`**: アプリケーションのすべての静的アセットが含まれています。画像など。
- **設定ファイル**: アプリケーションのルートに`next.config.ts`などの設定ファイルがあることもわかります。これらのファイルのほとんどは、`create-next-app`を使用して新しいプロジェクトを開始するときに作成され、事前設定されています。このコースでは変更する必要はありません。

これらのフォルダを自由に探索してください。コードが何をしているのかまだすべてを理解していなくても心配しないでください。

#### プレースホルダーデータ

ユーザーインターフェイスを構築するときは、プレースホルダーデータがあると便利です。データベースやAPIがまだ利用できない場合は、次のことができます：

- JSON形式またはJavaScriptオブジェクトとしてプレースホルダーデータを使用する。
- [mockAPI](https://mockapi.io/)のようなサードパーティサービスを使用する。

このプロジェクトでは、`app/lib/placeholder-data.ts`にプレースホルダーデータを用意しています。ファイル内の各JavaScriptオブジェクトは、データベース内のテーブルを表しています。例えば、請求書テーブルの場合：

```typescript
/app/lib/placeholder-data.ts

const invoices = [
  {
    customer_id: customers[0].id,
    amount: 15795,
    status: 'pending',
    date: '2022-12-06',
  },
  {
    customer_id: customers[1].id,
    amount: 20348,
    status: 'pending',
    date: '2022-11-14',
  },
  // ...
];
```

[データベースのセットアップ](/learn/dashboard-app/setting-up-your-database)の章では、このデータを使用してデータベースを_シード_（初期データを投入）します。

#### TypeScript

ほとんどのファイルに`.ts`または`.tsx`の接尾辞があることにも気付くでしょう。これは、プロジェクトがTypeScriptで書かれているためです。現代のWeb環境を反映したコースを作成したかったのです。

TypeScriptを知らなくても大丈夫です - 必要なときにTypeScriptコードスニペットを提供します。

今のところ、`/app/lib/definitions.ts`ファイルを見てみましょう。ここでは、データベースから返される型を手動で定義しています。例えば、請求書テーブルには次の型があります：

```typescript
/app/lib/definitions.ts

export type Invoice = {
  id: string;
  customer_id: string;
  amount: number;
  date: string;
  // TypeScriptでは、これは文字列ユニオン型と呼ばれます。
  // これは、"status"プロパティが'pending'または'paid'の2つの文字列のいずれかのみであることを意味します。
  status: 'pending' | 'paid';
};
```

TypeScriptを使用することで、請求書の`amount`に`number`ではなく`string`を渡すなど、誤ったデータ形式をコンポーネントやデータベースに渡さないようにすることができます。

> **TypeScript開発者の場合：**
>
> - データ型を手動で宣言していますが、型安全性を高めるには、データベーススキーマに基づいて型を自動生成する[Prisma](https://www.prisma.io/)または[Drizzle](https://orm.drizzle.team/)をお勧めします。
> - Next.jsは、プロジェクトがTypeScriptを使用しているかどうかを検出し、必要なパッケージと設定を自動的にインストールします。Next.jsには、コードエディタ用の[TypeScriptプラグイン](https://nextjs.org/docs/app/building-your-application/configuring/typescript#typescript-plugin)も付属しており、自動補完と型安全性を支援します。

### 開発サーバーの実行

`pnpm i`を実行して、プロジェクトのパッケージをインストールします。

```bash
pnpm i
```

続いて`pnpm dev`で開発サーバーを起動します。

```bash
pnpm dev
```

`pnpm dev`は、Next.js開発サーバーをポート`3000`で起動します。動作しているか確認しましょう。

ブラウザで[http://localhost:3000](http://localhost:3000/)を開きます。ホームページは次のようになり、意図的にスタイルが適用されていません：

![タイトル'Acme'、説明、ログインリンクを含むスタイルなしのページ。](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/learn/light/acme-unstyled.png)

![タイトル'Acme'、説明、ログインリンクを含むスタイルなしのページ。](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/learn/dark/acme-unstyled.png)

## 第1章を完了しました

おめでとうございます！スターターサンプルを使用してNext.jsアプリケーションを作成し、開発サーバーを実行しました。

**次へ**

### 2: CSSスタイリング

ホームページに取り組み、アプリケーションをスタイリングするさまざまな方法について説明しましょう。

[第2章を開始](/learn/dashboard-app/css-styling)
