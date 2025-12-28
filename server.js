// server.js (修正案 - 2つのストアをインポート)
"use strict";



const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

// 💡 汎用データストアをインポート (Website B/C用)
const generalStore = require('./generalStore'); 
// 💡 東方データストアをインポート (Website A用)
const touhouStore = require('./touhouStore'); 

const app = express();
const PORT = 3000;
const RESOURCE_NAME = 'data'; // 汎用リソース名

app.use(bodyParser.json());

//===================
// server.js (初期設定の箇所)

// 1. EJSをテンプレートエンジンとして設定
app.set('view engine', 'ejs'); 

// 2. テンプレートファイル（.ejsファイル）があるディレクトリを設定（通常は 'views'）
app.set('views', path.join(__dirname, 'views'));
//===================

// --- 1. 3つのフロントエンドサイトの静的公開設定 ---

// /frontend/website_A 
app.use('/touhou', express.static(path.join(__dirname, 'frontend/website_A')));
// /frontend/website_B 
app.use('/game', express.static(path.join(__dirname, 'frontend/website_B')));
// /frontend/website_C 
app.use('/todo', express.static(path.join(__dirname, 'frontend/website_C')));
// /frontend/common も公開（フロントエンドのJSからimportするために必要）
app.use('/common', express.static(path.join(__dirname, 'frontend/common')));


// --- 2. REST API ルートの定義 (統一された CRUD 操作) ---

// [R] 一覧表示 (GET /api/data)
app.get(`/api/${RESOURCE_NAME}`, (req, res) => {
    res.json(generalStore.getAll());
});

// [R] 詳細表示 (GET /api/data/:id)
app.get(`/api/${RESOURCE_NAME}/:id`, (req, res) => {
    const item = generalStore.getById(req.params.id);
    if (item) {
        res.json(item);
    } else {
        res.status(404).json({ message: `${RESOURCE_NAME} not found` });
    }
});

// [C] データ追加 (POST /api/data)
app.post(`/api/${RESOURCE_NAME}`, (req, res) => {
    try {
        const newItem = generalStore.create(req.body);
        res.status(201).json(newItem); // 201 Created
    } catch (e) {
        res.status(400).json({ message: e.message }); // 400 Bad Request
    }
});

// [U] データ変更 (PUT /api/data/:id)
app.put(`/api/${RESOURCE_NAME}/:id`, (req, res) => {
    const updatedItem = generalStore.update(req.params.id, req.body);
    if (updatedItem) {
        res.json(updatedItem);
    } else {
        res.status(404).json({ message: `${RESOURCE_NAME} not found` });
    }
});

// [D] データ削除 (DELETE /api/data/:id)
app.delete(`/api/${RESOURCE_NAME}/:id`, (req, res) => {
    const success = generalStore.remove(req.params.id);
    if (success) {
        res.status(204).send(); // 204 No Content
    } else {
        res.status(404).json({ message: `${RESOURCE_NAME} not found` });
    }
});

// server.js (既存の /api/data ルート群の直後に追記)

// --- 3. 東方データ API (Website Aが使用) ---

// [R] 全作品一覧 (GET /api/touhou/series)
app.get(`/api/touhou/series`, (req, res) => {
    res.json(touhouStore.getAllSeries());
});

// [R] 特定作品のキャラクター一覧 (GET /api/touhou/series/:seriesId/characters)
app.get(`/api/touhou/series/:seriesId/characters`, (req, res) => {
    const characters = touhouStore.getCharactersBySeriesId(req.params.seriesId);
    if (characters) {
        res.json(characters);
    } else {
        res.status(404).json({ message: `Series not found` });
    }
});

// [R] 特定キャラクターの詳細 (GET /api/touhou/characters/:charId)
app.get(`/api/touhou/characters/:charId`, (req, res) => {
    const charDetail = touhouStore.getCharacterDetail(req.params.charId);
    if (charDetail) {
        res.json(charDetail);
    } else {
        res.status(404).json({ message: `Character not found` });
    }
});

// /project_root/server.js (東方データ APIの GET ルート群の後に追記)

// ... (既存の GET /api/touhou/... ルート群の定義後) ...

// /project_root/server.js (東方データ APIの PUT/POST/DELETE ルートの後に追記)

// ... (既存の /api/touhou/... の定義後) ...

// --- シリーズ CRUD API ---

