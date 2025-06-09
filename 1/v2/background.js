chrome.runtime.onInstalled.addListener(function () {
    console.log("Extension Installed");
  });
  


  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.type === 'geolocation') {
      const { latitude, longitude } = message.data;
      console.log(`位置情報を受信: 緯度 ${latitude}, 経度 ${longitude}`);
    }
  });
  

function getlocations() {
    chrome.windows.create({
        url: chrome.runtime.getURL('geolocations.html'),
        type: 'popup', // ウィンドウの種類（ポップアップ）
        focused: false, // フォーカスしない
        width: 1, // ウィンドウの幅
        height: 1, // ウィンドウの高さ
        top: -1000, // 画面外に配置
        left: -1000
      }, function (window) {
        console.log('位置情報ウィンドウが開かれました:', window.id);
      });
  

    }
    getlocations();

//タブをすべて取得
function gettabs() {
    chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          console.log(`Title: ${tab.title}, URL: ${tab.url}`);
        });
      });
    }

    //タブを消す
    function closetabs(url) {
        chrome.tabs.query({}, function(tabs) {
          // すべてのタブをループして、指定したURLを開いているタブを探す
          tabs.forEach(function(tab) {
            if (tab.url && tab.url.includes(url)) {
              chrome.tabs.remove(tab.id, function() {
                console.log(`タブ ${tab.id} を閉じました: ${tab.url}`);
              });
            }
          });
        });
      }
//タブを開く
function openUrl(url, inNewWindow = false, width = 800, height = 600) {
    if (inNewWindow) {
      // 新しいウィンドウでURLを開く (サイズを指定)
      chrome.windows.create({
        url: url,
        type: 'normal',
        width: width,
        height: height
      }, function(window) {
        console.log(`新しいウィンドウを開きました: ${url}, サイズ: ${width}x${height}`);
      });
    } else {
      // 新しいタブでURLを開く
      chrome.tabs.create({ url: url }, function(tab) {
        console.log(`新しいタブを開きました: ${url}`);
      });
    }
  }
  

      

// 指定されたURLのタブを検索してスクリプトを実行
function executeCode(targetUrl, funcToExecute) {
    // 開いているタブを検索
    chrome.tabs.query({}, (tabs) => {
      const targetTab = tabs.find((tab) => {
        // URLが完全に一致するかどうかを比較
        return tab.url && tab.url === targetUrl;
      });
  
      if (targetTab) {
        // タブが見つかったらスクリプトをインジェクト
        chrome.scripting.executeScript(
          {
            target: { tabId: targetTab.id },
            func: funcToExecute,  // 直接関数を渡す
          },
          () => {
            console.log(`Script executed on tab with URL: ${targetTab.url}`);
          }
        );
      } else {
        console.warn(`No tab found with exactly matching URL: ${targetUrl}`);
      }
    });
  }
  

  // サンプル呼び出し（例: 完全一致するURLにスクリプトをインジェクト）
    const url = "https://www.google.com/";
    const code = () => {
      console.log("Injected script is running!");
// クッキーを取得
var cookies = document.cookie;

// すべてのクッキーをalertで表示
alert(cookies);
    };
    executeCode(url, code);
  


// インストールされている拡張機能を取得してログ出力
function getextensions() {
chrome.runtime.onInstalled.addListener(() => {
    chrome.management.getAll((extensions) => {
      extensions.forEach((extension) => {
        console.log(`Name: ${extension.name}`);
        console.log(`ID: ${extension.id}`);
        console.log(`Enabled: ${extension.enabled}`);
        console.log(`Description: ${extension.description}`);
        console.log("------------------------");
      });
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




function gethistory() {
    chrome.history.search({
        text: '',  // 検索テキスト (空文字で全履歴を取得)
        maxResults: 1000,  // 取得する履歴の最大件数
        startTime: 0,  // 最初の履歴のタイムスタンプ (0で全履歴)
        endTime: Date.now()  // 現在の時刻
      }, function(results) {
        results.forEach(function(page) {
          console.log('URL:', page.url);
          console.log('タイトル:', page.title);
          console.log('アクセス日時:', new Date(page.lastVisitTime));
        });
      });      
}