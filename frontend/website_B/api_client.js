// /frontend/website_B/api_client.js
"use strict";

// Website B の API ルートである /api/game に固定
const API_BASE_URL = 'http://localhost:3000/api';
const RESOURCE_NAME = 'game'; 

// [R] データ一覧の取得
export async function fetchAllItems() {
    const response = await fetch(`${API_BASE_URL}/${RESOURCE_NAME}`);
    if (!response.ok) {
        throw new Error(`[API Error] データ取得失敗: ${response.statusText}`);
    }
    return response.json();
}

// [C] データ追加
export async function createItem(data) {
    const response = await fetch(`${API_BASE_URL}/${RESOURCE_NAME}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const error = await response.json();
        // サーバー側からエラーメッセージが返されることを想定
        throw new Error(`[API Error] データ追加失敗: ${error.message || response.statusText}`);
    }
    return response.json();
}

// [R] データ詳細の取得
export async function fetchItemDetail(id) {
    const response = await fetch(`${API_BASE_URL}/${RESOURCE_NAME}/${id}`);
    if (!response.ok) {
        throw new Error(`[API Error] 詳細取得失敗: ${response.statusText}`);
    }
    return response.json();
}

// [D] データ削除
export async function deleteItem(id) {
    const response = await fetch(`${API_BASE_URL}/${RESOURCE_NAME}/${id}`, {
        method: 'DELETE'
    });
    if (response.status !== 204) {
        throw new Error(`[API Error] 削除失敗: ${response.statusText}`);
    }
    return true;
}

// [U] データ更新
export async function updateItem(id, data) {
    const response = await fetch(`${API_BASE_URL}/${RESOURCE_NAME}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(`[API Error] 更新失敗: ${error.message || response.statusText}`);
    }
    return response.json();
}