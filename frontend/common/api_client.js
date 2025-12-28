// /frontend/common/api_client.js
"use strict";

const API_BASE_URL = 'http://localhost:3000/api'; 
const RESOURCE_NAME = 'data'; 

// ヘルパー関数: リクエストの詳細を隠蔽し、エラー処理を行う
async function apiRequest(endpoint, method, data = null) {
    const url = `${API_BASE_URL}/${RESOURCE_NAME}${endpoint}`;
    
    const options = {
        method: method,
        headers: { 'Content-Type': 'application/json' },
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
        if (response.status === 204) return {}; // DELETE成功
        
        const errorBody = await response.json().catch(() => ({ message: '不明なエラー' }));
        throw new Error(errorBody.message || `HTTP Error ${response.status}`);
    }

    // GET, POST, PUT は JSON を返す
    return response.json();
}

// --- 統一された CRUD 操作関数 ---
export const fetchAllItems = async () => apiRequest('/', 'GET');
export const fetchItemDetail = async (id) => apiRequest(`/${id}`, 'GET');
export const createItem = async (itemData) => apiRequest('/', 'POST', itemData);
export const updateItem = async (id, updateData) => apiRequest(`/${id}`, 'PUT', updateData);
export const deleteItem = async (id) => apiRequest(`/${id}`, 'DELETE');