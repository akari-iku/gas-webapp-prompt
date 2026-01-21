/**
 * Webアプリのエントリーポイント
 */
function doGet() {
  return HtmlService.createTemplateFromFile('Untitled')
    .evaluate()
    .setTitle('タスクナビ')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * 初回起動時のサンプルデータ生成
 */
function initSampleData() {
  const tasks = [
    {
      id: 'task_' + new Date().getTime(),
      title: 'タスクナビを体験する',
      description: 'まずはツアー機能を使って、アプリの基本操作を覚えましょう。',
      priority: 'high', // high, medium, low
      dueDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(), // 3日後
      status: 'active', // active, completed
      isArchived: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'task_' + (new Date().getTime() + 1),
      title: 'テーマを変更してみる',
      description: '設定メニューから「サクラ」や「オーシャン」などのテーマを試してみてください。',
      priority: 'medium',
      dueDate: '',
      status: 'active',
      isArchived: false,
      createdAt: new Date().toISOString()
    }
  ];
  saveTasksToStore(tasks);
  return tasks;
}

/**
 * 全タスクの取得（アーカイブ済みを除く）
 */
function getTasks() {
  try {
    const json = PropertiesService.getUserProperties().getProperty('TASKS');
    if (!json) {
      return initSampleData();
    }
    const tasks = JSON.parse(json);
    // アーカイブされていないものを返す（論理削除対応）
    return tasks.filter(t => !t.isArchived);
  } catch (e) {
    throw new Error('データの取得に失敗しました: ' + e.message);
  }
}

/**
 * タスクの保存（新規・更新）
 */
function saveTask(taskData) {
  try {
    const tasks = getAllTasksRaw();
    const existingIndex = tasks.findIndex(t => t.id === taskData.id);

    if (existingIndex >= 0) {
      // 更新
      tasks[existingIndex] = { ...tasks[existingIndex], ...taskData };
    } else {
      // 新規作成
      taskData.createdAt = new Date().toISOString();
      taskData.isArchived = false;
      tasks.push(taskData);
    }

    saveTasksToStore(tasks);
    // 更新後のリスト（アーカイブ除く）を返す
    return tasks.filter(t => !t.isArchived);
  } catch (e) {
    throw new Error('保存できませんでした: ' + e.message);
  }
}

/**
 * タスクの完了状態切り替え
 */
function toggleTaskStatus(id, isCompleted) {
  const tasks = getAllTasksRaw();
  const index = tasks.findIndex(t => t.id === id);
  if (index >= 0) {
    tasks[index].status = isCompleted ? 'completed' : 'active';
    saveTasksToStore(tasks);
  }
  return tasks.filter(t => !t.isArchived);
}

/**
 * タスクのアーカイブ（論理削除）
 * HIG原則: ユーザーにUndoの余地を残すため、完全削除ではなくフラグを立てる
 */
function archiveTask(id) {
  const tasks = getAllTasksRaw();
  const index = tasks.findIndex(t => t.id === id);
  if (index >= 0) {
    tasks[index].isArchived = true;
    saveTasksToStore(tasks);
  }
  return tasks.filter(t => !t.isArchived);
}

/**
 * アーカイブからの復元（Undo機能用）
 */
function restoreTask(id) {
  const tasks = getAllTasksRaw();
  const index = tasks.findIndex(t => t.id === id);
  if (index >= 0) {
    tasks[index].isArchived = false;
    saveTasksToStore(tasks);
  }
  return tasks.filter(t => !t.isArchived);
}

// 内部ヘルパー: 生データの取得
function getAllTasksRaw() {
  const json = PropertiesService.getUserProperties().getProperty('TASKS');
  return json ? JSON.parse(json) : [];
}

// 内部ヘルパー: 保存
function saveTasksToStore(tasks) {
  PropertiesService.getUserProperties().setProperty('TASKS', JSON.stringify(tasks));
}
