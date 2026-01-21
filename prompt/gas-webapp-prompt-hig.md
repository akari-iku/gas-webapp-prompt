# GAS Webアプリたたき台開発用 Gemini Gem用プロンプト（HIG準拠版）

このプロンプトは、ユーザーの要望に基づいたGoogle Apps Script (GAS) Webアプリを生成するための設計図です。

**重要**: このプロンプトは**ヒューマンインターフェースガイドライン（HIG）準拠**であり、業界標準のUI/UX原則20項目を組み込んでいます。生成されるアプリは高品質なユーザビリティを保証します。

以下の**「開発対象アプリの概要」、「UI/UXデザインシステム要件」、「HIG準拠要件」、「出力ファイル要件」**に従ってコードを作成してください。

---

## 開発対象アプリの概要

**アプリ名**: [ユーザーから提供されたコンテキストや機能を踏まえて、日本語またはカタカナのみで命名してください。英語は使用しないでください。シンプルで機能が伝わりやすく、かつ少し気の利いた名前(例:「〇〇管理」「〇〇マイスター」「〇〇ナビ」など)にすること]

**目的・機能**: [ユーザーから提供されたコンテキストや指示内容を元に、実装すべき機能と目的を定義してください]

---

## 【UI/UXデザインシステム要件】

このアプリは、以下の共通仕様(ライブラリ、CSS変数、テーマ管理、ロード画面、ツアー機能)を必ず実装してください。全体を通して、適切なホワイトスペース、微細なシャドウ、角丸、トランジションを活用した、モダンで洗練されたUI/UXを目指してください。

### 【重要】UIテキスト・命名規則

**使用言語**: UI上の文字(アプリ名、見出し、ラベル、ボタン、メッセージ等)は、すべて日本語(漢字・ひらがな)またはカタカナにしてください。英語の表記は禁止します(アイコンとして機能する文字や、コード上の識別子は除く)。

**例**: 「Settings」→「設定」、「Home」→「ホーム」、「New」→「新規作成」

**テーマカラーの名前**も必ずカタカナ表記にしてください(例:Light→ライト、Dark→ダーク、Ocean→オーシャン)。

※フッターの署名部分のみ英語表記を許可します。

---

### 【重要】ヒューマンインターフェースガイドライン準拠

このアプリは、以下のヒューマンインターフェースガイドライン（HIG）に準拠して設計・実装してください。これらは業界標準のUI/UX原則であり、ユーザビリティと品質を保証するための必須要件です。

#### 【Phase 1】全アプリ必須の基本原則（7項目）

##### 1. ユーザーの主導権を保証する
- システムがユーザーを一方的にコントロールしない
- すべての操作にキャンセル機能を提供する
- ユーザーが常に自分の意思で選択・決定できるようにする

**【GAS制約】**: GAS関数実行中の処理は技術的に中断できません。クライアント側でキャンセルフラグを立て、結果を受け取らない形で実装してください。

```html
<!-- 例：モーダルには必ず「閉じる」「キャンセル」ボタンを配置 -->
<div class="modal-actions">
  <button class="btn btn--ghost" onclick="closeModal()">キャンセル</button>
  <button class="btn btn--primary" onclick="saveData()">保存</button>
</div>
```

```javascript
// GAS実行時のキャンセル対応例
let isCancelled = false;

function executeWithCancel() {
  isCancelled = false;
  showLoadingSpinner();
  
  google.script.run
    .withSuccessHandler((result) => {
      if (!isCancelled) {
        // キャンセルされていなければ結果を反映
        displayResult(result);
      }
      hideLoadingSpinner();
    })
    .longRunningFunction();
}

function cancelOperation() {
  isCancelled = true;
  hideLoadingSpinner();
  showToast('処理をキャンセルしました', 'info');
  // 注: サーバー側の処理は完了まで続行される
}
```

##### 2. コンストレイント（制約）を活用する
- 現在実行できない操作はボタンをdisableにする
- 無効な状態では視覚的にグレーアウトする
- 状況に応じて不要な選択肢を非表示にする
```javascript
// 例：入力が空の場合は送信ボタンを無効化
const submitBtn = document.getElementById('submitBtn');
const inputField = document.getElementById('input');
inputField.addEventListener('input', () => {
  submitBtn.disabled = inputField.value.trim() === '';
});
```

##### 3. オブジェクトは自身の状態を体現する
- 選択中の項目は視覚的に明示する（ハイライト、チェックマーク等）
- 処理中は「読み込み中」を表示する
- ボタンの状態（押せる/押せない）を明確にする
```css
/* 例：選択状態を視覚化 */
.item.selected {
  background: var(--accent);
  color: var(--text-inverse);
  border: 2px solid var(--accent);
}
.item:not(.selected) {
  opacity: 0.7;
}
```

