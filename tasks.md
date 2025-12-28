# タスク一覧
## レポートの仕様
◆レポートについて
```
・REST APIによる，統一した操作によるデータの一覧・詳細表示，
　追加，削除，変更を実装する．データは変数内に記録する．
・JSファイルの先頭に"use strict";を付けること
・仕様書はTeXで作成する
・仕様書は，利用者向け，管理者向け，開発者向けの3部構成とする
・ソースコードはGithubに置き，レポート内にURLを示すこと
・授業で説明していない技術については，その概要と採用理由を
　記載すること（10.API.key）
```
◆補足1
```
「統一した操作による」とは下記を指すものとする
・リソース名が統一されている
・ページ遷移が統一されている
```
```
仕様書は下記のとおりとする
・利用者向け：3つの内の代表的なシステムについて１つ
・管理者向け：管理者からすると1つのシステムなので１つ
・開発者向け：システムごとに１つで計3つ
（10.API.key）
```
◆補足2
```
大まかな作業順序は以下のような感じである．
・全体的な構想をまとめる
・開発者向け仕様書の作成
・プログラムを作る＆動作確認を行う
・管理者向け仕様書の作成
・利用者向け仕様書の作成
```
```
仕様書は，誰が読むのかを意識しよう
・開発者向け仕様書：自分，プログラムを改良しようとする人
・管理者向け仕様書：サービスを立ち上げる人
・利用者向け仕様書：IT知識のない一般人（11.ドキュメント.key）
```
◆補足3
```
開発者向け仕様書に書くべき内容
・データ構造
・ページ遷移
  どうやってページ遷移するか？（ページ内のリンク，駅名をクリックなど）
  HTTPメソッドとリソース名
  追加・削除・編集後に表示する内容
・リソースごとの機能の詳細（11.ドキュメント.key）
```
◆補足4
```
Q Reactなどのフレームワークを使用して良いですか？
A 本科目では，Webの仕組みを理解することを重視しているので，
　Reactなどのフレームワークは使用禁止とします．
Q 画像やCSSを使っても良いですか？
A どんどん使ってください．（11.ドキュメント.key）
```

### 全体的な構想
・東方キャラ一覧
　作品→キャラ→詳細
　（種族、能力、解説）
　https://seiga.nicovideo.jp/seiga/im3189645
・おすすめのゲーム
　5つのパラメータで評価
・夢日記

## 仕様書の作成

### 仕様書
管理者向けから手をつける。
データ構造をまとめる。
今までのapp.jsにどのような機能があったか復習した方が良いのでは。

### 機能

```
const express = require("express");
const app = express();

app.set('view engine', 'ejs');
app.use("/public", express.static(__dirname + "/public"));

let station = [
  { id:1, code:"JE01", name:"東京駅"},
  { id:2, code:"JE07", name:"舞浜駅"},
  { id:3, code:"JE12", name:"新習志野駅"},
  { id:4, code:"JE13", name:"幕張豊砂駅"},
  { id:5, code:"JE14", name:"海浜幕張駅"},
  { id:6, code:"JE05", name:"新浦安駅"},
];

let station2 = [
  { id:1, code:"JE01", name:"東京駅", change:"総武本線，中央線，etc", passengers:403831, distance:0 },
  { id:2, code:"JE02", name:"八丁堀駅", change:"日比谷線", passengers:31071, distance:1.2 },
  { id:3, code:"JE05", name:"新木場駅", change:"有楽町線，りんかい線", passengers:67206, distance:7.4 },
  { id:4, code:"JE07", name:"舞浜駅", change:"舞浜リゾートライン", passengers:76156,distance:12.7 },
  { id:5, code:"JE12", name:"新習志野駅", change:"", passengers:11655, distance:28.3 },
  { id:6, code:"JE17", name:"千葉みなと駅", change:"千葉都市モノレール", passengers:16602, distance:39.0 },
  { id:7, code:"JE18", name:"蘇我駅", change:"内房線，外房線", passengers:31328, distance:43.0 },
];

app.get("/keiyo", (req, res) => {
  // 本来ならここにDBとのやり取りが入る
  res.render('db1', { data: station });
});

app.get("/keiyo_add", (req, res) => {
  let id = req.query.id;
  let code = req.query.code;
  let name = req.query.name;
  let newdata = { id: id, code: code, name: name };
  station.push( newdata );
  res.redirect('/public/keiyo_add.html')
});

app.get("/keiyo2", (req, res) => {
  // 本来ならここにDBとのやり取りが入る
  res.render('keiyo2', {data: station2} );
});

app.get("/keiyo2/:number", (req, res) => {
  // 本来ならここにDBとのやり取りが入る
  const number = req.params.number;
  const detail = station2[ number ];
  res.render('keiyo2_detail', {data: detail} );
});

app.get("/hello1", (req, res) => {
  const message1 = "Hello world";
  const message2 = "Bon jour";
  res.render('show', { greet1:message1, greet2:message2});
});

app.get("/hello2", (req, res) => {
  res.render('show', { greet1:"Hello world", greet2:"Bon jour"});
});

app.get("/icon", (req, res) => {
  res.render('icon', { filename:"./public/Apple_logo_black.svg", alt:"Apple Logo"});
});

app.get("/omikuji1", (req, res) => {
  const num = Math.floor( Math.random() * 6 + 1 );
  let luck = '';
  if( num==1 ) luck = '大吉';
  else if( num==2 ) luck = '中吉';

  res.send( '今日の運勢は' + luck + 'です' );
});

app.get("/omikuji2", (req, res) => {
  const num = Math.floor( Math.random() * 6 + 1 );
  let luck = '';
  if( num==1 ) luck = '大吉';
  else if( num==2 ) luck = '中吉';

  res.render( 'omikuji2', {result:luck} );
});

app.get("/janken", (req, res) => {
  let hand = req.query.hand;
  let win = Number( req.query.win );
  let total = Number( req.query.total );
  console.log( {hand, win, total});

  const num = Math.floor( Math.random() * 3 + 1 );
  let cpu = '';
  let judgement = '';
  if( num==1 ) cpu = 'グー';
  else if( num==2 ) cpu = 'チョキ';
  else cpu = 'パー';

  if (hand === cpu){
    judgement = 'あいこ'
    total += 1;
  }

  else if(
    (hand ==='グー' && cpu === 'チョキ') ||
    (hand ==='チョキ' && cpu === 'パー') ||
    (hand === 'パー' && cpu === 'グー') 
   ){
    judgement = '勝ち';
    win += 1;
    total += 1;
  }

  else {
    judgement = '負け';
    total += 1;
  }
 
  // ここに勝敗の判定を入れる
  // 以下の数行は人間の勝ちの場合の処理なので，
  // 判定に沿ってあいこと負けの処理を追加する
const display={
  your:hand,
  cpu: cpu,
  judgement: judgement,
  win: win,
  total: total
}

  res.render( 'janken', display );
});

app.listen(8080, () => console.log("Example app listening on port 8080!"));
```


