// /project_root/touhouStore.js
"use strict";

// 東方Projectのキャラクターデータを格納する
// 課題の要件に合わせて、シリーズ、キャラクター、能力、画像URLを含める
let seriesData = [
    {
        seriesId: 1,
        title: "東方紅魔郷 〜 the Embodiment of Scarlet Devil.",
        short: "TH06",
        characters: [
            { id: 101, name: "博麗 霊夢", ability: "空を飛ぶ程度の能力", image: "reimu_06.png" },
            { id: 102, name: "霧雨 魔理沙", ability: "魔法を使う程度の能力", image: "marisa_06.png" },
            { id: 103, name: "ルーミア", ability: "闇を操る程度の能力", image: "rumia_06.png" },
            { id: 104, name: "チルノ", ability: "冷気を操る程度の能力", image: "cirno_06.png" },
            { id: 105, name: "紅 美鈴", ability: "気を使う程度の能力", image: "meiling_06.png" },
            { id: 106, name: "パチュリー・ノーレッジ", ability: "火水木金土の魔法を使う程度の能力", image: "patchouli_06.png" },
            { id: 107, name: "十六夜 咲夜", ability: "時間を操る程度の能力", image: "sakuya_06.png" },
            { id: 108, name: "レミリア・スカーレット", ability: "運命を操る程度の能力", image: "remilia_06.png" },
            { id: 109, name: "フランドール・スカーレット", ability: "ありとあらゆるものを破壊する程度の能力", image: "flandre_06.png" },
        ]
    },
    {
        seriesId: 2,
        title: "東方妖々夢 〜 Perfect Cherry Blossom.",
        short: "TH07",
        characters: [
            { id: 201, name: "レティ・ホワイトロック", ability: "寒気を操る程度の能力", image: "letty_07.png" },
            { id: 202, name: "橙", ability: "妖術を操る程度の能力", image: "chen_07.png" },
            { id: 203, name: "アリス・マーガトロイド", ability: "人形を操る程度の能力", image: "alice_07.png" },
            { id: 204, name: "プリズムリバー三姉妹", ability: "手足を使わずに楽器を演奏する程度の能力", image: "prismriver_07.png" },
            { id: 205, name: "魂魄 妖夢", ability: "剣術を扱う程度の能力", image: "youmu_07.png" },
            { id: 206, name: "西行寺 幽々子", ability: "死を操る程度の能力", image: "yuyuko_07.png" },
            { id: 207, name: "八雲 藍", ability: "式神を使う程度の能力", image: "ran_07.png" },
            { id: 208, name: "八雲 紫", ability: "境界を操る程度の能力", image: "yukari_07.png" },
        ]
    }
    // ... 他の作品データもここに追加可能
];

// /project_root/touhouStore.js (追記部分)

// ... (既存の seriesData の後、またはファイルの先頭付近) ...
let nextSeriesId = 3; // 新しいシリーズIDを管理 (既存IDの 1, 2 より大きく設定)


// --- [シリーズ CRUD 関数] ---

// [C] シリーズ作成 (Create)
const createSeries = (newseriesData) => {
    const newSeries = {
        seriesId: nextSeriesId++,
        title: newseriesData.title,
        short: newseriesData.short,
        characters: [] // 新しいシリーズはキャラクターリストを空で開始
    };
    seriesData.push(newSeries);
    return newSeries;
};

// [U] シリーズ更新 (Update)
const updateSeries = (seriesId, updateData) => {
    const series = seriesData.find(s => s.seriesId === parseInt(seriesId));
    if (!series) return null;

    // タイトルとショートネームのみ更新可能とする
    if (updateData.title) series.title = updateData.title;
    if (updateData.short) series.short = updateData.short;
    
    return series;
};

// [D] シリーズ削除 (Delete)
const removeSeries = (seriesId) => {
    const initialLength = seriesData.length;
    seriesData = seriesData.filter(s => s.seriesId !== parseInt(seriesId));
    // 長さが変わっていれば削除成功
    return seriesData.length < initialLength;
};


// --- [R] 読み込み専用の関数 ---

/**
 * 全作品（シリーズ）の概要一覧を取得します。
 * Website A のトップページで使用します。
 */
const getAllSeries = () => seriesData.map(s => ({
    seriesId: s.seriesId,
    title: s.title,
    short: s.short,
    characterCount: s.characters.length
}));

// /project_root/touhouStore.js (追記部分)

// ... (既存の seriesData の後、またはファイルの先頭付近)
let nextCharId = 300; // 新しいキャラクターIDを管理 (既存IDの 1xx, 2xx より大きく設定)

// キャラクターを探すためのヘルパー関数 (内部使用)
const findCharacterIndex = (charId) => {
    for (let i = 0; i < seriesData.length; i++) {
        const charIndex = seriesData[i].characters.findIndex(c => c.id === parseInt(charId));
        if (charIndex !== -1) {
            // 見つかったシリーズとキャラクターのインデックスを返す
            return { seriesIndex: i, charIndex: charIndex };
        }
    }
    return null;
};

// --- [C] 作成 (Create) ---
const createCharacter = (seriesId, charData) => {
    const series = seriesData.find(s => s.seriesId === parseInt(seriesId));
    if (!series) throw new Error(`Series ID ${seriesId} not found.`);

    const newChar = {
        id: nextCharId++,
        name: charData.name,
        ability: charData.ability,
        image: charData.image || 'default.png' // 画像がなければデフォルトを設定
    };
    series.characters.push(newChar);
    return newChar;
};

// --- [U] 更新 (Update) ---
const updateCharacter = (charId, updateData) => {
    const indices = findCharacterIndex(charId);
    if (!indices) return null;

    const char = seriesData[indices.seriesIndex].characters[indices.charIndex];
    
    // 既存データに新しいデータをマージして更新
    Object.assign(char, updateData); 
    
    return char;
};

// --- [D] 削除 (Delete) ---
const removeCharacter = (charId) => {
    const indices = findCharacterIndex(charId);
    if (!indices) return false;

    // 該当キャラクターを配列から削除
    seriesData[indices.seriesIndex].characters.splice(indices.charIndex, 1);
    return true;
};



/**
 * 特定作品の全キャラクター一覧を取得します。
 * Website A のキャラクター一覧ページで使用します。
 */
const getCharactersBySeriesId = (seriesId) => {
    const series = seriesData.find(s => s.seriesId === parseInt(seriesId));
    // キャラクター一覧を返す。作品が見つからない場合は null。
    return series ? series.characters : null;
};

/**
 * 特定キャラクターの詳細情報を取得します。
 * Website A のキャラクター詳細ページで使用します。
 */
const getCharacterDetail = (charId) => {
    // 全作品をループして該当IDのキャラクターを探す
    for (const series of seriesData) {
        const char = series.characters.find(c => c.id === parseInt(charId));
        if (char) return char;
    }
    return null;
};


// --- モジュールのエクスポートを更新 ---
module.exports = {
    // 既存の関数
    getAllSeries,
    getCharactersBySeriesId,
    getCharacterDetail,
    // 新しく追加した関数
    createSeries,
    updateSeries,
    removeSeries,
    createCharacter,
    updateCharacter,
    removeCharacter    
};