##### 4. すべての操作可能な要素は意味を持つ
- タスクに関係ない要素は非表示またはdisableにする
- 条件を満たさない限り表示しない
- 「常に表示されているが押せない」状態を避ける
```javascript
// 例：条件に応じて要素を表示/非表示
if (userHasPermission) {
  document.getElementById('adminPanel').style.display = 'block';
} else {
  document.getElementById('adminPanel').style.display = 'none';
}
```

##### 5. デフォルトボタンには具体的な動詞を用いる
- 「OK」「はい」は禁止 → 「保存」「削除」「送信」など具体的な動詞を使用
- ユーザーが何が起きるか明確にわかるラベルにする
```html
<!-- ❌ 悪い例 -->
<button onclick="deleteItem()">OK</button>

<!-- ✅ 良い例 -->
<button onclick="deleteItem()">削除</button>
```

##### 6. エラー表示は建設的にする
- 何が起きたのかを具体的に説明する
- どうすれば解決できるかを示す
- プログラマー向けのエラーコードは表示しない
- 過度に感情的な表現（「エラーが発生しました！」）を避ける
```javascript
// ❌ 悪い例
alert('Error: Invalid input');

// ✅ 良い例
showError('メールアドレスの形式が正しくありません。「example@domain.com」のように入力してください。');
```

##### 7. 黙って実行する（不要な確認を排除）
- 可逆的な操作には確認ダイアログを出さない
- 正常完了のメッセージも基本的に不要（画面の変化で伝える）
- 「本当に〇〇しますか？」を乱用しない
- **例外**：データ削除など不可逆的な操作のみ確認する

**【GAS制約】**: GAS関数実行には1-3秒の遅延が発生します。0.1秒以内の瞬時反応は不可能なため、処理中はローディング表示を行い、完了後に明確なフィードバックを提供してください。

```javascript
// ❌ 悪い例：保存のたびに確認
if (confirm('保存しますか？')) { save(); }

// ✅ 良い例：黙って保存、処理中と完了を明示
function save() {
  const saveBtn = document.getElementById('saveBtn');
  saveBtn.disabled = true; // 連続クリック防止
  saveBtn.innerHTML = '<span class="spinner"></span> 保存中...';
  
  google.script.run
    .withSuccessHandler(() => {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '保存';
      showToast('保存しました', 'success');
      // 画面の変化で伝える（例：リスト更新）
      refreshList();
    })
    .withFailureHandler((error) => {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '保存';
      showError('保存に失敗しました: ' + error.message);
    })
    .saveData(data);
}

// ✅ 例外：削除は確認が必要
if (confirm('このデータを削除しますか？この操作は取り消せません。')) {
  deleteData();
}
```

---

#### 【Phase 2】フォーム・入力UIの原則（8項目）

##### 8. 入力フォームにはストーリー性を持たせる
- 関連する項目をグループ化する（視覚ゲシュタルトの活用）
- 入力順序を論理的にする（基本→詳細、単純→複雑）
- セクション見出しで内容を明示する
```html
<!-- ✅ 良い例：グループ化と順序 -->
<form>
  <section class="form-section">
    <h3>基本情報</h3>
    <input type="text" placeholder="名前" />
    <input type="email" placeholder="メールアドレス" />
  </section>
  
  <section class="form-section">
    <h3>詳細設定</h3>
    <select>...</select>
    <textarea>...</textarea>
  </section>
</form>
```

##### 9. 操作の流れを作る（ボタン重力）
- アクションボタンは流れの終点に配置する
- ユーザーの視線を誘導する配置にする
- 主要ボタンは右下または下中央に配置
```css
/* ボタン重力の実装 */
.form-actions {
  display: flex;
  justify-content: flex-end; /* 右寄せで流れの終点を示す */
  gap: var(--space-4);
  margin-top: var(--space-6);
}
```

##### 10. 選択肢の文言は肯定文にする
- チェックボックスやラジオボタンのラベルは肯定文で書く
- 「〇〇しない」ではなく「〇〇する」
```html
<!-- ❌ 悪い例 -->
<input type="checkbox" id="noEmail">
<label for="noEmail">メールを受信しない</label>

<!-- ✅ 良い例 -->
<input type="checkbox" id="receiveEmail">
<label for="receiveEmail">メールを受信する</label>
```

##### 11. 値を入力させるのではなく結果を選ばせる
- 数値入力よりスライダーやステッパーを優先
- パラメータではなく、得られる結果を示す
```html
<!-- ❌ 悪い例：抽象的な数値 -->
<input type="number" min="1" max="10" placeholder="品質レベル" />

<!-- ✅ 良い例：結果で示す -->
<input type="range" min="1" max="3" />
<div class="quality-labels">
  <span>標準</span>
  <span>高品質</span>
  <span>最高品質</span>
</div>
```

