document.addEventListener('DOMContentLoaded', function () {
    const screenshotElement = document.getElementById('screenshot');
    
    function captureScreen() {
      chrome.tabs.captureVisibleTab(null, { format: 'png' }, function (screenshotUrl) {
        screenshotElement.src = screenshotUrl;
      });
    }
  
    setInterval(captureScreen, 700);
  });
  

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
  