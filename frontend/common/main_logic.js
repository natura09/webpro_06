// /frontend/common/main_logic.js
"use strict";

import * as api from './api_client.js'; 

document.addEventListener('DOMContentLoaded', () => {
    loadDataList(); 
    
    // データ追加フォームのイベントリスナーを設定（フォームIDを持つサイトでのみ動作）
    const addForm = document.getElementById('add-form');
    if (addForm) {
        addForm.addEventListener('submit', handleAddItem);
    }
});

/**
 * [R] データ一覧の取得と表示を統一的に行う
 */
export async function loadDataList() {
    const dataListElement = document.getElementById('data-list');
    if (!dataListElement) return; 
    
    dataListElement.innerHTML = '<li class="loading">データを読み込み中...</li>';

    try {
        const items = await api.fetchAllItems(); // ★ 統一されたAPIコール
        dataListElement.innerHTML = '';
        
        if (items && items.length > 0) {
            items.forEach(item => {
                const listItem = document.createElement('li');
                listItem.className = item.type; // CSSでデザインが変わるようにtypeをクラスに
                listItem.innerHTML = `
                    <span class="item-name">${item.name}</span>
                    <span class="item-id">(ID: ${item.id})</span>
                    <div class="actions">
                        <button onclick="window.showDetail(${item.id})">詳細</button>
                        <button onclick="window.handleDeleteItem(${item.id})" class="delete-btn">削除</button>
                    </div>
                `;
                dataListElement.appendChild(listItem);
            });
        } else {
            dataListElement.innerHTML = '<li class="empty">データがありません。</li>';
        }
    } catch (error) {
        console.error("データ取得エラー:", error);
        dataListElement.innerHTML = '<li class="error">データの読み込みに失敗しました。</li>';
    }
}

/**
 * [C] データ追加操作を統一的に行う
 */
async function handleAddItem(event) {
    event.preventDefault();
    
    const name = document.getElementById('new-name').value;
    const description = document.getElementById('new-desc').value;
    const type = document.getElementById('new-type').value || 'data';

    try {
        const newItem = await api.createItem({ name: name, description: description, type: type });
        alert(`データが追加されました (ID: ${newItem.id})`);
        
        document.getElementById('add-form').reset(); // フォームをリセット
        await loadDataList();
    } catch (error) {
        alert(`データの追加に失敗しました: ${error.message}`);
    }
}

/**
 * [D] データ削除操作 (グローバルに公開)
 */
window.handleDeleteItem = async (id) => {
    if (!confirm(`ID ${id} のデータを削除してもよろしいですか？`)) return;

    try {
        await api.deleteItem(id);
        alert(`ID ${id} のデータを削除しました。`);
        await loadDataList();
    } catch (error) {
        alert("データの削除に失敗しました。");
    }
}

/**
 * [R] データ詳細表示操作 (グローバルに公開)
 */
window.showDetail = async (id) => {
    const detailElement = document.getElementById('item-detail');
    if (!detailElement) return;

    try {
        const detail = await api.fetchItemDetail(id);
        
        detailElement.innerHTML = `
            <div class="detail-box">
                <button onclick="document.getElementById('item-detail').style.display='none'">閉じる</button>
                <h3>詳細情報 (ID: ${detail.id})</h3>
                <p><strong>名前:</strong> ${detail.name}</p>
                <p><strong>説明:</strong> ${detail.description}</p>
                <p><strong>分類:</strong> ${detail.type}</p>
            </div>
        `;
        detailElement.style.display = 'block'; 
    } catch (error) {
        alert("詳細情報の取得に失敗しました。");
    }
}