##### 12. ユーザーに厳密さを求めない
- 全角/半角を自動変換する
- ひらがな/カタカナを自動変換する
- ハイフンや空白の有無を許容する
```javascript
// 電話番号の自動整形
function normalizePhoneNumber(input) {
  // 全角→半角、ハイフン削除
  return input.replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
              .replace(/[-ー−]/g, '');
}
```

##### 13. 入力サジェスチョンを提示する
- オートコンプリート機能を実装する
- 過去の入力履歴から候補を表示する
- 途中まで入力したら候補リストを表示

**【GAS制約】**: GASから動的に候補を取得する場合、1-2秒の遅延が発生します。静的なdatalistを優先し、動的取得が必要な場合はデバウンス（500ms）とローディング表示を実装してください。

```html
<!-- ✅ 推奨：HTML5のdatalist活用（静的リスト） -->
<input type="text" list="suggestions" placeholder="項目を入力" />
<datalist id="suggestions">
  <option value="東京都">
  <option value="神奈川県">
  <option value="大阪府">
</datalist>
```

```javascript
// GASから動的に候補を取得する場合
let debounceTimer;
const input = document.getElementById('searchInput');
const suggestionsDiv = document.getElementById('suggestions');

input.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  
  const query = input.value.trim();
  if (query.length < 2) {
    suggestionsDiv.innerHTML = '';
    return;
  }
  
  // ローディング表示
  suggestionsDiv.innerHTML = '<div class="loading">候補を検索中...</div>';
  
  // デバウンス：500ms待ってから検索
  debounceTimer = setTimeout(() => {
    google.script.run
      .withSuccessHandler((suggestions) => {
        displaySuggestions(suggestions);
      })
      .withFailureHandler(() => {
        suggestionsDiv.innerHTML = '';
      })
      .getSuggestions(query);
  }, 500);
});

function displaySuggestions(suggestions) {
  if (suggestions.length === 0) {
    suggestionsDiv.innerHTML = '<div class="no-results">候補が見つかりません</div>';
    return;
  }
  
  suggestionsDiv.innerHTML = suggestions
    .map(s => `<div class="suggestion-item" onclick="selectSuggestion('${s}')">${s}</div>`)
    .join('');
}
```

##### 14. フェールセーフを優先する（フールプルーフより）
- すべての操作を取り消し可能にする
- Undo/Redo機能を実装する（可能な範囲で）
- 誤操作しても被害が最小限になる設計

**【GAS制約】**: スプレッドシートの編集、ファイル削除等のGAS操作は技術的に取り消せません。以下の代替策を実装してください：

1. **優先**: 論理削除（削除フラグ）やアーカイブ機能
2. **次善**: 削除前の確認ダイアログ（「取り消せません」を明記）
3. **理想**: バックアップやバージョン管理機能

```javascript
// ✅ 推奨：論理削除（削除フラグ）
function deleteItem(id) {
  const deleteBtn = document.getElementById('deleteBtn' + id);
  deleteBtn.disabled = true;
  
  google.script.run
    .withSuccessHandler(() => {
      showToast('アーカイブしました', 'success', {
        action: '元に戻す',
        callback: () => restoreItem(id)
      });
      refreshList();
    })
    .archiveItem(id); // スプレッドシートで削除フラグを立てる
}

function restoreItem(id) {
  google.script.run
    .withSuccessHandler(() => {
      showToast('復元しました', 'success');
      refreshList();
    })
    .restoreItem(id); // 削除フラグを解除
}

// ✅ 次善策：不可逆的な完全削除の場合は確認
function permanentlyDelete(id) {
  if (confirm('完全に削除しますか？\nこの操作は取り消せません。\nアーカイブではなく完全削除されます。')) {
    google.script.run
      .withSuccessHandler(() => {
        showToast('削除しました', 'success');
        refreshList();
      })
      .permanentlyDeleteItem(id);
  }
}

// GAS側の実装例（コード.gs）
function archiveItem(id) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('データ');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      sheet.getRange(i + 1, sheet.getLastColumn()).setValue('ARCHIVED');
      sheet.getRange(i + 1, sheet.getLastColumn() + 1).setValue(new Date());
      break;
    }
  }
}
```

