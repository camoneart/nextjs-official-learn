# App Router：データの変更

**公開日:** 2025年11月18日

**原文:** https://nextjs.org/learn/dashboard-app/mutating-data

---

## 第11章

### 導入

このチャプターでは、React Server Actionsを使用してNext.jsアプリケーション内でデータを変更する方法を説明します。前のチャプターでの検索とページネーション実装に基づき、Invoicesページに作成、更新、削除機能を追加します。

### カバーされるトピック

- React Server Actionsとは何か、またそれをデータ変更にどのように使用するか
- フォームとServer Componentsで動作する
- FormDataオブジェクトと型検証のネイティブの利用
- `revalidatePath` APIを使用したキャッシュ再検証
- 特定IDで動的ルートセグメントを作成する

### Server Actionsとは？

「React Server Actionsを使用すると、APIエンドポイントを作成する必要なしに、サーバー上で非同期コードを直接実行できます。」セキュリティ機能には、暗号化されたクロージャ、入力検証、エラーハッシング、ホスト制限が含まれます。

### Server Actionsでフォームを使用する

`<form>`要素の`action`属性はServer Actionsを呼び出します。「Server Component内でServer Actionを呼び出す利点は、プログレッシブエンハンスメントです—JavaScriptがまだクライアントに読み込まれていなくてもフォームが機能します。」

```javascript
// Server Component
export default function Page() {
  // Action
  async function create(formData: FormData) {
    'use server';
    // Logic to mutate data...
  }

  // Invoke the action using the "action" attribute
  return <form action={create}>...</form>;
}
```

### Server ActionsでNext.js

Server ActionsはNext.jsキャッシングと統合します。フォームをServer Actionsで送信するとき、開発者は`revalidatePath`と`revalidateTag`を使用して関連キャッシュを再検証できます。

## 請求書の作成

### ステップ1：ルートとフォームを作成する

`/dashboard/invoices/create/page.tsx`を作成します。ページはお客様をフェッチしてフォームコンポーネントに渡します。フォームには以下を含みます：
- お客様のドロップダウン`<select>`
- 金額の`<input>` with `type="number"`
- ステータスの2つの`<input>`要素 with `type="radio"`
- 送信ボタン

### ステップ2：Server Actionを作成する

`/app/lib/actions.ts`を作成し、トップに`'use server'`ディレクティブを含めます。これはエクスポートされた関数がServer Actionsで、Client ComponentsまたはServer Componentsにインポートできることをマークします。

```javascript
'use server';

export async function createInvoice(formData: FormData) {}
```

`createInvoice`をフォームコンポーネントにインポートし、`<form>`要素の`action`属性に追加します。

### ステップ3：フォームデータを抽出する

FormDataから`.get(name)`メソッドを使用して値を抽出します：

```javascript
'use server';

export async function createInvoice(formData: FormData) {
  const rawFormData = {
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  };
  // Test it out:
  console.log(rawFormData);
}
```

多くのフィールドを持つフォームの場合、`.entries()`と`Object.fromEntries()`の使用を検討してください。

### ステップ4：データを検証して準備する

請求書テーブルは以下を期待します：
```typescript
export type Invoice = {
  id: string;
  customer_id: string;
  amount: number; // Stored in cents
  status: 'pending' | 'paid';
  date: string;
};
```

型検証にZodを使用します：

```javascript
'use server';

import { z } from 'zod';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
}
```

**金銭的な値をセントで保存してください** 浮動小数点エラーを排除するために：

```javascript
const amountInCents = amount * 100;
```

**日付を作成します** YYYY-MM-DD形式で：

```javascript
const date = new Date().toISOString().split('T')[0];
```

### ステップ5：データをデータベースに挿入する

```javascript
import { z } from 'zod';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;
}
```

### ステップ6：再検証してリダイレクトする

`revalidatePath`でクライアントキャッシュをクリアし、`redirect`でナビゲーションしてユーザーを戻します：

```javascript
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}
```

送信後、ユーザーは`/dashboard/invoices`にリダイレクトされ、テーブルの上部に新しい請求書が表示されます。

## 請求書の更新

### ステップ1：動的ルートセグメントを作成する

`/invoices/[id]/edit/page.tsx`の構造で動的ルート`[id]`を持つ`edit`サブフォルダを作成します

`<UpdateInvoice />`ボタンの`href`をIDを受け入れるように更新します：

```javascript
export function UpdateInvoice({ id }: { id: string }) {
  return (
    <Link
      href={`/dashboard/invoices/${id}/edit`}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
}
```

### ステップ2：ページのパラメータからIDを読み取る

```javascript
export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  // ...
}
```

### ステップ3：特定の請求書をフェッチする

```javascript
import Form from '@/app/ui/invoices/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchInvoiceById, fetchCustomers } from '@/app/lib/data';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  const [invoice, customers] = await Promise.all([
    fetchInvoiceById(id),
    fetchCustomers(),
  ]);
  // ...
}
```

### ステップ4：IDをServer Actionに渡す

JavaScriptの`bind`メソッドを使用してIDをセキュアに渡します：

```javascript
import { updateInvoice } from '@/app/lib/actions';

export default function EditInvoiceForm({
  invoice,
  customers,
}: {
  invoice: InvoiceForm;
  customers: CustomerField[];
}) {
  const updateInvoiceWithId = updateInvoice.bind(null, invoice.id);

  return <form action={updateInvoiceWithId}>{/* ... */}</form>;
}
```

`updateInvoice` actionを作成します：

```javascript
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  const amountInCents = amount * 100;

  await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}
```

## 請求書の削除

削除ボタンを`<form>`でラップし、`bind`を使用してIDを渡します：

```javascript
import { deleteInvoice } from '@/app/lib/actions';

export function DeleteInvoice({ id }: { id: string }) {
  const deleteInvoiceWithId = deleteInvoice.bind(null, id);

  return (
    <form action={deleteInvoiceWithId}>
      <button type="submit" className="rounded-md border p-2 hover:bg-gray-100">
        <span className="sr-only">Delete</span>
        <TrashIcon className="w-4" />
      </button>
    </form>
  );
}
```

`deleteInvoice` actionを作成します：

```javascript
export async function deleteInvoice(id: string) {
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath('/dashboard/invoices');
}
```

### UUIDと自動増分キー

「UUIDはIDの衝突のリスクを排除し、グローバルに一意であり、列挙型攻撃のリスクを削減します—大規模なデータベースに理想的です。」ただし、自動増分キーと比較してより長いURLを作成します。

## 参考資料

チャプターは、フォームでのServer Actionsによるセキュリティに関する追加リソースを推奨して終了します。次のチャプターではデータ変更のエラー処理のベストプラクティスについて説明します。