// [C] シリーズ追加 (POST /api/touhou/series)
app.post(`/api/touhou/series`, (req, res) => {
    try {
        const newSeries = touhouStore.createSeries(req.body);
        res.status(201).json(newSeries); // 201 Created
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
});

// [U] シリーズ変更 (PUT /api/touhou/series/:seriesId)
app.put(`/api/touhou/series/:seriesId`, (req, res) => {
    const updatedSeries = touhouStore.updateSeries(req.params.seriesId, req.body);
    if (updatedSeries) {
        res.json(updatedSeries);
    } else {
        res.status(404).json({ message: `Series not found` });
    }
});

// [D] シリーズ削除 (DELETE /api/touhou/series/:seriesId)
app.delete(`/api/touhou/series/:seriesId`, (req, res) => {
    const success = touhouStore.removeSeries(req.params.seriesId);
    if (success) {
        // シリーズを削除したら、そのシリーズのキャラクターも削除される
        res.status(204).send(); // 204 No Content
    } else {
        res.status(404).json({ message: `Series not found` });
    }
});


// [C] キャラクター追加 (POST /api/touhou/series/:seriesId/characters)
// 特定の作品 (シリーズ) に新しいキャラクターを追加
app.post(`/api/touhou/series/:seriesId/characters`, (req, res) => {
    try {
        const newChar = touhouStore.createCharacter(req.params.seriesId, req.body);
        res.status(201).json(newChar); // 201 Created
    } catch (e) {
        // 例: seriesId が見つからない場合など
        res.status(404).json({ message: e.message }); 
    }
});

// [U] キャラクター変更 (PUT /api/touhou/characters/:charId)
// キャラクターIDを指定してデータを変更
app.put(`/api/touhou/characters/:charId`, (req, res) => {
    const updatedChar = touhouStore.updateCharacter(req.params.charId, req.body);
    if (updatedChar) {
        res.json(updatedChar);
    } else {
        res.status(404).json({ message: `Character not found` });
    }
});

// [D] キャラクター削除 (DELETE /api/touhou/characters/:charId)
// キャラクターIDを指定して削除
app.delete(`/api/touhou/characters/:charId`, (req, res) => {
    const success = touhouStore.removeCharacter(req.params.charId);
    if (success) {
        res.status(204).send(); // 204 No Content
    } else {
        res.status(404).json({ message: `Character not found` });
    }
});


// /project_root/server.js (ファイルの先頭付近)

// ... (既存の require の後)
const gameStore = require('./gameStore'); // 💡 Website B 用の新しいストア


// ... (既存の API ルート群の後、または /api/data ルートの直後に追記)

// --- 4. Website B (ゲームレビュー) API ---
const GAME_RESOURCE = 'game';

// [R] 一覧表示 (GET /api/game)
app.get(`/api/${GAME_RESOURCE}`, (req, res) => {
    res.json(gameStore.getAll());
});

// [R] 詳細表示 (GET /api/game/:id)
app.get(`/api/${GAME_RESOURCE}/:id`, (req, res) => {
    const item = gameStore.getById(req.params.id);
    if (item) {
        res.json(item);
    } else {
        res.status(404).json({ message: `${GAME_RESOURCE} not found` });
    }
});

// [C] データ追加 (POST /api/game)
app.post(`/api/${GAME_RESOURCE}`, (req, res) => {
    try {
        const newItem = gameStore.create(req.body);
        res.status(201).json(newItem);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
});

// [U] データ変更 (PUT /api/game/:id)
app.put(`/api/${GAME_RESOURCE}/:id`, (req, res) => {
    const updatedItem = gameStore.update(req.params.id, req.body);
    if (updatedItem) {
        res.json(updatedItem);
    } else {
        res.status(404).json({ message: `${GAME_RESOURCE} not found` });
    }
});

// [D] データ削除 (DELETE /api/game/:id)
app.delete(`/api/${GAME_RESOURCE}/:id`, (req, res) => {
    const success = gameStore.remove(req.params.id);
    if (success) {
        res.status(204).send();
    } else {
        res.status(404).json({ message: `${GAME_RESOURCE} not found` });
    }
});


// server.js (ファイルの先頭付近、他のストア定義の後など)

// ToDoリストのデータストア (変数内に記録)
let todoItems = [
    { id: 1, text: "メールをチェックする" },
    { id: 2, text: "WebサイトCのコーディングを終わらせる" }
];
let nextTodoId = todoItems.length > 0 ? Math.max(...todoItems.map(i => i.id)) + 1 : 1;


// server.js (既存の Express ルート定義の後)

// --- 5. Website C (ToDoリスト) シンプルルートの定義 ---

// [R] 一覧表示 (GET /todo/list)
app.get("/todo/list", (req, res) => {
    // EJSテンプレートでデータを表示
    res.render('todo_list', { items: todoItems });
});

// [C] タスク追加 (GET /todo/add?text=...)
app.get("/todo/add", (req, res) => {
    let text = req.query.text;

    if (text && text.trim() !== '') {
        let newItem = { id: nextTodoId++, text: text.trim() };
        todoItems.push(newItem);
        console.log(`ToDo追加: ID ${newItem.id}, テキスト: ${text}`);
    } 
    // 追加後、一覧ページにリダイレクト
    res.redirect('/todo/list'); 
});

// [D] タスク削除 (GET /todo/delete?id=X)
app.get("/todo/delete", (req, res) => {
    const idToDelete = parseInt(req.query.id);
    const initialLength = todoItems.length;
    
    // IDが一致しない要素だけを残してフィルタリング
    todoItems = todoItems.filter(item => item.id !== idToDelete);

    if (todoItems.length !== initialLength) {
        console.log(`ToDo削除: ID ${idToDelete} を削除しました。`);
    }
    
    // 削除後、一覧ページにリダイレクト
    res.redirect('/todo/list'); 
});

// --- 3. サーバー起動 ---
app.listen(PORT, () => {
    console.log(`REST API Server is running on http://localhost:${PORT}`);
    console.log(`フロントエンド A: http://localhost:${PORT}/touhou`);
    console.log(`フロントエンド B: http://localhost:${PORT}/game`);
    console.log(`フロントエンド C: http://localhost:${PORT}/todo`);
});