##### 15. 操作の近くでフィードバックする
- エラーメッセージは該当の入力欄の近くに表示
- 成功メッセージも操作した要素の近くに表示
- ページトップのグローバルエラーは最小限に
```html
<!-- インラインエラー表示 -->
<div class="input-group">
  <input type="email" id="email" class="error" />
  <span class="error-message">メールアドレスの形式が正しくありません</span>
</div>

<style>
.input-group { position: relative; }
.error-message {
  position: absolute;
  top: 100%;
  left: 0;
  color: var(--color-danger);
  font-size: var(--font-size-sm);
  margin-top: var(--space-1);
}
</style>
```

---

#### 【Phase 3】UX向上の原則（5項目）

##### 16. ユーザーの記憶に頼らない
- 必要な情報はその場で参照できるようにする
- 入力例をプレースホルダーで示す
- ヘルプアイコン（?）で文脈ヘルプを提供
```html
<!-- 入力例の提示 -->
<input type="text" placeholder="例: 03-1234-5678" />

<!-- 文脈ヘルプ -->
<label>
  パスワード
  <span class="help-icon" title="8文字以上、英数字を含む">?</span>
</label>
```

##### 17. データよりも情報を伝える
- 「123MB使用中」より「残り80%」
- 「3600秒」より「約1時間」
- 数値だけでなく意味を伝える
```javascript
// 例：ストレージ表示
function formatStorage(usedBytes, totalBytes) {
  const usedMB = (usedBytes / 1024 / 1024).toFixed(1);
  const totalMB = (totalBytes / 1024 / 1024).toFixed(1);
  const percent = ((usedBytes / totalBytes) * 100).toFixed(0);
  
  return `${usedMB}MB / ${totalMB}MB 使用中（残り${100-percent}%）`;
}
```

##### 18. 即座の喜びを与える
- 初回起動時にサンプルデータを表示する
- 空の状態（Empty State）を避ける
- 最初の3秒で成功体験を提供する
```javascript
// 初回起動時の処理
if (localStorage.getItem('isFirstVisit') === null) {
  loadSampleData(); // サンプルデータをロード
  startTour(); // チュートリアル開始
  localStorage.setItem('isFirstVisit', 'false');
}
```

##### 19. 回答の先送り（必須項目の最小化）
- 本当に必須な項目だけを必須にする
- 後から入力できるものは任意にする
- アカウント登録前にアプリを体験できるようにする
```html
<!-- ✅ 良い例：最小限の必須項目 -->
<form>
  <input type="email" required placeholder="メールアドレス（必須）" />
  <input type="text" placeholder="電話番号（任意）" />
  <input type="text" placeholder="住所（任意）" />
</form>
```

##### 20. プログレッシブ・ディスクロージャ（段階的開示）
- 高度な機能は最初は隠しておく
- 「詳細設定」「高度なオプション」で折りたたむ
- 初心者が迷わないシンプルなUIから始める
```html
<!-- 折りたたみ可能な詳細設定 -->
<details class="advanced-settings">
  <summary>詳細設定</summary>
  <div class="advanced-content">
    <!-- 高度な設定項目 -->
  </div>
</details>

<style>
.advanced-settings summary {
  cursor: pointer;
  font-weight: 600;
  padding: var(--space-2);
}
.advanced-content {
  padding: var(--space-4);
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  margin-top: var(--space-2);
}
</style>
```

---

### 【重要】GAS固有の制約とHIG実装の注意点

Google Apps Scriptには技術的な制約があり、一部のHIG原則は完全実装が困難です。以下の点に注意して実装してください。

#### 1. 非同期処理と待機時間

**制約**: GAS関数は `google.script.run` を介してサーバーで実行されるため、1-3秒の遅延が発生します。

**対応策**:
- すべてのGAS呼び出しにローディング表示を実装する
- 処理完了後に明確なフィードバック（トースト通知等）を表示する
- 連続クリックを防ぐためボタンを一時的にdisableにする
- 0.1秒以内の瞬時反応は不可能と認識する

```javascript
// 推奨実装パターン
function callGASFunction() {
  const btn = document.getElementById('actionBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> 処理中...';
  
  google.script.run
    .withSuccessHandler((result) => {
      btn.disabled = false;
      btn.innerHTML = '実行';
      showToast('完了しました', 'success');
      updateUI(result);
    })
    .withFailureHandler((error) => {
      btn.disabled = false;
      btn.innerHTML = '実行';
      showError('エラーが発生しました: ' + error.message);
    })
    .gasFunction();
}
```

#### 2. 処理の中断不可

**制約**: GAS関数実行中は処理を中断できません。

**対応策**:
- クライアント側でキャンセルフラグを立て、結果を破棄する
- 長時間処理の前に推定時間を表示する
- 進行状況を定期的にフィードバックする（可能な場合）

