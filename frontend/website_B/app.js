// /frontend/website_B/app.js (Website B 専用ロジック)
"use strict";

// 💡 共通ロジックの main_logic.js ではなく、Website B 専用の API クライアントをインポート
import * as api from './api_client.js'; 

const RESOURCE_NAME = 'game'; 

// --- [1] 表示ロジック ---

/**
 * ゲームの評価詳細をHTML要素として生成する
 */
function createGameDetailHTML(game, isEditable = true) {
    const editButton = isEditable 
        ? `<button class="edit-btn" data-id="${game.id}">編集</button>`
        : '';
    const deleteButton = isEditable 
        ? `<button class="delete-btn" data-id="${game.id}">削除</button>`
        : '';

    // 5つの観点の評価をリスト化
    const criteriaList = Object.entries(game.criteria || {}).map(([key, value]) => `
        <li><strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong> ${value} / 5</li>
    `).join('');

    // Website C の画像パス '/picture' を使用
    const chartSrc = `/game/images/${game.chartImage}`;

    return `
        <li class="game-item" data-id="${game.id}">
            <h3 class="game-title">${game.title}</h3>
            <div class="game-content">
                <div class="game-image">
                    <img src="${chartSrc}" alt="${game.title}の評価チャート" style="max-width:250px;">
                </div>
                <div class="game-info">
                    <p class="comment">${game.comment}</p>
                    <h4>評価内訳 (1~5点)</h4>
                    <ul class="criteria-list">
                        ${criteriaList}
                    </ul>
                    <div class="actions">
                        ${editButton}
                        ${deleteButton}
                    </div>
                </div>
            </div>
        </li>
    `;
}

/**
 * 全てのゲームレビューを取得し、リストに表示する (R)
 */
async function loadReviews() {
    const listContainer = document.getElementById('review-list');
    listContainer.innerHTML = 'データを読み込み中...';
    try {
        const games = await api.fetchAllItems(); // ★ Website B の API クライアントを使用
        listContainer.innerHTML = '';
        
        if (games.length === 0) {
            listContainer.innerHTML = '<li class="empty">レビューデータがありません。</li>';
            return;
        }

        const list = document.createElement('ul');
        list.className = 'review-list';
        games.forEach(game => {
            list.innerHTML += createGameDetailHTML(game, true); 
        });
        listContainer.appendChild(list);

        attachEventListeners(); // ボタンにイベントリスナーを付与
    } catch (error) {
        listContainer.innerHTML = `<p class="error">データの読み込みに失敗しました: ${error.message}</p>`;
        console.error(error);
    }
}


// --- [2] CRUD 操作 ---

/**
 * 新規レビュー作成処理 (C)
 */
// /frontend/website_B/app.js (handleCreate 関数内)
async function handleCreate(event) {
    console.log("--- handleCreate 実行開始 ---");

    event.preventDefault();
    const form = event.target;
    
    // 💡 修正後: 新しい5項目から値を取得
    const criteria = {
        story: parseInt(form.elements.story.value),           
        setting: parseInt(form.elements.setting.value),       
        character: parseInt(form.elements.character.value),   
        gameplay: parseInt(form.elements.gameplay.value),     
        original: parseInt(form.elements.original.value),     
    };
    
    // ... (1～5点のバリデーションチェック) ...

    const newReviewData = {
        title: form.elements.title.value,
        comment: form.elements.comment.value,
        chartImage: form.elements.chartImage.value,
        criteria: criteria // 💡 この criteria オブジェクトがAPIに送信される
    };

try {
        await api.createItem(newReviewData); // サーバーにデータを送信
        alert("レビューが正常に追加されました。");
        form.reset(); // フォームをリセット
        document.getElementById('add-form-container').style.display = 'none'; // フォームを隠す
        loadReviews(); // レビュー一覧を再読み込み (データが表示されるようになる)
    } catch (e) {
        alert(`レビュー追加に失敗しました: ${e.message}`);
    }
}

/**
 * レビュー削除処理 (D)
 */
async function handleDelete(event) {
    const itemId = event.target.dataset.id;
    if (!confirm(`レビューID ${itemId} を削除しますか？`)) {
        return;
    }

    try {
        await api.deleteItem(itemId);
        alert("レビューが削除されました。");
        loadReviews(); 
    } catch (error) {
        alert(`削除失敗: ${error.message}`);
    }
}

/**
 * 編集フォーム表示処理
 */
