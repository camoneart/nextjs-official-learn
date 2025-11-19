# App Router

**公開日:** 2025年11月18日

**原文:** https://nextjs.org/learn/dashboard-app

---

Next.js Foundationsコースへようこそ！この無料のインタラクティブコースでは、フルスタックWebアプリケーションを構築しながらNext.jsの主要機能を学びます。

## 構築するもの

![ダッシュボードプロジェクトのデスクトップ版とモバイル版のスクリーンショット。](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/learn/light/dashboard.png)

![ダッシュボードプロジェクトのデスクトップ版とモバイル版のスクリーンショット。](https://h8DxKfmAPhn8O0p3.public.blob.vercel-storage.com/learn/dark/dashboard.png)

このコースでは、以下の機能を持つ財務ダッシュボードを構築します：

- 公開ホームページ
- ログインページ
- 認証で保護されたダッシュボードページ
- ユーザーが請求書を追加、編集、削除できる機能

ダッシュボードには付属のデータベースもあり、[後の章](/learn/dashboard-app/setting-up-your-database)でセットアップします。

コース終了時には、フルスタックNext.jsアプリケーションの構築を開始するために必要な基本的なスキルが身につきます。

## 概要

このコースで学ぶ機能の概要は次のとおりです：

- **スタイリング**: Next.jsでアプリケーションをスタイリングするさまざまな方法。
- **最適化**: 画像、リンク、フォントを最適化する方法。
- **ルーティング**: ファイルシステムルーティングを使用してネストされたレイアウトとページを作成する方法。
- **データフェッチング**: VercelでPostgresデータベースをセットアップする方法と、フェッチングとストリーミングのベストプラクティス。
- **検索とページネーション**: URL検索パラメータを使用して検索とページネーションを実装する方法。
- **データの変更**: React Server Actionsを使用してデータを変更し、Next.jsキャッシュを再検証する方法。
- **エラーハンドリング**: 一般的なエラーと`404` not foundエラーを処理する方法。
- **フォームバリデーションとアクセシビリティ**: サーバーサイドのフォームバリデーションとアクセシビリティを改善するためのヒント。
- **認証**: [`NextAuth.js`](https://next-auth.js.org/)とProxyを使用してアプリケーションに認証を追加する方法。
- **メタデータ**: メタデータを追加し、ソーシャル共有のためにアプリケーションを準備する方法。

## 前提知識

このコースでは、ReactとJavaScriptの基本的な理解があることを前提としています。Reactが初めての場合は、まず[React Foundations](/learn/react-foundations)コースを受講して、コンポーネント、props、state、フックなどのReactの基礎と、Server ComponentsやSuspenseなどの新しい機能を学ぶことをお勧めします。

## システム要件

このコースを開始する前に、システムが次の要件を満たしていることを確認してください：

- Node.js 20.9以降がインストールされていること。[こちらからダウンロード](https://nodejs.org/en)。
- オペレーティングシステム：macOS、Windows（WSLを含む）、またはLinux。

さらに、[GitHubアカウント](https://github.com/join/)と[Vercelアカウント](https://vercel.com/signup)も必要です。

## 会話に参加

このコースについて質問がある場合、またはフィードバックを提供したい場合は、[Reddit](https://reddit.com/r/vercel)または[GitHub](https://github.com/vercel/next-learn)でコミュニティに質問できます。

## 始める準備はできましたか？

コースの紹介が終わったので、早速始めましょう。

### 次へ

**1: はじめに**

Next.jsアプリケーションの作成方法とローカル開発サーバーの実行方法を学びます。

[第1章を開始](/learn/dashboard-app/getting-started)