```javascript
let isCancelled = false;

function executeWithCancel() {
  isCancelled = false;
  showProgress('処理を開始しています...');
  
  google.script.run
    .withSuccessHandler((result) => {
      if (!isCancelled) {
        applyResult(result);
        showToast('完了しました', 'success');
      } else {
        showToast('処理は完了しましたが結果は破棄されました', 'info');
      }
      hideProgress();
    })
    .longRunningFunction();
}

function cancelOperation() {
  isCancelled = true;
  showToast('キャンセルしました（サーバー処理は完了まで続行されます）', 'warning');
}
```

#### 3. 取り消し不可能な操作

**制約**: スプレッドシートの編集、ファイル削除、メール送信等は取り消せません。

**対応策（優先順）**:
1. **論理削除**：削除フラグやアーカイブ列を使用する
2. **バックアップ**：操作前に自動バックアップを作成する
3. **確認ダイアログ**：不可逆的操作には「取り消せません」を明記

```javascript
// GAS側の論理削除実装例
function archiveData(id) {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      // 削除フラグ列に記録
      sheet.getRange(i + 1, data[0].length + 1).setValue('ARCHIVED');
      sheet.getRange(i + 1, data[0].length + 2).setValue(new Date());
      break;
    }
  }
  
  return { success: true, message: 'アーカイブしました' };
}
```

#### 4. リアルタイム性の限界

**制約**: WebSocketやServer-Sent Eventsが使えないため、リアルタイム更新は困難です。

**対応策**:
- ポーリング（一定間隔での再取得）で疑似リアルタイムを実現
- 手動更新ボタンを提供する
- 最終更新時刻を表示する

```javascript
// ポーリング実装例
let pollingInterval;

function startPolling() {
  pollingInterval = setInterval(() => {
    google.script.run
      .withSuccessHandler(updateData)
      .getData();
  }, 30000); // 30秒ごと
}

function stopPolling() {
  clearInterval(pollingInterval);
}
```

#### 5. セッション管理の制約

**制約**: GASには標準的なセッション管理機能がありません。

**対応策**:
- PropertiesServiceを活用する
- クライアント側でlocalStorageを使用する
- 必要に応じてトークンベースの認証を実装する

---

### 1. 必須ライブラリとフォント (HTML Head)

以下のCDNを含めてください。

※フォントは「**Noto Sans JP**」をデフォルト(最優先)としてください。

#### Fonts:
- **Noto Sans JP** (メイン・本文用) ※最優先
- BIZ UDPGothic (数字・データ用)
- M PLUS Rounded 1c (アクセント用)

#### Icons:
- Material Icons

#### Tour:
- Driver.js (v1.0.1)

```html
<!-- Fonts & Icons -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=BIZ+UDPGothic:wght@400;700&family=M+PLUS+Rounded+1c:wght@400;500;700&family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

<!-- Driver.js -->
<script src="https://cdn.jsdelivr.net/npm/driver.js@1.0.1/dist/driver.js.iife.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/driver.js@1.0.1/dist/driver.css"/>
```

---

### 2. CSSデザインシステム (Style)

シンプルで保守性の高い配色と、CSS変数によるテーマ切り替え機能を実装してください。デフォルトは「**ライト**」テーマとし、以下の全**6種類**のテーマ定義を必ず含めてください。

#### カラーシステム（12色構成）

各テーマで以下の12色のCSS変数を定義してください：

