# App Router：認証の追加

**公開日:** 2025年11月18日

**原文:** https://nextjs.org/learn/dashboard-app/adding-authentication

---

## 第14章

### 認証の追加

前のチャプターでは、フォームバリデーションを追加してInvoicesルートを完成させました。このチャプターではNextAuth.jsを使用して認証をダッシュボードに追加します。

#### このチャプターで説明するトピック

- 認証とは
- NextAuth.jsを使用してアプリケーションに認証を追加する方法
- Proxを使用してユーザーをリダイレクトしてルートを保護する方法
- Reactの`useActionState`を使用して保留状態とフォームエラーを処理する方法

### 認証とは？

認証は現在のWebアプリケーションの重要な部分です。ユーザーが言うとおりにユーザーを確認する仕組みです。

セキュアなWebサイトはユーザーアイデンティティをチェックするために複数の方法を使用します。例えば、ユーザー名とパスワードを入力した後、サイトはデバイスに確認コードを送信するか、Google Authenticatorなどの外部アプリを使用できます。2要素認証（2FA）によってセキュリティが強化されます。誰かがパスワードを学習しても、独自のトークンなしではアカウントにアクセスできません。

#### 認証対認可

Web開発では、認証と認可は異なる役割を果たします：

- **認証** はユーザーが言うとおりであることを確認することです。ユーザー名とパスワードのような何かでアイデンティティを証明します
- **認可** は次のステップです。ユーザーのアイデンティティが確認されたら、認可はユーザーがアプリケーションの一部にアクセスできるものを決定します

つまり、認証はあなたが誰であるか確認し、認可はアプリケーションで何ができるかを決定します。

### ログインルートの作成

`/app/login/page.tsx`という新しいルートを作成して、次のコードを貼り付けます：

```typescript
// /app/login/page.tsx
import AcmeLogo from '@/app/ui/acme-logo';
import LoginForm from '@/app/ui/login-form';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <main className="flex items-center justify-center md:h-screen">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
        <div className="flex h-20 w-full items-end rounded-lg bg-blue-500 p-3 md:h-36">
          <div className="w-32 text-white md:w-36">
            <AcmeLogo />
          </div>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
```

ページが`<LoginForm />`をインポートしていることに注意してください。このコンポーネントは後でこのチャプターで更新されます。Suspenseでラップされています。これはURLサーチパラメータから入ってくる情報にアクセスするためです。

### NextAuth.js

