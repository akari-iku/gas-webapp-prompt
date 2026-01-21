# 「タスクナビ」評価シート

指示: 「タスク管理アプリを作りたい」

生成アプリ: タスクナビ（PropertiesService版）

---

## ✅ レベル1: 基本（絶対守ってほしい）

### 1. 日本語UIか
**結果**: ✅ **良好**
- すべてのボタン、ラベルが日本語
- プレースホルダー：「例: プレゼン資料の作成」「タスクを検索...」
- エラーメッセージも日本語想定
- フッターのみ英語（プロンプトで許可済み）

**評価**: 10/10

---

### 2. 6テーマあるか
**結果**: ✅ **良好**
- ライト、ダーク、オーシャン、フォレスト、サンセット、サクラ
- すべてカタカナ表記
- CSS変数も正しく定義
- テーマセレクターのUIも実装済み

**評価**: 10/10

---

### 3. ローディング表示あるか
**結果**: ✅ **良好**
- 初期ロード画面: `#app-loading` 実装済み
- GAS実行時のボタンローディング:
  ```javascript
  btn.innerHTML = '<div class="spinner" style="width:16px;height:16px;border-width:2px"></div> 保存中...';
  ```
- スピナーアニメーションもCSS定義済み

**評価**: 10/10

---

### 4. ボタンが「OK」「はい」ではなく具体的な動詞か
**結果**: ✅ **良好**
- 「保存する」「キャンセル」「閉じる」「初期設定に戻す」
- 「アーカイブ」ボタンもアイコン+title属性で明示
- モーダルアクションボタンも具体的

**評価**: 10/10

---

## ✅ レベル2: HIG Phase 1（7項目）

### 5. キャンセルボタンがあるか（ユーザーの主導権）
**結果**: ✅ **良好**
- すべてのモーダルに「キャンセル」「閉じる」ボタン
- モーダル外クリックで閉じる実装:
  ```javascript
  window.onclick = (e) => {
    if (e.target.classList.contains('modal')) {
      e.target.classList.remove('active');
    }
  };
  ```
- フォーム送信時のキャンセルも可能

**評価**: 10/10

---

### 6. 無効なボタンがdisableか（コンストレイント）
**結果**: ✅ **良好**
- タイトル未入力時、保存ボタンがdisable:
  ```javascript
  function validateForm() {
    const title = document.getElementById('taskTitle').value;
    document.getElementById('saveTaskBtn').disabled = title.trim() === '';
  }
  ```
- GAS実行中もボタンをdisable:
  ```javascript
  btn.disabled = true;
  ```

**評価**: 10/10

---

### 7. 選択状態が視覚化されてるか（状態の体現）
**結果**: ✅ **良好**
- 完了タスク:
  ```css
  .task-card.completed { opacity: 0.6; filter: grayscale(0.8); }
  .task-card.completed .task-title { text-decoration: line-through; }
  .task-card.completed .checkbox-custom {
    background: var(--color-success);
    border-color: var(--color-success);
  }
  ```
- テーマ選択:
  ```css
  .theme-option.selected { border-color: var(--accent); }
  ```

**評価**: 10/10

---

### 8. 意味のない要素が非表示になっているか
**結果**: ✅ **良好**
- Empty State実装済み（タスクがない時の表示）
- アーカイブされたタスクはリストから除外:
  ```javascript
  const filtered = allTasks.filter(t => !t.isArchived);
  ```

**評価**: 9/10

---

### 9. ボタンに具体的な動詞があるか
**結果**: ✅ **良好**（レベル1と重複だが再確認）
- すべて具体的：「保存する」「アーカイブ」「元に戻す」

**評価**: 10/10

---

### 10. エラーメッセージが建設的か
**結果**: ⚠️ **部分的**

**実装されているエラー処理**:
```javascript
function showError(e) {
  showToast(e.message || 'エラーが発生しました', 'danger');
}
```

GAS側:
```javascript
throw new Error('データの取得に失敗しました: ' + e.message);
throw new Error('保存できませんでした: ' + e.message);
```

