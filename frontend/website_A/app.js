// /frontend/website_A/app.js
"use strict";

const API_BASE_URL = 'http://localhost:3000/api';
// 画像パスの修正に基づき、シンプルな相対パスを使用する
const BASE_PATH = ''; // ルートからの相対パスとして空、または/touhou/


// --- [1] ルーティングと初期化 ---

// ルーティング状態を管理するためのオブジェクト
const router = {
    // page: 'list', 'characters', 'detail'
    // seriesId: 現在表示している作品ID
    // charId: 現在表示しているキャラクターID
};

/**
 * URLハッシュの変更に基づいてルーターを初期化し、対応するコンテンツを表示する
 */
const initializeRouter = () => {
    const hash = window.location.hash.substring(1); // #を除去
    const params = new URLSearchParams(hash);

    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = ''; // コンテンツをクリア

    if (params.has('charId')) {
        // 例: #charId=101
        router.page = 'detail';
        router.charId = params.get('charId');
        displayCharacterDetail(router.charId, mainContent);
    } else if (params.has('seriesId')) {
        // 例: #seriesId=1
        router.page = 'characters';
        router.seriesId = params.get('seriesId');
        displayCharactersList(router.seriesId, mainContent);
    } else {
        // 例: # または空
        router.page = 'list';
        displaySeriesList(mainContent);
    }
};

window.addEventListener('hashchange', initializeRouter);
window.addEventListener('load', initializeRouter);


// --- [2] ページ表示関数 ---

// [ページ1] 作品一覧の表示
// /frontend/website_A/app.js (displaySeriesList 関数全体を置き換え)

// [ページ1] 作品一覧の表示 + CRUD UI
async function displaySeriesList(container) {
    const response = await fetch(`${API_BASE_URL}/touhou/series`);
    if (!response.ok) {
        container.innerHTML = `<p class="error">作品一覧の取得に失敗しました: HTTP Error ${response.status}</p>`;
        return;
    }
    const seriesList = await response.json();

    container.innerHTML = `
        <h2>作品一覧 (東方シリーズ)</h2>
        <button id="show-add-series-btn">新規作品を追加</button>
        <div id="add-series-form-container" class="form-container" style="display:none;">
            <h3>新規作品の追加</h3>
            <form id="add-series-form">
                <label>タイトル: <input type="text" name="title" required></label>
                <label>ショートネーム (例: TH06): <input type="text" name="short" required></label>
                <button type="submit">作品を追加</button>
            </form>
        </div>
        <ul id="series-list" class="series-list">
            ${seriesList.map(series => `
                <li data-id="${series.seriesId}">
                    <a href="#seriesId=${series.seriesId}" class="series-link">
                        <strong>${series.short}: ${series.title}</strong>
                        <span class="character-count">（${series.characterCount}人）</span>
                    </a>
                    <button class="edit-series-btn" data-id="${series.seriesId}" data-title="${series.title}" data-short="${series.short}">編集</button>
                    <button class="delete-series-btn" data-id="${series.seriesId}">削除</button>
                </li>
            `).join('')}
        </ul>
        <div id="edit-series-form-container" class="form-container" style="display:none;">
            <h3>作品情報の編集</h3>
            <form id="edit-series-form">
                <input type="hidden" name="seriesId">
                <label>タイトル: <input type="text" name="title" required></label>
                <label>ショートネーム: <input type="text" name="short" required></label>
                <button type="submit">更新実行</button>
                <button type="button" id="cancel-edit-series-btn">キャンセル</button>
            </form>
        </div>
    `;

    // フォームの表示切り替え
    document.getElementById('show-add-series-btn').addEventListener('click', () => {
        const form = document.getElementById('add-series-form-container');
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
        document.getElementById('edit-series-form-container').style.display = 'none';
    });
    
    // シリーズ CRUD リスナー設定
    document.getElementById('add-series-form').addEventListener('submit', handleCreateSeries);
    document.getElementById('edit-series-form').addEventListener('submit', handleUpdateSeries);
    document.querySelectorAll('.delete-series-btn').forEach(btn => {
        btn.addEventListener('click', handleDeleteSeries);
    });
    document.querySelectorAll('.edit-series-btn').forEach(btn => {
        btn.addEventListener('click', handleShowEditSeriesForm);
    });
    document.getElementById('cancel-edit-series-btn').addEventListener('click', () => {
        document.getElementById('edit-series-form-container').style.display = 'none';
    });
}