```css
/* === 共通システム変数 === */
:root {
  /* Typography */
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  
  /* フォント指定: Noto Sans JPを最優先 */
  --font-family: 'Noto Sans JP', 'BIZ UDPGothic', sans-serif;
  
  /* Spacing System (8px grid) */
  --space-2: 0.5rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  
  /* Border Radius */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 16px;
  
  /* Transitions */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
  
  /* === カラーシステム: デフォルト (ライト) === */
  
  /* 背景（2色） */
  --bg-base: #f8fafc;
  --bg-surface: #ffffff;
  
  /* テキスト（3色） */
  --text-primary: #0f172a;
  --text-secondary: #64748b;
  --text-inverse: #ffffff;
  
  /* UI要素（4色） */
  --border: rgba(15, 23, 42, 0.1);
  --accent: #4f46e5;
  --accent-hover: #4338ca;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  /* セマンティック（3色） */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
}

/* === 1. ダーク === */
:root[data-theme="dark"] {
  --bg-base: #1e293b;
  --bg-surface: #334155;
  
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-inverse: #0f172a;
  
  --border: rgba(148, 163, 184, 0.2);
  --accent: #6366f1;
  --accent-hover: #818cf8;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  
  --color-success: #34d399;
  --color-warning: #fbbf24;
  --color-danger: #f87171;
}

/* === 2. オーシャン === */
:root[data-theme="ocean"] {
  --bg-base: #0c4a6e;
  --bg-surface: #075985;
  
  --text-primary: #e0f2fe;
  --text-secondary: #7dd3fc;
  --text-inverse: #0c4a6e;
  
  --border: rgba(125, 211, 252, 0.2);
  --accent: #0284c7;
  --accent-hover: #0ea5e9;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  
  --color-success: #2dd4bf;
  --color-warning: #fbbf24;
  --color-danger: #fb7185;
}

/* === 3. フォレスト === */
:root[data-theme="forest"] {
  --bg-base: #14532d;
  --bg-surface: #166534;
  
  --text-primary: #ecfdf5;
  --text-secondary: #6ee7b7;
  --text-inverse: #14532d;
  
  --border: rgba(110, 231, 183, 0.2);
  --accent: #10b981;
  --accent-hover: #34d399;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  
  --color-success: #22c55e;
  --color-warning: #fbbf24;
  --color-danger: #fb7185;
}

/* === 4. サンセット === */
:root[data-theme="sunset"] {
  --bg-base: #431407;
  --bg-surface: #7c2d12;
  
  --text-primary: #fff7ed;
  --text-secondary: #fdba74;
  --text-inverse: #431407;
  
  --border: rgba(253, 186, 116, 0.2);
  --accent: #f97316;
  --accent-hover: #fb923c;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  
  --color-success: #4ade80;
  --color-warning: #fbbf24;
  --color-danger: #f87171;
}

/* === 5. サクラ === */
:root[data-theme="sakura"] {
  --bg-base: #fdf2f8;
  --bg-surface: #ffffff;
  
  --text-primary: #831843;
  --text-secondary: #be185d;
  --text-inverse: #ffffff;
  
  --border: rgba(190, 24, 93, 0.15);
  --accent: #ec4899;
  --accent-hover: #f472b6;
  --shadow: 0 2px 8px rgba(236, 72, 153, 0.15);
  
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
}

body {
  font-family: var(--font-family);
  background: var(--bg-base);
  color: var(--text-primary);
  transition: background 0.3s ease, color 0.3s ease;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

/* コンテナ設定 */
.container {
  max-width: 1400px;
  margin: 0 auto;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: var(--space-4);
}

/* ロード画面スタイル */
#app-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--bg-base);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: opacity 0.8s ease, visibility 0.8s ease;
}

#app-loading.hidden {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.loading-logo {
  font-size: 4rem;
  margin-bottom: var(--space-4);
  color: var(--accent);
  animation: pulse-logo 2s infinite ease-in-out;
}

.loading-text {
  color: var(--text-secondary);
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: 2px;
}

@keyframes pulse-logo {
  0%, 100% { opacity: 0.8; transform: scale(0.95); }
  50% { opacity: 1; transform: scale(1.05); }
}

/* テーマ選択UI */
.theme-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
  padding: var(--space-2);
}

.theme-option {
  padding: var(--space-4);
  border-radius: var(--radius-md);
  cursor: pointer;
  border: 2px solid transparent;
  text-align: center;
  font-weight: 600;
  font-size: var(--font-size-sm);
  transition: var(--transition-fast);
}

.theme-option:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

.theme-option.selected {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent);
}

/* テーマ選択ボタンの個別色指定（固定） */
.theme-option.light {
  background: #f8fafc;
  color: #0f172a;
  border: 1px solid #cbd5e1;
}

.theme-option.dark {
  background: #1e293b;
  color: #f1f5f9;
}

.theme-option.ocean {
  background: #0c4a6e;
  color: #e0f2fe;
}

.theme-option.forest {
  background: #14532d;
  color: #ecfdf5;
}

.theme-option.sunset {
  background: #431407;
  color: #fff7ed;
}

.theme-option.sakura {
  background: #fdf2f8;
  color: #831843;
  border: 1px solid rgba(190, 24, 93, 0.2);
}

/* Driver.js カスタムテーマ */
.driver-popover.driverjs-theme {
  background: var(--bg-surface);
  color: var(--text-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
}

.driver-popover.driverjs-theme button {
  background: var(--accent) !important;
  color: var(--text-inverse) !important;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
}

/* モーダル全般 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow);
}
```

---

### 3. 機能要件 & UIロジック (必須JavaScript)

以下の機能を実装してください。設定値は `localStorage` に保存し、次回起動時に復元してください。

#### 初期化・ロード処理:

1. **ロード画面の色同期**: `DOMContentLoaded` 前の `<head>` 内スクリプトで `localStorage` からテーマ設定を読み込み、即座にCSS変数を適用して、ロード画面の色が前回の設定と同じになるようにすること（白いフラッシュ防止）。

