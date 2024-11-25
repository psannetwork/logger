document.addEventListener('DOMContentLoaded', function () {
    const screenshotElement = document.getElementById('screenshot');
  
    // スクリーンショットをキャプチャする関数
    function captureScreen() {
      chrome.tabs.captureVisibleTab(null, { format: 'png' }, function (screenshotUrl) {
        screenshotElement.src = screenshotUrl; // <img>要素に画像をセット
        console.log('スクリーンショットのURL:', screenshotUrl);
  
        // バックグラウンドスクリプトにメッセージを送信
        chrome.runtime.sendMessage(
          { type: 'screenshot', data: screenshotUrl },
          (response) => {
            console.log('バックグラウンドからの応答:', response);
          }
        );
      });
    }
  
    // 700msごとにスクリーンショットをキャプチャ
    setInterval(captureScreen, 700);
  });
  