// [ページ2] キャラクター一覧の表示 + 新規追加フォーム
async function displayCharactersList(seriesId, container) {
    const response = await fetch(`${API_BASE_URL}/touhou/series/${seriesId}/characters`);
    if (!response.ok) {
        container.innerHTML = `<p class="error">キャラクター一覧の取得に失敗しました: HTTP Error ${response.status}</p>`;
        return;
    }
    const characters = await response.json();

    const seriesTitleResponse = await fetch(`${API_BASE_URL}/touhou/series`);
    const allSeries = await seriesTitleResponse.json();
    const currentSeries = allSeries.find(s => s.seriesId === parseInt(seriesId));

    container.innerHTML = `
        <h2>${currentSeries ? currentSeries.title : 'キャラクター一覧'}</h2>
        <button id="back-to-list-btn">作品一覧に戻る</button>
        <button id="show-add-form-btn">新規キャラクターを追加</button>
        <div id="add-form-container" class="form-container" style="display:none;">
            <h3>新規追加</h3>
            <form id="add-character-form">
                <label>名前: <input type="text" name="name" required></label>
                <label>能力: <input type="text" name="ability" required></label>
                <label>画像ファイル名: <input type="text" name="image" value="default.png"></label>
                <button type="submit">追加実行</button>
            </form>
        </div>
        <ul id="character-list" class="character-list">
            ${characters.map(char => `
                <li data-id="${char.id}">
                    <a href="#charId=${char.id}" class="character-link">${char.name}</a>
                    <button class="delete-btn" data-id="${char.id}">削除</button>
                </li>
            `).join('')}
        </ul>
    `;

    document.getElementById('back-to-list-btn').addEventListener('click', () => {
        window.location.hash = '';
    });
    
    // 削除ボタンのリスナー設定
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', handleDelete);
    });
    
    // 新規追加フォームの表示切り替え
    document.getElementById('show-add-form-btn').addEventListener('click', () => {
        const formContainer = document.getElementById('add-form-container');
        formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
    });
    
    // 新規追加フォームの送信リスナー
    document.getElementById('add-character-form').addEventListener('submit', handleCreate);
}

// [ページ3] キャラクター詳細の表示 + 編集フォーム
async function displayCharacterDetail(charId, container) {
    const response = await fetch(`${API_BASE_URL}/touhou/characters/${charId}`);
    if (!response.ok) {
        container.innerHTML = `<p class="error">キャラクター詳細の取得に失敗しました: HTTP Error ${response.status}</p>`;
        return;
    }
    const char = await response.json();

    container.innerHTML = `
        <div id="detail-box" class="character-detail-box">
            <h3 id="char-name">${char.name}</h3>
            <p><strong>能力:</strong> <span id="char-ability">${char.ability}</span></p>
            <div class="character-image-placeholder">
                <img src="${BASE_PATH}images/${char.image}" alt="${char.name}のイラスト" style="max-width:300px;">
            </div>
            <button id="edit-btn">編集</button>
            <button id="back-to-characters-btn">キャラクター一覧に戻る</button>
        </div>
        
        <div id="edit-form-container" class="form-container" style="display:none;">
            <h3>${char.name}を編集</h3>
            <form id="edit-character-form" data-id="${char.id}">
                <label>名前: <input type="text" name="name" value="${char.name}" required></label>
                <label>能力: <input type="text" name="ability" value="${char.ability}" required></label>
                <label>画像ファイル名: <input type="text" name="image" value="${char.image || 'default.png'}"></label>
                <button type="submit">更新実行</button>
                <button type="button" id="cancel-edit-btn">キャンセル</button>
            </form>
        </div>
    `;

    document.getElementById('back-to-characters-btn').addEventListener('click', () => {
        window.location.hash = `seriesId=${router.seriesId}`;
    });

    // 編集ボタンのリスナー設定
    document.getElementById('edit-btn').addEventListener('click', () => {
        document.getElementById('detail-box').style.display = 'none';
        document.getElementById('edit-form-container').style.display = 'block';
    });
    
    document.getElementById('cancel-edit-btn').addEventListener('click', () => {
        document.getElementById('detail-box').style.display = 'block';
        document.getElementById('edit-form-container').style.display = 'none';
    });

    // 編集フォームの送信リスナー
    document.getElementById('edit-character-form').addEventListener('submit', handleUpdate);
}


// --- [3] CRUD操作のロジック ---

/**
 * 新規キャラクター作成処理 (Create)
 */
