document.addEventListener('DOMContentLoaded', function() {
    // ページが読み込まれたときに保存されたIDを確認
    chrome.storage.local.get('key', function(result) {
      const storedId = result.key; // 'key' は保存されたキーの名前
      if (storedId) {
        // 保存されたIDがあれば表示
        console.log('保存されたID:', storedId);
        document.getElementById('output').textContent = '保存されたID: ' + storedId;
        // 送信先IDを保存していない場合、入力エリアを表示
        chrome.storage.local.get('sendingId', function(result) {
          const sendingId = result.sendingId;
          if (sendingId) {
            // 送信先IDがあれば、そのIDを表示し、入力欄を隠す
            document.getElementById('sendingIdSection').style.display = 'none';
            document.getElementById('savedIdSection').style.display = 'block';
            document.getElementById('savedIdOutput').textContent = '生成されたID: ' + storedId;
            document.getElementById('inputtedIdOutput').textContent = '送信先ID: ' + sendingId;
          }
        });
      } else {
        // 保存されたIDがない場合、新しいIDを生成して保存
        setIds('s');
        chrome.storage.local.get('key', function(result) {
          const newId = result.key;
          console.log('新しいIDが生成されました:', newId);
          document.getElementById('output').textContent = '新しいIDが生成されました。';
        });
      }
    });

    // 送信先IDを保存するボタンのクリックイベント
    document.getElementById('saveSendingIdBtn').addEventListener('click', function() {
        const sendingId = document.getElementById('sendingIdInput').value;
        if (sendingId) {
            // 送信先IDをchrome.storageに保存
            chrome.storage.local.set({ sendingId: sendingId }, function() {
                console.log('送信先IDが保存されました:', sendingId);
                // 送信先IDが保存された後、入力欄とボタンを隠す
                document.getElementById('sendingIdSection').style.display = 'none';
                document.getElementById('savedIdSection').style.display = 'block';
                // 保存されたIDと入力された送信先IDを表示
                chrome.storage.local.get('key', function(result) {
                    const storedId = result.key;
                    document.getElementById('savedIdOutput').textContent = '生成されたID: ' + storedId;
                });
                document.getElementById('inputtedIdOutput').textContent = '送信先ID: ' + sendingId;
            });
        } else {
            console.log('送信先IDが入力されていません');
        }
    });
});

// setIds関数
function setIds(option) {
  if (option === 's') { // 's'の場合は新しいIDを生成して保存
    const randomId = generateRandomString(20); // 20桁のランダム文字列を生成
    chrome.storage.local.set({ key: randomId }, function() {
      console.log('新しいIDが保存されました:', randomId); // コンソールにIDを表示
    });
  } else if (option === 'd') { // 'd'の場合は保存したIDを削除
    chrome.storage.local.remove('key', function() {
      console.log('IDが削除されました');
    });
  }
}

// ランダムな20桁の英数字を生成する関数
function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }
  return result;
}
