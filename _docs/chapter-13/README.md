# App Router：アクセシビリティの改善

**公開日:** 2025年11月18日

**原文:** https://nextjs.org/learn/dashboard-app/improving-accessibility

---

## 第13章

### アクセシビリティの改善

前のチャプターではエラーハンドリング（404エラーとフォールバック表示）について説明しました。このチャプターではServer Actionsを使用したサーバーサイドのフォームバリデーションと、Reactの`useActionState`フックを使用したアクセシビリティの改善について説明します。

### カバーされるトピック

- Next.jsと`eslint-plugin-jsx-a11y`を使用してアクセシビリティのベストプラクティスを実装する
- サーバーサイドのフォームバリデーションを実装する
- ReactのuseActionStateフックを使用してフォームエラーを処理し、ユーザーに表示する

### アクセシビリティとは？

アクセシビリティとは、障害を持つ人を含めて、すべての人が使用できるWebアプリケーションを設計および実装することを指します。キーボードナビゲーション、セマンティックHTML、画像、色、ビデオを含みます。より深い理解については、[web.devのLearn Accessibilityコース](https://web.dev/learn/accessibility/)をお勧めします。

### Next.jsでESLintアクセシビリティプラグインを使用する

Next.jsには、アクセシビリティの問題を早期にキャッチするための`eslint-plugin-jsx-a11y`が含まれています。これにより、以下のような問題をキャッチできます：
- `alt`テキストがない画像
- `aria-*`と`role`属性の正しくない使用

`package.json`にlintスクリプトを追加します：

```json
"scripts": {
    "build": "next build",
    "dev": "next dev",
    "start": "next start",
    "lint": "next lint"
}
```

`pnpm lint`を実行してチェックします。画像から`alt`propを削除すると、「Image elements must have an alt prop, either with meaningful text, or an empty string for decorative images」がトリガーされます。

### フォームのアクセシビリティの改善

すでに3つのアクセシビリティ改善があります：

1. **セマンティックHTML：** `<div>`の代わりに`<input>`や`<option>`などのセマンティック要素を使用すると、支援技術（AT）がフォーカスして文脈情報を提供できます

2. **ラベリング：** `htmlFor`属性を持つ`<label>`を各フィールドに関連付けると、支援技術サポートが向上し、ラベルをクリックしてフィールドにフォーカスできます

3. **フォーカスアウトライン：** フィールドがフォーカスされたときの適切なスタイリングはキーボードとスクリーンリーダーユーザーに重要です（`tab`を押して確認）

### フォームバリデーション

#### クライアント側バリデーション

フォーム入力に`required`属性を追加します：

```jsx
<input
  id="amount"
  name="amount"
  type="number"
  placeholder="Enter USD amount"
  className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
  required
/>
```

ブラウザは空の送信に対して警告を表示します。一部の支援技術はこのバリデーションをサポートしています。

#### サーバー側バリデーション

サーバー側バリデーションはデータ形式が有効であることを確保し、バイパスされたクライアントバリデーションからのリスクを削減し、有効なデータに対して単一の真実のソースを提供します。

**`useActionState`フックをインポート：**

```jsx
'use client';

import { useActionState } from 'react';
```

`useActionState`フック：
- 引数を取る：`(action, initialState)`
- 返す：`[state, formAction]`

**フォームコンポーネントを更新：**

```jsx
import { createInvoice, State } from '@/app/lib/actions';
import { useActionState } from 'react';

export default function Form({ customers }: { customers: CustomerField[] }) {
  const initialState: State = { message: null, errors: {} };
  const [state, formAction] = useActionState(createInvoice, initialState);

  return <form action={formAction}>...</form>;
}
```

**Zodスキーマを更新：**

```jsx
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});
```

**createInvoice actionを更新：**

```jsx
export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
  // Validate form fields using Zod
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  // Insert data into the database
  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    // If a database error occurs, return a more specific error.
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

  // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}
```

エラーハンドリング時にtry/catchなしで優雅に扱う方法として、`parse()`の代わりに`safeParse()`を使用します。

### アクセシビリティでエラーを表示する

ternary operatorとARIAラベルを使用してエラーを表示します：

```jsx
<form action={formAction}>
  <div className="rounded-md bg-gray-50 p-4 md:p-6">
    {/* Customer Name */}
    <div className="mb-4">
      <label htmlFor="customer" className="mb-2 block text-sm font-medium">
        Choose customer
      </label>
      <div className="relative">
        <select
          id="customer"
          name="customerId"
          className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
          defaultValue=""
          aria-describedby="customer-error"
        >
          <option value="" disabled>
            Select a customer
          </option>
          {customers.map((name) => (
            <option key={name.id} value={name.id}>
              {name.name}
            </option>
          ))}
        </select>
        <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
      </div>
      <div id="customer-error" aria-live="polite" aria-atomic="true">
        {state.errors?.customerId &&
          state.errors.customerId.map((error: string) => (
            <p className="mt-2 text-sm text-red-500" key={error}>
              {error}
            </p>
          ))}
      </div>
    </div>
    // ...
  </div>
</form>
```

**使用されるARIAラベル：**

- `aria-describedby="customer-error"：` selectとエラーコンテナの関係を確立
- `id="customer-error"：` エラーメッセージコンテナを一意に識別
- `aria-live="polite"：` ユーザーが作業中のときにユーザーを中断しないようにスクリーンリーダーがエラー変更を通知

### 練習：ARIAラベルを追加する

残りのフォームフィールドに同じパターンを適用してARIAラベルを追加します。フィールド がない場合、メッセージを表示します。`edit-form.tsx`コンポーネントにエラー状態を追加します：

- `useActionState`をコンポーネント内で使用
- Zodバリデーションエラーハンドリング用に`updateInvoice` actionを更新
- ARIAラベル付きのエラー表示
- `pnpm lint`を実行してARIAラベルの正しい使用を確認

### 次のステップ

第14章では、NextAuth.jsを使用した認証の追加についてカバーします。

[第14章を開始](/learn/dashboard-app/adding-authentication)