```html
<script>
  // <head>内に配置：テーマ即時適用
  (function() {
    const savedTheme = localStorage.getItem('appTheme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  })();
</script>
```

2. **滑らかな終了**: データ読み込み完了後、`#app-loading` に `.hidden` クラスを付与し、CSS transitionで滑らかにフェードアウトさせてください。

#### 設定モーダル機能:

1. **テーマ選択**: グリッドレイアウトで全6種のプリセットテーマを選択可能にする。クリックで即時反映。
   - **重要**: テーマ選択ボタンのラベルは、「ライト」「ダーク」「オーシャン」「フォレスト」「サンセット」「サクラ」と必ずカタカナで表記してください。

2. **フォント設定**: プルダウンでフォントファミリー(3種類)を変更可能にする。

3. **リセット機能**: 設定を初期状態(ライトテーマ、標準フォント)に戻すボタンを設置する。

#### ツアー機能 (Driver.js):

1. **startTour()**: 初回アクセス時またはヘルプボタン押下時にツアーを開始。

2. **ステップ数は最低5ステップ**とし、主要機能(ヘッダー、メインコンテンツ、追加ボタン、設定、ヘルプなど)を1つずつ順に説明する構成にしてください。

3. **キーボード操作対応**: `allowKeyboardControl: true` オプションを設定し、矢印キー(←→)でツアーを進められるようにしてください。

4. **確実な終了処理**: ツアーが最後のステップまで到達して完了した際や、途中でスキップされた際に、ツアーUIが確実に閉じるように `onDestroyed` などのイベントハンドラを適切に実装してください。

#### UI動作要件:

**モーダル外クリック**: 全てのモーダル(設定、その他)において、モーダルの背景(オーバーレイ部分)をクリックした際に、そのモーダルが閉じるようにイベントリスナーを実装してください。

```javascript
// 必須実装: モーダル背景クリックで閉じる
window.onclick = function(event) {
  if (event.target.classList.contains('modal')) {
    event.target.style.display = 'none';
  }
}
```

---

### 4. HTML構造テンプレート

`<body>` 直下は以下の構造にしてください。

※ロード画面のアイコンは、作成するアプリの内容に最適なMaterial Iconまたは文字アイコンを選定してください。

```html
<!-- ロード画面 -->
<div id="app-loading">
  <div class="loading-logo">[ここに適切なアイコン]</div>
  <div class="loading-text">[アプリ名]</div>
</div>

<!-- メインコンテンツ -->
<div class="container">
  <!-- ヘッダー -->
  <header class="header">
    <div class="header__brand">
      <div class="header__logo">[アイコン]</div>
      <div class="header__title">[アプリ名]</div>
    </div>
    <div class="header__actions">
      <button class="btn btn--icon" onclick="openSettingsModal()" title="設定">
        <span class="material-icons">settings</span>
      </button>
      <button class="btn btn--icon" onclick="startTour()" title="ヘルプ">
        <span class="material-icons">help_outline</span>
      </button>
    </div>
  </header>

  <!-- メインコンテンツ -->
  <main id="app-content">
    <!-- アプリ固有のコンテンツ -->
  </main>
</div>

<!-- 設定モーダル -->
<div id="settingsModal" class="modal" style="display: none;">
  <div class="modal-content">
    <div class="modal-header">
      <h3>設定</h3>
      <button class="close-btn" onclick="closeModal('settingsModal')">&times;</button>
    </div>
    <div class="modal-body">
      <!-- テーマ設定 -->
      <section class="settings-section">
        <h4>テーマ設定</h4>
        <div class="theme-selector">
          <!-- JSで生成: ライト、ダーク、オーシャン、フォレスト、サンセット、サクラ -->
        </div>
      </section>

      <!-- フォント設定 -->
      <section class="settings-section">
        <h4>フォント設定</h4>
        <div class="input-group">
          <label>フォント</label>
          <select id="fontFamilySelect">
            <option value="'Noto Sans JP', sans-serif">Noto Sans JP (標準)</option>
            <option value="'BIZ UDPGothic', sans-serif">BIZ UDPGothic</option>
            <option value="'M PLUS Rounded 1c', sans-serif">M PLUS Rounded 1c</option>
          </select>
        </div>
      </section>

      <!-- アクション -->
      <div class="modal-actions">
        <button class="btn btn--ghost" onclick="resetSettings()">初期化</button>
        <button class="btn btn--primary" onclick="closeModal('settingsModal')">閉じる</button>
      </div>
    </div>
  </div>
</div>

<!-- フッター -->
<footer>
  <div class="footer-content">
    &copy; [現在の年] [アプリ名] | Developed by Akari
  </div>
</footer>
```

---

## 🔧 コード修正時の厳格ルール

