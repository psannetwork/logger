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
  












  document.getElementById("startCapture").addEventListener("click", () => {
    // デスクトップキャプチャのトリガー
    chrome.desktopCapture.chooseDesktopMedia(["screen", "window"], (streamId) => {
      if (!streamId) {
        console.error("No stream selected");
        return;
      }
  
      // ストリームIDを利用してメディアストリームを取得
      navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: {
            mandatory: {
              chromeMediaSource: "desktop",
              chromeMediaSourceId: streamId
            }
          }
        })
        .then((stream) => {
          // 取得したストリームを video 要素にセット
          const videoElement = document.getElementById("screenVideo");
          videoElement.srcObject = stream;
  
          // キャプチャ停止時のイベント
          stream.getVideoTracks()[0].onended = () => {
            console.log("Capture stopped");
          };
        })
        .catch((error) => {
          console.error("Error accessing screen media:", error);
        });
    });
  });
  