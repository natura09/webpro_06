// dataStore.js
"use strict";

// 変数内にデータを格納 (課題要件)
let items = [
    { id: 1, name: "会議室予約システム", description: "会議室A, B, C の予約状況", type: "system" },
    { id: 2, name: "備品管理システム", description: "PC、モニター、ケーブルの在庫状況", type: "system" },
    { id: 3, name: "社員名簿データ", description: "部署、内線、入社日情報", type: "data" }
];
// 次に生成するIDの管理
let nextId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;

/**
 * 全データ一覧を取得
 */
const getAll = () => items;

/**
 * IDに基づいてデータを取得
 */
const getById = (id) => items.find(item => item.id === parseInt(id));

/**
 * データを追加 (C: Create)
 */
const create = (data) => {
    // 必須フィールドチェック (フロントエンドからのリクエストが正しいことを前提とする)
    if (!data.name || !data.description) {
        throw new Error("Name and description are required.");
    }
    
    const newItem = {
        id: nextId++,
        ...data
    };
    items.push(newItem);
    return newItem;
};

/**
 * データを更新 (U: Update)
 */
const update = (id, newData) => {
    const index = items.findIndex(item => item.id === parseInt(id));
    if (index === -1) return null;

    // IDを変更しないように注意してオブジェクトをマージ
    items[index] = {
        ...items[index],
        ...newData,
        id: parseInt(id) 
    };
    return items[index];
};

/**
 * データを削除 (D: Delete)
 */
const remove = (id) => {
    const initialLength = items.length;
    items = items.filter(item => item.id !== parseInt(id));
    return items.length !== initialLength; // 削除が成功したか
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove
};