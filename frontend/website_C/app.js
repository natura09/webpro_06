// /frontend/website_C/app.js

// Notes & Lists API を使用するためのグローバル変数（リストIDを保持）
let currentListId = null; 
const LIST_NAME = "今日のToDo"; // 使用するリスト名

// --- [1] リストの初期化と表示 ---

/**
 * Notes & Lists API を使用してリストの内容を表示する
 */
async function loadTodoList() {
    const listElement = document.getElementById('todo-list');
    listElement.innerHTML = ''; // リストを一旦クリア

    try {
        // 1. リストを検索/取得する
        const result = await notes_and_lists.get_notes_and_lists({
            search_term: LIST_NAME,
            hint: 'LIST'
        });

        if (result.notes_and_lists_items && result.notes_and_lists_items.length > 0) {
            const listData = result.notes_and_lists_items[0];
            currentListId = listData.item_id; // リストIDを保持
            
            // 2. リストアイテムを描画する
            if (listData.list_content && listData.list_content.list_items) {
                listData.list_content.list_items.forEach(item => {
                    renderListItem(item.text_content, item.list_item_id); // アイテムIDを渡す
                });
            } else {
                listElement.innerHTML = '<li>リストにタスクはありません。</li>';
            }
        } else {
            // 3. リストが存在しない場合は新規作成する
            await createInitialList();
            listElement.innerHTML = '<li>新しくToDoリストを作成しました。タスクを追加してください。</li>';
        }

        attachEventListeners(); // 動的に生成された削除ボタンにイベントを割り当てる

    } catch (e) {
        console.error("ToDoリストのロード中にエラーが発生しました:", e);
        listElement.innerHTML = '<li>リストの読み込みに失敗しました。</li>';
    }
}

/**
 * ToDoリストが存在しない場合に新規作成する
 */
async function createInitialList() {
    try {
        const result = await notes_and_lists.create_list({
            list_name: LIST_NAME,
            is_bulk_mutation: false
        });
        currentListId = result.list_id; // 新規作成したリストIDを保持
    } catch (e) {
        console.error("ToDoリストの新規作成に失敗しました:", e);
    }
}

/**
 * リストアイテムのHTMLを生成する
 */
function renderListItem(text, itemId) {
    const listElement = document.getElementById('todo-list');
    const li = document.createElement('li');
    li.innerHTML = `
        <span>${text}</span>
        <button class="delete-btn" data-item-id="${itemId}">削除</button>
    `;
    listElement.appendChild(li);
}

// --- [2] CRUD 操作 ---

/**
 * タスクの追加処理 (C)
 */
async function handleAddItem(event) {
    event.preventDefault();
    const inputElement = document.getElementById('task-input');
    const taskText = inputElement.value.trim();

    if (!taskText || !currentListId) return;

    try {
        // Notes & Lists API でリストにアイテムを追加
        await notes_and_lists.add_to_list({
            list_id: currentListId,
            elements_to_add: [taskText],
            is_bulk_mutation: false
        });

        inputElement.value = ''; // 入力フィールドをクリア
        loadTodoList(); // リストを再読み込みして更新

    } catch (e) {
        alert(`タスクの追加に失敗しました: ${e.message}`);
    }
}

/**
 * タスクの削除処理 (D)
 */
async function handleDeleteItem(event) {
    const itemIdToDelete = event.target.dataset.itemId;

    if (!itemIdToDelete || !currentListId) return;

    try {
        // Notes & Lists API でアイテムを削除
        await notes_and_lists.delete_list_item({
            list_id: currentListId,
            elements_to_delete: [itemIdToDelete]
        });

        loadTodoList(); // リストを再読み込みして更新

    } catch (e) {
        alert(`タスクの削除に失敗しました: ${e.message}`);
    }
}


// --- [3] イベントリスナーの設定 ---

/**
 * 動的に生成されるボタンにイベントリスナーを設定
 */
function attachEventListeners() {
    document.querySelectorAll('.delete-btn').forEach(btn => {
        // 二重設定を防ぐために一度削除してから追加
        btn.removeEventListener('click', handleDeleteItem); 
        btn.addEventListener('click', handleDeleteItem);
    });
}

// --- [4] 初期化 ---
document.addEventListener('DOMContentLoaded', () => {
    // フォーム送信リスナーを設定
    document.getElementById('todo-form').addEventListener('submit', handleAddItem);
    
    // 最初のリスト読み込み
    loadTodoList();
});