**改善点**:
- GAS側のエラーメッセージは良い
- ただし、解決方法が示されていない

**評価**: 7/10

---

### 11. 可逆的な操作に不要な確認ダイアログがないか（黙って実行）
**結果**: ✅ **良好**
- 完了チェック: 確認なし、即実行（楽観的UI）:
  ```javascript
  function toggleStatus(id, currentStatus) {
    // 楽観的UI更新（即座に反応）
    const taskEl = document.getElementById(id);
    if(taskEl) taskEl.classList.toggle('completed');
    // その後サーバー通信
  }
  ```
- 削除→アーカイブ: 確認なし、Undo可能
- 保存: 確認なし

**評価**: 10/10

---

## ✅ レベル3: GAS制約対応

### 12. `google.script.run` に `withSuccessHandler` あるか
**結果**: ✅ **良好**
- すべてのGAS呼び出しに実装:
  ```javascript
  google.script.run
    .withSuccessHandler((tasks) => { ... })
    .withFailureHandler(showError)
    .getTasks();
  ```

**評価**: 10/10

---

### 13. 削除が論理削除（アーカイブ）か
**結果**: ✅ **良好**

**GAS側**:
```javascript
function archiveTask(id) {
  const tasks = getAllTasksRaw();
  const index = tasks.findIndex(t => t.id === id);
  if (index >= 0) {
    tasks[index].isArchived = true;
    saveTasksToStore(tasks);
  }
  return tasks.filter(t => !t.isArchived);
}
```

**フロントエンド**:
```javascript
function confirmDelete(id) {
  // 一時的にUIから消す
  const taskEl = document.getElementById(id);
  taskEl.style.display = 'none';

  google.script.run
    .withSuccessHandler((updatedTasks) => {
      allTasks = updatedTasks;
      renderTasks();
      showToast('アーカイブしました', 'info', {
        label: '元に戻す',
        action: () => restoreTask(id)
      });
    })
    .archiveTask(id);
}
```

**評価**: 10/10（プロンプトの推奨パターンを適切に実装）

---

### 14. デバウンスあるか（検索機能あれば）
**結果**: ✅ **良好**

```javascript
// デバウンス検索
let debounceTimer;
document.getElementById('searchInput').addEventListener('input', (e) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    renderTasks(e.target.value);
  }, 300);
});
```

**評価**: 10/10

---

## ✅ レベル4: 細かいところ

### 15. フォームがグループ化されているか（ストーリー性）
**結果**: ⚠️ **部分的**
- 視覚的なグループ化なし（`<section>`やボーダーがない）
- 論理的な順序は良い：タイトル→優先度→期限→詳細

**評価**: 6/10

---

### 16. プレースホルダーに例示あるか（記憶に頼らない）
**結果**: ✅ **良好**
- タイトル: `placeholder="例: プレゼン資料の作成"`
- 詳細: `placeholder="詳細なメモがあれば入力してください"`
- 検索: `placeholder="タスクを検索..."`

**評価**: 10/10

---

### 17. 完了率とか「情報」で表示されてるか
**結果**: ⚠️ **部分的**

**良い点**:
- 期限の表示が情報的:
  ```javascript
  function formatDate(isoString) {
    if (diffDays === 0) return '今日';
    if (diffDays === 1) return '明日';
    if (diffDays < 0) return '期限切れ';
    return `${d.getMonth() + 1}/${d.getDate()} (あと${diffDays}日)`;
  }
  ```
- 優先度の視覚化（色分け）

**改善点**:
- タスク数の表示なし
- 完了率の表示なし

**評価**: 7/10

---

### 18. アクションボタンが流れの終点に配置されているか（ボタン重力）
**結果**: ✅ **良好**
```css
.modal-actions {
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: flex-end;
  gap: var(--space-4);
}
```

順序も正しい：キャンセル（左）→ 保存する（右）

**評価**: 10/10

---

### 19. 初回起動時にサンプルデータや成功体験があるか（即座の喜び）
**結果**: ✅ **良好**

