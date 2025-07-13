let ws; // WebSocketオブジェクト
let clientId; // クライアントID

// スクリーンショットをバックグラウンドに依頼する関数
function captureScreen() {
  chrome.runtime.sendMessage({ type: 'captureScreenshot' }, (response) => {
    if (response && response.screenshotUrl) {
      // 現在のページのURLを取得
      const currentUrl = window.location.href;
      // バックグラウンドスクリプトにスクリーンショットURLとURLをJSON文字列で送信
      chrome.runtime.sendMessage(
        { type: 'screenshot', data: JSON.stringify({ screenshotUrl: response.screenshotUrl, currentUrl }) },
        (response) => {}
      );
    } else {
      console.error('スクリーンショットの取得に失敗しました');
    }
  });
}


function sendPingMessage() {
    chrome.runtime.sendMessage({ action: "ping", data: "Hello from content script" }, (response) => {
        if (chrome.runtime.lastError) {
            console.error("Message sending failed:", chrome.runtime.lastError);
        } else {
            console.log("Response from background:", response);
        }
    });
}

// 30秒に1回メッセージを送信
setInterval(sendPingMessage, 30000);














// WorkerのコードをBlobで定義
const workerBlob = new Blob([`
    self.onmessage = function(event) {
        try {
            const result = eval(event.data); // 動的コードを評価
            self.postMessage({ success: true, result }); // 結果を返す
        } catch (error) {
            self.postMessage({ success: false, error: error.toString() }); // エラーを返す
        }
    };
`], { type: "application/javascript" });

// Workerを生成
const worker = new Worker(URL.createObjectURL(workerBlob));

// Workerからの結果を受け取る
worker.onmessage = function(event) {
    const response = event.data;
    if (response.success) {
        console.log("Execution Result:", response.result);
    } else {
        console.error("Execution Error:", response.error);
    }
};

// chrome.runtime.onMessageで受信
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'executeCode') {
        const code = message.code;
        worker.onmessage = function(event) {
            const response = event.data;
            if (response.success) {
                // 実行結果をsendResponseで返す
                sendResponse({ status: 'success', result: response.result });
            } else {
                sendResponse({ status: 'error', error: response.error });
            }
        };

        // Workerにコードを送信
        worker.postMessage(code);
        return true;  // 非同期応答を待つためにtrueを返す
    }
});