関数名 | 所属 | 役割 
-|-|-
res.render('...') | res | 指定されたEJSファイル（ビュー）にデータを渡し、サーバー側でHTMLを生成してクライアントに送信します。
res.send('...') | res | HTMLタグやテキストなどの文字列を直接クライアントに送信します（/omikuji1で使用）。
res.redirect('...') | res | クライアントに対して、別のtextに再アクセスするよう指示します（/keiyo_addで使用）。
req.query.\<key> | res | URLのクエリパラメータ（例: ?hand=グー の hand）から値を取得します。
req.params.\<key> | res | URLのパスパラメータ（例: /keiyo2/1 の 1）から値を取得します。

1. **app オブジェクト** (Express アプリケーション本体)
const app = express(); で作成される、サーバー全体の設定やルーティングを管理する中心的なオブジェクトです。



2. **req オブジェクト** (Request / リクエスト)クライアント（ブラウザなど）からサーバーに送られてきたリクエストに関する情報を全て含むオブジェクトです。

3. **res オブジェクト** (Response / レスポンス)
サーバーからクライアントへ応答を返すための機能を全て含むオブジェクトです。サーバーがこのオブジェクトの関数を使って応答を構築し、送信します。

```
<!Doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>京葉線の駅</title>
</head>
<body>
  <h2>京葉線の駅の詳細</h2>
  <table>
    <tr><th>ID</th><th>駅コード</th><th>駅名</th></tr>
      <% let number = 0 %>
      <% for( let row of data ) { %>
        <tr><td><%= row.id %></td>
        <td><%= row.code %></td>
        <td><a href="/keiyo2/<%= number %>"><%= row.name %></a></td></tr>
        <% number += 1 %>
      <% } %>
  </table>
</body>
</html>
```
**1. データを受け取る変数（外部からの入力）**

変数名 | 役割 | 動作 
-|-|-
data | 入力データ配列 | Expressサーバー（app.get("/keiyo2", ...)）から渡される、駅の情報を格納した配列（この場合は station2 配列）全体を指します。
row | 反復処理の要素 | data配列をループで処理する際、ループの各回で配列の個々の要素（例: { id:1, code:"JE01", name:"東京駅", ... }）を指します。

**2. 処理ロジック（制御と計算）**

記述 | 種類 | 役割 
-|-|-
let number = 0 | 変数定義 | ループの外で、配列のインデックス（$0$から始まる番号）を保持するための変数を初期化しています。
for( let row of data ) { ... } | 反復処理（ループ） | サーバーから渡された配列 data の要素の数だけ、\<tr>...\</tr> の行を繰り返して HTML に出力します。
number += 1 | 計算 | ループが 1 回実行されるごとに、number の値を 1 ずつ増やし、次の要素のインデックスを準備します。
\<a href="/keiyo2/<%= number %>">...\</a> | 生成（文字列連結） | EJSタグを使って、詳細ページへ移動するための URL を動的に生成しています。numberの値（$0, 1, 2, ...$）が URL の一部（パスパラメータ）になります。

**3. 出力処理**

記述 | 種類 | 役割 
-|-|-
<%= row\.id %> | データ出力 | ループの外で、配列のインデックス（$0$から始まる番号）を保持するための変数を初期化しています。
<%= row\.code %> | データ出力 | 現在の要素 row の中の code の値を取り出し、そのまま HTML の中に出力します。
<%= row\.name %> | データ出力 | 現在の要素 row の中の name の値を取り出し、\<a> タグのリンクテキストとして出力します。



## 構成

```
/project_root
├── /backend_api        <-- REST APIの実装 (サーバーサイド)
│   ├── server.js
│   └── dataStore.js
│
└── /frontend           <-- 3つのWebサイトのファイル
    ├── /common         <-- 共通部品
    │   └── api_client.js   <-- ★ API通信ロジック（ここを共通化）
    │
    ├── /website_A      <-- Web A 
    │   ├── index.html
    │   ├── style.css
    │   └── app.js
    │
    ├── /website_B      <-- Web B 
    │   ├── index.html
    │   ├── style.css
    │   └── app.js
    │
    └── /website_C      <-- Web C 
        ├── index.html
        ├── style.css
        └── app.js
```









