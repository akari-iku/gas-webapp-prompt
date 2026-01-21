# タスクナビ（生成例）

「タスク管理アプリを作りたい」の一言指示で生成されたサンプルアプリ。

## 評価結果

**94.5%達成**（20項目中）

- レベル1（基本）: 100%
- レベル2（HIG Phase 1）: 94%
- レベル3（GAS制約対応）: 100%
- レベル4（細部）: 88%

詳細は [docs/evaluation.md](../../docs/evaluation.md) を参照。

## 特徴

### PropertiesService使用
- **スプレッドシート不要**
- コピペですぐ動く
- セットアップ不要

### 機能

#### 基本機能
- タスクの追加・編集・削除
- 完了チェック
- アーカイブ（論理削除）
- キーワード検索（デバウンス300ms）

#### UI/UX
- 6テーマ切り替え
- 重要度の視覚化（色分け）
- 楽観的UI（即座にUI更新→サーバー送信）
- Undo機能（4秒以内に「元に戻す」）
- 初回起動時のサンプルデータ自動生成
- 自動ツアー起動
- 期限の情報表示（「今日」「明日」「あと〇日」）

#### GAS連携
- PropertiesServiceにデータ保存
- 論理削除（`isArchived`フラグ）
- ローディング表示
- エラーハンドリング

## データ構造

```javascript
{
  id: 'task_...',
  title: 'タスクタイトル',
  description: '詳細',
  priority: 'high' | 'medium' | 'low',
  dueDate: 'ISO文字列',
  status: 'active' | 'completed',
  isArchived: false,
  createdAt: 'ISO文字列'
}
```

## デプロイ方法

1. [Google Apps Script](https://script.google.com/)にアクセス
2. 「新しいプロジェクト」
3. `Code.gs` の内容を貼り付け
4. 「＋」→「HTML」→ `Untitled` という名前で作成
5. `Index.html` の内容を貼り付け
6. 「デプロイ」→「新しいデプロイ」→「ウェブアプリ」
7. アクセス権限を設定して「デプロイ」

完了！すぐに使えます。

## ファイル

- [Code.gs](./Code.gs) - サーバーサイド処理（PropertiesService）
- [Index.html](./Index.html) - フロントエンド（HTML/CSS/JS）
