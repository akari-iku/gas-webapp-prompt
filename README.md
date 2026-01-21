# GAS Webアプリ開発用プロンプト（HIG準拠）

社内向けGoogle系アプリを作る時のGemini Gem用プロンプト。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## これは何？

Google環境でちょっとしたWebアプリ作りたい時、サーバー管理とか認証とか考えずに、GAS（Google Apps Script）で済ませたいことありますよね。

そういう時に使えるプロンプトです。

「タスク管理アプリ作って」の一言で、v0.1としては十分なレベルのアプリが生成されます。
スプシの書き込みとか最終のゴールを考えると結局なんかGASwebアプリでいいか…ってなる事が増えたので。
わざわざなんか色々しなくても良いか、というのを楽にしたかったので産まれた。

## 特徴

- HIG（ヒューマンインターフェースガイドライン）準拠のUI/UX 20項目
- GAS固有の制約に対応（非同期処理、論理削除等）
- 6テーマ、日本語UI、ローディング、Undo機能等
- チェックリスト40項目以上

## 使い方

### 1. プロンプトをコピー

[prompt/gas-webapp-prompt-hig.md](prompt/gas-webapp-prompt-hig.md)

### 2. Gemini Gemに登録

1. [Gemini](https://gemini.google.com/)にアクセス
2. 左サイドバーの「Gem」から「新しいGemを作成」
3. プロンプトを「指示」欄に貼り付け

### 3. 使ってみる

```
タスク管理アプリを作りたい
```

### 4. GASにデプロイ

生成されたコードを[Google Apps Script](https://script.google.com/)にコピペしてデプロイ。

## 生成例

- [タスクナビ（タスク管理アプリ）](examples/task-manager/)
- [評価シート](docs/evaluation.md)（94.5%達成）

## できること・できないこと

### できる
- 15分くらいで「それっぽい」UIが出来る
- 初版、たたき台として十分なレベル

### 別途対応が必要
- アクセシビリティ対応
- 完全なレスポンシブ対応

### 前提知識

GASの基礎知識（デプロイ、デバッグ等）がある程度必要です。
生成されたコードは「サンプル」なので、バイブコーディングで調整していく前提です。

## ライセンス

MIT License

## 謝辞

- [ソシオメディアHIG](https://www.sociomedia.co.jp/category/shig)
- Anthropic Claude（プロンプト作成支援）