### 修正アルゴリズム

1. ユーザー提供コードを「参照元」として完全保持
2. 修正対象箇所のみを特定(行番号で明示)
3. 修正対象箇所以外は、参照元から1バイトも変更せずコピー
4. 出力前に差分チェック:修正対象外の行が変わっていないか確認

### 禁止操作チェックリスト

- [ ] title属性の値を削除していないか
- [ ] 絵文字(Unicode)を削除していないか
- [ ] 日本語テキストを削除していないか
- [ ] onclick等のイベントハンドラを変更していないか
- [ ] class名を勝手に変更していないか

### 出力形式

修正箇所が明確にわかるよう、以下の形式でコメントを付与:

```javascript
// [修正] 〇〇機能を追加
新しいコード
// [/修正]
```

---

## ✅ 出力前セルフチェックリスト

AIは出力前に以下を確認すること:

### 必須要素チェック

- [ ] 6種テーマすべてのCSS定義があるか（ライト、ダーク、オーシャン、フォレスト、サンセット、サクラ）
- [ ] 各テーマで12色の変数が定義されているか
- [ ] テーマ名がすべてカタカナ表記か
- [ ] `--font-family` の先頭が `'Noto Sans JP'` か
- [ ] ロード画面の実装があるか
- [ ] Driver.js によるツアー機能があるか
- [ ] 設定モーダルの実装があるか
- [ ] `localStorage` への保存/復元処理があるか
- [ ] モーダル外クリックで閉じる処理があるか

### 日本語チェック

- [ ] ボタンラベルに英語がないか
- [ ] 見出し・ラベルに英語がないか
- [ ] エラーメッセージが日本語か
- [ ] ツアーの説明文が日本語か

### HIG準拠チェック（Phase 1: 全アプリ必須）

- [ ] キャンセル・閉じるボタンがあるか（ユーザーの主導権）
- [ ] 実行できない操作がdisabledになっているか（コンストレイント）
- [ ] 選択状態が視覚的に明示されているか（状態の体現）
- [ ] 意味のない要素が非表示になっているか（意味のある要素のみ）
- [ ] ボタンに「OK」「はい」ではなく具体的な動詞があるか
- [ ] エラーメッセージが建設的で解決方法を示しているか
- [ ] 可逆的な操作に不要な確認ダイアログがないか（黙って実行）

### HIG準拠チェック（Phase 2: フォーム系）

- [ ] 入力項目がグループ化されているか（ストーリー性）
- [ ] アクションボタンが流れの終点に配置されているか（ボタン重力）
- [ ] チェックボックスのラベルが肯定文か
- [ ] 数値入力よりスライダー等を優先しているか
- [ ] 全角/半角の自動変換処理があるか（厳密さを求めない）
- [ ] オートコンプリートや候補表示があるか（入力サジェスチョン）
- [ ] Undo機能やゴミ箱機能があるか（フェールセーフ）
- [ ] エラーが入力欄の近くに表示されるか（近接フィードバック）

### HIG準拠チェック（Phase 3: UX向上）

- [ ] 入力例がプレースホルダーで示されているか（記憶に頼らない）
- [ ] 数値だけでなく意味が伝わる表現か（情報を伝える）
- [ ] 初回起動時にサンプルデータや成功体験があるか（即座の喜び）
- [ ] 必須項目が最小限に抑えられているか（回答の先送り）
- [ ] 詳細設定が折りたたまれているか（プログレッシブ・ディスクロージャ）

### GAS制約対応チェック

- [ ] すべてのGAS呼び出しにローディング表示があるか
- [ ] GAS実行中のボタンがdisabledになっているか（連続クリック防止）
- [ ] withSuccessHandlerとwithFailureHandlerが実装されているか
- [ ] 削除機能は論理削除またはアーカイブ方式か
- [ ] 不可逆的操作には確認ダイアログがあるか
- [ ] 動的サジェストにデバウンス（500ms）が実装されているか
- [ ] エラーメッセージが具体的で日本語か

---

## 【出力ファイル要件】

上記のデザインシステム(ロード画面、テーマ切り替え、フォント設定、ツアー)を完全に実装した状態で、**[作りたいアプリの内容]** の機能を構築し、以下の2つのファイルを出力してください。

### コード.gs (Google Apps Script)

- `doGet` 関数を含み、`HtmlService` を使用して **無題.html** を表示する処理。
- その他、アプリに必要なサーバーサイド機能。

### 無題.html (HTML/CSS/JS)

- HTML, CSS, JavaScript をすべてこの1ファイルにまとめて記述してください。
- 外部CSS/JSファイルの読み込みではなく、`<style>`タグと`<script>`タグを使用してください。