**GAS側**:
```javascript
function initSampleData() {
  const tasks = [
    {
      id: 'task_' + new Date().getTime(),
      title: 'タスクナビを体験する',
      description: 'まずはツアー機能を使って、アプリの基本操作を覚えましょう。',
      // ...
    },
    // ...
  ];
  saveTasksToStore(tasks);
  return tasks;
}
```

**フロントエンド**:
```javascript
// 初回訪問チェック
if (!localStorage.getItem('visited')) {
  localStorage.setItem('visited', 'true');
  setTimeout(startTour, 1000);
}
```

初回起動時にサンプルデータ生成＋自動ツアー起動！

**評価**: 10/10

---

### 20. Undo機能があるか（フェールセーフ）
**結果**: ✅ **良好**
```javascript
showToast('アーカイブしました', 'info', {
  label: '元に戻す',
  action: () => restoreTask(id)
});
```

トースト通知に「元に戻す」ボタン付き。4秒以内にクリックで復元可能。

**評価**: 10/10

---

## 📊 総合評価

| カテゴリ | 項目数 | 満点 | 獲得点 | 達成率 |
|---------|-------|------|--------|--------|
| **レベル1: 基本** | 4 | 40 | 40 | **100%** |
| **レベル2: HIG Phase 1** | 7 | 70 | 66 | **94%** |
| **レベル3: GAS制約** | 3 | 30 | 30 | **100%** |
| **レベル4: 細部** | 6 | 60 | 53 | **88%** |
| **総合** | **20** | **200** | **189** | **94.5%** |

---

## 🎯 主な減点項目

### 1. **エラーメッセージ** (-3点)
- 解決方法が示されていない
- ただし、GAS側のメッセージは改善されている

### 2. **フォームのグループ化** (-4点)
- 視覚的な区切りがない

### 3. **統計情報表示** (-3点)
- タスク数、完了率の表示なし
- ただし、期限表示は情報的で良い

### 4. **意味のない要素の非表示** (-1点)
- ほぼ良好だが、細かい配慮で若干減点

---

## ✨ 特に優れている点

### 1. **楽観的UI実装**（前回より進化）
```javascript
function toggleStatus(id, currentStatus) {
  // 楽観的UI更新（即座に反応）
  const taskEl = document.getElementById(id);
  if(taskEl) taskEl.classList.toggle('completed');
  // その後サーバー通信
}
```

### 2. **デバウンス検索実装**
前回は検索機能自体がなかったが、今回は適切に実装。

### 3. **日付の情報表示**
```javascript
if (diffDays === 0) return '今日';
if (diffDays === 1) return '明日';
if (diffDays < 0) return '期限切れ';
return `${d.getMonth() + 1}/${d.getDate()} (あと${diffDays}日)`;
```

「データよりも情報」の原則を一部実現。

### 4. **PropertiesService使用**
スプレッドシート不要で**コピペですぐ動く**。

### 5. **論理削除の良好な実装**
```javascript
tasks[index].isArchived = true;
```
+ Undo機能

---

## 🤔 総評

**結果**: **94.5% - 優秀+**

### 前回（タスク管理マイスター）との比較

| 項目 | マイスター | タスクナビ | 差分 |
|------|-----------|-----------|------|
| **総合** | 89.5% | **94.5%** | **+5.0%** |
| レベル1 | 100% | 100% | - |
| レベル2 | 90% | **94%** | **+4%** |
| レベル3 | 100% | 100% | - |
| レベル4 | 77% | **88%** | **+11%** |

### 改善された点

1. **デバウンス検索追加** (+10点)
2. **日付の情報表示** (+4点)
3. **意味のない要素の非表示** (+1点)

### まだ改善が必要な点

- フォームのグループ化（視覚的区切り）
- 統計情報の表示（タスク数、完了率）
- エラーメッセージの解決方法提示

---

## 💡 結論

**タスクナビの方が優秀**：
- スコア：**94.5%** > 89.5%
- PropertiesService使用で**セットアップ不要**
- デバウンス検索、情報表示など**細部の完成度が高い**

記事・GitHubには**タスクナビを採用推奨**。
