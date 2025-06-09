navigator.geolocation.getCurrentPosition(
    function (position) {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
  
      // 結果をバックグラウンドスクリプトに送信
      chrome.runtime.sendMessage({
        type: 'geolocation',
        data: { latitude, longitude }
      }, function () {
        console.log('位置情報が送信されました');
        // ウィンドウを自動で閉じる
        window.close();
      });
    },
    function (error) {
      console.error('位置情報取得失敗:', error.message);
      window.close(); // エラー時もウィンドウを閉じる
    }
  );
  