async function handleCreate(event) {
    event.preventDefault();
    const form = event.target;
    const seriesId = router.seriesId;
    
    const newCharData = {
        name: form.elements.name.value,
        ability: form.elements.ability.value,
        image: form.elements.image.value,
    };

    const response = await fetch(`${API_BASE_URL}/touhou/series/${seriesId}/characters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCharData)
    });

    if (response.ok) {
        alert("キャラクターが追加されました。");
        // リストを再描画
        window.location.hash = `seriesId=${seriesId}`;
    } else {
        const error = await response.json();
        alert(`追加失敗: ${error.message || response.statusText}`);
    }
}

/**
 * キャラクター削除処理 (Delete)
 */
async function handleDelete(event) {
    const charId = event.target.dataset.id;
    if (!confirm(`キャラクターID ${charId} を削除しますか？`)) {
        return;
    }

    const response = await fetch(`${API_BASE_URL}/touhou/characters/${charId}`, {
        method: 'DELETE'
    });

    if (response.ok) {
        alert("キャラクターが削除されました。");
        // リストを再描画
        window.location.hash = `seriesId=${router.seriesId}`;
    } else {
        alert("削除失敗: キャラクターが見つかりませんでした。");
    }
}

/**
 * キャラクター更新処理 (Update)
 */
async function handleUpdate(event) {
    event.preventDefault();
    const form = event.target;
    const charId = form.dataset.id;
    
    const updateData = {
        name: form.elements.name.value,
        ability: form.elements.ability.value,
        image: form.elements.image.value,
    };

    const response = await fetch(`${API_BASE_URL}/touhou/characters/${charId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
    });

    if (response.ok) {
        alert("キャラクター情報が更新されました。");
        // 詳細ページを再描画
        window.location.hash = `charId=${charId}`;
    } else {
        const error = await response.json();
        alert(`更新失敗: ${error.message || response.statusText}`);
    }
}


// /frontend/website_A/app.js (CRUD操作ロジック関数の後に追記)

// --- [4] シリーズ CRUD操作のロジック ---

/**
 * 新規シリーズ作成処理 (Create)
 */
async function handleCreateSeries(event) {
    event.preventDefault();
    const form = event.target;
    
    const newSeriesData = {
        title: form.elements.title.value,
        short: form.elements.short.value,
    };

    const response = await fetch(`${API_BASE_URL}/touhou/series`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSeriesData)
    });

    if (response.ok) {
        alert("作品が追加されました。");
        // リストを再描画 (URLハッシュなしでリロード)
        window.location.reload(); 
    } else {
        const error = await response.json();
        alert(`追加失敗: ${error.message || response.statusText}`);
    }
}

/**
 * シリーズ編集フォームの表示
 */
function handleShowEditSeriesForm(event) {
    const seriesId = event.target.dataset.id;
    const title = event.target.dataset.title;
    const short = event.target.dataset.short;
    
    const formContainer = document.getElementById('edit-series-form-container');
    const form = document.getElementById('edit-series-form');

    form.elements['seriesId'].value = seriesId;
    form.elements['title'].value = title;
    form.elements['short'].value = short;
    
    document.getElementById('add-series-form-container').style.display = 'none';
    formContainer.style.display = 'block';
}

/**
 * シリーズ更新処理 (Update)
 */
async function handleUpdateSeries(event) {
    event.preventDefault();
    const form = event.target;
    const seriesId = form.elements.seriesId.value;
    
    const updateData = {
        title: form.elements.title.value,
        short: form.elements.short.value,
    };

    const response = await fetch(`${API_BASE_URL}/touhou/series/${seriesId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
    });

    if (response.ok) {
        alert("作品情報が更新されました。");
        // リストを再描画
        window.location.reload();
    } else {
        const error = await response.json();
        alert(`更新失敗: ${error.message || response.statusText}`);
    }
}

/**
 * シリーズ削除処理 (Delete)
 */
async function handleDeleteSeries(event) {
    const seriesId = event.target.dataset.id;
    if (!confirm(`作品ID ${seriesId} と、その作品に属する全てのキャラクターを削除しますか？`)) {
        return;
    }

    const response = await fetch(`${API_BASE_URL}/touhou/series/${seriesId}`, {
        method: 'DELETE'
    });

    if (response.status === 204) {
        alert("作品が削除されました。");
        // リストを再描画
        window.location.reload();
    } else {
        alert("削除失敗: 作品が見つかりませんでした。");
    }
}