認証を使用して、[NextAuth.js](https://nextjs.authjs.dev/)を使用します。「NextAuth.jsはセッション管理、サインイン・サインアウト、認証のその他の側面の複雑さを管理することを抽象化します。」これらの機能を手動で実装することもできますが、時間がかかり、エラーが発生しやすくなります。NextAuth.jsは次のjs アプリケーションでの認証のための統一されたソリューションを提供することで、プロセスを簡素化します。

### NextAuth.jsのセットアップ

ターミナルで以下のコマンドを実行してNextAuth.jsをインストールします：

```bash
pnpm i next-auth@beta
```

ここでは、Next.js 14+と互換性のあるNextAuth.jsの`beta`バージョンをインストールしています。

次に、アプリケーションのシークレットキーを生成します。このキーはCookieの暗号化に使用され、ユーザーセッションのセキュリティを保証します。ターミナルで以下のコマンドを実行します：

```bash
# macOS
openssl rand -base64 32
# Windows can use https://generate-secret.vercel.app/32
```

その後、`.env`ファイルで、生成されたキーを`AUTH_SECRET`変数に追加します：

```env
AUTH_SECRET=your-secret-key
```

本番環境での認証を機能させるには、Vercelプロジェクトの環境変数を更新する必要があります。このガイドをご確認ください。

#### pages optionを追加する

プロジェクトのルートで`auth.config.ts`ファイルを作成し、`authConfig`オブジェクトをエクスポートします。このオブジェクトにはNextAuth.jsの設定オプションが含まれます。当面は、`pages`オプションのみが含まれます：

```typescript
// /auth.config.ts
import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
} satisfies NextAuthConfig;
```

`pages`オプションを使用して、カスタムサインイン、サインアウト、エラーページのルートを指定できます。これは必須ではありませんが、`signIn: '/login'`を`pages`オプションに追加することで、ユーザーはNextAuth.jsのデフォルトページではなくカスタムログインページにリダイレクトされます。

### Next.js Proxyでルートを保護する

次に、ルートを保護するロジックを追加します。これはログインしていないユーザーがダッシュボードページにアクセスするのを防ぎます。

```typescript
// /auth.config.ts
import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
```

「`authorized`コールバックはNext.js Proxyを使用してリクエストがページへのアクセスを許可されているかどうかを検証するために使用される」ます。リクエストが完了する前に呼び出され、`auth`と`request`プロパティを持つオブジェクトを受け取ります。`auth`プロパティはユーザーのセッションを含み、`request`プロパティは入ってくるリクエストを含みます。

`providers`オプションはログイン選択肢をリストするアレイです。今のところ、NextAuth設定を満たすために空の配列です。このセクションでProviderについて詳しく説明します。

次に、`authConfig`オブジェクトをProxyファイルにインポートする必要があります。プロジェクトのルートで`proxy.ts`というファイルを作成し、次のコードを貼り付けます：

```typescript
// /proxy.ts
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  // https://nextjs.org/docs/app/api-reference/file-conventions/proxy#matcher
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
```

ここで、`authConfig`オブジェクトでNextAuth.jsを初期化し、`auth`プロパティをエクスポートしています。また、Proxyが特定のパスで実行される対象を指定するための`matcher`オプションを使用しています。

「このタスク用にProxyを利用する利点は、保護されたルートがProxyがが認証を検証するまで、レンダリングを開始しさえしない」ため、セキュリティと パフォーマンスの両方が向上します。

#### パスワードのハッシング

データベースに保存する前にパスワードをハッシュすることはベストプラクティスです。ハッシング化は、パスワードをランダムに見える固定長の文字列に変換し、ユーザーのデータが公開されても、セキュリティの層を提供します。

セキュアWebサイトがWebサイトに保存される前にパスワードをハッシュ化します。代わりに、ユーザーが入力したパスワードがデータベースに保存されたハッシュと一致するかどうかを比較することで、パスワードを検証します。ただし、`bcrypt`はNext.js Proxyで使用できないNode.js APIに依存しているため、代わりに別のファイルを作成する必要があります。

プロジェクトのルートで`auth.ts`というファイルを作成し、次のコードを含めます：

```typescript
// /auth.ts
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
});
```

#### Credentials Providerを追加する

次に、NextAuth.jsの`providers`オプションを追加する必要があります。`providers`はGoogle や GitHub などの異なるログインオプションをリストするアレイです。このコースでは、[Credentials provider](https://authjs.dev/getting-started/providers/credentials-tutorial)のみに焦点を当てます。

Credentials providerはユーザーがユーザー名とパスワードでログインできるようにします。

```typescript
// /auth.ts
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [Credentials({})],
});
```

> **知っておくと良いこと：**
>
> [OAuth](https://authjs.dev/getting-started/providers/oauth-tutorial)や[email](https://authjs.dev/getting-started/providers/email-tutorial)など、他の代替プロバイダーがあります。オプションの完全なリストについては、[NextAuth.jsドキュメント](https://authjs.dev/getting-started/providers)を参照してください。

#### サインイン機能を追加する

`authorize`関数を使用して認証ロジックを処理できます。Server Actionsと同様に、`zod`を使用してメールアドレスとパスワードをバリデーションし、ユーザーがデータベースに存在するかどうかを確認できます：

```typescript
// /auth.ts
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);
      },
    }),
  ],
});
```

パスワードを検証した後、データベースからユーザーをクエリする新しい`getUser`関数を作成します。

```typescript
// /auth.ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { z } from 'zod';
import type { User } from '@/app/lib/definitions';
import bcrypt from 'bcrypt';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User[]>`SELECT * FROM users WHERE email=${email}`;
    return user[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          if (!user) return null;
        }

        return null;
      },
    }),
  ],
});
```

その後、`bcrypt.compare`を呼び出して、パスワードが一致するかチェックします：

```typescript
// /auth.ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { z } from 'zod';
import type { User } from '@/app/lib/definitions';
import bcrypt from 'bcrypt';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// ...

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        // ...

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          if (!user) return null;
          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) return user;
        }

        console.log('Invalid credentials');
        return null;
      },
    }),
  ],
});
```

最後に、パスワードが一致する場合、ユーザーを返します。一致しない場合は、`null`を返してユーザーのログインを防ぎます。

#### ログインフォームを更新する

これで、認証ロジックをログインフォームに接続する必要があります。`actions.ts`ファイルで、`authenticate`という新しいアクションを作成します。このアクションは`auth.ts`から`signIn`関数をインポートする必要があります：

```typescript
// /app/lib/actions.ts
'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

// ...

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}
```

`'CredentialsSignin'`エラーがある場合、適切なエラーメッセージを表示したいです。NextAuth.js エラーについては[ドキュメント](https://errors.authjs.dev)を参照してください。

最後に、`login-form.tsx`コンポーネントで、Reactの`useActionState`を使用してサーバーアクションを呼び出し、フォームエラーを処理し、フォームの保留状態を表示できます：

```typescript
// app/ui/login-form.tsx
'use client';

import { lusitana } from '@/app/ui/fonts';
import {
  AtSymbolIcon,
  KeyIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from '@/app/ui/button';
import { useActionState } from 'react';
import { authenticate } from '@/app/lib/actions';
import { useSearchParams } from 'next/navigation';

export default function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-3">
      <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
        <h1 className={`${lusitana.className} mb-3 text-2xl`}>
          Please log in to continue.
        </h1>
        <div className="w-full">
          <div>
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="email"
            >
              Email
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email address"
                required
              />
              <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
          <div className="mt-4">
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="password"
                type="password"
                name="password"
                placeholder="Enter password"
                required
                minLength={6}
              />
              <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
        </div>
        <input type="hidden" name="redirectTo" value={callbackUrl} />
        <Button className="mt-4 w-full" aria-disabled={isPending}>
          Log in <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
        </Button>
        <div
          className="flex h-8 items-end space-x-1"
          aria-live="polite"
          aria-atomic="true"
        >
          {errorMessage && (
            <>
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-500">{errorMessage}</p>
            </>
          )}
        </div>
      </div>
    </form>
  );
}
```

### ログアウト機能の追加

`<SideNav />`にログアウト機能を追加するために、`auth.ts`から`signOut`関数をフォーム要素で呼び出します：

```typescript
// /ui/dashboard/sidenav.tsx
import Link from 'next/link';
import NavLinks from '@/app/ui/dashboard/nav-links';
import AcmeLogo from '@/app/ui/acme-logo';
import { PowerIcon } from '@heroicons/react/24/outline';
import { signOut } from '@/auth';

export default function SideNav() {
  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2">
      // ...
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks />
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>
        <form
          action={async () => {
            'use server';
            await signOut({ redirectTo: '/' });
          }}
        >
          <button className="flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3">
            <PowerIcon className="w-6" />
            <div className="hidden md:block">Sign Out</div>
          </button>
        </form>
      </div>
    </div>
  );
}
```

### 試してみる

これで、アプリケーションにログインとログアウトできるようになりました。次の資格情報を使用します：

- Email: `user@nextmail.com`
- Password: `123456`

---

## 第14章を完了しました

アプリケーションに認証を追加し、ダッシュボードルートを保護しました。

### 次に

**15：メタデータの追加**

共有準備完了の準備のためにアプリケーションにメタデータを追加する方法を学びます。

[第15章を開始](/learn/dashboard-app/adding-metadata)
