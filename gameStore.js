// /project_root/gameStore.js
"use strict";

let nextId = 3;

let data = [
    {
        id: 1,
        title: "UNDERTALE",
        comment: "地底世界に落ちた人間の子どもが、モンスターたちと出会いながら地上への帰還を目指すドット絵のRPG。生かすも殺すも、あなたの選択次第。",
        chartImage: "UNDERTALE.png", 
        criteria: {
            story: 5, setting: 5, character: 5, gameplay: 4, original: 5, // 💡 項目名と点数を変更
        }
    },
    {
        id: 2,
        title: "キミガシネ",
        comment: "多数決で選ばれた者が死ぬ。集められた11人の参加者が生存をかけて舌戦を繰り広げるレトロホラーアドベンチャー。",
        chartImage: "キミガシネ.png", 
        criteria: {
            story: 5, setting: 4, character: 5, gameplay: 5, original: 5, // 💡 項目名と点数を変更
        }
    },
    {
        id: 3,
        title: "Ruina 廃都の物語",
        comment: "地図の空白を埋めながらダンジョンを探索する、ゲームブック的RPG。細やかな情景描写と、行動の自由度の高さが最大の特徴。",
        chartImage: "Ruina.png", 
        criteria: {
            story: 4, setting: 5, character: 3, gameplay: 4, original: 5, // 💡 項目名と点数を変更
        }
    }
];

// --- CRUD 操作 ---

const getAll = () => data;
const getById = (id) => data.find(item => item.id === parseInt(id));

const create = (itemData) => {
    const newItem = {
        id: nextId++,
        title: itemData.title,
        comment: itemData.comment,
        chartImage: itemData.chartImage || 'default_chart.png',
        criteria: itemData.criteria || {},
    };
    data.push(newItem);
    return newItem;
};

const update = (id, updateData) => {
    const item = getById(id);
    if (!item) return null;
    Object.assign(item, updateData);
    return item;
};

const remove = (id) => {
    const initialLength = data.length;
    data = data.filter(item => item.id !== parseInt(id));
    return data.length < initialLength;
};

module.exports = {
    getAll, getById, create, update, remove
};