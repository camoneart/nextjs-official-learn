# App Router：エラーハンドリング

**公開日:** 2025年11月18日

**原文:** https://nextjs.org/learn/dashboard-app/error-handling

---

## 第12章

### 概要

このチャプターはNext.jsアプリケーションでエラーを優雅に処理する方法を説明します。JavaScriptの`try/catch`ステートメントとNext.jsの未処理例外用のAPIを使用します。

### カバーされるトピック

- 特別な`error.tsx`ファイルを使用してルートセグメントのエラーをキャッチし、フォールバックUIを表示する
- `notFound`関数と`not-found`ファイルを使用して404エラーを処理する

---

## Server ActionsにTry/Catchを追加する

最初のステップはServer Actionsをjavascriptの`try/catch`ブロックでラップしてエラーを優雅に処理することです。

**重要な注:** `redirect`関数はエラーをスローすることで機能するため、`try/catch`ブロックの**外**で呼び出す必要があります。`try/catch`の後に呼び出されることで、成功時にのみ実行されることが保証されます。

例の構造：
```typescript
try {
  // Perform database operations
} catch (error) {
  // Return helpful error message
}
// Call redirect here, after try/catch
```

---

## `error.tsx`ですべてのエラーを処理する

### `error.tsx`とは？

`error.tsx`ファイルはルートセグメントのUIバウンダリを作成し、予期しないエラーの全キャッチオールとしてフォールバックUIを表示できます。

### 要件

- **Client Component**である必要があります（`"use client"`でマークされる）
- 2つのpropを受け入れます：
  - **`error`：** JavaScriptのErrorオブジェクトインスタンス
  - **`reset`：** ルートセグメントを再レンダリングしてエラー境界をリセットする関数

### 実装例

```typescript
'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex h-full flex-col items-center justify-center">
      <h2 className="text-center">Something went wrong!</h2>
      <button
        className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
        onClick={() => reset()}
      >
        Try again
      </button>
    </main>
  );
}
```

---

## `notFound`で404エラーを処理する

### `notFound`をいつ使用するか

`error.tsx`に依存するのではなく、データベースに存在しないリソースをフェッチしようとするときに`notFound`関数を使用します。

### 実装ステップ

1. **`notFound`をインポートする** `'next/navigation'`から
2. **リソースが存在するかチェックする** データフェッチング関数内
3. **リソースが見つからない場合、`notFound()`を呼び出す**

`/dashboard/invoices/[id]/edit/page.tsx`での例：

```typescript
import { fetchInvoiceById, fetchCustomers } from '@/app/lib/data';
import { notFound } from 'next/navigation';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  const [invoice, customers] = await Promise.all([
    fetchInvoiceById(id),
    fetchCustomers(),
  ]);

  if (!invoice) {
    notFound();
  }

  // Render page content
}
```

### `not-found.tsx`の作成

`/edit`フォルダーに`not-found.tsx`ファイルを作成してカスタム404 UIを表示します：

```typescript
import Link from 'next/link';
import { FaceFrownIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  return (
    <main className="flex h-full flex-col items-center justify-center gap-2">
      <FaceFrownIcon className="w-10 text-gray-400" />
      <h2 className="text-xl font-semibold">404 Not Found</h2>
      <p>Could not find the requested invoice.</p>
      <Link
        href="/dashboard/invoices"
        className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
      >
        Go Back
      </Link>
    </main>
  );
}
```

### キーポイント

「`notFound`はエラーハンドリング時に`error.tsx`に優先」されます。リソースが存在しないなどのより具体的なエラーを処理するときに使用します。

---

## 参考資料

- Error Handling Documentation（エラーハンドリングドキュメント）
- [`error.js` API Reference](https://nextjs.org/docs/app/api-reference/file-conventions/error)
- [`notFound()` API Reference](https://nextjs.org/docs/app/api-reference/functions/not-found)
- [`not-found.js` API Reference](https://nextjs.org/docs/app/api-reference/file-conventions/not-found)

---

## 次のステップ

**第13章：アクセシビリティの改善** はサーバー側フォームバリデーションとアクセシビリティ改善についてカバーします。
