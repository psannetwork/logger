// server.js
// このサーバは、Expressを使ってHTTPサーバおよびWebSocketサーバを同一の3000ポート上にホストします。
// ダッシュボード（index.html）やgeolocation.htmlなどの静的ファイルを提供します。
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();

// 現在のディレクトリから静的ファイルを提供
app.use(express.static(path.join(__dirname)));

// ルートアクセス時に index.html を返す
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// HTTPサーバを3000ポートで起動
const server = http.createServer(app);
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`HTTPサーバがポート${PORT}で起動中`);
});

// 同じHTTPサーバ上でWebSocketサーバを作成
const wss = new WebSocket.Server({ server });
console.log(`WebSocketサーバがポート${PORT}で起動中`);

// クライアントからのメッセージを受信し、必要に応じて全クライアントへブロードキャスト
wss.on('connection', function (ws) {
  console.log("新しいWSクライアントが接続されました。");
  
  ws.on('message', function (message) {
    console.log("受信メッセージ:", message);
    // 必要に応じて、受信したメッセージを他のクライアントに中継するなどの処理を追加できます
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', function () {
    console.log("WSクライアントとの接続が切断されました。");
  });
});