async function handleShowEditForm(event) {
    // 💡 [修正1] クリックされた要素のIDを取得。closest()を使って、確実にボタン要素のIDを取得する方が安全ですが、
    // まずは既存の target から取得を試みます。
    let itemId = event.target.dataset.id; 
    
    // 💡 [追加] ID取得の安全性を高めるため、もしクリックされたのがボタンの子要素だったら、ボタン自体を探す
    if (!itemId) {
        const editButton = event.target.closest('.edit-btn');
        if (editButton) {
            itemId = editButton.dataset.id;
        }
    }
    
    const editForm = document.getElementById('edit-review-form');

    const editFormContainer = document.getElementById('edit-form-container');
    const addFormContainer = document.getElementById('add-form-container');
    
    // 💡 [デバッグログ] 取得したIDをコンソールに出力
    console.log("--- handleShowEditForm 実行 ---");
    console.log("クリックされた要素:", event.target); 
    console.log("取得された itemId:", itemId); 
    
    if (!itemId) {
        console.error("編集対象のIDが取得できませんでした。");
        alert("エラー: 編集対象のIDが見つかりません。"); // アラートでユーザーに通知
        return;
    }

    try {
        // 💡 [デバッグログ] 取得するIDとデータを確認
        console.log(`APIからID: ${itemId} の詳細データを取得します。`);
        const item = await api.fetchItemDetail(itemId);

        // フォームにデータを設定
        editForm.elements['id'].value = item.id; // 💡 フォームにセットされるIDが item.id であることを確認
        editForm.elements['title'].value = item.title;
        editForm.elements['comment'].value = item.comment;
        editForm.elements['chartImage'].value = item.chartImage;
        
        // 評価項目を設定
        if (item.criteria) {
            editForm.elements['story'].value = item.criteria.story;
            editForm.elements['setting'].value = item.criteria.setting;
            editForm.elements['character'].value = item.criteria.character;
            editForm.elements['gameplay'].value = item.criteria.gameplay;
            editForm.elements['original'].value = item.criteria.original;
        }

        // フォームを表示する
        editFormContainer.style.display = 'block';
        addFormContainer.style.display = 'none'; 
        
        // 💡 [デバッグログ] フォームに設定されたデータIDを確認
        console.log(`フォームに設定されたID: ${editForm.elements['id'].value}`); 
        
    } catch (e) {
        alert(`編集データの取得に失敗しました: ${e.message}`);
    }
} // 関数を閉じる }

/**
 * レビュー更新処理 (U)
 */
async function handleUpdate(event) {
    event.preventDefault();
    const form = event.target;
    const itemId = form.elements['id'].value;
    
    // 💡 修正箇所: criteria オブジェクトのキーを新しい5項目に合わせる
    const criteria = {
        gameplay: parseInt(form.elements.gameplay.value),
        story: parseInt(form.elements.story.value),
        
        // --- 修正・変更後の項目 ---
        setting: parseInt(form.elements.setting.value),     // ← 世界観 (旧 graphics/sound)
        character: parseInt(form.elements.character.value), // ← キャラクター (旧 graphics/sound)
        original: parseInt(form.elements.original.value),   // ← オリジナル項目 (旧 innovation)
        // ------------------------

        // ※ 古い graphics, sound, innovation は削除
    };

    // 💡 (重要) 5段階評価を維持するため、1～5の範囲のバリデーションを適用
    for (const key in criteria) {
        const score = criteria[key];
        if (isNaN(score) || score < 1 || score > 5) { 
            alert(`評価項目の「${key}」の値は1から5の範囲で入力してください。`);
            return; // 範囲外なら処理を中断
        }
    }


    const updateData = {
        title: form.elements.title.value,
        comment: form.elements.comment.value,
        chartImage: form.elements.chartImage.value,
        criteria: criteria // 💡 このオブジェクトがサーバーに送信される
    };

    try {
        await api.updateItem(itemId, updateData);
        alert("レビュー情報が更新されました。");
        document.getElementById('edit-form-container').style.display = 'none';
        loadReviews(); 
    } catch (e) {
        alert(`更新失敗: ${e.message}`);
    }
}

// --- [3] イベントリスナー設定 ---

function attachEventListeners() {
    // 削除・編集ボタンのリスナーを再設定（動的に生成されるため）
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.removeEventListener('click', handleDelete); 
        btn.addEventListener('click', handleDelete);
    });
    
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.removeEventListener('click', handleShowEditForm); 
        btn.addEventListener('click', handleShowEditForm);
    });
}

// /frontend/website_B/app.js (修正後の window.addEventListener('load', ...) 部分)


// ページロード時に実行 (DOMContentLoaded に戻す)
document.addEventListener('DOMContentLoaded', () => { 

    // 💡 [修正点1] 新規レビュー表示ボタンのIDを以前の設定 'add-review-btn' に合わせます
    // ※ HTMLのIDが 'show-add-form-btn' なら、そちらを維持してください
    const showAddBtn = document.getElementById('add-review-btn'); 
    if (showAddBtn) {
        showAddBtn.addEventListener('click', () => {
            const formContainer = document.getElementById('add-form-container');
            console.log("新規レビューボタンがクリックされました。フォーム表示を切り替えます。"); 
            
            // フォーム表示 (ここではシンプルに切り替えではなく、表示に固定)
            document.getElementById('add-form-container').style.display = 'block';
            document.getElementById('edit-form-container').style.display = 'none';
        });
    } else {
        // デバッグログを警告に変更
        console.warn("#add-review-btn が見つかりません。"); 
    }

    // 💡 [修正点2] フォーム送信リスナーの設定 (これは正しい)
    const addForm = document.getElementById('add-review-form');
    if (addForm) {
        addForm.addEventListener('submit', handleCreate);
    } else {
        console.error("#add-review-form が見つかりません。"); // これが出力されていませんでしたか？
    }

    // 編集フォームのリスナー設定
    const editForm = document.getElementById('edit-review-form');
    if (editForm) {
        editForm.addEventListener('submit', handleUpdate);
    }
    
    // キャンセルボタンリスナー
    const cancelBtn = document.getElementById('cancel-edit-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            document.getElementById('edit-form-container').style.display = 'none';
        });
    }
    
    loadReviews(); // 最初のデータ読み込み
});